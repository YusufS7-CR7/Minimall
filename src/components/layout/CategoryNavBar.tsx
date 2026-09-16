import { Link, useParams, useLocation } from "react-router-dom";
import { useCategories } from "@/context/CategoriesContext";
import { T } from "@/data/translations";
import type { Lang } from "@/data/types";

interface CategoryNavBarProps {
  lang: Lang;
}

export default function CategoryNavBar({ lang }: CategoryNavBarProps) {
  const { categories } = useCategories();
  // Try to detect active category from URL
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const isCatalogRoot = location.pathname === "/catalog";

  return (
    <nav aria-label="Категории товаров" className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-1 overflow-x-auto scrollbar-hide" role="list">
          <li>
            <Link
              to="/catalog"
              className={`inline-block whitespace-nowrap px-4 py-3 text-sm font-medium transition-all relative ${
                isCatalogRoot ? "text-red-600 font-semibold" : "text-gray-600 hover:text-red-500"
              }`}
            >
              {T[lang].allCategories}
              {isCatalogRoot && (
                <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-red-500 rounded-t-full" />
              )}
            </Link>
          </li>
          {categories.map((c) => {
            const label = lang === "ru" ? c.labelRu : c.labelUz;
            const isActive = slug === c.slug;
            return (
              <li key={c.key}>
                <Link
                  to={`/catalog/${c.slug}`}
                  className={`inline-block whitespace-nowrap px-4 py-3 text-sm font-medium transition-all relative ${
                    isActive
                      ? "text-red-600 font-semibold"
                      : "text-gray-600 hover:text-red-500"
                  }`}
                >
                  {label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-red-500 rounded-t-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
