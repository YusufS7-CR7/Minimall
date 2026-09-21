import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductsContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { getCategoryByKey } from "@/data/categories";
import { T } from "@/data/translations";
import StarRating from "@/components/ui/StarRating";
import ProductCard from "@/components/ui/ProductCard";

import { formatPrice } from "@/utils/formatPrice";

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang, addToCart } = useApp();
  const { user, openAuthModal } = useAuth();
  const { getProductBySlug, products } = useProducts();
  const { usdRate } = useCurrency();
  const t = T[lang];

  const product = getProductBySlug(slug ?? "");

  // SEO — always call hooks before any conditional return
  const primaryCatKey = (product?.categories && product.categories.length > 0)
    ? product.categories[0]
    : product?.category;
  const category = primaryCatKey ? getCategoryByKey(primaryCatKey) : undefined;
  const name = product ? (lang === "uz" ? (product.nameUz || product.name) : product.name) : "";
  const desc = product ? (lang === "uz" ? (product.descUz || product.descRu) : product.descRu) : "";
  const categoryLabel = category ? (lang === "uz" ? (category.labelUz || category.labelRu) : category.labelRu) : "";

  const productCategories = useMemo(() => {
    if (!product) return [];
    const keys = (product.categories && product.categories.length > 0)
      ? product.categories
      : (product.category ? [product.category] : []);
    return keys.map((k) => getCategoryByKey(k)).filter(Boolean) as NonNullable<ReturnType<typeof getCategoryByKey>>[];
  }, [product]);

  useDocumentMeta({
    title: product
      ? `${name} — купить в Ташкенте | Minimall`
      : "Товар не найден | Minimall",
    description: product
      ? `${name}: ${desc.slice(0, 150)}. Купить на mini-mall.uz с доставкой по Узбекистану.`
      : undefined,
    image: product?.image,
    canonical: product ? `https://mini-mall.uz/product/${product.slug}` : undefined,
    structuredData: product
      ? {
          "@context": "https://schema.org",
          "@type": "Product",
          name,
          description: desc,
          image: product.images ?? [product.image],
          brand: { "@type": "Brand", name: product.brand },
          sku: `MM-${product.id}`,
          offers: {
            "@type": "Offer",
            url: `https://mini-mall.uz/product/${product.slug}`,
            priceCurrency: "UZS",
            price: product.price,
            availability: product.inStock
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: "Minimall" },
          },
          ...(product.rating !== undefined && {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              bestRating: 5,
              ratingCount: 42,
            },
          }),
        }
      : undefined,
  });

  if (!product) return <Navigate to="/404" replace />;

  const related = products.filter((p) => {
    if (p.id === product.id) return false;
    const prodCats = (product.categories && product.categories.length > 0)
      ? product.categories
      : (product.category ? [product.category] : []);
    const pCats = (p.categories && p.categories.length > 0)
      ? p.categories
      : (p.category ? [p.category] : []);
    return prodCats.some((c) => pCats.includes(c));
  }).slice(0, 4);

  const allImages = useMemo(() => {
    if (product?.images && product.images.length > 0) {
      return product.images.filter((img) => Boolean(img && img.trim() !== ""));
    }
    if (product?.image && product.image.trim() !== "") return [product.image];
    return [];
  }, [product?.images, product?.image]);

  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "desc">("specs");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const selectedSizeOption = product?.sizes?.find((size) => size.name === selectedSize);
  const displayedPrice = selectedSizeOption?.price ?? product?.price ?? 0;

  useEffect(() => {
    if (product?.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].name);
    } else {
      setSelectedSize("");
    }
  }, [product?.id, product?.sizes]);

  useEffect(() => {
    setCurrentImgIndex(0);
  }, [product?.id, product?.slug]);

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImgIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  }, [allImages.length]);

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentImgIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  }, [allImages.length]);

  // Keyboard navigation for fullscreen lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  // Touch swipe support for mobile
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
    setTouchStartX(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
        <ol className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap">
          <li>
            <Link to="/" className="hover:text-red-500 transition-colors">{t.breadcrumbHome}</Link>
          </li>
          <li aria-hidden="true"><span className="text-gray-300">›</span></li>
          {productCategories.length > 0 ? (
            productCategories.map((cat, idx) => {
              const catLbl = lang === "uz" ? (cat.labelUz || cat.labelRu) : cat.labelRu;
              return (
                <span key={cat.key} className="flex items-center gap-1.5">
                  <li>
                    <Link to={`/catalog/${cat.slug}`} className="hover:text-red-500 transition-colors">
                      {catLbl}
                    </Link>
                  </li>
                  {idx < productCategories.length - 1 ? (
                    <span className="text-gray-300">,</span>
                  ) : (
                    <li aria-hidden="true"><span className="text-gray-300">›</span></li>
                  )}
                </span>
              );
            })
          ) : category ? (
            <>
              <li>
                <Link to={`/catalog/${category.slug}`} className="hover:text-red-500 transition-colors">
                  {categoryLabel}
                </Link>
              </li>
              <li aria-hidden="true"><span className="text-gray-300">›</span></li>
            </>
          ) : null}
          <li className="text-gray-800 font-medium" aria-current="page">{name}</li>
        </ol>
      </nav>

      <div className="grid lg:grid-cols-2 gap-4 sm:gap-10 mb-8 sm:mb-12">
        {/* Images Gallery */}
        <div>
          {allImages.length > 0 ? (
            <>
              <div
                onClick={() => setIsLightboxOpen(true)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="group relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm mb-3 cursor-zoom-in flex items-center justify-center select-none"
                style={{ height: "min(420px, 72vw)" }}
                title="Нажмите, чтобы открыть полную галерею"
              >
                <img
                  src={allImages[currentImgIndex] || product.image}
                  alt={`${name} фото ${currentImgIndex + 1}`}
                  className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                  width={600}
                  height={420}
                />

                {/* Gallery counter badge */}
                {allImages.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full pointer-events-none">
                    {currentImgIndex + 1} / {allImages.length}
                  </div>
                )}

                {/* Hint overlay on hover */}
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
                  <span>🔍</span>
                  <span>{lang === "uz" ? "Galereyani ochish" : "Открыть галерею"}</span>
                </div>

                {/* Navigation arrows on main photo */}
                {allImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center text-base font-bold opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
                      title={lang === "uz" ? "Oldingi rasm" : "Предыдущее фото"}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-gray-800 shadow-md flex items-center justify-center text-base font-bold opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
                      title={lang === "uz" ? "Keyingi rasm" : "Следующее фото"}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails row */}
              {allImages.length > 1 && (
                <div className="flex gap-2 sm:gap-2.5 flex-wrap">
                  {allImages.map((img, i) => {
                    const isSelected = currentImgIndex === i;
                    const isCover = i === 0;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentImgIndex(i)}
                        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white p-1 flex items-center justify-center ${
                          isSelected
                            ? "border-red-600 shadow-md ring-2 ring-red-500/30 scale-105"
                            : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${name} foto ${i + 1}`}
                          className="w-full h-full object-contain"
                        />
                        {isCover && (
                          <span className="absolute bottom-0 inset-x-0 bg-red-600 text-[8px] font-bold text-white text-center py-0.2 uppercase tracking-tighter">
                            {lang === "uz" ? "Muqova" : "Обложка"}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div
              className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 via-slate-50 to-red-50/25 border border-gray-200/80 p-6 sm:p-10 flex flex-col items-center justify-center text-center shadow-xs"
              style={{ minHeight: "clamp(260px, 50vw, 420px)" }}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-4xl sm:text-5xl mb-4">
                📦
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-gray-900 mb-1.5">
                {lang === "uz" ? "Fotosurat tez orada yuklanadi" : "Фотография товара скоро появится"}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm leading-relaxed mb-4">
                {lang === "uz"
                  ? "Ushbu tovar sotuvda va omborimizda mavjud. Haqiqiy fotosuratlar yoki batafsil ma'lumot olish uchun Telegram orqali murojaat qilishingiz mumkin."
                  : "Товар в наличии и доступен к покупке. Вы можете запросить живые фотографии и консультацию у нашего менеджера в Telegram."}
              </p>
              <a
                href={`https://t.me/minimall_uzb?text=${encodeURIComponent(
                  `Здравствуйте! Интересует товар: ${name} (арт. MM-${product.id}). Хочу запросить живые фото.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <span>✈️</span>
                <span>{lang === "uz" ? "Telegram'da rasm so'rash" : "Запросить фото в Telegram"}</span>
              </a>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {/* Brand & badges */}
          <div className="flex items-center gap-2 mb-3">
            {product.brand && product.brand !== "Без бренда" ? (
              <Link to={`/brand/${product.brand.toLowerCase()}`} className="text-xs font-bold text-red-500 uppercase tracking-wider hover:text-red-700 transition-colors">
                {product.brand}
              </Link>
            ) : (
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                {lang === "uz" ? "Brendsiz" : "Без бренда"}
              </span>
            )}
            {product.badge && (
              <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg">
                {product.badge}
              </span>
            )}
            {product.oldPrice && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                -{Math.round((1 - product.price / product.oldPrice) * 100)}%
              </span>
            )}
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-3" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
            {name}
          </h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} size="md" />
            <span className="text-xs text-gray-400">42 {lang === "ru" ? "отзыва" : "ta sharh"}</span>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${product.inStock ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              {product.inStock ? t.inStock : t.outOfStock}
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="text-3xl font-extrabold text-gray-900">{formatPrice(displayedPrice, usdRate)}</div>
            {product.oldPrice && (
              <div className="text-sm text-gray-400 line-through mt-0.5">{formatPrice(product.oldPrice, usdRate)}</div>
            )}
          </div>

          {/* Sizes selector if available */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6 bg-gray-50/90 p-4 rounded-2xl border border-gray-200/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <span>📏</span>
                  <span>{lang === "uz" ? "O'lchamni tanlang:" : "Выберите размер:"}</span>
                </span>
                {selectedSize && (
                  <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                    {selectedSize}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size.name;
                  return (
                    <button
                      key={size.name}
                      type="button"
                      onClick={() => setSelectedSize(size.name)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-red-600 text-white shadow-md shadow-red-600/25 ring-2 ring-red-600/30 scale-105"
                          : "bg-white text-gray-700 border border-gray-200 hover:border-red-300 hover:text-red-600 shadow-2xs"
                      }`}
                    >
                      <span>{size.name}</span>
                      <span className="ml-1 opacity-80">{formatPrice(size.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* CTA — stacked on mobile */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8">
            <button
              onClick={() => {
                if (!user) { openAuthModal("register"); return; }
                addToCart(product, selectedSize || undefined, selectedSizeOption?.price);
              }}
              disabled={!product.inStock}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                product.inStock
                  ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" /></svg>
              {t.addToCart}
            </button>
            <div className="flex gap-2 sm:gap-3">
              <a
                href={`https://t.me/minimall_uzb?text=${encodeURIComponent(`Здравствуйте! Интересует товар: ${name}${selectedSize ? ` (Размер: ${selectedSize})` : ""} (арт. MM-${product.id})`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl border-2 border-sky-200 hover:border-sky-400 bg-sky-50 hover:bg-sky-100/80 text-sky-700 text-sm font-bold transition-all shadow-xs"
                title="Задать вопрос по товару в Telegram"
              >
                <span>✈️</span>
                <span>Telegram</span>
              </a>
              <a
                href="tel:+998970363636"
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl border-2 border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-600 text-sm font-bold transition-all"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                {lang === "ru" ? "Позвонить" : "Qo'ng'iroq"}
              </a>
            </div>
          </div>

          {/* Delivery & Return Trust Badges */}
          <div className="bg-gradient-to-br from-gray-50 to-red-50/30 rounded-2xl p-4 border border-gray-200/80 space-y-2.5 mb-6 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="text-base shrink-0 mt-0.5">🚚</span>
              <div>
                <span className="font-bold text-gray-900">
                  {lang === "ru" ? "Бесплатная доставка от 1 000 000 сум" : "1 000 000 so'mdan bepul yetkazib berish"}
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  {lang === "ru"
                    ? "Товары в мешках не учитываются. При сумме менее 1 000 000 сум цена доставки договорная."
                    : "Qopdagi tovarlar bepul yetkazishga kirmaydi. 1 000 000 so'mgacha yetkazib berish narxi kelishilgan holda."}
                </p>
              </div>
            </div>
            <div className="border-t border-gray-200/60 pt-2 flex items-start gap-2.5">
              <span className="text-base shrink-0 mt-0.5">🔄</span>
              <div>
                <span className="font-bold text-gray-900">
                  {lang === "ru" ? "Возврат и обмен в течение 4 дней" : "4 kun ichida qaytarish va almashtirish"}
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  {lang === "ru"
                    ? "Гарантированный возврат товара при сохранении товарного вида и чека."
                    : "Tovar ko'rinishi va chek saqlangan holda tovarni tez qaytarish."}
                </p>
              </div>
            </div>
          </div>

          {/* Key specs preview */}
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {Object.entries(product.specs).slice(0, 4).map(([k, v]) => (
                <div key={k}>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{k}</div>
                  <div className="text-sm font-semibold text-gray-900">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specs / Description */}
      <div className="mb-12">
        <div className="flex gap-0 border-b border-gray-200 mb-6">
          {(["specs", "desc"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-bold transition-all relative ${
                activeTab === tab ? "text-red-600" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab === "specs" ? t.characteristics : t.description}
              {activeTab === tab && <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-red-500 rounded-t-full" />}
            </button>
          ))}
        </div>

        {activeTab === "specs" ? (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(product.specs).map(([k, v], i) => (
                  <tr key={k} className={i % 2 === 0 ? "bg-gray-50/50" : "bg-white"}>
                    <td className="px-5 py-3 text-gray-500 font-medium w-1/2">{k}</td>
                    <td className="px-5 py-3 text-gray-900 font-semibold">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <p className="text-gray-700 leading-relaxed text-sm">{desc}</p>
          </div>
        )}
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading">
          <h2 id="related-heading" className="text-2xl font-extrabold text-gray-900 mb-6" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
            {lang === "ru" ? "Похожие товары" : "O'xshash tovarlar"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} />
            ))}
          </div>
        </section>
      )}
      {/* Fullscreen Lightbox Gallery Modal */}
      {isLightboxOpen && allImages.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 text-white animate-fadeIn select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Lightbox Top Header */}
          <div
            className="flex items-center justify-between gap-4 shrink-0 pb-3 border-b border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {name}
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>
                  {lang === "uz"
                    ? `${currentImgIndex + 1} / ${allImages.length} rasm`
                    : `Фото ${currentImgIndex + 1} из ${allImages.length}`}
                </span>
                {currentImgIndex === 0 && (
                  <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {lang === "uz" ? "Muqova" : "Обложка"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
                title={lang === "uz" ? "Yopish (Esc)" : "Закрыть (Esc)"}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Lightbox Main Image & Arrows */}
          <div
            className="relative flex-1 flex items-center justify-center my-auto p-2"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {allImages.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-red-600 text-white flex items-center justify-center text-3xl font-bold transition-all shadow-lg hover:scale-110 cursor-pointer border border-white/10"
                title={lang === "uz" ? "Oldingi rasm (←)" : "Предыдущее фото (←)"}
              >
                ‹
              </button>
            )}

            <div className="max-w-full max-h-full flex items-center justify-center">
              <img
                src={allImages[currentImgIndex]}
                alt={`${name} photo ${currentImgIndex + 1}`}
                className="max-h-[72vh] sm:max-h-[78vh] max-w-[90vw] object-contain rounded-xl shadow-2xl transition-all duration-200"
              />
            </div>

            {allImages.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-10 w-12 h-12 rounded-full bg-black/50 hover:bg-red-600 text-white flex items-center justify-center text-3xl font-bold transition-all shadow-lg hover:scale-110 cursor-pointer border border-white/10"
                title={lang === "uz" ? "Keyingi rasm (→)" : "Следующее фото (→)"}
              >
                ›
              </button>
            )}
          </div>

          {/* Lightbox Bottom Filmstrip */}
          <div
            className="shrink-0 pt-3 border-t border-white/10 flex flex-col items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {allImages.length > 1 && (
              <div className="flex gap-2 max-w-full overflow-x-auto pb-1 px-2">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentImgIndex(i)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white/5 shrink-0 ${
                      currentImgIndex === i
                        ? "border-red-500 scale-110 shadow-lg ring-2 ring-red-500/50"
                        : "border-white/20 hover:border-white/50 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-contain p-0.5"
                    />
                  </button>
                ))}
              </div>
            )}
            <p className="text-[11px] text-gray-400 text-center hidden sm:block">
              {lang === "uz"
                ? "Rasmlarni ko'rish uchun ← → tugmalaridan, chiqish uchun Esc tugmasidan foydalaning"
                : "Используйте клавиши ← → на клавиатуре для перелистывания, Esc для закрытия"}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
