import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { T } from "@/data/translations";
import type { Lang } from "@/data/types";
import CheckoutModal from "./CheckoutModal";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("ru-UZ", { style: "decimal" }).format(p) + " сум";

interface CartDrawerProps {
  lang: Lang;
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ lang, open, onClose }: CartDrawerProps) {
  const t = T[lang];
  const { cart, totalCartCount, totalCartPrice, updateCartCount } = useApp();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (!open && !checkoutOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={t.cart}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 z-10 animate-slideLeft">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-gray-900" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
              {t.cart}
            </h2>
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {totalCartCount}
            </span>
          </div>
          <button onClick={onClose} aria-label="Закрыть корзину" className="text-gray-400 hover:text-gray-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🛒</div>
              <p className="text-gray-500 font-medium">
                {lang === "ru" ? "Ваша корзина пуста" : "Savatingiz bo'sh"}
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <img
                  src={item.product.image}
                  alt={lang === "uz" ? (item.product.nameUz || item.product.name) : item.product.name}
                  className="w-16 h-16 object-cover rounded-lg bg-white shrink-0"
                  width={64}
                  height={64}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-2">
                    {lang === "uz" ? (item.product.nameUz || item.product.name) : item.product.name}
                  </h4>
                  <div className="text-xs text-red-600 font-extrabold mt-1">
                    {formatPrice(item.product.price)}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateCartCount(item.product.id, -1)}
                      aria-label="Уменьшить количество"
                      className="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-gray-800">{item.count}</span>
                    <button
                      onClick={() => updateCartCount(item.product.id, 1)}
                      aria-label="Увеличить количество"
                      className="w-6 h-6 bg-white border border-gray-200 rounded flex items-center justify-center text-xs font-bold text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout */}
        {cart.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-gray-600">
                {lang === "ru" ? "Итого:" : "Jami:"}
              </span>
              <span className="text-xl font-extrabold text-gray-900">{formatPrice(totalCartPrice)}</span>
            </div>
            <button
              onClick={() => {
                setCheckoutOpen(true);
              }}
              className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{lang === "ru" ? "Оформить заказ" : "Buyurtma berish"}</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>

      {/* Real Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false);
          onClose();
        }}
      />
    </div>
  );
}
