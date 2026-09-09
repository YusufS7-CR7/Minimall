import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Product } from "@/data/types";
import { slugify, BRANDS as INITIAL_BRANDS } from "@/data/products";
import { supabase } from "@/lib/supabase";

// ─── DB row type (Supabase snake_case) ───────────────────────────────────────

interface DbProduct {
  id: number;
  slug: string;
  name: string;
  name_uz: string;
  brand: string;
  category: string;
  price: number;
  old_price: number | null;
  image: string;
  images: string[] | null;
  voltage: string | null;
  power: string | null;
  type: string;
  desc_ru: string | null;
  desc_uz: string | null;
  specs: Record<string, string> | null;
  badge: string | null;
  in_stock: boolean;
  rating: number | null;
  created_at: string;
}

function dbToProduct(row: DbProduct): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameUz: row.name_uz,
    brand: row.brand,
    category: row.category,
    price: row.price,
    oldPrice: row.old_price ?? undefined,
    image: row.image,
    images: row.images ?? [],
    voltage: row.voltage ?? undefined,
    power: row.power ?? undefined,
    type: row.type,
    descRu: row.desc_ru ?? "",
    descUz: row.desc_uz ?? "",
    specs: row.specs ?? {},
    badge: row.badge ?? undefined,
    inStock: row.in_stock,
    rating: row.rating ?? undefined,
  };
}

function productToDb(p: Omit<Product, "id"> & { id?: number }): Omit<DbProduct, "id" | "created_at"> & { id?: number } {
  return {
    ...(p.id ? { id: p.id } : {}),
    slug: p.slug,
    name: p.name,
    name_uz: p.nameUz,
    brand: p.brand,
    category: p.category,
    price: p.price,
    old_price: p.oldPrice ?? null,
    image: p.image,
    images: p.images ?? [],
    voltage: p.voltage ?? null,
    power: p.power ?? null,
    type: p.type,
    desc_ru: p.descRu ?? null,
    desc_uz: p.descUz ?? null,
    specs: p.specs ?? {},
    badge: p.badge ?? null,
    in_stock: p.inStock ?? true,
    rating: p.rating ?? null,
  };
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface ProductsContextValue {
  products: Product[];
  loading: boolean;
  addProduct: (data: Omit<Product, "id"> & { id?: number }) => Promise<Product | null>;
  updateProduct: (id: number, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  resetProducts: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: number) => Product | undefined;
  brands: string[];
  addBrand: (brandName: string) => void;
  exportCatalog: () => void;
  importCatalog: (jsonString: string) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all products from Supabase ───────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts((data as DbProduct[]).map(dbToProduct));
    } else if (error) {
      console.error("Failed to fetch products:", error.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Custom brands (still localStorage — lightweight, no table needed) ──────
  const [customBrands, setCustomBrands] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("minimall_custom_brands_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error("Failed to load custom brands from localStorage", e);
    }
    return [];
  });

  const addBrand = useCallback((brandName: string) => {
    const trimmed = brandName.trim();
    if (!trimmed) return;
    setCustomBrands((prev) => {
      if (prev.some((b) => b.toLowerCase() === trimmed.toLowerCase())) {
        return prev;
      }
      const updated = [...prev, trimmed];
      try {
        localStorage.setItem("minimall_custom_brands_v2", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save custom brands to localStorage", e);
      }
      return updated;
    });
  }, []);

  const brands = useMemo(() => {
    const set = new Set<string>(INITIAL_BRANDS);
    customBrands.forEach((b) => {
      if (b && b.trim()) set.add(b.trim());
    });
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        set.add(p.brand.trim());
      }
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [products, customBrands]);

  // ── Lookups ────────────────────────────────────────────────────────────────
  const getProductBySlug = useCallback(
    (slug: string) => products.find((p) => p.slug === slug),
    [products]
  );

  const getProductById = useCallback(
    (id: number) => products.find((p) => p.id === id),
    [products]
  );

  // ── Add product ────────────────────────────────────────────────────────────
  const addProduct = useCallback(
    async (data: Omit<Product, "id"> & { id?: number }): Promise<Product | null> => {
      let targetSlug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);
      if (!targetSlug) targetSlug = `product-${Date.now()}`;

      const dbRow = productToDb({ ...data, slug: targetSlug });
      // Remove id so Supabase auto-increments
      delete dbRow.id;

      const { data: inserted, error } = await supabase
        .from("products")
        .insert([dbRow])
        .select()
        .single();

      if (error) {
        console.error("Failed to add product:", error.message);
        return null;
      }

      const newProduct = dbToProduct(inserted as DbProduct);
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    },
    []
  );

  // ── Update product ─────────────────────────────────────────────────────────
  const updateProduct = useCallback(
    async (id: number, patch: Partial<Product>) => {
      // Build the DB-compatible patch
      const dbPatch: Record<string, unknown> = {};
      if (patch.name !== undefined) dbPatch.name = patch.name;
      if (patch.nameUz !== undefined) dbPatch.name_uz = patch.nameUz;
      if (patch.slug !== undefined) dbPatch.slug = slugify(patch.slug);
      if (patch.brand !== undefined) dbPatch.brand = patch.brand;
      if (patch.category !== undefined) dbPatch.category = patch.category;
      if (patch.price !== undefined) dbPatch.price = patch.price;
      if (patch.oldPrice !== undefined) dbPatch.old_price = patch.oldPrice;
      if (patch.image !== undefined) dbPatch.image = patch.image;
      if (patch.images !== undefined) dbPatch.images = patch.images;
      if (patch.voltage !== undefined) dbPatch.voltage = patch.voltage;
      if (patch.power !== undefined) dbPatch.power = patch.power;
      if (patch.type !== undefined) dbPatch.type = patch.type;
      if (patch.descRu !== undefined) dbPatch.desc_ru = patch.descRu;
      if (patch.descUz !== undefined) dbPatch.desc_uz = patch.descUz;
      if (patch.specs !== undefined) dbPatch.specs = patch.specs;
      if (patch.badge !== undefined) dbPatch.badge = patch.badge;
      if (patch.inStock !== undefined) dbPatch.in_stock = patch.inStock;
      if (patch.rating !== undefined) dbPatch.rating = patch.rating;

      const { error } = await supabase
        .from("products")
        .update(dbPatch)
        .eq("id", id);

      if (error) {
        console.error("Failed to update product:", error.message);
        return;
      }

      // Optimistic local update
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;
          let nextSlug = p.slug;
          if (patch.slug && patch.slug !== p.slug) {
            nextSlug = slugify(patch.slug);
          }
          return { ...p, ...patch, slug: nextSlug };
        })
      );
    },
    []
  );

  // ── Delete product ─────────────────────────────────────────────────────────
  const deleteProduct = useCallback(async (id: number) => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete product:", error.message);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Reset (delete all) ────────────────────────────────────────────────────
  const resetProducts = useCallback(async () => {
    // Delete all products from Supabase
    const { error } = await supabase
      .from("products")
      .delete()
      .neq("id", 0); // delete all rows

    if (error) {
      console.error("Failed to reset products:", error.message);
      return;
    }

    setProducts([]);
  }, []);

  // ── Export catalog ─────────────────────────────────────────────────────────
  const exportCatalog = useCallback(() => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(products, null, 2));
    const a = document.createElement("a");
    a.setAttribute("href", dataStr);
    a.setAttribute(
      "download",
      `minimall-catalog-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [products]);

  // ── Import catalog ─────────────────────────────────────────────────────────
  const importCatalog = useCallback(async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (!Array.isArray(parsed) || parsed.length === 0) return false;

      // Convert to DB format
      const dbRows = parsed.map((p: Product) => {
        const row = productToDb(p);
        delete row.id; // Let Supabase auto-increment
        return row;
      });

      // Clear existing products
      await supabase.from("products").delete().neq("id", 0);

      // Insert all
      const { error } = await supabase.from("products").insert(dbRows);
      if (error) {
        console.error("Failed to import catalog:", error.message);
        return false;
      }

      // Refresh from DB
      await fetchProducts();
      return true;
    } catch (e) {
      console.error("Invalid JSON catalog file", e);
      return false;
    }
  }, [fetchProducts]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProducts,
        getProductBySlug,
        getProductById,
        brands,
        addBrand,
        exportCatalog,
        importCatalog,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return ctx;
}
