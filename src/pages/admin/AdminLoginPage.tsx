import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminAuth, DEFAULT_SUPERADMIN } from "@/context/AdminAuthContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();

  useDocumentMeta({
    title: "Вход в панель управления | Minimall Admin",
    description: "Авторизация администратора маркетплейса mini-mall.uz",
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
      setError("Пожалуйста, введите логин");
      return;
    }

    if (!password) {
      setError("Пожалуйста, введите пароль");
      return;
    }

    setIsLoading(true);

    const res = await login(username, password);
    setIsLoading(false);

    if (!res.success) {
      setError(res.error || "Неверный логин или пароль");
    }
  };

  const handleFillSuperAdmin = () => {
    setUsername(DEFAULT_SUPERADMIN.username);
    setPassword(DEFAULT_SUPERADMIN.password);
    setError(null);
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
              src="/logo.jpg"
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
                Панель управления
              </div>
            </div>
          </Link>
          <p className="text-xs text-gray-400">
            Безопасный доступ к управлению маркетплейсом и каталогом
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          {/* Superadmin Credentials Helper Card */}
          <div className="bg-gradient-to-r from-red-950/50 to-gray-800/50 border border-red-500/20 rounded-2xl p-3.5 text-xs text-gray-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-red-400 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                <span>👑</span> Главный Администратор
              </span>
              <button
                type="button"
                onClick={handleFillSuperAdmin}
                className="text-[11px] font-semibold text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                Вставить в 1 клик
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] bg-black/40 rounded-xl p-2 border border-white/5 font-mono">
              <div>
                <span className="text-gray-500">Логин: </span>
                <span className="text-white font-bold">{DEFAULT_SUPERADMIN.username}</span>
              </div>
              <div>
                <span className="text-gray-500">Пароль: </span>
                <span className="text-white font-bold">{DEFAULT_SUPERADMIN.password}</span>
              </div>
            </div>
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
                Логин администратора
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
                Пароль
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
                  {showPassword ? "Скрыть" : "Показать"}
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
                  <span>Вход...</span>
                </>
              ) : (
                <>
                  <span>Войти в панель</span>
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
            <span>Вернуться на главную витрину маркетплейса</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
