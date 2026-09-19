import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { T } from "@/data/translations";
import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";
import type { Lang } from "@/data/types";

interface CatalogModalProps {
  id: string;
  lang: Lang;
  open: boolean;
  onClose: () => void;
}

export default function CatalogModal({ id, lang, open, onClose }: CatalogModalProps) {
  const t = T[lang];
  const { categories } = useCategories();
  const { products } = useProducts();
  const [activeCategory, setActiveCategory] = useState<string>(() => categories[0]?.key || "drills");
  const menuRef = useRef<HTMLDivElement>(null);

  // Reset active category when menu opens
  useEffect(() => {
    if (open && categories.length > 0) {
      if (!categories.some((c) => c.key === activeCategory)) {
        setActiveCategory(categories[0].key);
      }
    }
  }, [open, categories, activeCategory]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // slight delay so the button click that opened the menu doesn't immediately close it
    const timer = setTimeout(() => document.addEventListener("mousedown", handleClick), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, onClose]);

  if (!open) return null;

  const activeCat = categories.find((c) => c.key === activeCategory) ?? categories[0];
  if (!activeCat) return null;
  const subcategories = activeCat.subcategories ?? [];
  const catProductCount = (catKey: string) =>
    products.filter((p) => {
      const cats = (p.categories && p.categories.length > 0)
        ? p.categories
        : (p.category ? [p.category] : []);
      return cats.includes(catKey);
    }).length;

  return (
    <>
      {/* Backdrop — subtle */}
      <div
        className="fixed inset-0 z-[45] bg-black/25 backdrop-blur-[2px]"
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-b-2xl overflow-hidden border border-t-0 border-gray-100 flex"
               style={{ maxHeight: "calc(100vh - 140px)" }}>

            {/* ─── Left panel: category list ─── */}
            <nav
              aria-label={lang === "uz" ? "Kategoriyalar" : "Категории"}
              className="w-[220px] shrink-0 bg-gray-50 border-r border-gray-100 overflow-y-auto py-2"
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
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-all group relative ${
                      isActive
                        ? "bg-white text-red-600 font-semibold shadow-sm"
                        : "text-gray-700 hover:bg-white hover:text-red-500"
                    }`}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-red-500 rounded-r-full" />
                    )}
                    <span className="text-base w-5 text-center shrink-0">{cat.icon}</span>
                    <span className="leading-tight flex-1 min-w-0">{label}</span>
                    <svg
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${isActive ? "text-red-400" : "text-gray-300 group-hover:text-gray-400"}`}
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
              {/* Category header */}
              <div className="flex items-center gap-3 pb-3 mb-4 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img
                    src={activeCat.image}
                    alt={lang === "ru" ? activeCat.labelRu : activeCat.labelUz}
                    className="w-full h-full object-cover"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-base leading-tight">
                    {lang === "ru" ? activeCat.labelRu : activeCat.labelUz}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {catProductCount(activeCat.key)}{" "}
                    {lang === "ru" ? "товаров" : "ta tovar"}
                  </p>
                </div>
                <Link
                  to={`/catalog/${activeCat.slug}`}
                  onClick={onClose}
                  className="ml-auto text-xs font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 shrink-0"
                >
                  {lang === "ru" ? "Все товары" : "Barcha mahsulotlar"}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Subcategory grid */}
              {subcategories.length > 0 ? (
                <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {subcategories.map((sub) => {
                    const subLabel = lang === "ru" ? sub.labelRu : sub.labelUz;
                    return (
                      <li key={sub.key}>
                        <Link
                          to={`/catalog/${activeCat.slug}?sub=${sub.slug}`}
                          onClick={onClose}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/60 transition-all text-sm text-gray-700 hover:text-red-600 font-medium group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-red-400 transition-colors shrink-0" />
                          <span className="leading-snug">{subLabel}</span>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
