import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AdminUser, AdminPermission } from "@/data/adminTypes";
import { ALL_ADMIN_PERMISSIONS } from "@/data/adminTypes";
import { supabase } from "@/lib/supabase";

const SESSION_STORAGE_KEY = "minimall_admin_session";

// Default primary superadmin credentials
export const DEFAULT_SUPERADMIN: AdminUser = {
  id: "superadmin-1",
  username: "admin",
  name: "Главный Администратор",
  password: "admin123",
  role: "superadmin",
  isSuperAdmin: true,
  permissions: ALL_ADMIN_PERMISSIONS.map((p) => p.id),
  createdAt: "2026-01-01T00:00:00.000Z",
  isActive: true,
};

// ─── DB row type (Supabase snake_case) ───────────────────────────────────────

interface DbAdmin {
  id: string;
  username: string;
  name: string;
  password: string;
  role: string;
  is_super_admin: boolean;
  permissions: AdminPermission[];
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

function dbToAdmin(row: DbAdmin): AdminUser {
  return {
    id: row.id,
    username: row.username,
    name: row.name,
    password: row.password,
    role: row.role as AdminUser["role"],
    isSuperAdmin: row.is_super_admin,
    permissions: row.permissions || [],
    isActive: row.is_active,
    lastLoginAt: row.last_login_at ?? undefined,
    createdAt: row.created_at,
  };
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface CreateAdminPayload {
  username: string;
  name: string;
  password: string;
  role?: "admin" | "manager";
  permissions: AdminPermission[];
}

interface UpdateAdminPayload {
  name?: string;
  password?: string;
  role?: "admin" | "manager";
  permissions?: AdminPermission[];
  isActive?: boolean;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  admins: AdminUser[];
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  loading: boolean;
  hasPermission: (perm: AdminPermission) => boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  createAdmin: (payload: CreateAdminPayload) => Promise<{ success: boolean; error?: string }>;
  updateAdmin: (id: string, payload: UpdateAdminPayload) => Promise<{ success: boolean; error?: string }>;
  deleteAdmin: (id: string) => Promise<{ success: boolean; error?: string }>;
  toggleAdminStatus: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch all admins from Supabase ─────────────────────────────────────────
  const fetchAdmins = useCallback(async () => {
    const { data, error } = await supabase
      .from("mm_admins")
      .select("*")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      const fetched = (data as DbAdmin[]).map(dbToAdmin);
      setAdmins(fetched);
      return fetched;
    } else {
      // If table is empty or error, seed the default superadmin
      const { error: seedError } = await supabase.from("mm_admins").insert([{
        id: DEFAULT_SUPERADMIN.id,
        username: DEFAULT_SUPERADMIN.username,
        name: DEFAULT_SUPERADMIN.name,
        password: DEFAULT_SUPERADMIN.password,
        role: DEFAULT_SUPERADMIN.role,
        is_super_admin: true,
        permissions: DEFAULT_SUPERADMIN.permissions,
        is_active: true,
      }]);

      if (seedError) {
        console.error("Failed to seed superadmin:", seedError.message);
        // Fallback to local default
        setAdmins([DEFAULT_SUPERADMIN]);
        return [DEFAULT_SUPERADMIN];
      }

      setAdmins([DEFAULT_SUPERADMIN]);
      return [DEFAULT_SUPERADMIN];
    }
  }, []);

  // ── Initialize: fetch admins + restore session ─────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const fetchedAdmins = await fetchAdmins();

      // Restore session
      try {
        const session = localStorage.getItem(SESSION_STORAGE_KEY);
        if (session && fetchedAdmins) {
          const parsedSession: { id: string } = JSON.parse(session);
          const match = fetchedAdmins.find((a) => a.id === parsedSession.id && a.isActive);
          if (match) {
            setAdminUser(match);
          } else {
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }
      } catch (e) {
        console.error("Failed to restore admin session:", e);
      }

      setLoading(false);
    };

    init();
  }, [fetchAdmins]);

  // Keep adminUser in sync with admins list
  useEffect(() => {
    if (adminUser) {
      const updated = admins.find((a) => a.id === adminUser.id);
      if (updated) {
        if (!updated.isActive) {
          logout();
        } else if (JSON.stringify(updated) !== JSON.stringify(adminUser)) {
          setAdminUser(updated);
        }
      } else if (admins.length > 0) {
        // Admin was deleted while logged in
        logout();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admins]);

  const hasPermission = (perm: AdminPermission): boolean => {
    if (!adminUser) return false;
    if (adminUser.isSuperAdmin) return true;
    return adminUser.permissions.includes(perm);
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUsername = username.trim().toLowerCase();

    const { data, error } = await supabase
      .from("mm_admins")
      .select("*")
      .eq("username", trimmedUsername)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: "Пользователь с таким логином не найден" };
    }

    const target = dbToAdmin(data as DbAdmin);

    if (!target.isActive) {
      return { success: false, error: "Учетная запись администратора деактивирована" };
    }

    if (target.password !== password) {
      return { success: false, error: "Неверный пароль" };
    }

    // Update lastLoginAt
    await supabase
      .from("mm_admins")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", target.id);

    const loggedIn: AdminUser = {
      ...target,
      lastLoginAt: new Date().toISOString(),
    };

    setAdminUser(loggedIn);
    setAdmins((prev) => prev.map((a) => (a.id === target.id ? loggedIn : a)));

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: target.id }));
    } catch (e) {
      console.error("Failed to persist admin session:", e);
    }

    return { success: true };
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setAdminUser(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear admin session:", e);
    }
  }, []);

  // ── Create admin ───────────────────────────────────────────────────────────
  const createAdmin = useCallback(async (payload: CreateAdminPayload): Promise<{ success: boolean; error?: string }> => {
    if (!adminUser || (!adminUser.isSuperAdmin && !hasPermission("admins_manage"))) {
      return { success: false, error: "У вас нет прав на создание администраторов" };
    }

    const cleanUsername = payload.username.trim().toLowerCase();
    if (!cleanUsername) {
      return { success: false, error: "Логин не может быть пустым" };
    }

    if (cleanUsername.length < 3) {
      return { success: false, error: "Логин должен содержать минимум 3 символа" };
    }

    // Check uniqueness in DB
    const { data: existing } = await supabase
      .from("mm_admins")
      .select("id")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "Администратор с таким логином уже существует" };
    }

    if (!payload.password || payload.password.length < 4) {
      return { success: false, error: "Пароль должен содержать не менее 4 символов" };
    }

    const newId = `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const { error } = await supabase.from("mm_admins").insert([{
      id: newId,
      username: cleanUsername,
      name: payload.name.trim() || cleanUsername,
      password: payload.password,
      role: payload.role || "admin",
      is_super_admin: false,
      permissions: payload.permissions || ["products_view"],
      is_active: true,
    }]);

    if (error) {
      console.error("Failed to create admin:", error.message);
      return { success: false, error: error.message };
    }

    const newAdmin: AdminUser = {
      id: newId,
      username: cleanUsername,
      name: payload.name.trim() || cleanUsername,
      password: payload.password,
      role: payload.role || "admin",
      isSuperAdmin: false,
      permissions: payload.permissions || ["products_view"],
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    setAdmins((prev) => [...prev, newAdmin]);
    return { success: true };
  }, [adminUser]);

  // ── Update admin ───────────────────────────────────────────────────────────
  const updateAdmin = useCallback(async (id: string, payload: UpdateAdminPayload): Promise<{ success: boolean; error?: string }> => {
    if (!adminUser || (!adminUser.isSuperAdmin && !hasPermission("admins_manage"))) {
      return { success: false, error: "У вас нет прав на редактирование администраторов" };
    }

    const target = admins.find((a) => a.id === id);
    if (!target) {
      return { success: false, error: "Администратор не найден" };
    }

    if (target.isSuperAdmin && !adminUser.isSuperAdmin) {
      return { success: false, error: "Только Главный Администратор может изменять свой аккаунт" };
    }

    const dbPatch: Record<string, unknown> = {};
    if (payload.name !== undefined) dbPatch.name = payload.name.trim();
    if (payload.password) dbPatch.password = payload.password;
    if (!target.isSuperAdmin) {
      if (payload.role) dbPatch.role = payload.role;
      if (payload.permissions) dbPatch.permissions = payload.permissions;
      if (payload.isActive !== undefined) dbPatch.is_active = payload.isActive;
    }

    const { error } = await supabase
      .from("mm_admins")
      .update(dbPatch)
      .eq("id", id);

    if (error) {
      console.error("Failed to update admin:", error.message);
      return { success: false, error: error.message };
    }

    // Optimistic local update
    setAdmins((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        return {
          ...a,
          name: payload.name !== undefined ? payload.name.trim() : a.name,
          password: payload.password ? payload.password : a.password,
          role: a.isSuperAdmin ? "superadmin" : (payload.role || a.role),
          permissions: a.isSuperAdmin ? ALL_ADMIN_PERMISSIONS.map((p) => p.id) : (payload.permissions || a.permissions),
          isActive: a.isSuperAdmin ? true : (payload.isActive !== undefined ? payload.isActive : a.isActive),
        };
      })
    );

    return { success: true };
  }, [adminUser, admins]);

  // ── Delete admin ───────────────────────────────────────────────────────────
  const deleteAdmin = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!adminUser || (!adminUser.isSuperAdmin && !hasPermission("admins_manage"))) {
      return { success: false, error: "У вас нет прав на удаление администраторов" };
    }

    const target = admins.find((a) => a.id === id);
    if (!target) {
      return { success: false, error: "Администратор не найден" };
    }

    if (target.isSuperAdmin) {
      return { success: false, error: "Главного Администратора нельзя удалить!" };
    }

    if (target.id === adminUser.id) {
      return { success: false, error: "Вы не можете удалить свою текущую учетную запись" };
    }

    const { error } = await supabase
      .from("mm_admins")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete admin:", error.message);
      return { success: false, error: error.message };
    }

    setAdmins((prev) => prev.filter((a) => a.id !== id));
    return { success: true };
  }, [adminUser, admins]);

  // ── Toggle status ──────────────────────────────────────────────────────────
  const toggleAdminStatus = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    const target = admins.find((a) => a.id === id);
    if (!target) return { success: false, error: "Не найден" };
    if (target.isSuperAdmin) return { success: false, error: "Нельзя заблокировать Главного Администратора" };

    return updateAdmin(id, { isActive: !target.isActive });
  }, [admins, updateAdmin]);

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        admins,
        isAuthenticated: !!adminUser,
        isSuperAdmin: !!adminUser?.isSuperAdmin,
        loading,
        hasPermission,
        login,
        logout,
        createAdmin,
        updateAdmin,
        deleteAdmin,
        toggleAdminStatus,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
}
