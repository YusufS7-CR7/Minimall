import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { useProducts } from "@/context/ProductsContext";
import { useApp } from "@/context/AppContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useOrders } from "@/context/OrdersContext";
import { useBanners } from "@/context/BannersContext";
import { useCategories } from "@/context/CategoriesContext";
import { useCurrency } from "@/context/CurrencyContext";
import { ADMIN_TRANSLATIONS } from "@/data/adminTranslations";
import { LOGO_DATA_URI } from "@/assets/logoDataUri";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { products } = useProducts();
  const { categories } = useCategories();
  const { lang, setLang, showToast } = useApp();
  const { adminUser, admins, logout, isSuperAdmin, hasPermission } = useAdminAuth();
  const { orders, newOrdersCount } = useOrders();
  const { slides } = useBanners();
  const { usdRate, setUsdRate } = useCurrency();
  const location = useLocation();

  // Currency widget local state
  const [rateInput, setRateInput] = useState<string>(String(usdRate));
  const [rateEditing, setRateEditing] = useState(false);
  const [rateSaved, setRateSaved] = useState(false);

  const handleRateSave = () => {
    const val = parseFloat(rateInput.replace(/\s/g, "").replace(/,/g, "."));
    if (!isNaN(val) && val > 0) {
      setUsdRate(val);
      setRateEditing(false);
      setRateSaved(true);
      setTimeout(() => setRateSaved(false), 2000);
      showToast(lang === "uz" ? `Kurs yangilandi: 1 $ = ${val.toLocaleString("ru")} сум` : `Курс обновлён: 1 $ = ${val.toLocaleString("ru")} сум`);
    }
  };

  const t = ADMIN_TRANSLATIONS[lang].nav;

  const handleLogout = () => {
    if (window.confirm(t.logoutConfirm)) {
      logout();
      showToast(t.logoutSuccess);
    }
  };

  const canManageAdmins = isSuperAdmin || hasPermission("admins_manage");

  const isProductsActive = location.pathname === "/admin" || location.pathname === "/admin/products";
  const isOrdersActive = location.pathname.startsWith("/admin/orders");
  const isAdminsActive = location.pathname.startsWith("/admin/admins");
  const isBannersActive = location.pathname.startsWith("/admin/banners");
  const isCategoriesActive = location.pathname.startsWith("/admin/categories");
  const isHelpActive = location.pathname.startsWith("/admin/help");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="bg-gray-900 text-white border-b border-gray-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-14 sm:h-16">
          {/* Brand + Status */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <Link to="/admin" className="flex items-center gap-1.5 sm:gap-2.5 group shrink-0">
              <img
                src={LOGO_DATA_URI}
                alt="Minimall"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-contain bg-white p-0.5 shrink-0"
              />
              <span
                className="text-base sm:text-xl font-extrabold tracking-wide truncate"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                minimall<span className="text-red-500">.admin</span>
              </span>
            </Link>
            <span className="hidden lg:inline-flex items-center gap-1.5 bg-red-950/60 border border-red-500/30 text-red-400 text-xs px-2.5 py-0.5 rounded-full font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {t.tagline}
            </span>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Language Switcher */}
            <div className="flex items-center gap-1 bg-gray-800/90 border border-gray-700/80 p-1 rounded-xl">
              <button
                id="admin-lang-uz-btn"
                type="button"
                onClick={() => setLang("uz")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === "uz"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                title="O'zbek tiliga o'tkazish"
              >
                <span>🇺🇿</span>
                <span>UZ</span>
              </button>
              <button
                id="admin-lang-ru-btn"
                type="button"
                onClick={() => setLang("ru")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === "ru"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
                title="Переключить на русский язык"
              >
                <span>🇷🇺</span>
                <span>RU</span>
              </button>
            </div>

            {/* Logged in admin pill — desktop only */}
            {adminUser && (
              <div className="hidden sm:flex items-center gap-2 bg-gray-800/80 border border-gray-700/80 px-3 py-1.5 rounded-xl">
                <span className="text-base">
                  {adminUser.isSuperAdmin ? "👑" : "👤"}
                </span>
                <div className="text-left text-xs leading-tight">
                  <div className="font-bold text-white flex items-center gap-1">
                    <span>{adminUser.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono hidden lg:inline">
                      (@{adminUser.username})
                    </span>
                  </div>
                  <div className="text-[10px] text-red-400 font-medium">
                    {adminUser.isSuperAdmin
                      ? t.superAdmin
                      : adminUser.role === "manager"
                      ? t.manager
                      : t.admin}
                  </div>
                </div>
              </div>
            )}

            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-2.5 sm:px-3.5 py-2 rounded-xl transition-all shadow-md shadow-red-600/20"
            >
              <span>←</span>
              <span className="hidden sm:inline">{t.toStore}</span>
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-300 hover:text-red-400 bg-white/5 hover:bg-red-500/10 px-2.5 py-2 rounded-xl border border-white/10 transition-colors cursor-pointer"
              title={t.logout}
            >
              <span>🚪</span>
              <span className="hidden sm:inline">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Layout Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* ── Sidebar / Mobile Tab Nav ── */}
        <aside className="w-full md:w-64 shrink-0 space-y-4">
          {/* Mobile: horizontal pill tabs */}
          <div className="md:hidden overflow-x-auto scrollbar-hide">
            <nav className="flex items-center gap-2 pb-1 min-w-max">
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap ${
                  isProductsActive ? "bg-red-600 text-white shadow-sm" : "bg-white border border-gray-100 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>📦</span>
                <span>{t.productsShort}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isProductsActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {products.length}
                </span>
              </Link>
              {canManageAdmins && (
                <Link
                  to="/admin/admins"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap ${
                    isAdminsActive ? "bg-red-600 text-white shadow-sm" : "bg-white border border-gray-100 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span>👥</span>
                  <span>{t.adminsShort}</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isAdminsActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                    {admins.length}
                  </span>
                </Link>
              )}
              <Link
                to="/admin/orders"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap ${
                  isOrdersActive ? "bg-red-600 text-white shadow-sm" : "bg-white border border-gray-100 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>🛒</span>
                <span>{t.orders}</span>
                {newOrdersCount > 0 && (
                  <span className="text-xs bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full animate-pulse">
                    +{newOrdersCount}
                  </span>
                )}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isOrdersActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {orders.length}
                </span>
              </Link>
              <Link
                to="/admin/banners"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap ${
                  isBannersActive ? "bg-red-600 text-white shadow-sm" : "bg-white border border-gray-100 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>⚡</span>
                <span>{t.bannersShort}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isBannersActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {slides.length}
                </span>
              </Link>
              <Link
                to="/admin/categories"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap ${
                  isCategoriesActive ? "bg-red-600 text-white shadow-sm" : "bg-white border border-gray-100 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>🗂️</span>
                <span>{t.categoriesShort}</span>
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isCategoriesActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {categories.length}
                </span>
              </Link>
              <Link
                to="/admin/help"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap ${
                  isHelpActive ? "bg-red-600 text-white shadow-sm" : "bg-white border border-gray-100 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span>ℹ️</span>
                <span>{t.helpShort}</span>
              </Link>
            </nav>
          </div>

          {/* Desktop: vertical sidebar */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 p-4 shadow-xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 mb-2">
              {t.management}
            </div>
            <nav className="space-y-1">
              <Link
                to="/admin"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isProductsActive ? "bg-red-50 text-red-700 font-bold" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span>📦</span>
                  <span>{t.products}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isProductsActive ? "bg-red-200/60 text-red-800" : "bg-gray-100 text-gray-600"}`}>
                  {products.length}
                </span>
              </Link>

              {canManageAdmins && (
                <Link
                  to="/admin/admins"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    isAdminsActive ? "bg-red-50 text-red-700 font-bold" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>👥</span>
                    <span>{t.admins}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isAdminsActive ? "bg-red-200/60 text-red-800" : "bg-gray-100 text-gray-600"}`}>
                    {admins.length}
                  </span>
                </Link>
              )}

              <Link
                to="/admin/orders"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isOrdersActive ? "bg-red-50 text-red-700 font-bold" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span>🛒</span>
                  <span>{t.orders}</span>
                </div>
                <div className="flex items-center gap-1">
                  {newOrdersCount > 0 && (
                    <span className="text-[10px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded-full animate-pulse">
                      +{newOrdersCount}
                    </span>
                  )}
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isOrdersActive ? "bg-red-200/60 text-red-800" : "bg-gray-100 text-gray-600"}`}>
                    {orders.length}
                  </span>
                </div>
              </Link>

              <Link
                to="/admin/banners"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isBannersActive ? "bg-red-50 text-red-700 font-bold" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span>⚡</span>
                  <span>{t.banners}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isBannersActive ? "bg-red-200/60 text-red-800" : "bg-gray-100 text-gray-600"}`}>
                  {slides.length}
                </span>
              </Link>

              <Link
                to="/admin/categories"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isCategoriesActive ? "bg-red-50 text-red-700 font-bold" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span>🗂️</span>
                  <span>{t.categories}</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isCategoriesActive ? "bg-red-200/60 text-red-800" : "bg-gray-100 text-gray-600"}`}>
                  {categories.length}
                </span>
              </Link>

              <Link
                to="/admin/help"
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                  isHelpActive ? "bg-red-50 text-red-700 font-bold" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span>ℹ️</span>
                  <span>{t.help}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isHelpActive ? "bg-red-200/60 text-red-800" : "bg-gray-100 text-gray-600"}`}>
                  {t.helpSectionsCount}
                </span>
              </Link>
            </nav>
          </div>

          {/* Currency Rate Widget — desktop only */}
          <div className="hidden md:block bg-white rounded-2xl border border-amber-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-base">💱</span>
                <span className="text-xs font-bold text-gray-700">
                  {lang === "uz" ? "Dollar kursi" : "Курс доллара"}
                </span>
              </div>
              {rateSaved && (
                <span className="text-[10px] text-emerald-600 font-bold animate-pulse">✓ {lang === "uz" ? "Saqlandi" : "Сохранено"}</span>
              )}
            </div>

            {/* Current rate display */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3">
              <div className="text-[10px] text-amber-700 font-medium mb-0.5">1 USD =</div>
              <div className="text-lg font-black text-amber-800">
                {usdRate.toLocaleString("ru")} <span className="text-xs font-bold">сум</span>
              </div>
            </div>

            {/* Rate input */}
            {rateEditing ? (
              <div className="space-y-2">
                <input
                  id="admin-usd-rate-input"
                  type="number"
                  min="1"
                  step="100"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleRateSave(); if (e.key === "Escape") { setRateEditing(false); setRateInput(String(usdRate)); } }}
                  className="w-full text-sm font-bold border border-amber-300 bg-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-400 text-gray-800"
                  placeholder={lang === "uz" ? "Kursni kiriting..." : "Введите курс..."}
                  autoFocus
                />
                <div className="flex gap-1.5">
                  <button
                    id="admin-usd-rate-save-btn"
                    type="button"
                    onClick={handleRateSave}
                    className="flex-1 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {lang === "uz" ? "Saqlash" : "Сохранить"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRateEditing(false); setRateInput(String(usdRate)); }}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    {lang === "uz" ? "Bekor" : "Отмена"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                id="admin-usd-rate-edit-btn"
                type="button"
                onClick={() => { setRateEditing(true); setRateInput(String(usdRate)); }}
                className="w-full text-xs font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>✏️</span>
                <span>{lang === "uz" ? "Kursni o'zgartirish" : "Изменить курс"}</span>
              </button>
            )}
          </div>

          {/* Quick System Info Box — desktop only */}
          <div className="hidden md:block bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-4 shadow-sm border border-gray-800 text-xs space-y-2.5">
            <div className="font-bold flex items-center gap-1.5 text-gray-200">
              <span>🚀</span>
              <span>{t.systemTitle}</span>
            </div>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              {t.systemDesc}
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-gray-400">
              <span>{t.statusLabel}</span>
              <span className="text-emerald-400 font-medium">{t.authorized}</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
