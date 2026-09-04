import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Lang, Product, CartItem } from "@/data/types";
import { setGoogleTranslateLanguage } from "@/utils/googleTranslate";

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  cart: CartItem[];
  favorites: number[];
  toastMessage: string | null;
  totalCartCount: number;
  totalCartPrice: number;
  addToCart: (product: Product) => void;
  updateCartCount: (productId: number, delta: number) => void;
  clearCart: () => void;
  toggleFavorite: (productId: number) => void;
  removeFavorite: (productId: number) => void;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("mm_lang");
      if (saved === "ru" || saved === "uz") return saved;
    } catch {}
    return "uz"; // Default immediately to Uzbek as requested
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<number[]>([8]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    try {
      localStorage.setItem("mm_lang", newLang);
    } catch {}
    document.documentElement.lang = newLang;
    setGoogleTranslateLanguage(newLang);
  }, []);

  // Sync Google Translate on mount and when lang changes
  useEffect(() => {
    document.documentElement.lang = lang;
    setGoogleTranslateLanguage(lang);
  }, [lang]);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const addToCart = useCallback(
    (product: Product) => {
      setCart((prev) => {
        const existing = prev.find((i) => i.product.id === product.id);
        if (existing) {
          return prev.map((i) =>
            i.product.id === product.id
              ? { ...i, count: i.count + 1 }
              : i
          );
        }
        return [...prev, { product, count: 1 }];
      });
      showToast(
        lang === "ru"
          ? `"${product.name}" добавлен в корзину!`
          : `"${product.nameUz}" savatga qo'shildi!`
      );
    },
    [lang, showToast]
  );

  const updateCartCount = useCallback(
    (productId: number, delta: number) => {
      setCart((prev) =>
        prev
          .map((i) => {
            if (i.product.id !== productId) return i;
            const newCount = i.count + delta;
            return newCount > 0 ? { ...i, count: newCount } : null;
          })
          .filter(Boolean) as CartItem[]
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const removeFavorite = useCallback((productId: number) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
  }, []);

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
        return exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      });
    },
    [lang, showToast]
  );

  const totalCartCount = cart.reduce((s, i) => s + i.count, 0);
  const totalCartPrice = cart.reduce(
    (s, i) => s + i.product.price * i.count,
    0
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
