import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { Product, ProductSize, StockStatus } from "@/data/types";
import { slugify, BRANDS as INITIAL_BRANDS } from "@/data/products";
import { supabase } from "@/lib/supabase";
import { isUsdProduct, recalculateProductForRate } from "@/utils/usdProductUtils";

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

  let sizes: ProductSize[] | undefined = undefined;
  if (specs && typeof specs === "object") {
    const rawSizes = (specs as Record<string, any>)._sizes ?? (specs as Record<string, any>).sizes;
    if (Array.isArray(rawSizes)) {
      sizes = rawSizes
        .map((item: unknown) => {
          if (typeof item === "string") return { name: item, price: row.price };
          if (!item || typeof item !== "object") return null;
          const value = item as Record<string, unknown>;
          const name = String(value.name ?? value.size ?? "").trim();
          const price = Number(value.price ?? row.price);
          return name && price > 0 ? {
            name,
            price,
            currency: value.currency === "USD" ? "USD" : "UZS",
            originalPrice: Number(value.originalPrice ?? price),
          } : null;
        })
        .filter(Boolean) as ProductSize[];
    } else if (typeof rawSizes === "string") {
      try {
        const parsed = JSON.parse(rawSizes);
        if (Array.isArray(parsed)) {
          sizes = (parsed.map((item: unknown) => {
            if (typeof item === "string") return { name: item, price: row.price };
            const value = item as Record<string, unknown>;
            const name = String(value?.name ?? value?.size ?? "").trim();
            const price = Number(value?.price ?? row.price);
            return {
              name,
              price: price > 0 ? price : row.price,
              currency: (value?.currency === "USD" ? "USD" : "UZS") as "USD" | "UZS",
              originalPrice: Number(value?.originalPrice ?? price),
            };
          }) as ProductSize[]).filter((s) => s.name);
        }
      } catch {
        sizes = rawSizes.split(",").map((s) => ({ name: s.trim(), price: row.price })).filter((s) => s.name);
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

  const rawStockStatus = (specs as Record<string, any>)?._stockStatus as StockStatus | undefined;
  const stockStatus: StockStatus = rawStockStatus || (row.in_stock ? "in_stock" : "out_of_stock");

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
    inStock: stockStatus !== "out_of_stock",
    stockStatus,
    rating: row.rating ?? undefined,
    sizes: sizes && sizes.length > 0 ? sizes : undefined,
  };
}

function productToDb(p: Omit<Product, "id"> & { id?: number }): Omit<DbProduct, "id" | "created_at"> & { id?: number } {
  const cats = (p.categories && p.categories.length > 0)
    ? p.categories.map((c) => c.trim()).filter(Boolean)
    : (p.category ? [p.category.trim()] : []);
  const primaryCategory = cats[0] || p.category || "";

  // Store clean specs plus system fields in specs JSONB (as the table schema uses specs for these)
  const rawSpecs = p.specs ?? {};
  const specs: Record<string, string> = {};
  for (const [k, v] of Object.entries(rawSpecs)) {
    // Skip any auto-generated underscore system keys
    if (k.startsWith("_sizes") || k.startsWith("_categories") || k === "_subcategory" || k === "_stockStatus") continue;
    specs[k] = v;
  }
  if (p.subcategory) {
    specs._subcategory = p.subcategory;
  }
  if (cats.length > 0) {
    specs._categories = JSON.stringify(cats);
  }
  if (p.sizes && p.sizes.length > 0) {
    specs._sizes = JSON.stringify(p.sizes);
  }
  const stockStatus: StockStatus = p.stockStatus || (p.inStock ? "in_stock" : "out_of_stock");
  specs._stockStatus = stockStatus;

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
    in_stock: stockStatus !== "out_of_stock",
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
  syncProductsWithUsdRate: (
    newRate: number,
    onProgress?: (progress: { current: number; total: number; percent: number }) => void
  ) => Promise<{ updatedCount: number; totalUsdCount: number; success: boolean }>;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

const CACHE_KEY = "minimall_products_cache_v3";

function loadCachedProducts(): Product[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load products from cache", e);
  }
  return [];
}

function saveCachedProducts(prods: Product[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(prods));
  } catch {
    // Ignore storage quota or private-browsing errors
  }
}

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(loadCachedProducts);
  const [loading, setLoading] = useState<boolean>(() => products.length === 0);

  // Sync state to cache whenever products change
  useEffect(() => {
    if (products.length > 0) {
      saveCachedProducts(products);
    }
  }, [products]);

  // ── Fetch all products from Supabase ───────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    // Only display loading screen if we have no cached data at all
    setProducts((current) => {
      if (current.length === 0) setLoading(true);
      return current;
    });

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped = (data as DbProduct[]).map(dbToProduct);
      setProducts(mapped);
      saveCachedProducts(mapped);
    } else if (error) {
      console.error("Failed to fetch products:", error.message);
      // Notice: we DO NOT clear `products`, we keep existing cached products!
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

      // Handle category, categories, subcategory, sizes, stockStatus and specs
      if (
        patch.categories !== undefined ||
        patch.category !== undefined ||
        patch.subcategory !== undefined ||
        patch.sizes !== undefined ||
        patch.stockStatus !== undefined ||
        patch.specs !== undefined
      ) {
        const currentProd = products.find((p) => p.id === id);
        const mergedSpecs: Record<string, any> = {
          ...(currentProd?.specs || {}),
          ...(patch.specs || {}),
        };

        // Build clean specs without any old auto-generated system keys
        const cleanSpecs: Record<string, string> = {};
        for (const [k, v] of Object.entries(mergedSpecs)) {
          if (k.startsWith("_sizes") || k.startsWith("_categories") || k === "_subcategory" || k === "_stockStatus") continue;
          cleanSpecs[k] = v;
        }

        // Subcategory is preserved in specs._subcategory
        const effectiveSubcat = patch.subcategory !== undefined ? patch.subcategory : currentProd?.subcategory;
        if (effectiveSubcat) {
          cleanSpecs._subcategory = effectiveSubcat;
        }

        // Categories are preserved in specs._categories and dbPatch.category
        if (patch.categories !== undefined) {
          const cats = patch.categories.map((c) => c.trim()).filter(Boolean);
          if (cats.length > 0) {
            dbPatch.category = cats[0];
            cleanSpecs._categories = JSON.stringify(cats);
          }
        } else if (patch.category !== undefined) {
          dbPatch.category = patch.category;
        } else if (currentProd?.categories && currentProd.categories.length > 0) {
          cleanSpecs._categories = JSON.stringify(currentProd.categories);
        }

        // Sizes are preserved in specs._sizes
        const effectiveSizes = patch.sizes !== undefined ? patch.sizes : currentProd?.sizes;
        if (effectiveSizes && effectiveSizes.length > 0) {
          cleanSpecs._sizes = JSON.stringify(effectiveSizes);
        }

        // Stock status is preserved in specs._stockStatus
        const effectiveStockStatus = patch.stockStatus !== undefined ? patch.stockStatus : currentProd?.stockStatus;
        if (effectiveStockStatus) {
          cleanSpecs._stockStatus = effectiveStockStatus;
        }

        dbPatch.specs = cleanSpecs;
      }
      if (patch.badge !== undefined) dbPatch.badge = patch.badge;
      if (patch.stockStatus !== undefined) {
        dbPatch.in_stock = patch.stockStatus !== "out_of_stock";
      } else if (patch.inStock !== undefined) {
        dbPatch.in_stock = patch.inStock;
      }
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

          const nextStockStatus = patch.stockStatus !== undefined
            ? patch.stockStatus
            : (patch.inStock !== undefined ? (patch.inStock ? "in_stock" : "out_of_stock") : p.stockStatus);
          const nextInStock = patch.stockStatus !== undefined
            ? patch.stockStatus !== "out_of_stock"
            : (patch.inStock !== undefined ? patch.inStock : p.inStock);

          return {
            ...p,
            ...patch,
            inStock: nextInStock,
            stockStatus: nextStockStatus,
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

  // ── Sync USD Products with new Exchange Rate ──────────────────────────────
  const syncProductsWithUsdRate = useCallback(
    async (
      newRate: number,
      onProgress?: (progress: { current: number; total: number; percent: number }) => void
    ): Promise<{ updatedCount: number; totalUsdCount: number; success: boolean }> => {
      if (!newRate || newRate <= 0) {
        return { updatedCount: 0, totalUsdCount: 0, success: false };
      }

      // Filter products that have USD prices
      const usdProducts = products.filter(isUsdProduct);
      const totalUsdCount = usdProducts.length;

      if (totalUsdCount === 0) {
        return { updatedCount: 0, totalUsdCount: 0, success: true };
      }

      // Recalculate each USD product for the new exchange rate
      const updatedProducts = usdProducts.map((p) => recalculateProductForRate(p, newRate));
      const updatedMap = new Map<number, Product>();
      updatedProducts.forEach((p) => updatedMap.set(p.id, p));

      // 1. Instant optimistic update to local state and cache
      setProducts((prev) => {
        const next = prev.map((p) => updatedMap.get(p.id) || p);
        saveCachedProducts(next);
        return next;
      });

      // 2. Persist to Supabase in chunks of 50
      const dbRows = updatedProducts.map((p) => productToDb(p));
      const chunkSize = 50;
      let success = true;

      for (let i = 0; i < dbRows.length; i += chunkSize) {
        const chunk = dbRows.slice(i, i + chunkSize);
        const { error } = await supabase.from("products").upsert(chunk);
        if (error) {
          console.warn(`Chunk ${Math.floor(i / chunkSize) + 1} upsert failed, falling back to sequential:`, error.message);
          for (const row of chunk) {
            if (row.id) {
              const { error: singleErr } = await supabase.from("products").update(row).eq("id", row.id);
              if (singleErr) {
                console.error(`Failed to update product ${row.id}:`, singleErr.message);
                success = false;
              }
            }
          }
        }

        const processed = Math.min(i + chunkSize, dbRows.length);
        if (onProgress) {
          onProgress({
            current: processed,
            total: dbRows.length,
            percent: Math.round((processed / dbRows.length) * 100),
          });
        }
      }

      return {
        updatedCount: totalUsdCount,
        totalUsdCount,
        success,
      };
    },
    [products]
  );

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
        syncProductsWithUsdRate,
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
