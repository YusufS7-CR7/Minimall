import { useState, useMemo } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useProducts } from "@/context/ProductsContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { slugify } from "@/data/products";
import { T } from "@/data/translations";
import ProductCard from "@/components/ui/ProductCard";
import ProductFilters, {
  ActiveFilterBar,
  DEFAULT_FILTER_STATE,
  type FilterState,
} from "@/components/ui/ProductFilters";

export default function BrandPage() {
  const { slug } = useParams<{ slug?: string }>();
  const { lang } = useApp();
  const { products: allProducts, brands } = useProducts();
  const t = T[lang];

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "rating">("default");

  const brandName = brands.find((b) => slugify(b) === slug);

  if (!brandName) {
    return <Navigate to="/404" replace />;
  }

  const baseProducts = useMemo(() => {
    return allProducts.filter((p) => slugify(p.brand) === slug);
  }, [allProducts, slug]);

  const filteredProducts = useMemo(() => {
    return baseProducts
      .filter((p) => {
        // Price Range filter
        if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) {
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
    title: `${brandName} — инструменты и оборудование | Купить в Ташкенте Minimall`,
    description: `Оригинальный инструмент ${brandName} в Ташкенте. Каталог из ${baseProducts.length} моделей с официальной гарантией и доставкой по Узбекистану на Minimall.uz.`,
    canonical: `https://minimall.uz/brand/${slug}`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: `${brandName} — Minimall`,
      url: `https://minimall.uz/brand/${slug}`,
      numberOfItems: filteredProducts.length,
      about: {
        "@type": "Brand",
        name: brandName,
      },
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
          <li>
            <Link to="/" className="hover:text-red-500 transition-colors">
              {t.breadcrumbHome}
            </Link>
          </li>
          <li aria-hidden="true">
            <span className="text-gray-300">›</span>
          </li>
          <li>
            <span className="text-gray-500">{t.brands}</span>
          </li>
          <li aria-hidden="true">
            <span className="text-gray-300">›</span>
          </li>
          <li className="text-gray-800 font-medium" aria-current="page">
            {brandName}
          </li>
        </ol>
      </nav>

      {/* Brand Hero Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 md:p-10 text-white mb-10 relative overflow-hidden shadow-xl border border-gray-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-red-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 border border-red-500/30 text-xs font-semibold px-3 py-1 rounded-full mb-3">
              <span>★</span>
              <span>{lang === "ru" ? "Официальный дилер" : "Rasmiy diler"}</span>
            </div>
            <h1
              className="text-4xl md:text-5xl font-black tracking-wide text-white uppercase"
              style={{ fontFamily: "Barlow Condensed, sans-serif" }}
            >
              {brandName}
            </h1>
            <p className="text-gray-300 text-sm md:text-base max-w-xl mt-2">
              {lang === "ru"
                ? `Каталог оригинальной продукции ${brandName} с официальной гарантией качества, сервисной поддержкой и оперативной доставкой по всему Узбекистану.`
                : `${brandName} original mahsulotlari katalogi. Rasmiy kafolat, servis xizmati va butun O'zbekiston bo'ylab tezkor yetkazib berish.`}
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[120px]">
              <div
                className="text-3xl font-black text-white"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                {baseProducts.length}
              </div>
              <div className="text-xs text-gray-300 font-medium mt-0.5">
                {lang === "ru" ? "моделей в наличии" : "model mavjud"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Products Section */}
      <div className="mb-6 flex items-center justify-between">
        <h2
          className="text-2xl font-bold text-gray-900"
          style={{ fontFamily: "Barlow Condensed, sans-serif" }}
        >
          {lang === "ru" ? `Все товары бренда ${brandName}` : `${brandName} brendi tovarlari`}
        </h2>
        <span className="text-sm text-gray-400 font-medium">
          {filteredProducts.length === baseProducts.length
            ? `${baseProducts.length} ${lang === "ru" ? "товаров" : "ta tovar"}`
            : `${filteredProducts.length} / ${baseProducts.length} ${lang === "ru" ? "товаров" : "ta tovar"}`}
        </span>
      </div>

      {baseProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-gray-100 p-8 shadow-xs">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg font-medium">
            {lang === "ru"
              ? `Товары бренда ${brandName} скоро появятся в наличии`
              : `${brandName} brendi tovarlari tez kunda sotuvga chiqadi`}
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
          {/* Filter Sidebar */}
          <ProductFilters
            filters={filters}
            onChange={setFilters}
            lang={lang}
            totalProductsCount={baseProducts.length}
            filteredProductsCount={filteredProducts.length}
            availableProducts={baseProducts}
            hideBrandFilter={true}
          />

          {/* Products Column */}
          <div className="flex-1 min-w-0">
            {/* Top Toolbar */}
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

            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100 p-8">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-800 text-lg font-bold">
                  {lang === "ru" ? "Нет подходящих товаров" : "Mos tovarlar topilmadi"}
                </p>
                <p className="text-gray-400 text-sm mt-1 max-w-md">
                  {lang === "ru"
                    ? "Попробуйте расширить диапазон цен"
                    : "Narx oralig'ini kengaytirib ko'ring"}
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
      )}
    </main>
  );
}
