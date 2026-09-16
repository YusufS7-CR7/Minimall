import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useApp } from "@/context/AppContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { ADMIN_TRANSLATIONS } from "@/data/adminTranslations";
import { LOGO_DATA_URI } from "@/assets/logoDataUri";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const { lang, setLang } = useApp();
  const t = ADMIN_TRANSLATIONS[lang].login;

  useDocumentMeta({
    title: lang === "uz" ? "Boshqaruv paneliga kirish | Minimall Admin" : "Вход в панель управления | Minimall Admin",
    description: lang === "uz" ? "mini-mall.uz marketpleysi administratorini avtorizatsiya qilish" : "Авторизация администратора маркетплейса mini-mall.uz",
    noIndex: true,
  });

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim()) {
      setError(t.errUsername);
      return;
    }

    if (!password) {
      setError(t.errPassword);
      return;
    }

    setIsLoading(true);

    const res = await login(username, password);
    setIsLoading(false);

    if (!res.success) {
      if (res.error === "err_admin_inactive") {
        setError(
          lang === "uz"
            ? "Administrator hisobi faolsizlantirilgan"
            : "Учетная запись администратора деактивирована"
        );
      } else {
        setError(t.errAuth);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans selection:bg-red-500 selection:text-white">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-72 h-72 bg-red-800/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group transition-transform hover:scale-105"
          >
            <img
              src={LOGO_DATA_URI}
              alt="Minimall"
              className="w-12 h-12 rounded-2xl object-contain bg-white p-1 shadow-lg shadow-red-600/20"
            />
            <div className="text-left">
              <div
                className="text-3xl font-black tracking-wider text-white"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                minimall<span className="text-red-500">.admin</span>
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-red-400">
                {t.tagline}
              </div>
            </div>
          </Link>
          <p className="text-xs text-gray-400">
            {t.subtitle}
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Header row with Language Switcher */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-800">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {lang === "uz" ? "Tilni tanlash" : "Выбор языка"}
            </span>
            <div className="flex items-center gap-1 bg-gray-950/80 border border-gray-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setLang("uz")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === "uz"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-gray-400 hover:text-white"
                }`}
                title="O'zbek tiliga o'tkazish"
              >
                <span>🇺🇿</span>
                <span>UZ</span>
              </button>
              <button
                type="button"
                onClick={() => setLang("ru")}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  lang === "ru"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-gray-400 hover:text-white"
                }`}
                title="Переключить на русский язык"
              >
                <span>🇷🇺</span>
                <span>RU</span>
              </button>
            </div>
          </div>

          {/* Secure Access Notice */}
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-2xl p-3 text-xs text-gray-400 flex items-center gap-2.5">
            <span className="text-base">🔒</span>
            <span>{t.notice}</span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2 animate-shake">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                {t.username}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-500 text-sm">👤</span>
                <input
                  type="text"
                  autoFocus
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-gray-950/60 border border-gray-700 focus:border-red-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-300">
                {t.password}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 text-gray-500 text-sm">🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-950/60 border border-gray-700 focus:border-red-500 rounded-xl pl-10 pr-11 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-200 text-xs cursor-pointer"
                >
                  {showPassword ? (lang === "uz" ? "Yashirish" : "Скрыть") : (lang === "uz" ? "Ko'rsatish" : "Показать")}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{lang === "uz" ? "Kirilmoqda..." : "Вход..."}</span>
                </>
              ) : (
                <>
                  <span>{t.submit}</span>
                  <span>→</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to storefront link */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1.5"
          >
            <span>←</span>
            <span>{t.toStore}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
