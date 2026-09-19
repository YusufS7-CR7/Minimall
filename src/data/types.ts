// ─── Core Types ───────────────────────────────────────────────────────────────

export type Lang = "ru" | "uz";

export interface SubcategoryDef {
  key: string;
  slug: string;
  labelRu: string;
  labelUz: string;
}

export interface Product {
  id: number;
  /** Slug used in URLs — auto-generated from name, must be unique */
  slug: string;
  name: string;
  nameUz: string;
  brand: string;
  /** Primary Category key (matches CategoryDef.key) */
  category: string;
  /** Multiple Category keys (when product belongs to more than one category) */
  categories?: string[];
  /** Subcategory key (optional, matches SubcategoryDef.key within the category) */
  subcategory?: string;
  /** Multiple Subcategory keys (optional) */
  subcategories?: string[];
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  voltage?: string;
  power?: string;
  type: string;
  descRu: string;
  descUz: string;
  specs: Record<string, string>;
  badge?: string;
  inStock: boolean;
  rating?: number;
  /** Available sizes/variations (e.g. ["3mm", "4mm", "6mm"] or ["100mm", "125mm"]) */
  sizes?: string[];
}

export interface CategoryDef {
  /** URL-safe key used in /catalog/:slug */
  key: string;
  slug: string;
  icon: string;
  image: string;
  labelRu: string;
  labelUz: string;
  subcategories?: SubcategoryDef[];
}

export interface CartItem {
  product: Product;
  count: number;
  selectedSize?: string;
}
