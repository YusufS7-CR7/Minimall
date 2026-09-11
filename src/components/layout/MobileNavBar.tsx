import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { T } from "@/data/translations";
import CartDrawer from "@/components/ui/CartDrawer";
import FavoritesModal from "@/components/ui/FavoritesModal";
import OrderHistoryModal from "@/components/ui/OrderHistoryModal";

export default function MobileNavBar() {
  const location = useLocation();
  const { lang, totalCartCount, favorites } = useApp();
  const { user, openAuthModal } = useAuth();
  const t = T[lang];

  const [cartOpen, setCartOpen] = useState(false);
  const [favOpen, setFavOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const isHome = location.pathname === "/";
  const isCatalog =
    location.pathname.startsWith("/catalog") ||
    location.pathname.startsWith("/brand") ||
    location.pathname.startsWith("/search");
  const isProfile = false; // no separate profile page

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav
        aria-label="Мобильная навигация"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch h-[60px]">

          {/* Home */}
          <Link
            to="/"
            aria-label="Главная"
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              isHome ? "text-red-600" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <svg className="w-5 h-5" fill={isHome ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isHome ? 0 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-[10px] font-semibold leading-none">
              {lang === "ru" ? "Главная" : "Bosh sahifa"}
            </span>
          </Link>

          {/* Catalog */}
          <Link
            to="/catalog"
            aria-label={t.catalog}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              isCatalog ? "text-red-600" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            <svg className="w-5 h-5" fill={isCatalog ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isCatalog ? 0 : 1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-[10px] font-semibold leading-none">{t.catalog}</span>
          </Link>

          {/* Cart — center, bigger */}
          <button
            onClick={() => setCartOpen(true)}
            aria-label={t.cart}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative text-gray-400 hover:text-gray-700 transition-colors"
          >
            <div className="relative">
              <div className={`w-12 h-12 -mt-6 rounded-full flex items-center justify-center shadow-lg transition-all ${
                totalCartCount > 0
                  ? "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-red-200"
                  : "bg-gradient-to-br from-gray-700 to-gray-900 text-white shadow-gray-300"
              }`}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 9M17 13l2.3 9M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                </svg>
              </div>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[16px] h-4 flex items-center justify-center px-1 shadow-md">
                  {totalCartCount > 99 ? "99+" : totalCartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold leading-none mt-0.5">{t.cart}</span>
          </button>

          {/* Favorites */}
          <button
            onClick={() => setFavOpen(true)}
            aria-label={t.favorites}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative text-gray-400 hover:text-gray-700 transition-colors"
          >
            <div className="relative">
              <svg className={`w-5 h-5 ${favorites.length > 0 ? "text-red-500" : ""}`} fill={favorites.length > 0 ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold leading-none">{t.favorites}</span>
          </button>

          {/* Profile / Login */}
          <button
            onClick={() => {
              if (user) setOrdersOpen(true);
              else openAuthModal("login");
            }}
            aria-label={user ? (lang === "ru" ? "Мои заказы" : "Buyurtmalar") : t.login}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              isProfile ? "text-red-600" : "text-gray-400 hover:text-gray-700"
            }`}
          >
            {user ? (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-[10px] font-black shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
            <span className="text-[10px] font-semibold leading-none">
              {user ? (lang === "ru" ? "Заказы" : "Buyurtma") : t.login}
            </span>
          </button>

        </div>
      </nav>

      {/* Modals triggered from mobile nav */}
      <CartDrawer lang={lang} open={cartOpen} onClose={() => setCartOpen(false)} />
      <FavoritesModal isOpen={favOpen} onClose={() => setFavOpen(false)} />
      <OrderHistoryModal isOpen={ordersOpen} onClose={() => setOrdersOpen(false)} />
    </>
  );
}
