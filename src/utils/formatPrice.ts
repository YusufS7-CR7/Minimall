/**
 * Formats a numeric price in Uzbek Sums into locale string with " сум" suffix.
 * Single source of truth across the whole application.
 */
const _formatter = new Intl.NumberFormat("ru-UZ", { style: "decimal" });

export function formatPrice(price: number, _usdRate?: number): string {
  const rounded = Math.round(price || 0);
  return _formatter.format(rounded) + " сум";
}

