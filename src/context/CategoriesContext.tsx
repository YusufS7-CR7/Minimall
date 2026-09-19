import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import type { CategoryDef, SubcategoryDef } from "@/data/types";
import { CATEGORIES as INITIAL_CATEGORIES } from "@/data/categories";
import { supabase } from "@/lib/supabase";

const STORAGE_KEY = "minimall_categories_v2";

interface CategoriesContextType {
  categories: CategoryDef[];
  loading: boolean;
  addCategory: (cat: Omit<CategoryDef, "key"> & { key?: string }) => Promise<CategoryDef>;
  updateCategory: (key: string, patch: Partial<CategoryDef>) => Promise<void>;
  deleteCategory: (key: string) => Promise<void>;
  addSubcategory: (categoryKey: string, sub: SubcategoryDef) => Promise<void>;
  updateSubcategory: (categoryKey: string, subKey: string, patch: Partial<SubcategoryDef>) => Promise<void>;
  deleteSubcategory: (categoryKey: string, subKey: string) => Promise<void>;
  getCategoryBySlug: (slug: string) => CategoryDef | undefined;
  getCategoryByKey: (key: string) => CategoryDef | undefined;
  resetCategories: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

function loadLocalCategories(): CategoryDef[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse local categories", e);
  }
  return INITIAL_CATEGORIES;
}

function saveLocalCategories(cats: CategoryDef[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
    window.dispatchEvent(new Event("minimall_categories_updated"));
  } catch (e) {
    console.error("Failed to save local categories", e);
  }
}

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<CategoryDef[]>(loadLocalCategories);
  const [loading, setLoading] = useState(false);

  // Sync with Supabase on mount
  const fetchRemoteCategories = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("id", { ascending: true });

      if (!error && data && data.length > 0) {
        setCategories((prev) => {
          // Merge remote categories with existing subcategories / icons
          const prevMap = new Map(prev.map((c) => [c.key, c]));
          const merged: CategoryDef[] = data.map((row: any) => {
            const existing = prevMap.get(row.key);
            // Prefer Supabase subcategories if available, fall back to local
            let remoteSubs: any[] = [];
            if (Array.isArray(row.subcategories) && row.subcategories.length > 0) {
              remoteSubs = row.subcategories;
            } else if (typeof row.subcategories === "string" && row.subcategories) {
              try { remoteSubs = JSON.parse(row.subcategories); } catch {}
            }
            const subcategories = remoteSubs.length > 0
              ? remoteSubs
              : (existing?.subcategories || []);
            return {
              key: row.key,
              slug: row.slug || row.key,
              icon: row.icon || existing?.icon || "📦",
              image: row.image || existing?.image || "",
              labelRu: row.label_ru || existing?.labelRu || row.key,
              labelUz: row.label_uz || existing?.labelUz || row.key,
              subcategories,
            };
          });

          // Also keep any local-only categories that haven't synced yet
          const remoteKeys = new Set(data.map((r: any) => r.key));
          const localOnly = prev.filter((c) => !remoteKeys.has(c.key));

          const combined = [...merged, ...localOnly];
          saveLocalCategories(combined);
          return combined;
        });
      }
    } catch (e) {
      console.warn("Supabase categories sync fallback to local:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRemoteCategories();

    // Listen to updates from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setCategories(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [fetchRemoteCategories]);

  // ── Category CRUD ──────────────────────────────────────────────────────────

  const addCategory = useCallback(
    async (newCat: Omit<CategoryDef, "key"> & { key?: string }): Promise<CategoryDef> => {
      const slug = (newCat.slug || newCat.labelRu.toLowerCase().replace(/\s+/g, "-"))
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");
      const key = newCat.key || slug || `cat_${Date.now()}`;

      const created: CategoryDef = {
        key,
        slug: slug || key,
        icon: newCat.icon || "📦",
        image: newCat.image || "",
        labelRu: newCat.labelRu,
        labelUz: newCat.labelUz || newCat.labelRu,
        subcategories: newCat.subcategories || [],
      };

      setCategories((prev) => {
        // Prevent duplicate keys
        const filtered = prev.filter((c) => c.key !== key);
        const updated = [...filtered, created];
        saveLocalCategories(updated);
        return updated;
      });

      // Attempt Supabase insert
      try {
        await supabase.from("categories").insert([
          {
            key: created.key,
            slug: created.slug,
            label_ru: created.labelRu,
            label_uz: created.labelUz,
            icon: created.icon,
            image: created.image,
            subcategories: JSON.stringify(created.subcategories || []),
          },
        ]);
      } catch (e) {
        console.error("Failed to sync category to Supabase", e);
      }

      return created;
    },
    []
  );

  const updateCategory = useCallback(
    async (key: string, patch: Partial<CategoryDef>) => {
      setCategories((prev) => {
        const updated = prev.map((c) => (c.key === key ? { ...c, ...patch } : c));
        saveLocalCategories(updated);
        return updated;
      });

      // Attempt Supabase update
      try {
        const dbPatch: Record<string, any> = {};
        if (patch.slug !== undefined) dbPatch.slug = patch.slug;
        if (patch.labelRu !== undefined) dbPatch.label_ru = patch.labelRu;
        if (patch.labelUz !== undefined) dbPatch.label_uz = patch.labelUz;
        if (patch.icon !== undefined) dbPatch.icon = patch.icon;
        if (patch.image !== undefined) dbPatch.image = patch.image;

        if (Object.keys(dbPatch).length > 0) {
          await supabase.from("categories").update(dbPatch).eq("key", key);
        }
      } catch (e) {
        console.error("Failed to sync category update to Supabase", e);
      }
    },
    []
  );

  const deleteCategory = useCallback(async (key: string) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.key !== key);
      saveLocalCategories(updated);
      return updated;
    });

    try {
      await supabase.from("categories").delete().eq("key", key);
    } catch (e) {
      console.error("Failed to sync category deletion to Supabase", e);
    }
  }, []);

  // ── Subcategory CRUD ───────────────────────────────────────────────────────

  const addSubcategory = useCallback(
    async (categoryKey: string, sub: SubcategoryDef) => {
      let updatedSubs: SubcategoryDef[] = [];
      setCategories((prev) => {
        const updated = prev.map((c) => {
          if (c.key !== categoryKey) return c;
          const currentSubs = c.subcategories || [];
          if (currentSubs.some((s) => s.key === sub.key)) return c;
          updatedSubs = [...currentSubs, sub];
          return { ...c, subcategories: updatedSubs };
        });
        saveLocalCategories(updated);
        return updated;
      });
      // Persist to Supabase
      try {
        await supabase
          .from("categories")
          .update({ subcategories: JSON.stringify(updatedSubs) })
          .eq("key", categoryKey);
      } catch (e) {
        console.error("Failed to sync subcategory add to Supabase", e);
      }
    },
    []
  );

  const updateSubcategory = useCallback(
    async (categoryKey: string, subKey: string, patch: Partial<SubcategoryDef>) => {
      let updatedSubs: SubcategoryDef[] = [];
      setCategories((prev) => {
        const updated = prev.map((c) => {
          if (c.key !== categoryKey) return c;
          const currentSubs = c.subcategories || [];
          updatedSubs = currentSubs.map((s) => (s.key === subKey ? { ...s, ...patch } : s));
          return { ...c, subcategories: updatedSubs };
        });
        saveLocalCategories(updated);
        return updated;
      });
      // Persist to Supabase
      try {
        await supabase
          .from("categories")
          .update({ subcategories: JSON.stringify(updatedSubs) })
          .eq("key", categoryKey);
      } catch (e) {
        console.error("Failed to sync subcategory update to Supabase", e);
      }
    },
    []
  );

  const deleteSubcategory = useCallback(
    async (categoryKey: string, subKey: string) => {
      let updatedSubs: SubcategoryDef[] = [];
      setCategories((prev) => {
        const updated = prev.map((c) => {
          if (c.key !== categoryKey) return c;
          updatedSubs = (c.subcategories || []).filter((s) => s.key !== subKey);
          return { ...c, subcategories: updatedSubs };
        });
        saveLocalCategories(updated);
        return updated;
      });
      // Persist to Supabase
      try {
        await supabase
          .from("categories")
          .update({ subcategories: JSON.stringify(updatedSubs) })
          .eq("key", categoryKey);
      } catch (e) {
        console.error("Failed to sync subcategory delete to Supabase", e);
      }
    },
    []
  );

  // ── Lookups ────────────────────────────────────────────────────────────────

  const getCategoryBySlug = useCallback(
    (slug: string) => {
      const clean = slug?.toLowerCase().trim();
      return categories.find(
        (c) => c.slug.toLowerCase() === clean || c.key.toLowerCase() === clean
      );
    },
    [categories]
  );

  const getCategoryByKey = useCallback(
    (key: string) => {
      const clean = key?.toLowerCase().trim();
      return categories.find((c) => c.key.toLowerCase() === clean);
    },
    [categories]
  );

  const resetCategories = useCallback(async () => {
    setCategories(INITIAL_CATEGORIES);
    saveLocalCategories(INITIAL_CATEGORIES);
  }, []);

  const value = useMemo(
    () => ({
      categories,
      loading,
      addCategory,
      updateCategory,
      deleteCategory,
      addSubcategory,
      updateSubcategory,
      deleteSubcategory,
      getCategoryBySlug,
      getCategoryByKey,
      resetCategories,
      refreshCategories: fetchRemoteCategories,
    }),
    [
      categories,
      loading,
      addCategory,
      updateCategory,
      deleteCategory,
      addSubcategory,
      updateSubcategory,
      deleteSubcategory,
      getCategoryBySlug,
      getCategoryByKey,
      resetCategories,
      fetchRemoteCategories,
    ]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategories(): CategoriesContextType {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return ctx;
}
