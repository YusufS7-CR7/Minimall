import React, { createContext, useContext, useState, useEffect } from "react";
import type { AdminUser, AdminPermission } from "@/data/adminTypes";
import { ALL_ADMIN_PERMISSIONS } from "@/data/adminTypes";

const ADMINS_STORAGE_KEY = "minimall_admin_users";
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
  hasPermission: (perm: AdminPermission) => boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  createAdmin: (payload: CreateAdminPayload) => { success: boolean; error?: string };
  updateAdmin: (id: string, payload: UpdateAdminPayload) => { success: boolean; error?: string };
  deleteAdmin: (id: string) => { success: boolean; error?: string };
  toggleAdminStatus: (id: string) => { success: boolean; error?: string };
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  // Load admins list from localStorage
  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    if (typeof window === "undefined") return [DEFAULT_SUPERADMIN];
    try {
      const stored = localStorage.getItem(ADMINS_STORAGE_KEY);
      if (stored) {
        const parsed: AdminUser[] = JSON.parse(stored);
        // Ensure superadmin always exists
        const hasSuperAdmin = parsed.some((a) => a.isSuperAdmin);
        if (!hasSuperAdmin) {
          parsed.unshift(DEFAULT_SUPERADMIN);
          localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to load admin users from storage:", e);
    }
    // Fallback: save default superadmin
    localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify([DEFAULT_SUPERADMIN]));
    return [DEFAULT_SUPERADMIN];
  });

  // Load current logged in admin session
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const session = localStorage.getItem(SESSION_STORAGE_KEY);
      if (session) {
        const parsedSession: { id: string } = JSON.parse(session);
        const match = admins.find((a) => a.id === parsedSession.id && a.isActive);
        return match || null;
      }
    } catch (e) {
      console.error("Failed to load admin session:", e);
    }
    return null;
  });

  // Synchronize admins to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(admins));
    } catch (e) {
      console.error("Failed to save admins to storage:", e);
    }
  }, [admins]);

  // Keep adminUser object in sync with admins list in case details or permissions change
  useEffect(() => {
    if (adminUser) {
      const updated = admins.find((a) => a.id === adminUser.id);
      if (updated) {
        if (!updated.isActive) {
          // If deactivated while logged in, log out
          logout();
        } else if (JSON.stringify(updated) !== JSON.stringify(adminUser)) {
          setAdminUser(updated);
        }
      } else {
        logout();
      }
    }
  }, [admins]);

  const hasPermission = (perm: AdminPermission): boolean => {
    if (!adminUser) return false;
    if (adminUser.isSuperAdmin) return true; // Superadmin has all rights
    return adminUser.permissions.includes(perm);
  };

  const login = (username: string, password: string): { success: boolean; error?: string } => {
    const trimmedUsername = username.trim().toLowerCase();
    const target = admins.find((a) => a.username.toLowerCase() === trimmedUsername);

    if (!target) {
      return { success: false, error: "Пользователь с таким логином не найден" };
    }

    if (!target.isActive) {
      return { success: false, error: "Учетная запись администратора деактивирована" };
    }

    if (target.password !== password) {
      return { success: false, error: "Неверный пароль" };
    }

    // Update lastLoginAt
    const updatedTarget: AdminUser = {
      ...target,
      lastLoginAt: new Date().toISOString(),
    };

    setAdmins((prev) => prev.map((a) => (a.id === target.id ? updatedTarget : a)));
    setAdminUser(updatedTarget);

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id: target.id }));
    } catch (e) {
      console.error("Failed to persist admin session:", e);
    }

    return { success: true };
  };

  const logout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.error("Failed to clear admin session:", e);
    }
  };

  const createAdmin = (payload: CreateAdminPayload): { success: boolean; error?: string } => {
    // Only superadmin or admin with 'admins_manage' permission can create
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

    if (admins.some((a) => a.username.toLowerCase() === cleanUsername)) {
      return { success: false, error: "Администратор с таким логином уже существует" };
    }

    if (!payload.password || payload.password.length < 4) {
      return { success: false, error: "Пароль должен содержать не менее 4 символов" };
    }

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
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
  };

  const updateAdmin = (id: string, payload: UpdateAdminPayload): { success: boolean; error?: string } => {
    if (!adminUser || (!adminUser.isSuperAdmin && !hasPermission("admins_manage"))) {
      return { success: false, error: "У вас нет прав на редактирование администраторов" };
    }

    const target = admins.find((a) => a.id === id);
    if (!target) {
      return { success: false, error: "Администратор не найден" };
    }

    // Superadmin protections
    if (target.isSuperAdmin && !adminUser.isSuperAdmin) {
      return { success: false, error: "Только Главный Администратор может изменять свой аккаунт" };
    }

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
  };

  const deleteAdmin = (id: string): { success: boolean; error?: string } => {
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

    setAdmins((prev) => prev.filter((a) => a.id !== id));
    return { success: true };
  };

  const toggleAdminStatus = (id: string): { success: boolean; error?: string } => {
    const target = admins.find((a) => a.id === id);
    if (!target) return { success: false, error: "Не найден" };
    if (target.isSuperAdmin) return { success: false, error: "Нельзя заблокировать Главного Администратора" };

    return updateAdmin(id, { isActive: !target.isActive });
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        admins,
        isAuthenticated: !!adminUser,
        isSuperAdmin: !!adminUser?.isSuperAdmin,
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
