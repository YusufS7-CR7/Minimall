/**
 * Formats a numeric price in Uzbek Sums into locale string with " сум" suffix.
 * Single source of truth across the whole application.
 */
const _formatter = new Intl.NumberFormat("ru-UZ", { style: "decimal" });

export function formatPrice(price: number, _usdRate?: number): string {
  const rounded = Math.round(price || 0);
  return _formatter.format(rounded) + " сум";
}

/**
 * Formats a raw number or string with spaces every 3 digits
 * e.g. "2150000" -> "2 150 000"
 */
export function formatNumberWithSpaces(val: string | number | undefined | null): string {
  if (val === undefined || val === null) return "";
  const digits = String(val).replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Parses formatted string into integer
 * e.g. "2 150 000" -> 2150000
 */
export function parseFormattedNumber(val: string | undefined | null): number {
  if (!val) return 0;
  const digits = String(val).replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

