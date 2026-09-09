import type { Product } from "./types";

// ─── Slug Helpers ─────────────────────────────────────────────────────────────

/**
 * Converts a product name to a URL-safe slug.
 * e.g. "Угловая шлифмашина Makita GA5030" → "makita-ga5030"
 * For SEO we prioritize the model number from the name.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[а-я]/g, (c) => {
      const map: Record<string, string> = {
        а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
        ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
        н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
        ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
        ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
      };
      return map[c] || c;
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Find a product by its slug */
export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** Find products by brand slug */
export function getProductsByBrand(brandSlug: string): Product[] {
  return PRODUCTS.filter((p) => slugify(p.brand) === brandSlug);
}

// ─── Brand List ───────────────────────────────────────────────────────────────

/** Unique brand list */
export const BRANDS: string[] = [
  "EPA",
  "Sibrtex",
  "Sparta",
  "MTX",
  "Denzel",
  "Pollwon",
  "Biyoti",
  "Ubay",
  "Bosch",
  "Makita",
  "DeWalt",
  "Ferro",
  "SL",
  "Mexmash",
  "Epica",
  "PIT",
  "Dima",
  "LIT",
  "Dingqi",
  "3M",
  "Tytan",
  "Selsil",
  "Soudal",
  "Akfix",
  "Yato",
  "Yofe",
  "Force",
  "Stels",
  "Luga",
  "Ekspert",
  "DDER",
  "Varta",
  "Beshr",
  "Philips",
  "Milwaukee",
  "Metabo",
  "Hilti",
  "Crown",
  "Total",
  "Ingco",
];

// ─── Product Data ─────────────────────────────────────────────────────────────

/** Товары добавляются администратором через админ-панель */
export const PRODUCTS: Product[] = [];
