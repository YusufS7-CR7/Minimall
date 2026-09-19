import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// Default exchange rate (USD to UZS)
const DEFAULT_RATE = 12700;
const STORAGE_KEY = "mm_usd_rate";

function loadRate(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
  } catch {}
  return DEFAULT_RATE;
}

function saveRate(rate: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(rate));
  } catch {}
}

interface CurrencyContextValue {
  usdRate: number;
  setUsdRate: (rate: number) => void;
  toSom: (usd: number) => number;
  formatSom: (usd: number | undefined) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

const _formatter = new Intl.NumberFormat("ru-UZ", { style: "decimal" });

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [usdRate, setUsdRateState] = useState<number>(loadRate);

  const setUsdRate = useCallback((rate: number) => {
    if (isNaN(rate) || rate <= 0) return;
    setUsdRateState(rate);
    saveRate(rate);
  }, []);

  const toSom = useCallback(
    (usd: number) => Math.round(usd * usdRate),
    [usdRate]
  );

  const formatSom = useCallback(
    (usd: number | undefined): string => {
      if (usd === undefined || usd === null) return "";
      return _formatter.format(Math.round(usd * usdRate)) + " сум";
    },
    [usdRate]
  );

  return (
    <CurrencyContext.Provider value={{ usdRate, setUsdRate, toSom, formatSom }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside <CurrencyProvider>");
  return ctx;
}
