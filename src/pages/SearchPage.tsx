import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useProducts } from "@/context/ProductsContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { T } from "@/data/translations";
import ProductCard from "@/components/ui/ProductCard";
import ProductFilters, {
  ActiveFilterBar,
  DEFAULT_FILTER_STATE,
  type FilterState,
} from "@/components/ui/ProductFilters";

export default function SearchPage() {
  const { lang } = useApp();
  const { products, brands } = useProducts();
  const t = T[lang];
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "rating">("default");

  const rawResults = useMemo(() => {
    if (!q.trim()) return [];
    const query = q.toLowerCase();
    return products.filter((p) => {
      const name = (lang === "uz" ? (p.nameUz || p.name) : p.name).toLowerCase();
      return (
        name.includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.slug.includes(query)
      );
    });
  }, [q, products, lang]);

  const filteredResults = useMemo(() => {
    return rawResults
      .filter((p) => {
        // Price Range filter
        if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) {
          return false;
        }
        // Brand filter
        if (
          filters.selectedBrands.length > 0 &&
          !filters.selectedBrands.includes(p.brand)
        ) {
          return false;
        }
        // Stock filter
        if (filters.inStockOnly && !p.inStock) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [rawResults, filters, sortBy]);

  useDocumentMeta({
    title: q
      ? `Поиск: «${q}» — Minimall`
      : "Поиск товаров — Minimall",
    description: q ? `Результаты поиска «${q}» на Minimall.uz: найдено ${filteredResults.length} товаров.` : undefined,
    // Search result pages should NOT be indexed
    noIndex: true,
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-xs text-gray-500">
          <li><Link to="/" className="hover:text-red-500 transition-colors">{t.breadcrumbHome}</Link></li>
          <li aria-hidden="true"><span className="text-gray-300">›</span></li>
          <li className="text-gray-800 font-medium" aria-current="page">
            {lang === "ru" ? "Поиск" : "Qidiruv"}
            {q && <span>: «{q}»</span>}
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
          {q ? (
            <>
              {lang === "ru" ? "Результаты поиска" : "Qidiruv natijalari"}:{" "}
              <span className="text-red-600">«{q}»</span>
            </>
          ) : (
            lang === "ru" ? "Поиск товаров" : "Tovarlarni qidirish"
          )}
        </h1>
        {q && (
          <p className="text-sm text-gray-400 mt-1">
            {filteredResults.length === rawResults.length
              ? lang === "ru"
                ? `Найдено ${rawResults.length} товаров`
                : `${rawResults.length} ta tovar topildi`
              : lang === "ru"
              ? `Показано ${filteredResults.length} из ${rawResults.length} найденных товаров`
              : `${rawResults.length} tadan ${filteredResults.length} ta tovar ko'rsatildi`}
          </p>
        )}
      </div>

      {q.trim() === "" ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 p-8">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg font-medium">
            {lang === "ru" ? "Введите поисковый запрос" : "Qidiruv so'rovini kiriting"}
          </p>
        </div>
      ) : rawResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 p-8">
          <div className="text-5xl mb-4">😔</div>
          <p className="text-gray-500 text-lg font-medium">
            {lang === "ru" ? "Товары не найдены" : "Tovarlar topilmadi"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {lang === "ru" ? `По запросу «${q}» ничего не найдено` : `"${q}" bo'yicha hech narsa topilmadi`}
          </p>
          <Link
            to="/"
            className="mt-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md"
          >
            {t.backToHome}
          </Link>
        </div>
      ) : (
        <div className="lg:flex lg:gap-8 items-start">
          {/* Filters Sidebar */}
          <ProductFilters
            filters={filters}
            onChange={setFilters}
            lang={lang}
            allBrands={brands}
            totalProductsCount={rawResults.length}
            filteredProductsCount={filteredResults.length}
            availableProducts={rawResults}
          />

          {/* Products Column */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-4 mb-4 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
              <span className="text-xs text-gray-600 font-semibold">
                {lang === "ru"
                  ? `Показано ${filteredResults.length} товаров`
                  : `${filteredResults.length} ta tovar ko'rsatilmoqda`}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                  {lang === "ru" ? "Сортировка:" : "Saralash:"}
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="text-xs font-semibold text-gray-800 bg-white border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-red-500 cursor-pointer shadow-2xs"
                >
                  <option value="default">{lang === "ru" ? "По умолчанию" : "Odatiy"}</option>
                  <option value="price_asc">{lang === "ru" ? "Сначала дешевле" : "Avval arzonlari"}</option>
                  <option value="price_desc">{lang === "ru" ? "Сначала дороже" : "Avval qimmatlari"}</option>
                  <option value="rating">{lang === "ru" ? "По рейтингу" : "Reyting bo'yicha"}</option>
                </select>
              </div>
            </div>

            {/* Active filter badges */}
            <ActiveFilterBar
              filters={filters}
              onChange={setFilters}
              lang={lang}
              totalFound={filteredResults.length}
            />

            {filteredResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100 p-8">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-800 text-lg font-bold">
                  {lang === "ru" ? "Нет подходящих товаров" : "Mos tovarlar topilmadi"}
                </p>
                <p className="text-gray-400 text-sm mt-1 max-w-md">
                  {lang === "ru"
                    ? "Попробуйте изменить диапазон цен или фильтры"
                    : "Narx oralig'i yoki filtrlarni o'zgartirib ko'ring"}
                </p>
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTER_STATE)}
                  className="mt-5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  {t.resetFilters}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredResults.map((p) => (
                  <ProductCard key={p.id} product={p} lang={lang} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
