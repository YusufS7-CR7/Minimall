import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useProducts } from "@/context/ProductsContext";

import { formatPrice } from "@/utils/formatPrice";

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FavoritesModal({ isOpen, onClose }: FavoritesModalProps) {
  const { favorites, removeFavorite, addToCart, lang, showToast } = useApp();
  const { products } = useProducts();

  if (!isOpen) return null;

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  const handleAddAllToCart = () => {
    let addedCount = 0;
    favoriteProducts.forEach((p) => {
      if (p.inStock) {
        addToCart(p);
        addedCount++;
      }
    });
    showToast(
      lang === "ru"
        ? `Добавлено в корзину товаров: ${addedCount}`
        : `Savatga ${addedCount} ta tovar qo'shildi`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">❤️</span>
            <div>
              <h2
                className="text-xl font-bold tracking-wide"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                {lang === "ru" ? "Избранные товары" : "Sevimlilar ro'yxati"}
              </h2>
              <p className="text-xs text-red-100">
                {lang === "ru"
                  ? `Сохранено позиций: ${favoriteProducts.length}`
                  : `Saqlangan tovarlar: ${favoriteProducts.length}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 text-gray-900">
          {favoriteProducts.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="text-6xl text-gray-300">🤍</div>
              <h3 className="text-base font-bold text-gray-800">
                {lang === "ru" ? "В избранном пока пусто" : "Sevimlilar ro'yxati bo'sh"}
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {lang === "ru"
                  ? "Нажимайте на сердечко на карточках товаров, чтобы сохранить понравившиеся позиции и вернуться к ним позже."
                  : "Yoqqan tovarlarni saqlab qolish uchun tovar kartasidagi yurakchani bosing."}
              </p>
              <button
                onClick={onClose}
                className="mt-3 inline-block bg-red-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
              >
                {lang === "ru" ? "Перейти к покупкам" : "Katalogga o'tish"}
              </button>
            </div>
          ) : (
            favoriteProducts.map((p) => {
              const name = lang === "uz" ? (p.nameUz || p.name) : p.name;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-4 p-3.5 bg-gray-50/70 hover:bg-gray-50 rounded-2xl border border-gray-100 transition-colors"
                >
                  <Link
                    to={`/product/${p.slug}`}
                    onClick={onClose}
                    className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 border border-gray-200"
                  >
                    <img
                      src={p.image}
                      alt={name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                      {p.brand}
                    </div>
                    <Link
                      to={`/product/${p.slug}`}
                      onClick={onClose}
                      className="text-xs sm:text-sm font-bold text-gray-900 hover:text-red-600 line-clamp-1 transition-colors"
                    >
                      {name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-extrabold text-gray-900">
                        {formatPrice(p.price)}
                      </span>
                      {p.oldPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(p.oldPrice)}
                        </span>
                      )}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          p.inStock
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {p.inStock ? "В наличии" : "Нет на складе"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => addToCart(p)}
                      disabled={!p.inStock}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        p.inStock
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer active:scale-95"
                          : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <span>🛒</span>
                      <span className="hidden sm:inline">В корзину</span>
                    </button>

                    <button
                      onClick={() => removeFavorite(p.id)}
                      className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Удалить из избранного"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {favoriteProducts.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-gray-50/70 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Позиций: {favoriteProducts.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddAllToCart}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Добавить все в корзину
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
