import React, { createContext, useContext, useState, useEffect } from "react";
import type { BannerSlide } from "@/data/bannerTypes";
import { INITIAL_BANNER_SLIDES } from "@/data/bannerTypes";

const STORAGE_KEY = "minimall_carousel_banners";

interface BannersContextType {
  slides: BannerSlide[];
  activeSlides: BannerSlide[];
  addSlide: (slide: Omit<BannerSlide, "id">) => void;
  updateSlide: (id: string, slide: Partial<BannerSlide>) => void;
  deleteSlide: (id: string) => void;
  toggleSlideActive: (id: string) => void;
  resetSlides: () => void;
}

const BannersContext = createContext<BannersContextType | undefined>(undefined);

export function BannersProvider({ children }: { children: React.ReactNode }) {
  const [slides, setSlides] = useState<BannerSlide[]>(() => {
    if (typeof window === "undefined") return INITIAL_BANNER_SLIDES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load banners from storage:", e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BANNER_SLIDES));
    return INITIAL_BANNER_SLIDES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
    } catch (e) {
      console.error("Failed to persist banners:", e);
    }
  }, [slides]);

  const activeSlides = slides.filter((s) => s.isActive);

  const addSlide = (newSlideData: Omit<BannerSlide, "id">) => {
    const newSlide: BannerSlide = {
      ...newSlideData,
      id: `banner-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    setSlides((prev) => [newSlide, ...prev]);
  };

  const updateSlide = (id: string, updatedFields: Partial<BannerSlide>) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
  };

  const deleteSlide = (id: string) => {
    setSlides((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleSlideActive = (id: string) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const resetSlides = () => {
    setSlides(INITIAL_BANNER_SLIDES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BANNER_SLIDES));
    } catch {}
  };

  return (
    <BannersContext.Provider
      value={{
        slides,
        activeSlides: activeSlides.length > 0 ? activeSlides : INITIAL_BANNER_SLIDES,
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
