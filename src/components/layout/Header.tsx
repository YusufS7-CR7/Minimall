import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { T } from "@/data/translations";
import type { Lang } from "@/data/types";
import CartDrawer from "@/components/ui/CartDrawer";
import CatalogModal from "@/components/ui/CatalogModal";
import FavoritesModal from "@/components/ui/FavoritesModal";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface HeaderProps {
  lang: Lang;
}

export default function Header({ lang }: HeaderProps) {
  const t = T[lang];
  const { totalCartCount, favorites, showToast } = useApp();
  const { user, openAuthModal, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <>
      <header className="bg-white sticky top-0 z-40 shadow-[0_2px_16px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-5 h-[68px]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group" aria-label="Minimall — на главную">
              <div className="relative p-1 bg-white rounded-xl shadow-xs border border-gray-100 group-hover:border-red-200 transition-all">
                <img
                  src="/logo.jpg"
                  alt="Minimall"
                  className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  width={44}
                  height={44}
                />
              </div>
              <div className="hidden sm:block">
                <div
                  className="text-[22px] font-extrabold text-gray-900 leading-none"
                  style={{ fontFamily: "Barlow Condensed, sans-serif", letterSpacing: "0.01em" }}
                >
                  minimall<span className="text-red-600">.uz</span>
                </div>
                <div className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.25em] leading-none mt-1">
                  {t.tagline}
                </div>
              </div>
            </Link>

            {/* Catalog Button */}
            <button
              id="catalog-toggle"
              onClick={() => setCatalogOpen(!catalogOpen)}
              aria-expanded={catalogOpen}
              aria-controls="catalog-modal"
              className={`hidden md:flex items-center gap-2.5 font-bold text-sm px-5 py-2.5 rounded-xl transition-all shrink-0 shadow-md active:scale-[0.97] ${
                catalogOpen
                  ? "bg-gray-900 text-white shadow-gray-400"
                  : "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white shadow-red-200 hover:shadow-red-300"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                {catalogOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              {t.catalog}
            </button>

            {/* Search */}
            <form
              role="search"
              onSubmit={handleSearch}
              className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 focus-within:bg-white transition-all"
            >
              <input
                id="site-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                aria-label={t.searchPlaceholder}
                className="flex-1 py-2.5 px-4 bg-transparent text-sm outline-none text-gray-800 placeholder-gray-400"
              />
              <button
                type="submit"
                aria-label="Найти"
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </button>
            </form>

            {/* Theme Toggle (Desktop & Tablet) */}
            <div className="hidden sm:flex items-center px-1">
              <ThemeToggle showIcon={true} />
            </div>

            {/* Favorites */}
            <button
              id="favorites-btn"
              onClick={() => setFavoritesOpen(true)}
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

            {/* Cart */}
            <button
              id="cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label={t.cart}
              className="hidden md:flex flex-col items-center gap-0.5 relative text-gray-500 hover:text-red-500 transition-colors px-2 group"
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

            {/* Auth button — Login or User menu */}
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
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover ring-2 ring-red-100 group-hover:ring-red-300 transition"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-red-100 group-hover:ring-red-300 transition">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-[10px] font-medium max-w-[56px] truncate">{user.name.split(" ")[0]}</span>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-white shadow-xl border border-gray-100 overflow-hidden z-50"
                    style={{ animation: "authSlideIn 0.18s cubic-bezier(.22,1,.36,1)" }}
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                    <button
                      id="logout-btn"
                      onClick={() => { logout(); setUserMenuOpen(false); showToast("Вы вышли из аккаунта"); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Выйти из аккаунта
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="login-btn"
                onClick={() => openAuthModal("login")}
                aria-label={T[lang].login}
                className="hidden md:flex flex-col items-center gap-0.5 text-gray-500 hover:text-red-500 transition-colors px-2 group"
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-[10px] font-medium">{T[lang].login}</span>
              </button>
            )}

            {/* Admin Panel */}
            <Link
              to="/admin"
              aria-label="Админ-панель"
              title="Перейти в панель управления товарами"
              className="hidden md:flex flex-col items-center gap-0.5 text-gray-500 hover:text-red-500 transition-colors px-2 group"
            >
              <div className="relative">
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-[10px] font-medium">{lang === "ru" ? "Админка" : "Admin"}</span>
            </Link>

            {/* Theme Toggle (Mobile) */}
            <div className="flex sm:hidden items-center">
              <ThemeToggle showIcon={false} />
            </div>

            {/* Mobile Admin Link */}
            <Link
              to="/admin"
              aria-label="Админ-панель"
              title="Админка"
              className="md:hidden text-gray-600 hover:text-red-500 p-1"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>

            {/* Mobile cart */}
            <button
              onClick={() => setCartOpen(true)}
              aria-label={t.cart}
              className="md:hidden relative text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 9M17 13l2.3 9M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
              </svg>
              {totalCartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
        {/* Accent bar */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60" />
      </header>

      {/* Catalog mega-menu */}
      <CatalogModal
        id="catalog-modal"
        lang={lang}
        open={catalogOpen}
        onClose={() => setCatalogOpen(false)}
      />

      {/* Cart drawer */}
      <CartDrawer lang={lang} open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Favorites modal */}
      <FavoritesModal isOpen={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </>
  );
}
