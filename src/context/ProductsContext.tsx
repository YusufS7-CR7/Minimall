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
  subcategory?: string | null;
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
  const specs = row.specs ?? {};
  const subcategory =
    row.subcategory ||
    (specs as Record<string, any>)?._subcategory ||
    (specs as Record<string, any>)?.subcategory ||
    undefined;

  let sizes: string[] | undefined = undefined;
  if (specs && typeof specs === "object") {
    const rawSizes = (specs as Record<string, any>)._sizes ?? (specs as Record<string, any>).sizes;
    if (Array.isArray(rawSizes)) {
      sizes = rawSizes.map(String).filter((s) => s.trim().length > 0);
    } else if (typeof rawSizes === "string") {
      try {
        const parsed = JSON.parse(rawSizes);
        if (Array.isArray(parsed)) {
          sizes = parsed.map(String).filter((s) => s.trim().length > 0);
        }
      } catch {
        sizes = rawSizes.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
  }

  let categories: string[] = [];
  if (specs && typeof specs === "object") {
    const rawCats = (specs as Record<string, any>)._categories ?? (specs as Record<string, any>).categories;
    if (Array.isArray(rawCats)) {
      categories = rawCats.map(String).map((s) => s.trim()).filter(Boolean);
    } else if (typeof rawCats === "string") {
      try {
        const parsed = JSON.parse(rawCats);
        if (Array.isArray(parsed)) {
          categories = parsed.map(String).map((s) => s.trim()).filter(Boolean);
        }
      } catch {
        categories = rawCats.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
  }
  if (categories.length === 0 && row.category) {
    categories = [row.category];
  }

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nameUz: row.name_uz,
    brand: row.brand,
    category: categories[0] || row.category || "",
    categories: categories.length > 0 ? categories : undefined,
    subcategory,
    price: row.price,
    oldPrice: row.old_price ?? undefined,
    image: row.image,
    images: row.images ?? [],
    voltage: row.voltage ?? undefined,
    power: row.power ?? undefined,
    type: row.type,
    descRu: row.desc_ru ?? "",
    descUz: row.desc_uz ?? "",
    specs,
    badge: row.badge ?? undefined,
    inStock: row.in_stock,
    rating: row.rating ?? undefined,
    sizes: sizes && sizes.length > 0 ? sizes : undefined,
  };
}

function productToDb(p: Omit<Product, "id"> & { id?: number }): Omit<DbProduct, "id" | "created_at"> & { id?: number } {
  const cats = (p.categories && p.categories.length > 0)
    ? p.categories.map((c) => c.trim()).filter(Boolean)
    : (p.category ? [p.category.trim()] : []);
  const primaryCategory = cats[0] || p.category || "";

  const specs = {
    ...(p.specs ?? {}),
    ...(p.subcategory ? { _subcategory: p.subcategory } : {}),
    ...(p.sizes && p.sizes.length > 0 ? { _sizes: JSON.stringify(p.sizes) } : {}),
    ...(cats.length > 0 ? { _categories: JSON.stringify(cats) } : {}),
  };
  return {
    ...(p.id ? { id: p.id } : {}),
    slug: p.slug,
    name: p.name,
    name_uz: p.nameUz,
    brand: p.brand,
    category: primaryCategory,
    price: p.price,
    old_price: p.oldPrice ?? null,
    image: p.image,
    images: p.images ?? [],
    voltage: p.voltage ?? null,
    power: p.power ?? null,
    type: p.type,
    desc_ru: p.descRu ?? null,
    desc_uz: p.descUz ?? null,
    specs,
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
  addProductsBatch: (items: Array<Omit<Product, "id">>) => Promise<Product[]>;
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

  // ── Add products batch (Excel / CSV import) ────────────────────────────────
  const addProductsBatch = useCallback(
    async (items: Array<Omit<Product, "id">>): Promise<Product[]> => {
      if (items.length === 0) return [];

      const usedSlugs = new Set<string>();
      const dbRows = items.map((data) => {
        let baseSlug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);
        if (!baseSlug) baseSlug = `item-${Date.now()}`;
        let finalSlug = baseSlug;
        let counter = 1;
        while (usedSlugs.has(finalSlug)) {
          finalSlug = `${baseSlug}-${counter++}`;
        }
        usedSlugs.add(finalSlug);

        const dbRow = productToDb({ ...data, slug: finalSlug });
        delete dbRow.id;
        return dbRow;
      });

      const { data: inserted, error } = await supabase
        .from("products")
        .insert(dbRows)
        .select();

      if (error) {
        console.error("Batch insert failed, falling back to sequential:", error.message);
        const fallbackResults: Product[] = [];
        for (const item of items) {
          const res = await addProduct(item);
          if (res) fallbackResults.push(res);
        }
        return fallbackResults;
      }

      const newProducts = (inserted as DbProduct[]).map(dbToProduct);
      setProducts((prev) => [...newProducts, ...prev]);
      return newProducts;
    },
    [addProduct]
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
      if (patch.price !== undefined) dbPatch.price = patch.price;
      if (patch.oldPrice !== undefined) dbPatch.old_price = patch.oldPrice;
      if (patch.image !== undefined) dbPatch.image = patch.image;
      if (patch.images !== undefined) dbPatch.images = patch.images;
      if (patch.voltage !== undefined) dbPatch.voltage = patch.voltage;
      if (patch.power !== undefined) dbPatch.power = patch.power;
      if (patch.type !== undefined) dbPatch.type = patch.type;
      if (patch.descRu !== undefined) dbPatch.desc_ru = patch.descRu;
      if (patch.descUz !== undefined) dbPatch.desc_uz = patch.descUz;

      // Handle category, categories, subcategory, sizes and specs
      if (
        patch.categories !== undefined ||
        patch.category !== undefined ||
        patch.subcategory !== undefined ||
        patch.sizes !== undefined ||
        patch.specs !== undefined
      ) {
        const currentProd = products.find((p) => p.id === id);
        const mergedSpecs: Record<string, any> = {
          ...(currentProd?.specs || {}),
          ...(patch.specs || {}),
        };

        if (patch.subcategory !== undefined) {
          if (patch.subcategory) {
            mergedSpecs._subcategory = patch.subcategory;
          } else {
            delete mergedSpecs._subcategory;
          }
        }

        if (patch.sizes !== undefined) {
          if (patch.sizes && patch.sizes.length > 0) {
            mergedSpecs._sizes = JSON.stringify(patch.sizes);
          } else {
            delete mergedSpecs._sizes;
          }
        }

        if (patch.categories !== undefined) {
          const cats = patch.categories.map((c) => c.trim()).filter(Boolean);
          if (cats.length > 0) {
            mergedSpecs._categories = JSON.stringify(cats);
            dbPatch.category = cats[0];
          } else {
            delete mergedSpecs._categories;
          }
        } else if (patch.category !== undefined) {
          dbPatch.category = patch.category;
          mergedSpecs._categories = JSON.stringify([patch.category]);
        }

        dbPatch.specs = mergedSpecs;
      }
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
          const nextCategories = patch.categories !== undefined
            ? patch.categories
            : (patch.category ? [patch.category] : p.categories);
          const nextCategory = (nextCategories && nextCategories.length > 0)
            ? nextCategories[0]
            : (patch.category || p.category);

          return {
            ...p,
            ...patch,
            category: nextCategory,
            categories: nextCategories,
            slug: nextSlug,
          };
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
        addProductsBatch,
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
