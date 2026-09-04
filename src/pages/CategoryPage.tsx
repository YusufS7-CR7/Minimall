import { useState, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useProducts } from "@/context/ProductsContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { getCategoryBySlug } from "@/data/categories";
import { T } from "@/data/translations";
import ProductCard from "@/components/ui/ProductCard";
import ProductFilters, {
  ActiveFilterBar,
  DEFAULT_FILTER_STATE,
  type FilterState,
} from "@/components/ui/ProductFilters";

export default function CategoryPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { lang } = useApp();
  const { products: allProducts, brands } = useProducts();
  const t = T[lang];

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "rating">("default");

  // If no slug, show all products
  const category = slug ? getCategoryBySlug(slug) : undefined;

  // Redirect invalid slugs to 404
  if (slug && !category) return <Navigate to="/404" replace />;

  const baseProducts = slug
    ? allProducts.filter((p) => p.category === category!.key)
    : allProducts;

  const categoryLabel = category
    ? lang === "ru"
      ? category.labelRu
      : category.labelUz
    : lang === "ru"
    ? "Все товары"
    : "Barcha tovarlar";

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return baseProducts
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
  }, [baseProducts, filters, sortBy]);

  useDocumentMeta({
    title: category
      ? `${categoryLabel} — купить в Ташкенте | Minimall`
      : "Весь каталог инструментов | Minimall",
    description: category
      ? `Купить ${categoryLabel.toLowerCase()} в Ташкенте. ${baseProducts.length} товаров в наличии. Доставка по Узбекистану, официальная гарантия — Minimall.uz`
      : "Весь каталог профессионального инструмента на Minimall.uz. Bosch, Makita, DeWalt, Milwaukee и другие бренды.",
    canonical: category
      ? `https://minimall.uz/catalog/${slug}`
      : "https://minimall.uz/catalog",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: categoryLabel,
      url: category
        ? `https://minimall.uz/catalog/${slug}`
        : "https://minimall.uz/catalog",
      numberOfItems: filteredProducts.length,
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Top row: Breadcrumbs & Return to Home Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
            <li><Link to="/" className="hover:text-red-500 transition-colors">{t.breadcrumbHome}</Link></li>
            <li aria-hidden="true"><span className="text-gray-300">›</span></li>
            <li><Link to="/catalog" className="hover:text-red-500 transition-colors">{t.catalog}</Link></li>
            {category && (
              <>
                <li aria-hidden="true"><span className="text-gray-300">›</span></li>
                <li className="text-gray-800 font-medium" aria-current="page">{categoryLabel}</li>
              </>
            )}
          </ol>
        </nav>

        {/* Return to Home Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 hover:text-red-600 bg-white hover:bg-red-50 px-4 py-2 rounded-xl border border-gray-200 hover:border-red-200 transition-all shadow-xs w-fit group active:scale-95 cursor-pointer"
          title={lang === "ru" ? "Вернуться на главную страницу" : "Bosh sahifaga qaytish"}
        >
          <span className="text-sm transition-transform group-hover:-translate-x-1">←</span>
          <span>{lang === "ru" ? "Вернуться на главную" : "Bosh sahifaga qaytish"}</span>
        </Link>
      </div>

      {/* Heading */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
            {categoryLabel}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            {filteredProducts.length === baseProducts.length
              ? `${baseProducts.length} ${lang === "ru" ? "товаров" : "ta tovar"}`
              : lang === "ru"
              ? `Найдено ${filteredProducts.length} из ${baseProducts.length} товаров`
              : `${baseProducts.length} tadan ${filteredProducts.length} ta tovar`}
          </p>
        </div>
        {category && (
          <img
            src={category.image}
            alt={categoryLabel}
            className="hidden md:block w-16 h-16 rounded-2xl object-cover border border-gray-100 shadow-2xs"
            width={64}
            height={64}
          />
        )}
      </div>

      {/* Main Content Layout with Filters Sidebar */}
      <div className="lg:flex lg:gap-8 items-start">
        {/* Filter Sidebar (Desktop) / Mobile Drawer */}
        <ProductFilters
          filters={filters}
          onChange={setFilters}
          lang={lang}
          allBrands={brands}
          totalProductsCount={baseProducts.length}
          filteredProductsCount={filteredProducts.length}
          availableProducts={baseProducts}
        />

        {/* Products Column */}
        <div className="flex-1 min-w-0">
          {/* Top toolbar: Count + Sort dropdown */}
          <div className="flex items-center justify-between gap-4 mb-4 bg-gray-50/70 p-3 rounded-2xl border border-gray-100">
            <span className="text-xs text-gray-600 font-semibold">
              {lang === "ru"
                ? `Показано ${filteredProducts.length} товаров`
                : `${filteredProducts.length} ta tovar ko'rsatilmoqda`}
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
            totalFound={filteredProducts.length}
          />

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100 p-8">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-800 text-lg font-bold">
                {lang === "ru" ? "Товары не найдены" : "Tovarlar topilmadi"}
              </p>
              <p className="text-gray-400 text-sm mt-1 max-w-md">
                {lang === "ru"
                  ? "Попробуйте расширить диапазон цен или сбросить активные фильтры"
                  : "Narx oralig'ini kengaytiring yoki faol filtrlarni tozalang"}
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
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
