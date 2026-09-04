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
import { PRODUCTS as INITIAL_PRODUCTS, slugify, BRANDS as INITIAL_BRANDS } from "@/data/products";

const STORAGE_KEY = "minimall_products_v1";

interface ProductsContextValue {
  products: Product[];
  addProduct: (data: Omit<Product, "id"> & { id?: number }) => Product;
  updateProduct: (id: number, data: Partial<Product>) => void;
  deleteProduct: (id: number) => void;
  resetProducts: () => void;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductById: (id: number) => Product | undefined;
  brands: string[];
  exportCatalog: () => void;
  importCatalog: (jsonString: string) => boolean;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to load products from localStorage", e);
    }
    return INITIAL_PRODUCTS;
  });

  // Save to localStorage on any change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products to localStorage", e);
    }
  }, [products]);

  const brands = useMemo(() => {
    const set = new Set<string>(INITIAL_BRANDS);
    products.forEach((p) => {
      if (p.brand && p.brand.trim()) {
        set.add(p.brand.trim());
      }
    });
    return Array.from(set);
  }, [products]);

  const getProductBySlug = useCallback(
    (slug: string) => {
      return products.find((p) => p.slug === slug);
    },
    [products]
  );

  const getProductById = useCallback(
    (id: number) => {
      return products.find((p) => p.id === id);
    },
    [products]
  );

  const addProduct = useCallback(
    (data: Omit<Product, "id"> & { id?: number }) => {
      const maxId = products.reduce((max, p) => (p.id > max ? p.id : max), 0);
      const nextId = data.id && data.id > 0 ? data.id : maxId + 1;

      let targetSlug = data.slug?.trim() ? slugify(data.slug) : slugify(data.name);
      if (!targetSlug) targetSlug = `product-${nextId}`;

      // Ensure uniqueness of slug
      let uniqueSlug = targetSlug;
      let counter = 1;
      while (products.some((p) => p.slug === uniqueSlug)) {
        uniqueSlug = `${targetSlug}-${counter}`;
        counter++;
      }

      const newProduct: Product = {
        ...data,
        id: nextId,
        slug: uniqueSlug,
        inStock: data.inStock ?? true,
        specs: data.specs || {},
      };

      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    },
    [products]
  );

  const updateProduct = useCallback(
    (id: number, patch: Partial<Product>) => {
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id !== id) return p;

          let nextSlug = p.slug;
          if (patch.slug && patch.slug !== p.slug) {
            nextSlug = slugify(patch.slug);
          } else if (patch.name && patch.name !== p.name && !patch.slug) {
            // keep existing slug unless requested
            nextSlug = p.slug;
          }

          return {
            ...p,
            ...patch,
            slug: nextSlug,
          };
        })
      );
    },
    []
  );

  const deleteProduct = useCallback((id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const resetProducts = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportCatalog = useCallback(() => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `minimall-catalog-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [products]);

  const importCatalog = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setProducts(parsed);
        return true;
      }
    } catch (e) {
      console.error("Invalid JSON catalog file", e);
    }
    return false;
  }, []);

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProducts,
        getProductBySlug,
        getProductById,
        brands,
        exportCatalog,
        importCatalog,
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
