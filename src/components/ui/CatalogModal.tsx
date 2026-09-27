import { useState, useEffect, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { T } from "@/data/translations";
import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";
import type { Lang } from "@/data/types";

interface CatalogModalProps {
  id?: string;
  lang: Lang;
  open: boolean;
  onClose: () => void;
}

export default function CatalogModal({ id = "catalog-modal", lang, open, onClose }: CatalogModalProps) {
  const t = T[lang];
  const navigate = useNavigate();
  const { categories } = useCategories();
  const { products } = useProducts();
  const [activeCategory, setActiveCategory] = useState<string>(() => categories[0]?.key || "drills");
  const [searchQuery, setSearchQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync / validate active category when menu opens
  useEffect(() => {
    if (open && categories.length > 0) {
      if (!categories.some((c) => c.key === activeCategory)) {
        setActiveCategory(categories[0].key);
      }
    }
  }, [open, categories, activeCategory]);

  // Lock body scroll when catalog is open
  useEffect(() => {
    if (open) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Close on outside click (for desktop dropdown)
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handleClick), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, onClose]);

  // Helper: count products per category
  const catProductCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const cat of categories) {
      map[cat.key] = products.filter((p) => {
        const cats = (p.categories && p.categories.length > 0)
          ? p.categories
          : (p.category ? [p.category] : []);
        return cats.includes(cat.key);
      }).length;
    }
    return map;
  }, [categories, products]);

  // Filtered results if user types in search box
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const matchedSubs: Array<{
      categoryKey: string;
      categorySlug: string;
      categoryLabel: string;
      subKey: string;
      subSlug: string;
      subLabel: string;
    }> = [];

    const matchedCats = categories.filter((c) => {
      const name = (lang === "ru" ? c.labelRu : c.labelUz).toLowerCase();
      return name.includes(q);
    });

    for (const c of categories) {
      const cLabel = lang === "ru" ? c.labelRu : c.labelUz;
      if (c.subcategories) {
        for (const sub of c.subcategories) {
          const sLabel = lang === "ru" ? sub.labelRu : sub.labelUz;
          if (sLabel.toLowerCase().includes(q)) {
            matchedSubs.push({
              categoryKey: c.key,
              categorySlug: c.slug,
              categoryLabel: cLabel,
              subKey: sub.key,
              subSlug: sub.slug,
              subLabel: sLabel,
            });
          }
        }
      }
    }

    return { matchedCats, matchedSubs };
  }, [categories, searchQuery, lang]);

  if (!open) return null;

  const activeCat = categories.find((c) => c.key === activeCategory) ?? categories[0];
  const subcategories = activeCat?.subcategories ?? [];

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <>
      {/* ──────────────────────────────────────────────────────────────────────────
          MOBILE CATALOG (Full-screen mobile experience for phones & small tablets)
      ────────────────────────────────────────────────────────────────────────── */}
      <div
        className="md:hidden fixed inset-0 z-[60] bg-white flex flex-col animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-label={t.catalog}
        style={{ height: "100dvh" }}
      >
        {/* Top Header */}
        <div className="bg-white border-b border-gray-100 px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-2xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-black text-sm">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                {lang === "uz" ? "Tovarlar katalogi" : "Каталог товаров"}
              </h2>
              <p className="text-[11px] text-gray-400 font-medium leading-none">
                {categories.length} {lang === "uz" ? "ta toifalar" : "категорий"} • {products.length} {lang === "uz" ? "ta tovar" : "товаров"}
              </p>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть каталог"
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-all active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search bar inside catalog */}
        <div className="px-3.5 py-2 bg-gray-50/70 border-b border-gray-100 shrink-0">
          <div className="relative flex items-center">
            <svg className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "uz" ? "Kategoriya yoki bo'lim qidirish..." : "Поиск категории или подкатегории..."}
              className="w-full bg-white border border-gray-200 focus:border-red-400 rounded-xl pl-9 pr-8 py-2 text-xs text-gray-800 placeholder-gray-400 outline-none transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 text-gray-400 hover:text-gray-600 p-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Body of Mobile Catalog */}
        <div className="flex-1 flex overflow-hidden">
          {searchResults ? (
            /* Live search results across categories & subcategories */
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {searchResults.matchedCats.length === 0 && searchResults.matchedSubs.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  <span className="text-3xl block mb-2">🔍</span>
                  <p className="text-sm font-medium">
                    {lang === "uz" ? "Hech narsa topilmadi" : "Ничего не найдено"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {lang === "uz" ? "Boshqa so'z bilan qidiring" : "Попробуйте изменить поисковый запрос"}
                  </p>
                </div>
              ) : (
                <>
                  {searchResults.matchedCats.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {lang === "uz" ? "Kategoriyalar" : "Категории"}
                      </h3>
                      <div className="space-y-1.5">
                        {searchResults.matchedCats.map((cat) => {
                          const label = lang === "ru" ? cat.labelRu : cat.labelUz;
                          return (
                            <button
                              key={cat.key}
                              type="button"
                              onClick={() => handleNavigate(`/catalog/${cat.slug}`)}
                              className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-red-50 text-left border border-gray-100 transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="text-xl">{cat.icon}</span>
                                <div>
                                  <div className="text-xs font-bold text-gray-900">{label}</div>
                                  <div className="text-[10px] text-gray-400">
                                    {catProductCount[cat.key] || 0} {lang === "uz" ? "ta tovar" : "товаров"}
                                  </div>
                                </div>
                              </div>
                              <span className="text-gray-400 text-xs">›</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {searchResults.matchedSubs.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {lang === "uz" ? "Kichik bo'limlar (podkategoriyalar)" : "Подкатегории"}
                      </h3>
                      <div className="space-y-1.5">
                        {searchResults.matchedSubs.map((sub) => (
                          <button
                            key={`${sub.categoryKey}-${sub.subKey}`}
                            type="button"
                            onClick={() => handleNavigate(`/catalog/${sub.categorySlug}?sub=${sub.subSlug}`)}
                            className="w-full flex items-center justify-between p-3 rounded-xl bg-white hover:bg-red-50 text-left border border-gray-200/80 transition-colors shadow-2xs"
                          >
                            <div>
                              <div className="text-xs font-bold text-gray-900">{sub.subLabel}</div>
                              <div className="text-[10px] text-red-600 font-medium mt-0.5">
                                {sub.categoryLabel}
                              </div>
                            </div>
                            <span className="text-red-500 text-xs font-bold">›</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* Split layout: Left Categories, Right Subcategories */
            <>
              {/* Left Column: Categories List */}
              <nav
                aria-label="Категории каталога"
                className="w-[94px] sm:w-[108px] shrink-0 bg-gray-50/90 border-r border-gray-200/80 overflow-y-auto overscroll-contain py-1.5 flex flex-col gap-1 select-none"
              >
                {categories.map((cat) => {
                  const label = lang === "ru" ? cat.labelRu : cat.labelUz;
                  const isActive = cat.key === activeCategory;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setActiveCategory(cat.key)}
                      className={`relative w-full flex flex-col items-center justify-center py-2.5 px-1 text-center transition-all cursor-pointer ${
                        isActive
                          ? "bg-white text-red-600 font-bold shadow-xs"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/70"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3.5px] bg-red-600 rounded-r-full" />
                      )}
                      <span className="text-2xl leading-none mb-1">{cat.icon}</span>
                      <span className="text-[10.5px] leading-[13px] line-clamp-2 px-0.5">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Right Column: Active Category Details & Subcategories */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 pb-20 bg-white">
                {activeCat && (
                  <div>
                    {/* Active Category Header Card */}
                    <div className="bg-gradient-to-br from-red-50/90 to-rose-50/40 rounded-2xl p-3.5 border border-red-100/90 mb-4 shadow-2xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-red-100 flex items-center justify-center text-xl shrink-0 overflow-hidden">
                          {activeCat.image ? (
                            <img src={activeCat.image} alt={activeCat.labelRu} className="w-full h-full object-cover" />
                          ) : (
                            <span>{activeCat.icon}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-extrabold text-gray-900 leading-tight line-clamp-1">
                            {lang === "ru" ? activeCat.labelRu : activeCat.labelUz}
                          </h3>
                          <p className="text-[11px] text-red-600 font-bold mt-0.5">
                            {catProductCount[activeCat.key] || 0} {lang === "uz" ? "ta tovar" : "товаров"}
                          </p>
                        </div>
                      </div>

                      {/* View all products of this category button */}
                      <button
                        type="button"
                        onClick={() => handleNavigate(`/catalog/${activeCat.slug}`)}
                        className="mt-3 w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center justify-between shadow-xs shadow-red-200 transition-all active:scale-[0.98]"
                      >
                        <span>
                          {lang === "uz" ? "Bo'limdagi barcha tovarlar" : "Все товары категории"}
                        </span>
                        <span className="text-sm font-extrabold">→</span>
                      </button>
                    </div>

                    {/* Subcategories list */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          {lang === "uz" ? "Kichik bo'limlar" : "Подкатегории"}
                        </span>
                        <span className="text-[11px] text-gray-400 font-semibold">
                          {subcategories.length}
                        </span>
                      </div>

                      {subcategories.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {subcategories.map((sub) => {
                            const subLabel = lang === "ru" ? sub.labelRu : sub.labelUz;
                            return (
                              <button
                                key={sub.key}
                                type="button"
                                onClick={() => handleNavigate(`/catalog/${activeCat.slug}?sub=${sub.slug}`)}
                                className="w-full flex items-center justify-between p-3 rounded-xl bg-gray-50/70 hover:bg-red-50/60 active:bg-red-100/70 border border-gray-100 hover:border-red-200 text-left transition-all group active:scale-[0.99]"
                              >
                                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0 group-hover:scale-125 transition-transform" />
                                  <span className="text-xs font-semibold text-gray-800 group-hover:text-red-600 leading-tight">
                                    {subLabel}
                                  </span>
                                </div>
                                <span className="text-gray-400 group-hover:text-red-500 font-bold text-sm shrink-0">
                                  ›
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-gray-400 text-xs">
                          {lang === "uz" ? "Kichik bo'limlar yo'q" : "Подкатегории отсутствуют"}
                        </div>
                      )}
                    </div>

                    {/* Quick jump to all products */}
                    <button
                      type="button"
                      onClick={() => handleNavigate("/catalog")}
                      className="w-full py-2.5 px-3 rounded-xl border border-dashed border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-300 text-xs font-bold text-center transition-colors"
                    >
                      {lang === "uz" ? "Barcha katalogga o'tish →" : "Перейти ко всему каталогу →"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          DESKTOP CATALOG (Mega-menu dropdown for md: screens and above)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="hidden md:block">
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-[45] bg-black/30 backdrop-blur-[2px] animate-fadeIn"
          aria-hidden="true"
          onClick={onClose}
        />

        {/* Mega-menu panel */}
        <div
          id={id}
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label={t.catalog}
          className="fixed left-0 right-0 z-[46] shadow-2xl"
          style={{ top: "104px", animation: "catalogSlideDown 0.22s cubic-bezier(.22,1,.36,1)" }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div
              className="bg-white rounded-b-2xl overflow-hidden border border-t-0 border-gray-100 flex shadow-2xl"
              style={{ maxHeight: "calc(100vh - 140px)" }}
            >
              {/* ─── Left panel: category list ─── */}
              <nav
                aria-label={lang === "uz" ? "Kategoriyalar" : "Категории"}
                className="w-[240px] shrink-0 bg-gray-50 border-r border-gray-100 overflow-y-auto py-2"
              >
                {categories.map((cat) => {
                  const label = lang === "ru" ? cat.labelRu : cat.labelUz;
                  const isActive = cat.key === activeCategory;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onMouseEnter={() => setActiveCategory(cat.key)}
                      onClick={() => setActiveCategory(cat.key)}
                      className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left transition-all group relative cursor-pointer ${
                        isActive
                          ? "bg-white text-red-600 font-semibold shadow-xs"
                          : "text-gray-700 hover:bg-white hover:text-red-500"
                      }`}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-red-500 rounded-r-full" />
                      )}
                      <span className="text-lg w-5 text-center shrink-0">{cat.icon}</span>
                      <span className="leading-tight flex-1 min-w-0">{label}</span>
                      <svg
                        className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                          isActive ? "text-red-400" : "text-gray-300 group-hover:text-gray-400"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  );
                })}
              </nav>

              {/* ─── Right panel: subcategories ─── */}
              <div className="flex-1 overflow-y-auto p-5">
                {activeCat && (
                  <>
                    {/* Category header */}
                    <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-100">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                        {activeCat.image ? (
                          <img
                            src={activeCat.image}
                            alt={lang === "ru" ? activeCat.labelRu : activeCat.labelUz}
                            className="w-full h-full object-cover"
                            width={48}
                            height={48}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            {activeCat.icon}
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="font-extrabold text-gray-900 text-lg leading-tight">
                          {lang === "ru" ? activeCat.labelRu : activeCat.labelUz}
                        </h2>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {catProductCount[activeCat.key] || 0} {lang === "ru" ? "товаров в категории" : "ta tovar"}
                        </p>
                      </div>
                      <Link
                        to={`/catalog/${activeCat.slug}`}
                        onClick={onClose}
                        className="ml-auto text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors shrink-0"
                      >
                        <span>{lang === "ru" ? "Все товары категории" : "Barcha tovarlar"}</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>

                    {/* Subcategory grid */}
                    {subcategories.length > 0 ? (
                      <ul className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                        {subcategories.map((sub) => {
                          const subLabel = lang === "ru" ? sub.labelRu : sub.labelUz;
                          return (
                            <li key={sub.key}>
                              <Link
                                to={`/catalog/${activeCat.slug}?sub=${sub.slug}`}
                                onClick={onClose}
                                className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/60 transition-all text-xs lg:text-sm text-gray-700 hover:text-red-600 font-medium group"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-red-400 transition-colors shrink-0" />
                                <span className="leading-snug line-clamp-1">{subLabel}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <Link
                        to={`/catalog/${activeCat.slug}`}
                        onClick={onClose}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
                      >
                        {lang === "ru" ? "Перейти в раздел" : "Bo'limga o'tish"}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
