/**
 * Parses a string containing one or more size specifications into an array of size names.
 * Preserves decimal numbers with commas or dots (e.g. "7,25", "8,34", "7,125", "7.5")
 * without any restrictions on the number of digits after the decimal separator.
 *
 * Examples:
 * - "7,25" -> ["7,25"]
 * - "8,34" -> ["8,34"]
 * - "7,125" -> ["7,125"]
 * - "7,25, 8,34, 10" -> ["7,25", "8,34", "10"]
 * - "7,25; 8,34" -> ["7,25", "8,34"]
 * - "4mm, 6mm, 8mm" -> ["4mm", "6mm", "8mm"]
 * - "S, M, L" -> ["S", "M", "L"]
 */
export function parseSizeNames(input: string): string[] {
  const trimmed = input.trim();
  if (!trimmed) return [];

  // Split on newlines and semicolons first
  const tokens = trimmed.split(/[\r\n;]+/).map((s) => s.trim()).filter(Boolean);

  const result: string[] = [];
  for (const token of tokens) {
    // Split by:
    // 1) Comma followed by whitespace: `,\s+` (e.g. "7,25, 8,34, 10")
    // 2) Comma adjacent to non-digits: `(?<=\D),|,(?=\D)` (e.g. "4mm,6mm,8mm", "S,M,L")
    // Decimal commas directly between two digits with no space `(?<=\d),(?=\d)` are kept intact.
    const subTokens = token
      .split(/,\s+|(?<=\D),|,(?=\D)/)
      .map((s) => s.trim())
      .filter(Boolean);

    result.push(...subTokens);
  }

  return result;
}
