import { useState, useMemo } from "react";
import { useParams, useSearchParams, Link, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useProducts } from "@/context/ProductsContext";
import { useCategories } from "@/context/CategoriesContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { T } from "@/data/translations";
import ProductCard from "@/components/ui/ProductCard";
import ProductFilters, {
  ActiveFilterBar,
  DEFAULT_FILTER_STATE,
  type FilterState,
} from "@/components/ui/ProductFilters";
import CustomSelect from "@/components/ui/CustomSelect";

export default function CategoryPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const subSlug = searchParams.get("sub");

  const { lang } = useApp();
  const { products: allProducts, brands } = useProducts();
  const { getCategoryBySlug } = useCategories();
  const t = T[lang];

  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "rating">("default");

  // If no slug, show all products
  const category = slug ? getCategoryBySlug(slug) : undefined;

  // Redirect invalid slugs to 404
  if (slug && !category) return <Navigate to="/404" replace />;

  // Active subcategory if ?sub= is present in URL
  const activeSubcategory = useMemo(() => {
    if (!category || !subSlug) return undefined;
    const cleanSub = subSlug.toLowerCase().trim();
    return category.subcategories?.find(
      (s) => s.slug.toLowerCase() === cleanSub || s.key.toLowerCase() === cleanSub
    );
  }, [category, subSlug]);

  const subLabel = activeSubcategory
    ? lang === "ru"
      ? activeSubcategory.labelRu
      : activeSubcategory.labelUz
    : undefined;

  // Select / clear subcategory
  const handleSelectSubcategory = (subKeyOrSlug?: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (subKeyOrSlug) {
      newParams.set("sub", subKeyOrSlug);
    } else {
      newParams.delete("sub");
    }
    setSearchParams(newParams);
  };

  // Base products filtered by category and subcategory
  const baseProducts = useMemo(() => {
    let prods = slug
      ? allProducts.filter((p) => p.category === category!.key)
      : allProducts;

    if (activeSubcategory) {
      prods = prods.filter((p) => {
        // Direct match with subcategory key or slug
        if (p.subcategory) {
          return (
            p.subcategory === activeSubcategory.key ||
            p.subcategory === activeSubcategory.slug
          );
        }
        // Fallback for older products added before subcategory field:
        // match name by root keyword (e.g. "лобзик" in name for lobziki)
        const subRu = activeSubcategory.labelRu.toLowerCase();
        const cleanName = subRu.replace(
          /^(аккумуляторные|настольные|ручной|ручные|электрический|электрические)\s+/i,
          ""
        );
        const root = cleanName.split(" ")[0].replace(/[ыиаоеь]$/i, "");
        if (root.length >= 3 && p.name.toLowerCase().includes(root)) {
          return true;
        }
        return false;
      });
    }
    return prods;
  }, [allProducts, slug, category, activeSubcategory]);

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
    title: activeSubcategory
      ? `${subLabel} — купить в Ташкенте | Minimall`
      : category
      ? `${categoryLabel} — купить в Ташкенте | Minimall`
      : "Весь каталог инструментов | Minimall",
    description: activeSubcategory
      ? `Купить ${subLabel?.toLowerCase()} в Ташкенте. ${baseProducts.length} товаров в наличии. Доставка по Узбекистану, официальная гарантия — mini-mall.uz`
      : category
      ? `Купить ${categoryLabel.toLowerCase()} в Ташкенте. ${baseProducts.length} товаров в наличии. Доставка по Узбекистану, официальная гарантия — mini-mall.uz`
      : "Весь каталог профессионального инструмента на mini-mall.uz. Bosch, Makita, DeWalt, Milwaukee и другие бренды.",
    canonical: activeSubcategory
      ? `https://mini-mall.uz/catalog/${slug}?sub=${activeSubcategory.slug}`
      : category
      ? `https://mini-mall.uz/catalog/${slug}`
      : "https://mini-mall.uz/catalog",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: subLabel || categoryLabel,
      url: activeSubcategory
        ? `https://mini-mall.uz/catalog/${slug}?sub=${activeSubcategory.slug}`
        : category
        ? `https://mini-mall.uz/catalog/${slug}`
        : "https://mini-mall.uz/catalog",
      numberOfItems: filteredProducts.length,
    },
  });

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Top row: Breadcrumbs & Return to Home Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
            <li><Link to="/" className="hover:text-red-500 transition-colors">{t.breadcrumbHome}</Link></li>
            <li aria-hidden="true"><span className="text-gray-300">›</span></li>
            <li><Link to="/catalog" className="hover:text-red-500 transition-colors">{t.catalog}</Link></li>
            {category && (
              <>
                <li aria-hidden="true"><span className="text-gray-300">›</span></li>
                {activeSubcategory ? (
                  <>
                    <li>
                      <Link to={`/catalog/${category.slug}`} className="hover:text-red-500 transition-colors">
                        {categoryLabel}
                      </Link>
                    </li>
                    <li aria-hidden="true"><span className="text-gray-300">›</span></li>
                    <li className="text-gray-800 font-medium" aria-current="page">
                      {subLabel}
                    </li>
                  </>
                ) : (
                  <li className="text-gray-800 font-medium" aria-current="page">{categoryLabel}</li>
                )}
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
      <div className="flex items-center justify-between mb-3 sm:mb-6">
        <div>
          {activeSubcategory && (
            <div className="flex items-center gap-2 mb-1.5">
              <Link
                to={`/catalog/${category?.slug}`}
                className="text-xs font-semibold text-red-600 hover:underline inline-flex items-center gap-1"
              >
                <span>← {categoryLabel}</span>
              </Link>
              <span className="text-gray-300">•</span>
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                {lang === "ru" ? "Подкатегория" : "Kichik bo'lim"}
              </span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
            {subLabel || categoryLabel}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">
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

      {/* Subcategory Pills / Chips Carousel */}
      {category && category.subcategories && category.subcategories.length > 0 && (
        <div className="mb-5 overflow-x-auto pb-2 scrollbar-thin -mx-3 sm:mx-0 px-3 sm:px-0">
          <div className="flex items-center gap-2 min-w-max">
            <button
              type="button"
              onClick={() => handleSelectSubcategory()}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                !activeSubcategory
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
              }`}
            >
              {lang === "ru" ? "Все товары" : "Barcha tovarlar"}
            </button>
            {category.subcategories.map((sub) => {
              const isActive =
                activeSubcategory?.key === sub.key ||
                activeSubcategory?.slug === sub.slug;
              const label = lang === "ru" ? sub.labelRu : sub.labelUz;

              return (
                <button
                  key={sub.key}
                  type="button"
                  onClick={() => handleSelectSubcategory(sub.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
                  }`}
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

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
          <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4 bg-gray-50/70 p-2.5 sm:p-3 rounded-2xl border border-gray-100">
            <span className="text-xs text-gray-600 font-semibold truncate">
              {lang === "ru"
                ? `Показано: ${filteredProducts.length}`
                : `Ko'rsatildi: ${filteredProducts.length}`}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400 font-medium hidden sm:inline">
                {lang === "ru" ? "Сортировка:" : "Saralash:"}
              </span>
              <div className="w-36 sm:w-48">
                <CustomSelect
                  value={sortBy}
                  onChange={(val) => setSortBy(val as any)}
                  size="sm"
                  options={[
                    { value: "default", label: lang === "ru" ? "По умолчанию" : "Odatiy" },
                    { value: "price_asc", label: lang === "ru" ? "Сначала дешевле" : "Avval arzonlari" },
                    { value: "price_desc", label: lang === "ru" ? "Сначала дороже" : "Avval qimmatlari" },
                    { value: "rating", label: lang === "ru" ? "По рейтингу" : "Reyting bo'yicha" },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Active Subcategory Pill if selected */}
          {activeSubcategory && (
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500 font-medium">
                {lang === "ru" ? "Подкатегория:" : "Kichik bo'lim:"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-700 font-bold px-3 py-1 rounded-xl border border-red-200 shadow-2xs">
                <span>📁 {subLabel}</span>
                <button
                  type="button"
                  onClick={() => handleSelectSubcategory()}
                  className="hover:text-red-900 ml-1 text-sm font-black cursor-pointer leading-none"
                  title={lang === "ru" ? "Сбросить подкатегорию" : "Bo'limni tozalash"}
                >
                  ×
                </button>
              </span>
            </div>
          )}

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
                {activeSubcategory
                  ? lang === "ru"
                    ? `В подкатегории «${subLabel}» товары не найдены`
                    : `«${subLabel}» bo'limida tovarlar topilmadi`
                  : lang === "ru"
                  ? "Товары не найдены"
                  : "Tovarlar topilmadi"}
              </p>
              <p className="text-gray-400 text-sm mt-1 max-w-md">
                {activeSubcategory
                  ? lang === "ru"
                    ? `Попробуйте сбросить фильтры или посмотреть все товары в разделе «${categoryLabel}»`
                    : `Filtrlarni tozalang yoki «${categoryLabel}» bo'limidagi barcha tovarlarni ko'ring`
                  : lang === "ru"
                  ? "Попробуйте расширить диапазон цен или сбросить активные фильтры"
                  : "Narx oralig'ini kengaytiring yoki faol filtrlarni tozalang"}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                {activeSubcategory && (
                  <button
                    type="button"
                    onClick={() => handleSelectSubcategory()}
                    className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    {lang === "ru" ? `Все товары «${categoryLabel}»` : `Barcha «${categoryLabel}»`}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setFilters(DEFAULT_FILTER_STATE)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  {t.resetFilters}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
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
