import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { hashPassword } from "@/utils/crypto";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "email" | "google";
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  city: string;
  address: string;
}

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  isAuthModalOpen: boolean;
  authTab: "login" | "register";
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  setAuthTab: (tab: "login" | "register") => void;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  saveProfile: (profile: Partial<Omit<UserProfile, "id" | "email">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helpers — session storage for current user (standard practice) ──────────
function getSession(): User | null {
  try {
    const raw = sessionStorage.getItem("mm_current_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(u: User | null) {
  if (u) sessionStorage.setItem("mm_current_user", JSON.stringify(u));
  else sessionStorage.removeItem("mm_current_user");
}

// ─── Supabase helpers ─────────────────────────────────────────────────────────

type DbUser = { id: string; name: string; email: string; password?: string };

async function dbGetUser(email: string): Promise<DbUser | null> {
  const { data } = await supabase
    .from("mm_users")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();
  return data ?? null;
}

async function dbCreateUser(user: DbUser): Promise<{ error?: string }> {
  const { error } = await supabase.from("mm_users").insert([user]);
  if (error) return { error: error.message };
  return {};
}

async function dbGetProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  return data ?? null;
}

async function dbCreateProfile(profile: UserProfile): Promise<void> {
  await supabase.from("user_profiles").insert([{
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    city: profile.city,
    address: profile.address,
  }]);
}

async function dbUpdateProfile(userId: string, updates: Partial<Omit<UserProfile, "id" | "email">>): Promise<void> {
  await supabase
    .from("user_profiles")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(getSession);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  // Load profile from Supabase whenever we have a user
  const loadProfile = useCallback(async (u: User) => {
    const profile = await dbGetProfile(u.id);
    if (profile) setUserProfile(profile);
  }, []);

  const persistUser = useCallback((u: User | null) => {
    setUser(u);
    setSession(u);
    if (!u) setUserProfile(null);
  }, []);

  const openAuthModal = useCallback((tab: "login" | "register" = "login") => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  // On initial mount, if there's a session, load the profile
  useState(() => {
    const session = getSession();
    if (session) loadProfile(session);
  });

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const found = await dbGetUser(cleanEmail);
    if (!found) {
      return { error: "Неверный email или пароль" };
    }

    const hashedInput = await hashPassword(password, cleanEmail);
    const isMatch = found.password === hashedInput || found.password === password;

    if (!isMatch) {
      return { error: "Неверный email или пароль" };
    }

    // Auto-migrate plaintext password to hash in DB
    if (found.password === password && found.password !== hashedInput) {
      await supabase.from("mm_users").update({ password: hashedInput }).eq("id", found.id);
    }

    const loggedIn: User = { id: found.id, name: found.name, email: found.email, provider: "email" };
    persistUser(loggedIn);
    await loadProfile(loggedIn);
    return {};
  }, [persistUser, loadProfile]);

  // ── Register ───────────────────────────────────────────────────────────────
  const register = useCallback(async (name: string, email: string, password: string): Promise<{ error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanName || !password) {
      return { error: "Пожалуйста, заполните все поля" };
    }

    if (password.length < 6) {
      return { error: "Пароль должен содержать не менее 6 символов" };
    }

    const existing = await dbGetUser(cleanEmail);
    if (existing) return { error: "Этот email уже зарегистрирован в магазине" };

    const id = crypto.randomUUID();
    const hashedPassword = await hashPassword(password, cleanEmail);

    const res = await dbCreateUser({ id, name: cleanName, email: cleanEmail, password: hashedPassword });
    if (res.error) return { error: res.error };

    // Create an empty profile for quick checkout
    const newProfile: UserProfile = { id, email: cleanEmail, name: cleanName, phone: "", city: "Ташкент", address: "" };
    await dbCreateProfile(newProfile);

    const loggedIn: User = { id, name: cleanName, email: cleanEmail, provider: "email" };
    persistUser(loggedIn);
    setUserProfile(newProfile);
    return {};
  }, [persistUser]);

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const loginWithGoogle = useCallback(async () => {
    // Google OAuth не настроен — показываем сообщение
    alert("Вход через Google временно недоступен. Используйте email и пароль.");
  }, []);

  // ── Logout ─────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    persistUser(null);
  }, [persistUser]);

  // ── Save profile (for quick checkout) ─────────────────────────────────────
  const saveProfile = useCallback(async (updates: Partial<Omit<UserProfile, "id" | "email">>) => {
    if (!user) return;
    await dbUpdateProfile(user.id, updates);
    setUserProfile((prev) => prev ? { ...prev, ...updates } : null);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAuthModalOpen,
        authTab,
        openAuthModal,
        closeAuthModal,
        setAuthTab,
        login,
        register,
        loginWithGoogle,
        logout,
        saveProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
