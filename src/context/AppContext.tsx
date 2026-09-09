import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react";
import type { Lang, Product, CartItem } from "@/data/types";
import { setGoogleTranslateLanguage } from "@/utils/googleTranslate";

// ─── Per-user localStorage helpers ───────────────────────────────────────────

function cartKey(uid: string) { return `mm_cart_${uid}`; }
function favsKey(uid: string) { return `mm_favs_${uid}`; }

function loadCart(uid: string): CartItem[] {
  try {
    const raw = localStorage.getItem(cartKey(uid));
    if (raw) return JSON.parse(raw) as CartItem[];
  } catch {}
  return [];
}

function saveCart(uid: string, cart: CartItem[]) {
  try { localStorage.setItem(cartKey(uid), JSON.stringify(cart)); } catch {}
}

function loadFavsForUser(uid: string): number[] {
  try {
    const raw = localStorage.getItem(favsKey(uid));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as number[];
    }
  } catch {}
  return uid === "guest" ? [8] : []; // seed only for guests
}

function saveFavsForUser(uid: string, ids: number[]) {
  try { localStorage.setItem(favsKey(uid), JSON.stringify(ids)); } catch {}
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  cart: CartItem[];
  favorites: number[];
  toastMessage: string | null;
  totalCartCount: number;
  totalCartPrice: number;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  toggleTheme: () => void;
  addToCart: (product: Product) => void;
  updateCartCount: (productId: number, delta: number) => void;
  clearCart: () => void;
  toggleFavorite: (productId: number) => void;
  removeFavorite: (productId: number) => void;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyTheme(theme: "light" | "dark") {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// (per-user helpers moved to top)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children, userId = "guest" }: { children: ReactNode; userId?: string }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("mm_lang");
      if (saved === "ru" || saved === "uz") return saved;
    } catch {}
    return "uz";
  });

  const [theme, setThemeState] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("mm_theme");
      if (saved === "dark" || saved === "light") return saved;
    } catch {}
    return "light";
  });

  const [cart, setCart] = useState<CartItem[]>(() => loadCart(userId));
  const [favorites, setFavorites] = useState<number[]>(() => loadFavsForUser(userId));
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Sync cart & favorites when userId changes (login / logout) ────────────
  const prevUserIdRef = useRef(userId);
  useEffect(() => {
    if (prevUserIdRef.current === userId) return;
    // Save outgoing user's data
    saveCart(prevUserIdRef.current, cart);
    saveFavsForUser(prevUserIdRef.current, favorites);
    // Load incoming user's data
    setCart(loadCart(userId));
    setFavorites(loadFavsForUser(userId));
    prevUserIdRef.current = userId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Apply theme once on mount (no extra useEffect needed — done in setTheme/toggleTheme)
  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only once on mount

  // ── Theme ────────────────────────────────────────────────────────────────────
  const setTheme = useCallback((newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("mm_theme", newTheme);
    } catch {}
    applyTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("mm_theme", next);
      } catch {}
      applyTheme(next);
      return next;
    });
  }, []);

  // ── Language ─────────────────────────────────────────────────────────────────
  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem("mm_lang", newLang);
    } catch {}
    document.documentElement.lang = newLang;
    setGoogleTranslateLanguage(newLang);
  }, []);

  // Sync Google Translate & html lang on mount
  useEffect(() => {
    document.documentElement.lang = lang;
    setGoogleTranslateLanguage(lang);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally run only once; setLang keeps subsequent ones in sync

  // ── Toast ─────────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // ── Cart ──────────────────────────────────────────────────────────────────────
  const addToCart = useCallback(
    (product: Product) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        const next = existing
          ? prev.map((i) =>
              i.product.id === product.id ? { ...i, count: i.count + 1 } : i
            )
          : [...prev, { product, count: 1 }];
        saveCart(userId, next);
        return next;
      });
      showToast(
        lang === "ru"
          ? `"${product.name}" добавлен в корзину!`
          : `"${product.nameUz}" savatga qo'shildi!`
      );
    },
    [lang, showToast, userId]
  );

  const updateCartCount = useCallback(
    (productId: number, delta: number) => {
      setCart((prev) => {
        const next = prev
          .map((i) => {
            if (i.product.id !== productId) return i;
            const newCount = i.count + delta;
            return newCount > 0 ? { ...i, count: newCount } : null;
          })
          .filter(Boolean) as CartItem[];
        saveCart(userId, next);
        return next;
      });
    },
    [userId]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    saveCart(userId, []);
  }, [userId]);

  // ── Favorites ─────────────────────────────────────────────────────────────────
  const removeFavorite = useCallback((productId: number) => {
    setFavorites((prev) => {
      const next = prev.filter((id) => id !== productId);
      saveFavsForUser(userId, next);
      return next;
    });
  }, [userId]);

  const toggleFavorite = useCallback(
    (productId: number) => {
      setFavorites((prev) => {
        const exists = prev.includes(productId);
        showToast(
          exists
            ? lang === "ru"
              ? "Удалено из избранного"
              : "Sevimlilardan o'chirildi"
            : lang === "ru"
            ? "Добавлено в избранное ❤️"
            : "Sevimlilarga qo'shildi ❤️"
        );
        const next = exists
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        saveFavsForUser(userId, next);
        return next;
      });
    },
    [lang, showToast, userId]
  );

  // ── Derived values (memoized) ─────────────────────────────────────────────────
  const totalCartCount = useMemo(
    () => cart.reduce((s, i) => s + i.count, 0),
    [cart]
  );
  const totalCartPrice = useMemo(
    () => cart.reduce((s, i) => s + i.product.price * i.count, 0),
    [cart]
  );

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        cart,
        favorites,
        toastMessage,
        totalCartCount,
        totalCartPrice,
        theme,
        setTheme,
        toggleTheme,
        addToCart,
        updateCartCount,
        clearCart,
        toggleFavorite,
        removeFavorite,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
