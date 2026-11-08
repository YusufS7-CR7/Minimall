import { useState, useRef, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductsContext";
import { searchProducts } from "@/utils/smartSearch";
import { T } from "@/data/translations";
import type { Lang } from "@/data/types";
import CatalogModal from "@/components/ui/CatalogModal";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { LOGO_DATA_URI } from "@/assets/logoDataUri";

interface HeaderProps {
  lang: Lang;
}

export default function Header({ lang }: HeaderProps) {
  const t = T[lang];
  const {
    totalCartCount,
    favorites,
    showToast,
    setLang,
    catalogOpen,
    setCatalogOpen,
    openCart,
    openFavorites,
    openOrders,
  } = useApp();
  const { user, openAuthModal, logout } = useAuth();
  const { products } = useProducts();
  const [search, setSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Live search suggestions
  const liveResultsAll = useMemo(() => {
    if (!search.trim() || search.trim().length < 2) return [];
    return searchProducts(products, search, lang);
  }, [search, products, lang]);

  const liveResults = useMemo(() => {
    return liveResultsAll.slice(0, 5);
  }, [liveResultsAll]);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      setIsSearchFocused(false);
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <>
      <header className="bg-white sticky top-0 z-40 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-4">
          <div className="flex items-center gap-1.5 sm:gap-5 h-[52px] sm:h-[68px]">

            {/* Mobile Catalog button */}
            <button
              id="mobile-catalog-btn"
              type="button"
              onClick={() => setCatalogOpen((o) => !o)}
              aria-expanded={catalogOpen}
              aria-label={t.catalog}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-700 hover:text-red-600 hover:bg-gray-100 transition-colors active:scale-95 shrink-0"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group" aria-label="Minimall — на главную">
              <div className="relative p-0.5 sm:p-1 bg-white rounded-xl shadow-xs border border-gray-100 group-hover:border-red-200 transition-all">
                <img
                  src={LOGO_DATA_URI}
                  alt="Minimall"
                  className="h-8 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  width={44}
                  height={44}
                />
              </div>
              <div className="hidden sm:block">
                <div
                  className="text-[22px] font-extrabold text-gray-900 leading-none"
                  style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.01em" }}
                >
                  mini-mall<span className="text-red-600">.uz</span>
                </div>
                <div className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.25em] leading-none mt-1">
                  {t.tagline}
                </div>
              </div>
            </Link>

            {/* Catalog Button — desktop only */}
            <button
              id="catalog-toggle"
              type="button"
              onClick={() => setCatalogOpen((o) => !o)}
              aria-expanded={catalogOpen}
              aria-haspopup="dialog"
              aria-label={t.catalog}
              className={`hidden md:flex items-center gap-2.5 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shrink-0 shadow-md active:scale-[0.97] ${
                catalogOpen
                  ? "bg-gradient-to-r from-red-700 to-red-600 text-white shadow-red-300 scale-[0.97]"
                  : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-red-200 hover:shadow-red-300"
              }`}
            >
              {catalogOpen ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
              {t.catalog}
            </button>

            {/* Search — takes all remaining space, smaller on mobile */}
            <div ref={searchContainerRef} className="flex-1 relative min-w-0">
              <form
                role="search"
                onSubmit={handleSearch}
                className="flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 focus-within:bg-white transition-all"
              >
                <input
                  id="site-search"
                  type="search"
                  value={search}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsSearchFocused(false);
                    }
                  }}
                  placeholder={t.searchPlaceholder}
                  aria-label={t.searchPlaceholder}
                  autoComplete="off"
                  className="flex-1 py-1.5 sm:py-2.5 px-2.5 sm:px-4 bg-transparent text-xs sm:text-sm outline-none text-gray-800 placeholder-gray-400 min-w-0"
                />

                {/* Clear search query button */}
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setIsSearchFocused(false);
                    }}
                    aria-label="Очистить"
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors mr-0.5"
                  >
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                <button
                  type="submit"
                  aria-label="Найти"
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2.5 sm:px-4 py-1.5 sm:py-2.5 transition-all shrink-0 cursor-pointer"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                </button>
              </form>

              {/* Instant Search Suggestions Dropdown */}
              {isSearchFocused && search.trim().length >= 2 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden divide-y divide-gray-100">
                  {liveResults.length > 0 ? (
                    <div>
                      <div className="px-3.5 py-2 bg-gray-50/70 text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                        <span>{lang === "ru" ? "Быстрый поиск" : "Tezkor qidiruv"}</span>
                        <span>{liveResultsAll.length} {lang === "ru" ? "найдено" : "topildi"}</span>
                      </div>
                      <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
                        {liveResults.map((product) => {
                          const productName = lang === "uz" ? (product.nameUz || product.name) : product.name;
                          return (
                            <Link
                              key={product.id}
                              to={`/product/${product.slug}`}
                              onClick={() => {
                                setIsSearchFocused(false);
                              }}
                              className="flex items-center gap-3 p-2.5 sm:p-3 hover:bg-red-50/50 transition-colors group"
                            >
                              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={productName}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <span className="text-gray-300 text-xs">📦</span>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs sm:text-sm font-semibold text-gray-800 truncate group-hover:text-red-600 transition-colors">
                                  {productName}
                                </div>
                                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                                  {product.brand && (
                                    <span className="px-1.5 py-0.2 rounded bg-gray-100 text-gray-600 font-medium text-[10px]">
                                      {product.brand}
                                    </span>
                                  )}
                                  <span className="font-bold text-red-600 text-xs sm:text-sm">
                                    {product.price.toLocaleString("ru-RU")} {lang === "ru" ? "сум" : "so'm"}
                                  </span>
                                </div>
                              </div>
                              <svg className="w-4 h-4 text-gray-300 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          );
                        })}
                      </div>
                      <div className="p-2 bg-gray-50/80 text-center">
                        <button
                          type="button"
                          onClick={handleSearch}
                          className="w-full py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        >
                          {lang === "ru"
                            ? `Показать все результаты (${liveResultsAll.length}) →`
                            : `Barcha natijalarni ko'rish (${liveResultsAll.length}) →`}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 text-center text-gray-400">
                      <div className="text-2xl mb-1">🔍</div>
                      <div className="text-xs sm:text-sm font-medium text-gray-600">
                        {lang === "ru" ? "Ничего не найдено" : "Hech narsa topilmadi"}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {lang === "ru"
                          ? `По запросу «${search}» товаров не найдено`
                          : `"${search}" so'rovi bo'yicha tovarlar topilmadi`}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Language Switcher */}
            <button
              id="mobile-lang-btn"
              type="button"
              onClick={() => setLang(lang === "ru" ? "uz" : "ru")}
              aria-label="Сменить язык"
              title={lang === "ru" ? "O'zbek tiliga o'tish" : "Переключить на русский"}
              className="md:hidden shrink-0 flex items-center gap-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-xl text-xs font-bold text-gray-700 transition-all cursor-pointer"
            >
              <span className="text-sm leading-none">{lang === "ru" ? "🇷🇺" : "🇺🇿"}</span>
              <span className="text-[10px] font-extrabold uppercase leading-none">{lang}</span>
            </button>

            {/* ── Desktop-only actions ── */}
            <div className="hidden sm:flex items-center px-1">
              <ThemeToggle showIcon={true} />
            </div>

            <button
              id="favorites-btn"
              onClick={openFavorites}
              aria-label={t.favorites}
              className="hidden md:flex flex-col items-center gap-0.5 relative text-gray-500 hover:text-red-500 transition-colors px-2 group cursor-pointer"
            >
              <div className="relative">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {favorites.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                    {favorites.length}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{t.favorites}</span>
            </button>

            <button
              id="cart-btn"
              onClick={openCart}
              aria-label={t.cart}
              className="hidden md:flex flex-col items-center gap-0.5 relative text-gray-500 hover:text-red-500 transition-colors px-2 group cursor-pointer"
            >
              <div className="relative">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 9M17 13l2.3 9M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                </svg>
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-md">
                    {totalCartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{t.cart}</span>
            </button>

            {user ? (
              <div ref={userMenuRef} className="hidden md:block relative">
                <button
                  id="user-menu-btn"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-label="Меню пользователя"
                  aria-expanded={userMenuOpen}
                  className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-red-500 transition-colors px-2 group"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover ring-2 ring-red-100 group-hover:ring-red-300 transition" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-red-100 group-hover:ring-red-300 transition">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-[10px] font-medium max-w-[56px] truncate">{user.name.split(" ")[0]}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden z-50" style={{ animation: "authSlideIn 0.18s cubic-bezier(.22,1,.36,1)" }}>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button id="my-orders-btn" onClick={() => { openOrders(); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-medium border-b border-gray-100 cursor-pointer">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                      {lang === "ru" ? "Мои заказы" : "Mening buyurtmalarim"}
                    </button>
                    <button id="logout-btn" onClick={() => { logout(); setUserMenuOpen(false); showToast(lang === "ru" ? "Вы вышли из аккаунта" : "Akkauntdan chiqdingiz"); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium cursor-pointer">
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      {lang === "ru" ? "Выйти из аккаунта" : "Akkauntdan chiqish"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button id="login-btn" onClick={() => openAuthModal("login")} aria-label={T[lang].login} className="hidden md:flex flex-col items-center gap-0.5 text-gray-500 hover:text-red-500 transition-colors px-2 group cursor-pointer">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[10px] font-medium">{T[lang].login}</span>
              </button>
            )}

            <Link to="/admin" aria-label="Админ-панель" title="Перейти в панель управления товарами" className="hidden md:flex flex-col items-center gap-0.5 text-gray-500 hover:text-red-500 transition-colors px-2 group">
              <div className="relative">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-medium">{lang === "ru" ? "Админка" : "Admin"}</span>
            </Link>

          </div>
        </div>
        {/* Accent bar */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />
      </header>

      {/* Catalog mega-menu */}
      <CatalogModal id="catalog-modal" lang={lang} open={catalogOpen} onClose={() => setCatalogOpen(false)} />
    </>
  );
}
