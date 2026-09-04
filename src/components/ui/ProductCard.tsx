import { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
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
  const name = lang === "uz" ? (product.nameUz || product.name) : product.name;
  const isFav = favorites.includes(product.id);

  const handleFavorite = useCallback(() => {
    toggleFavorite(product.id);
  }, [toggleFavorite, product.id]);

  const handleAddToCart = useCallback(() => {
    addToCart(product);
  }, [addToCart, product]);

  return (
    <article className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:border-red-100 transition-all duration-300 hover:-translate-y-1 relative">
      {/* Favorite button */}
      <button
        onClick={handleFavorite}
        aria-label={isFav ? "Убрать из избранного" : "Добавить в избранное"}
        aria-pressed={isFav}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-md shadow-sm ${
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
        <div className="relative bg-gradient-to-br from-gray-50 to-white overflow-hidden" style={{ height: 210 }}>
          <img
            src={product.image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            width={400}
            height={210}
          />
          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {product.badge && (
              <span className="bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-lg shadow-sm">
                {product.badge}
              </span>
            )}
            {product.oldPrice && (
              <span className="bg-gradient-to-r from-emerald-500 to-green-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-sm">
                -{Math.round((1 - product.price / product.oldPrice) * 100)}%
              </span>
            )}
          </div>
          <div className="absolute top-2.5 right-11">
            <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${product.inStock ? "bg-green-100/90 text-green-700" : "bg-gray-100/90 text-gray-500"}`}>
              {product.inStock ? t.inStock : t.outOfStock}
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <Link
            to={`/brand/${product.brand.toLowerCase()}`}
            className="text-[11px] font-bold text-red-500 uppercase tracking-wider hover:text-red-700 transition-colors"
          >
            {product.brand}
          </Link>
          {product.voltage && product.voltage !== "N/A" && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-md font-mono shrink-0">
              {product.voltage}
            </span>
          )}
        </div>

        <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">
          <Link to={`/product/${product.slug}`} className="hover:text-red-600 transition-colors">
            {name}
          </Link>
        </h3>

        <div className="mb-3">
          <StarRating rating={product.rating} />
        </div>

        {/* Price + CTA */}
        <div className="flex items-end justify-between gap-2 mt-auto pt-1">
          <div>
            <div className="text-lg font-extrabold text-gray-900">{formatPrice(product.price)}</div>
            {product.oldPrice && (
              <div className="text-xs text-gray-400 line-through">{formatPrice(product.oldPrice)}</div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            aria-label={`${t.addToCart}: ${name}`}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              product.inStock
                ? "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white hover:shadow-md shadow-sm active:scale-[0.96]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
            </svg>
            {t.addToCart}
          </button>
        </div>
      </div>
    </article>
  );
});

export default ProductCard;
