import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { AdminUser, AdminPermission } from "@/data/adminTypes";
import { ALL_ADMIN_PERMISSIONS } from "@/data/adminTypes";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/utils/crypto";

const SESSION_STORAGE_KEY = "minimall_admin_session";

// ─── DB row type (Supabase snake_case) ───────────────────────────────────────

interface DbAdmin {
  id: string;
  username: string;
  name: string;
  password?: string;
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
    password: "", // Never store or expose passwords in client state
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
  fetchAdmins: () => Promise<AdminUser[]>;
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

  // ── Fetch all admins (accessible only for authenticated admins) ────────────
  const fetchAdmins = useCallback(async (): Promise<AdminUser[]> => {
    const { data, error } = await supabase
      .from("mm_admins")
      .select("id, username, name, role, is_super_admin, permissions, is_active, last_login_at, created_at")
      .order("created_at", { ascending: true });

    if (!error && data && data.length > 0) {
      const fetched = (data as DbAdmin[]).map(dbToAdmin);
      setAdmins(fetched);
      return fetched;
    }
    return [];
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setAdminUser(null);
    setAdmins([]);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear admin session:", e);
    }
  }, []);

  // ── Initialize: restore session safely without exposing other admins ───────
  useEffect(() => {
    const init = async () => {
      setLoading(true);

      try {
        const session = localStorage.getItem(SESSION_STORAGE_KEY);
        if (session) {
          const parsedSession: { id: string } = JSON.parse(session);
          if (parsedSession?.id) {
            const { data, error } = await supabase
              .from("mm_admins")
              .select("id, username, name, role, is_super_admin, permissions, is_active, last_login_at, created_at")
              .eq("id", parsedSession.id)
              .maybeSingle();

            if (!error && data && data.is_active) {
              const current = dbToAdmin(data as DbAdmin);
              setAdminUser(current);
            } else {
              localStorage.removeItem(SESSION_STORAGE_KEY);
            }
          }
        }
      } catch (e) {
        console.error("Failed to restore admin session:", e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const hasPermission = useCallback((perm: AdminPermission): boolean => {
    if (!adminUser) return false;
    if (adminUser.isSuperAdmin) return true;
    return adminUser.permissions.includes(perm);
  }, [adminUser]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmedUsername = username.trim().toLowerCase();
    if (!trimmedUsername || !password) {
      return { success: false, error: "err_fields_required" };
    }

    // Query admin account by username
    const { data, error } = await supabase
      .from("mm_admins")
      .select("*")
      .eq("username", trimmedUsername)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: "err_invalid_credentials" };
    }

    if (!data.is_active) {
      return { success: false, error: "err_admin_inactive" };
    }

    // Compare password with cryptographic SHA-256 hash or legacy plaintext for upgrade
    const hashedInput = await hashPassword(password);
    const storedPassword = data.password || "";
    const isMatch = storedPassword === hashedInput || storedPassword === password;

    if (!isMatch) {
      return { success: false, error: "err_invalid_credentials" };
    }

    const nowIso = new Date().toISOString();

    // Auto-migrate legacy unhashed password to SHA-256 hash in database
    if (storedPassword === password && storedPassword !== hashedInput) {
      await supabase
        .from("mm_admins")
        .update({ password: hashedInput, last_login_at: nowIso })
        .eq("id", data.id);
    } else {
      await supabase
        .from("mm_admins")
        .update({ last_login_at: nowIso })
        .eq("id", data.id);
    }

    const loggedIn: AdminUser = {
      id: data.id,
      username: data.username,
      name: data.name,
      password: "",
      role: data.role as AdminUser["role"],
      isSuperAdmin: data.is_super_admin,
      permissions: data.permissions || [],
      isActive: true,
      lastLoginAt: nowIso,
      createdAt: data.created_at,
    };

    setAdminUser(loggedIn);

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: data.id }));
    } catch (e) {
      console.error("Failed to persist admin session:", e);
    }

    return { success: true };
  }, []);

  // ── Create admin ───────────────────────────────────────────────────────────
  const createAdmin = useCallback(async (payload: CreateAdminPayload): Promise<{ success: boolean; error?: string }> => {
    if (!adminUser || (!adminUser.isSuperAdmin && !hasPermission("admins_manage"))) {
      return { success: false, error: "err_no_permission" };
    }

    const cleanUsername = payload.username.trim().toLowerCase();
    if (!cleanUsername) {
      return { success: false, error: "err_admin_username_empty" };
    }

    if (cleanUsername.length < 3) {
      return { success: false, error: "err_admin_username_short" };
    }

    // Check uniqueness in DB
    const { data: existing } = await supabase
      .from("mm_admins")
      .select("id")
      .eq("username", cleanUsername)
      .maybeSingle();

    if (existing) {
      return { success: false, error: "err_admin_username_exists" };
    }

    if (!payload.password || payload.password.length < 4) {
      return { success: false, error: "err_admin_password_short" };
    }

    const hashedPassword = await hashPassword(payload.password);
    const newId = `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const nowIso = new Date().toISOString();

    const { error } = await supabase.from("mm_admins").insert([{
      id: newId,
      username: cleanUsername,
      name: payload.name.trim() || cleanUsername,
      password: hashedPassword,
      role: payload.role || "admin",
      is_super_admin: false,
      permissions: payload.permissions || ["products_view"],
      is_active: true,
      created_at: nowIso,
    }]);

    if (error) {
      console.error("Failed to create admin:", error.message);
      return { success: false, error: error.message };
    }

    const newAdmin: AdminUser = {
      id: newId,
      username: cleanUsername,
      name: payload.name.trim() || cleanUsername,
      password: "",
      role: payload.role || "admin",
      isSuperAdmin: false,
      permissions: payload.permissions || ["products_view"],
      createdAt: nowIso,
      isActive: true,
    };

    setAdmins((prev) => [...prev, newAdmin]);
    return { success: true };
  }, [adminUser, hasPermission]);

  // ── Update admin ───────────────────────────────────────────────────────────
  const updateAdmin = useCallback(async (id: string, payload: UpdateAdminPayload): Promise<{ success: boolean; error?: string }> => {
    if (!adminUser || (!adminUser.isSuperAdmin && !hasPermission("admins_manage"))) {
      return { success: false, error: "err_no_permission" };
    }

    const target = admins.find((a) => a.id === id) || (adminUser.id === id ? adminUser : null);
    if (!target) {
      return { success: false, error: "err_admin_not_found" };
    }

    if (target.isSuperAdmin && !adminUser.isSuperAdmin) {
      return { success: false, error: "err_superadmin_self_only" };
    }

    const dbPatch: Record<string, unknown> = {};
    if (payload.name !== undefined) dbPatch.name = payload.name.trim();
    if (payload.password) {
      dbPatch.password = await hashPassword(payload.password);
    }
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
          password: "",
          role: a.isSuperAdmin ? "superadmin" : (payload.role || a.role),
          permissions: a.isSuperAdmin ? ALL_ADMIN_PERMISSIONS.map((p) => p.id) : (payload.permissions || a.permissions),
          isActive: a.isSuperAdmin ? true : (payload.isActive !== undefined ? payload.isActive : a.isActive),
        };
      })
    );

    if (adminUser.id === id && payload.name !== undefined) {
      setAdminUser((prev) => prev ? { ...prev, name: payload.name!.trim() } : null);
    }

    return { success: true };
  }, [adminUser, admins, hasPermission]);

  // ── Delete admin ───────────────────────────────────────────────────────────
  const deleteAdmin = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!adminUser || (!adminUser.isSuperAdmin && !hasPermission("admins_manage"))) {
      return { success: false, error: "err_no_permission" };
    }

    const target = admins.find((a) => a.id === id);
    if (!target) {
      return { success: false, error: "err_admin_not_found" };
    }

    if (target.isSuperAdmin) {
      return { success: false, error: "err_cannot_delete_superadmin" };
    }

    if (target.id === adminUser.id) {
      return { success: false, error: "err_cannot_delete_self" };
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
  }, [adminUser, admins, hasPermission]);

  // ── Toggle status ──────────────────────────────────────────────────────────
  const toggleAdminStatus = useCallback(async (id: string): Promise<{ success: boolean; error?: string }> => {
    const target = admins.find((a) => a.id === id);
    if (!target) return { success: false, error: "err_admin_not_found" };
    if (target.isSuperAdmin) return { success: false, error: "err_cannot_block_superadmin" };

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
        fetchAdmins,
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
