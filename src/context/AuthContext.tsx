import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "email" | "google";
}

interface AuthContextValue {
  user: User | null;
  isAuthModalOpen: boolean;
  authTab: "login" | "register";
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  setAuthTab: (tab: "login" | "register") => void;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Fake "database" stored in sessionStorage ────────────────────────────────

function getStoredUsers(): Array<{ id: string; name: string; email: string; password: string; avatar?: string }> {
  try {
    return JSON.parse(sessionStorage.getItem("mm_users") ?? "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: ReturnType<typeof getStoredUsers>) {
  sessionStorage.setItem("mm_users", JSON.stringify(users));
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = sessionStorage.getItem("mm_current_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");

  const persistUser = (u: User | null) => {
    setUser(u);
    if (u) sessionStorage.setItem("mm_current_user", JSON.stringify(u));
    else sessionStorage.removeItem("mm_current_user");
  };

  const openAuthModal = useCallback((tab: "login" | "register" = "login") => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    await new Promise((r) => setTimeout(r, 600));
    const users = getStoredUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) return { error: "Неверный email или пароль" };
    const loggedIn: User = { id: found.id, name: found.name, email: found.email, avatar: found.avatar, provider: "email" };
    persistUser(loggedIn);
    return {};
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ error?: string }> => {
    await new Promise((r) => setTimeout(r, 600));
    const users = getStoredUsers();
    if (users.find((u) => u.email === email)) return { error: "Этот email уже используется" };
    const newUser = { id: crypto.randomUUID(), name, email, password };
    saveUsers([...users, newUser]);
    const loggedIn: User = { id: newUser.id, name: newUser.name, email: newUser.email, provider: "email" };
    persistUser(loggedIn);
    return {};
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await new Promise((r) => setTimeout(r, 900));
    // Simulate Google OAuth – replace with real Google Sign-In SDK in production
    const mockGoogleUser: User = {
      id: "google-" + crypto.randomUUID(),
      name: "Google User",
      email: "user@gmail.com",
      avatar: `https://ui-avatars.com/api/?name=Google+User&background=4285F4&color=fff&size=64`,
      provider: "google",
    };
    persistUser(mockGoogleUser);
  }, []);

  const logout = useCallback(() => {
    persistUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthModalOpen,
        authTab,
        openAuthModal,
        closeAuthModal,
        setAuthTab,
        login,
        register,
        loginWithGoogle,
        logout,
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
