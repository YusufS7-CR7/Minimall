import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useProducts } from "@/context/ProductsContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { T } from "@/data/translations";
import { CATEGORIES } from "@/data/categories";
import ProductCard from "@/components/ui/ProductCard";
import StarRating from "@/components/ui/StarRating";
import PriceRangeSlider from "@/components/ui/PriceRangeSlider";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("ru-UZ", { style: "decimal" }).format(p) + " сум";

const BANNER_IMAGES = [
  "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1200&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1530124566582-a45a7e3e29f0?w=1200&h=500&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1504382103100-db7e92322d95?w=1200&h=500&fit=crop&auto=format",
];

const ADVANTAGE_ICONS = [
  "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0",
  "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
  "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
];

const ADVANTAGE_COLORS = [
  "from-red-500/10 to-red-500/5 text-red-600",
  "from-emerald-500/10 to-emerald-500/5 text-emerald-600",
  "from-violet-500/10 to-violet-500/5 text-violet-600",
  "from-sky-500/10 to-sky-500/5 text-sky-600",
  "from-orange-500/10 to-orange-500/5 text-orange-600",
  "from-teal-500/10 to-teal-500/5 text-teal-600",
];

export default function HomePage() {
  const { lang, addToCart } = useApp();
  const { products, brands } = useProducts();
  const t = T[lang];

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20_000_000]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const isPriceFiltered = priceRange[0] > 0 || priceRange[1] < 20_000_000;

  const displayedProducts = products.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
  );

  useDocumentMeta({
    title: "Minimall — интернет-магазин инструментов в Ташкенте | minimall.uz",
    description:
      "Купить профессиональный строительный инструмент в Ташкенте. Широкий выбор Bosch, Makita, DeWalt, Milwaukee. Доставка по всему Узбекистану. Официальная гарантия.",
    canonical: "https://minimall.uz/",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Minimall",
      url: "https://minimall.uz",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://minimall.uz/search?q={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
  });

  return (
    <>
      <HeroSection lang={lang} />
      <CategoriesSection lang={lang} />
      <AdvantagesSection lang={lang} />
      <DiscountProductsRow lang={lang} />

      {/* Full catalog grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
              {lang === "ru" ? "Все товары" : "Barcha tovarlar"}
              <span className="ml-2 text-lg text-gray-400 font-normal">
                ({displayedProducts.length}{displayedProducts.length !== products.length ? ` из ${products.length}` : ""})
              </span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                isPriceFiltered || isFilterOpen
                  ? "bg-red-600 text-white border-red-600 shadow-sm"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>{lang === "ru" ? "Фильтр по цене" : "Narx filtri"}</span>
              {isPriceFiltered && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
            <Link
              to="/catalog"
              className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
            >
              <span>{lang === "ru" ? "Весь каталог" : "Barcha katalog"}</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Collapsible Price Range Filter Card */}
        {isFilterOpen && (
          <div className="mb-8 p-5 bg-white rounded-2xl border border-red-100 shadow-sm animate-fade-in max-w-xl">
            <PriceRangeSlider
              min={0}
              max={20_000_000}
              step={100_000}
              value={priceRange}
              onChange={setPriceRange}
              lang={lang}
              showInputs={true}
              showPresets={true}
              onReset={() => setPriceRange([0, 20_000_000])}
            />
          </div>
        )}

        {displayedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100 p-8">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-800 text-lg font-bold">
              {lang === "ru" ? "Товары не найдены" : "Tovarlar topilmadi"}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {lang === "ru" ? "В выбранном ценовом диапазоне товаров нет" : "Tanlangan narx oralig'ida tovarlar yo'q"}
            </p>
            <button
              type="button"
              onClick={() => setPriceRange([0, 20_000_000])}
              className="mt-4 px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-700 transition-all cursor-pointer"
            >
              {t.resetFilters}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {displayedProducts.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        )}
      </section>

      {/* Partners / Brands */}
      <div className="border-y border-gray-200/60 bg-white py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-7">
            {lang === "ru" ? "Официальные поставщики" : "Rasmiy yetkazib beruvchilar"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            {brands.map((b) => (
              <Link
                key={b}
                to={`/brand/${b.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="text-2xl font-black text-gray-300 hover:text-red-500 transition-all hover:scale-110 duration-300"
                style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.05em" }}
              >
                {b}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

function HeroSection({ lang }: { lang: string }) {
  const t = T[lang as "ru" | "uz"];
  const { products } = useProducts();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = t.newsItems.length;
  const featuredProduct = products.find((p) => p.id === 8) || products[0];
  const { addToCart } = useApp();

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % total), 5000);
    return () => clearInterval(id);
  }, [paused, total]);

  return (
    <section aria-label="Главный баннер" className="max-w-7xl mx-auto px-4 pt-5 pb-2">
      <div className="flex gap-4" style={{ minHeight: 360 }}>
        {/* Main Carousel */}
        <div
          className="flex-1 relative rounded-2xl overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {t.newsItems.map((item, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-all duration-700 ${i === active ? "opacity-100 scale-100" : "opacity-0 scale-105 pointer-events-none"}`}
            >
              <img src={BANNER_IMAGES[i]} alt={item.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-10 max-w-lg">
                <h2 className="text-white text-2xl md:text-4xl font-extrabold leading-tight mb-3" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  {item.title}
                </h2>
                <p className="text-white/70 text-sm md:text-base leading-relaxed mb-5 line-clamp-2">{item.desc}</p>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {[
                    { icon: "🛡️", text: lang === "ru" ? "Оригинал" : "Original" },
                    { icon: "🚚", text: lang === "ru" ? "Быстрая доставка" : "Tez yetkazish" },
                    { icon: "💎", text: lang === "ru" ? "Лучшие цены" : "Eng yaxshi narx" },
                  ].map((b, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md text-white/90 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10">
                      <span>{b.icon}</span>
                      <span>{b.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <button onClick={() => setActive((a) => (a - 1 + total) % total)} aria-label="Предыдущий слайд" className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 backdrop-blur-sm text-white w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 border border-white/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => setActive((a) => (a + 1) % total)} aria-label="Следующий слайд" className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/15 hover:bg-white/30 backdrop-blur-sm text-white w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 border border-white/10">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
            {t.newsItems.map((_, i) => (
              <button key={i} onClick={() => setActive(i)} aria-label={`Слайд ${i + 1}`} className={`transition-all rounded-full ${i === active ? "bg-red-500 w-7 h-2.5 shadow-lg shadow-red-500/50" : "bg-white/40 hover:bg-white/60 w-2.5 h-2.5"}`} />
            ))}
          </div>
        </div>

        {/* Featured Product Sidebar */}
        <div className="hidden lg:flex w-72 shrink-0 bg-white border border-gray-100 rounded-2xl flex-col items-center p-5 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-gradient-to-br from-red-500/10 to-transparent rounded-full" />
          <Link to={`/product/${featuredProduct.slug}`} className="w-full bg-gradient-to-br from-gray-50 to-white rounded-xl overflow-hidden mb-4 flex items-center justify-center relative" style={{ height: 180 }}>
            <img src={featuredProduct.image} alt={lang === "ru" ? featuredProduct.name : featuredProduct.nameUz} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
          </Link>
          <h3 className="text-sm font-semibold text-gray-800 text-center leading-snug mb-2">
            <Link to={`/product/${featuredProduct.slug}`} className="hover:text-red-600 transition-colors">
              {lang === "ru" ? featuredProduct.name : featuredProduct.nameUz}
            </Link>
          </h3>
          <div className="text-xl font-extrabold text-gray-900 mb-1.5">{formatPrice(featuredProduct.price)}</div>
          <StarRating rating={featuredProduct.rating} />
          <button onClick={() => addToCart(featuredProduct)} className="mt-3 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
            {T[lang as "ru" | "uz"].addToCart}
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Categories Section ────────────────────────────────────────────────────────

function CategoriesSection({ lang }: { lang: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  return (
    <section aria-labelledby="categories-heading" className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 id="categories-heading" className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
          {lang === "ru" ? "Категории" : "Kategoriyalar"}
        </h2>
        <Link to="/catalog" className="text-red-500 hover:text-red-600 text-sm font-semibold flex items-center gap-1 transition-colors group">
          {lang === "ru" ? "Все категории" : "Barcha kategoriyalar"}
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </Link>
      </div>
      <div className="relative">
        <div ref={scrollRef} onScroll={checkScroll} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {CATEGORIES.map((c) => {
            const label = lang === "ru" ? c.labelRu : c.labelUz;
            return (
              <Link
                key={c.key}
                to={`/catalog/${c.slug}`}
                className="group flex flex-col items-center gap-2.5 shrink-0"
                style={{ width: 130 }}
              >
                <div className="w-[110px] h-[110px] rounded-2xl overflow-hidden border-2 border-gray-100 group-hover:border-red-400 transition-all bg-white shadow-sm group-hover:shadow-lg group-hover:shadow-red-100/50 group-hover:-translate-y-1 duration-300">
                  <img src={c.image} alt={label} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" width={110} height={110} loading="lazy" />
                </div>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-red-600 text-center leading-tight transition-colors">{label}</span>
              </Link>
            );
          })}
        </div>
        {canScrollRight && (
          <button onClick={() => scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })} aria-label="Прокрутить вправо" className="absolute right-0 top-[55px] -translate-y-1/2 bg-white shadow-lg border border-gray-100 w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-all z-10">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        )}
      </div>
    </section>
  );
}

// ─── Advantages ────────────────────────────────────────────────────────────────

function AdvantagesSection({ lang }: { lang: string }) {
  const t = T[lang as "ru" | "uz"];
  return (
    <section aria-labelledby="advantages-heading" className="max-w-7xl mx-auto px-4 py-8">
      <h2 id="advantages-heading" className="text-2xl font-extrabold text-gray-900 mb-6" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
        {t.advantages}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {t.advantageItems.map((item, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-lg hover:border-red-100 hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${ADVANTAGE_COLORS[i]} transition-transform group-hover:scale-110 duration-300`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={ADVANTAGE_ICONS[i]} />
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug">{item.title}</h3>
            <p className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Discount Row ──────────────────────────────────────────────────────────────

function DiscountProductsRow({ lang }: { lang: string }) {
  const { addToCart } = useApp();
  const { products } = useProducts();
  const t = T[lang as "ru" | "uz"];
  const discountProducts = products.filter((p) => p.oldPrice);
  if (discountProducts.length === 0) return null;

  return (
    <section aria-labelledby="discounts-heading" className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 id="discounts-heading" className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
            {lang === "ru" ? "Товары со скидкой" : "Chegirmali tovarlar"}
          </h2>
          <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">Sale</span>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-3">
        {discountProducts.map((p) => (
          <div key={p.id} className="shrink-0 bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-red-100 transition-all duration-300 group hover:-translate-y-1" style={{ width: 230 }}>
            <Link to={`/product/${p.slug}`} className="block relative bg-gradient-to-br from-gray-50 to-white overflow-hidden" style={{ height: 190 }}>
              <img src={p.image} alt={lang === "ru" ? p.name : p.nameUz} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-2.5 left-2.5">
                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                  -{Math.round((1 - p.price / p.oldPrice!) * 100)}%
                </span>
              </div>
            </Link>
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-2 line-clamp-2">
                <Link to={`/product/${p.slug}`} className="hover:text-red-600 transition-colors">
                  {lang === "ru" ? p.name : p.nameUz}
                </Link>
              </h3>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-base font-extrabold text-gray-900">{formatPrice(p.price)}</span>
              </div>
              <div className="text-xs text-gray-400 line-through mb-2">{formatPrice(p.oldPrice!)}</div>
              <StarRating rating={p.rating} />
              <button onClick={() => addToCart(p)} className="mt-3 w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.97]">
                {t.addToCart}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


