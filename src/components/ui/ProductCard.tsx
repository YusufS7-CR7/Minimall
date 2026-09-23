import { memo, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { T } from "@/data/translations";
import type { Product, Lang } from "@/data/types";
import StarRating from "./StarRating";
import { formatPrice } from "@/utils/formatPrice";

interface ProductCardProps {
  product: Product;
  lang: Lang;
}

/**
 * Memoized product card — only re-renders when `product` or `lang` actually changes.
 * This prevents the entire product grid from re-rendering on every cart/favorites update.
 */
const ProductCard = memo(function ProductCard({ product, lang }: ProductCardProps) {
  const t = T[lang];
  const { addToCart, toggleFavorite, favorites } = useApp();
  const { user, openAuthModal } = useAuth();
  const { usdRate } = useCurrency();
  const navigate = useNavigate();
  const name = lang === "uz" ? (product.nameUz || product.name) : product.name;
  const isFav = favorites.includes(product.id);
  const [imgError, setImgError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const galleryImages = (product.images && product.images.length > 0 ? product.images : [product.image]).filter(
    (img): img is string => Boolean(img && img.trim() !== "")
  );
  const hasImage = galleryImages.length > 0 && !imgError;
  const hasSizes = Boolean(product.sizes && product.sizes.length > 0);

  useEffect(() => {
    setCurrentImageIndex(0);
    setImgError(false);
  }, [product.id, product.image, product.images]);

  const goToPrevImage = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (galleryImages.length > 0 ? (prev - 1 + galleryImages.length) % galleryImages.length : 0));
  }, [galleryImages.length]);

  const goToNextImage = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (galleryImages.length > 0 ? (prev + 1) % galleryImages.length : 0));
  }, [galleryImages.length]);

  const handleFavorite = useCallback(() => {
    if (!user) {
      openAuthModal("register");
      return;
    }
    toggleFavorite(product.id);
  }, [user, openAuthModal, toggleFavorite, product.id]);

  const handleAddToCart = useCallback(() => {
    if (!user) {
      openAuthModal("register");
      return;
    }
    if (hasSizes) {
      navigate(`/product/${product.slug}`);
      return;
    }
    addToCart(product);
  }, [user, openAuthModal, addToCart, product, hasSizes, navigate]);

  return (
    <article className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-red-100 transition-all duration-300 hover:-translate-y-1 relative">
      {/* Favorite button */}
      <button
        onClick={handleFavorite}
        aria-label={isFav ? "Убрать из избранного" : "Добавить в избранное"}
        aria-pressed={isFav}
        className={`absolute top-2 right-2 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-sm touch-manipulation ${
          isFav
            ? "bg-red-50 text-red-600 border border-red-200"
            : "bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white"
        }`}
      >
        <svg className="w-4 h-4" fill={isFav ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      {/* Image — wrapped in Link for SEO crawlability */}
      <Link to={`/product/${product.slug}`} tabIndex={-1} aria-hidden="true">
        <div className="relative bg-gradient-to-br from-gray-50 via-slate-50 to-white overflow-hidden" style={{ height: "clamp(130px, 36vw, 210px)" }}>
          {hasImage ? (
            <>
              <img
                src={galleryImages[currentImageIndex]}
                alt={name}
                loading="lazy"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                width={400}
                height={210}
              />

              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goToPrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/85 text-gray-700 shadow-md flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-white cursor-pointer"
                    aria-label={lang === "uz" ? "Oldingi rasm" : "Предыдущее фото"}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={goToNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white/85 text-gray-700 shadow-md flex items-center justify-center text-lg font-bold opacity-0 group-hover:opacity-100 transition-all hover:bg-white cursor-pointer"
                    aria-label={lang === "uz" ? "Keyingi rasm" : "Следующее фото"}
                  >
                    ›
                  </button>
                  <div className="absolute bottom-2 right-2 z-10 bg-black/55 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                    {currentImageIndex + 1} / {galleryImages.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-slate-50 to-red-50/25 p-3 select-none relative group-hover:scale-[1.03] transition-transform duration-500">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-xs border border-gray-100 flex items-center justify-center text-2xl sm:text-3xl text-gray-400 group-hover:text-red-500 group-hover:border-red-100 group-hover:shadow-md transition-all duration-300 mb-1.5">
                📦
              </div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 group-hover:text-gray-600 transition-colors text-center line-clamp-1">
                {lang === "uz" ? "Rasm tayyorlanmoqda" : "Фото готовится"}
              </span>
              {product.brand && product.brand !== "Без бренда" && (
                <span className="mt-1 text-[9px] font-bold text-gray-400/90 uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md border border-gray-200/60 shadow-2xs">
                  {product.brand}
                </span>
              )}
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badge && (
              <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-wide px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-xs">
                {product.badge}
              </span>
            )}
            {product.oldPrice && (
              <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg shadow-xs">
                -{Math.round((1 - product.price / product.oldPrice) * 100)}%
              </span>
            )}
          </div>
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <span className={`text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg backdrop-blur-md shadow-2xs ${product.inStock ? "bg-emerald-600/90 text-white" : "bg-gray-900/85 text-gray-200"}`}>
              {product.inStock ? t.inStock : t.outOfStock}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      {/* Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-1 mb-1">
          {product.brand && product.brand !== "Без бренда" ? (
            <Link
              to={`/brand/${product.brand.toLowerCase()}`}
              className="text-[10px] sm:text-[11px] font-bold text-red-500 uppercase tracking-wider hover:text-red-700 transition-colors truncate"
            >
              {product.brand}
            </Link>
          ) : (
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-400 uppercase tracking-wider truncate">
              {lang === "uz" ? "Brendsiz" : "Без бренда"}
            </span>
          )}
          {hasSizes && (
            <span className="text-[9px] sm:text-[10px] bg-red-50 text-red-700 font-bold px-1.5 py-0.5 rounded border border-red-100 flex items-center gap-0.5 shrink-0" title={lang === "uz" ? "Bir nechta o'lchamlar mavjud" : "Доступно несколько размеров"}>
              <span>📏</span>
              <span>{product.sizes!.length} {lang === "uz" ? "o'lcham" : "разм."}</span>
            </span>
          )}
          {product.voltage && product.voltage !== "N/A" && (
            <span className="text-[9px] sm:text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono shrink-0">
              {product.voltage}
            </span>
          )}
        </div>

        <h3 className="text-xs sm:text-sm font-semibold text-gray-900 leading-snug mb-1.5 line-clamp-2 min-h-[2rem]">
          <Link to={`/product/${product.slug}`} className="hover:text-red-600 transition-colors">
            {name}
          </Link>
        </h3>

        <div className="mb-2">
          <StarRating rating={product.rating} />
        </div>

        {/* Price + CTA */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mt-auto pt-1">
          <div>
            <div className="text-sm sm:text-lg font-extrabold text-gray-900 leading-tight">{formatPrice(product.price)}</div>
            {product.oldPrice && (
              <div className="text-[10px] sm:text-xs text-gray-400 line-through">{formatPrice(product.oldPrice)}</div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            aria-label={`${t.addToCart}: ${name}`}
            className={`w-full sm:w-auto flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all touch-manipulation cursor-pointer ${
              product.inStock
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-md shadow-xs active:scale-[0.96]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
            </svg>
            <span>
              {hasSizes
                ? (lang === "uz" ? "Tanlash" : "Выбрать")
                : t.addToCart}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
});

export default ProductCard;
