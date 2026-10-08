import type { Product } from "@/data/types";

export interface UsdProductInfo {
  isUsd: boolean;
  usdPrice: number | null;
  usdOldPrice: number | null;
  currentUzsPrice: number;
  calculatedUzsPrice: number;
  priceDiff: number;
  needsSync: boolean;
  hasUsdSizes: boolean;
  usdSizesCount: number;
}

/**
 * Checks whether a product was originally added with a USD price or has USD variations.
 */
export function isUsdProduct(product: Product): boolean {
  const specs = product.specs || {};
  const origCurrency = String(specs._origCurrency || specs.currency || "").trim().toUpperCase();
  if (origCurrency === "USD") return true;
  if (product.sizes && product.sizes.some((s) => s.currency === "USD")) return true;
  return false;
}

/**
 * Extracts USD price details and compares current UZS price against the given rate.
 */
export function getUsdProductInfo(product: Product, currentRate: number): UsdProductInfo {
  const specs = product.specs || {};
  const origCurrency = String(specs._origCurrency || specs.currency || "").trim().toUpperCase();
  const hasUsdSizes = !!(product.sizes && product.sizes.some((s) => s.currency === "USD"));
  const usdSizesCount = product.sizes ? product.sizes.filter((s) => s.currency === "USD").length : 0;

  const isUsd = origCurrency === "USD" || hasUsdSizes;

  let usdPrice: number | null = null;
  const rawPrice = specs._origPrice || specs.priceUsd || specs._priceUsd;
  if (rawPrice !== undefined && rawPrice !== null && String(rawPrice).trim() !== "") {
    const parsed = parseFloat(String(rawPrice).replace(/\s/g, "").replace(",", "."));
    if (!isNaN(parsed) && parsed > 0) {
      usdPrice = parsed;
    }
  }

  let usdOldPrice: number | null = null;
  const rawOldPrice = specs._origOldPrice;
  if (rawOldPrice !== undefined && rawOldPrice !== null && String(rawOldPrice).trim() !== "") {
    const parsedOld = parseFloat(String(rawOldPrice).replace(/\s/g, "").replace(",", "."));
    if (!isNaN(parsedOld) && parsedOld > 0) {
      usdOldPrice = parsedOld;
    }
  }

  const currentUzsPrice = product.price;
  const calculatedUzsPrice =
    usdPrice !== null && currentRate > 0 ? Math.round(usdPrice * currentRate) : currentUzsPrice;
  const priceDiff = calculatedUzsPrice - currentUzsPrice;

  // Check if any size price differs from size.originalPrice * currentRate
  const sizesNeedSync = hasUsdSizes && !!product.sizes?.some((s) => {
    if (s.currency === "USD" && s.originalPrice && s.originalPrice > 0) {
      return s.price !== Math.round(s.originalPrice * currentRate);
    }
    return false;
  });

  const needsSync = isUsd && ((usdPrice !== null && priceDiff !== 0) || sizesNeedSync);

  return {
    isUsd,
    usdPrice,
    usdOldPrice,
    currentUzsPrice,
    calculatedUzsPrice,
    priceDiff,
    needsSync,
    hasUsdSizes,
    usdSizesCount,
  };
}

/**
 * Returns a new product object with recalculated prices based on the new exchange rate.
 */
export function recalculateProductForRate(product: Product, newRate: number): Product {
  const info = getUsdProductInfo(product, newRate);
  if (!info.isUsd || newRate <= 0) return product;

  let newPrice = product.price;
  if (info.usdPrice !== null) {
    newPrice = Math.round(info.usdPrice * newRate);
  }

  let newOldPrice = product.oldPrice;
  if (info.usdOldPrice !== null) {
    newOldPrice = Math.round(info.usdOldPrice * newRate);
  }

  let newSizes = product.sizes;
  if (product.sizes && product.sizes.length > 0) {
    newSizes = product.sizes.map((s) => {
      if (s.currency === "USD" && s.originalPrice && s.originalPrice > 0) {
        return {
          ...s,
          price: Math.round(s.originalPrice * newRate),
          displayPrice: String(s.originalPrice),
        };
      }
      return s;
    });
  }

  return {
    ...product,
    price: newPrice,
    oldPrice: newOldPrice,
    sizes: newSizes,
  };
}
