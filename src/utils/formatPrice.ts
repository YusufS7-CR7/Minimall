/**
 * Formats a numeric price into the Uzbek locale string with " сум" suffix.
 * Single source of truth — import this everywhere instead of re-declaring inline.
 */
const _formatter = new Intl.NumberFormat("ru-UZ", { style: "decimal" });

export function formatPrice(price: number): string {
  return _formatter.format(price) + " сум";
}
