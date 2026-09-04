// ─── Core Types ───────────────────────────────────────────────────────────────

export type Lang = "ru" | "uz";

export interface Product {
  id: number;
  /** Slug used in URLs — auto-generated from name, must be unique */
  slug: string;
  name: string;
  nameUz: string;
  brand: string;
  /** Category key (matches CategoryDef.key) */
  category: string;
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
}

export interface CategoryDef {
  /** URL-safe key used in /catalog/:slug */
  key: string;
  slug: string;
  icon: string;
  image: string;
  labelRu: string;
  labelUz: string;
}

export interface CartItem {
  product: Product;
  count: number;
}
