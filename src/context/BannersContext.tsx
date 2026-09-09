import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { BannerSlide } from "@/data/bannerTypes";
import { INITIAL_BANNER_SLIDES } from "@/data/bannerTypes";
import { supabase } from "@/lib/supabase";

// ─── DB row type (Supabase snake_case) ───────────────────────────────────────

interface DbBanner {
  id: string;
  title_ru: string;
  title_uz: string;
  desc_ru: string | null;
  desc_uz: string | null;
  image: string;
  link: string | null;
  is_active: boolean;
  badge1: string | null;
  badge2: string | null;
  badge3: string | null;
  created_at: string;
}

function dbToSlide(row: DbBanner): BannerSlide {
  return {
    id: row.id,
    titleRu: row.title_ru,
    titleUz: row.title_uz,
    descRu: row.desc_ru ?? "",
    descUz: row.desc_uz ?? "",
    image: row.image,
    link: row.link ?? undefined,
    isActive: row.is_active,
    badge1: row.badge1 ?? undefined,
    badge2: row.badge2 ?? undefined,
    badge3: row.badge3 ?? undefined,
  };
}

function slideToDb(s: Omit<BannerSlide, "id">): Omit<DbBanner, "id" | "created_at"> & { id?: string } {
  return {
    title_ru: s.titleRu || "",
    title_uz: s.titleUz || "",
    desc_ru: s.descRu || null,
    desc_uz: s.descUz || null,
    image: s.image,
    link: s.link || null,
    is_active: s.isActive ?? true,
    badge1: s.badge1 || null,
    badge2: s.badge2 || null,
    badge3: s.badge3 || null,
  };
}

// ─── Context Shape ────────────────────────────────────────────────────────────

interface BannersContextType {
  slides: BannerSlide[];
  activeSlides: BannerSlide[];
  loading: boolean;
  addSlide: (slide: Omit<BannerSlide, "id">) => Promise<void>;
  updateSlide: (id: string, slide: Partial<BannerSlide>) => Promise<void>;
  deleteSlide: (id: string) => Promise<void>;
  toggleSlideActive: (id: string) => Promise<void>;
  resetSlides: () => Promise<void>;
}

const BannersContext = createContext<BannersContextType | undefined>(undefined);

export function BannersProvider({ children }: { children: React.ReactNode }) {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all banners from Supabase ────────────────────────────────────────
  const fetchBanners = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const fetched = (data as DbBanner[]).map(dbToSlide);
      setSlides(fetched.length > 0 ? fetched : INITIAL_BANNER_SLIDES);
    } else if (error) {
      console.error("Failed to fetch banners:", error.message);
      // Fallback to initial slides on error
      setSlides(INITIAL_BANNER_SLIDES);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const activeSlides = slides.filter((s) => s.isActive);

  // ── Add slide ──────────────────────────────────────────────────────────────
  const addSlide = useCallback(async (newSlideData: Omit<BannerSlide, "id">) => {
    const id = `banner-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const dbRow = { id, ...slideToDb(newSlideData) };

    const { error } = await supabase.from("banners").insert([dbRow]);

    if (error) {
      console.error("Failed to add banner:", error.message);
      return;
    }

    const newSlide: BannerSlide = { ...newSlideData, id };
    setSlides((prev) => [newSlide, ...prev]);
  }, []);

  // ── Update slide ───────────────────────────────────────────────────────────
  const updateSlide = useCallback(async (id: string, updatedFields: Partial<BannerSlide>) => {
    const dbPatch: Record<string, unknown> = {};
    if (updatedFields.titleRu !== undefined) dbPatch.title_ru = updatedFields.titleRu;
    if (updatedFields.titleUz !== undefined) dbPatch.title_uz = updatedFields.titleUz;
    if (updatedFields.descRu !== undefined) dbPatch.desc_ru = updatedFields.descRu;
    if (updatedFields.descUz !== undefined) dbPatch.desc_uz = updatedFields.descUz;
    if (updatedFields.image !== undefined) dbPatch.image = updatedFields.image;
    if (updatedFields.link !== undefined) dbPatch.link = updatedFields.link;
    if (updatedFields.isActive !== undefined) dbPatch.is_active = updatedFields.isActive;
    if (updatedFields.badge1 !== undefined) dbPatch.badge1 = updatedFields.badge1;
    if (updatedFields.badge2 !== undefined) dbPatch.badge2 = updatedFields.badge2;
    if (updatedFields.badge3 !== undefined) dbPatch.badge3 = updatedFields.badge3;

    const { error } = await supabase
      .from("banners")
      .update(dbPatch)
      .eq("id", id);

    if (error) {
      console.error("Failed to update banner:", error.message);
      return;
    }

    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
  }, []);

  // ── Delete slide ───────────────────────────────────────────────────────────
  const deleteSlide = useCallback(async (id: string) => {
    const { error } = await supabase
      .from("banners")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Failed to delete banner:", error.message);
      return;
    }

    setSlides((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ── Toggle active ──────────────────────────────────────────────────────────
  const toggleSlideActive = useCallback(async (id: string) => {
    const target = slides.find((s) => s.id === id);
    if (!target) return;

    const newActive = !target.isActive;
    const { error } = await supabase
      .from("banners")
      .update({ is_active: newActive })
      .eq("id", id);

    if (error) {
      console.error("Failed to toggle banner:", error.message);
      return;
    }

    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: newActive } : s))
    );
  }, [slides]);

  // ── Reset (delete all from DB) ─────────────────────────────────────────────
  const resetSlides = useCallback(async () => {
    const { error } = await supabase
      .from("banners")
      .delete()
      .neq("id", "");

    if (error) {
      console.error("Failed to reset banners:", error.message);
      return;
    }

    setSlides(INITIAL_BANNER_SLIDES);
  }, []);

  return (
    <BannersContext.Provider
      value={{
        slides,
        activeSlides: activeSlides.length > 0 ? activeSlides : INITIAL_BANNER_SLIDES,
        loading,
        addSlide,
        updateSlide,
        deleteSlide,
        toggleSlideActive,
        resetSlides,
      }}
    >
      {children}
    </BannersContext.Provider>
  );
}

export function useBanners() {
  const context = useContext(BannersContext);
  if (!context) {
    throw new Error("useBanners must be used within a BannersProvider");
  }
  return context;
}
