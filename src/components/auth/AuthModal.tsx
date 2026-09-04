import { useState, useEffect, useRef, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";

// ─── Google Icon SVG ──────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

// ─── Eye / EyeOff icons ───────────────────────────────────────────────────────
function EyeIcon({ off }: { off?: boolean }) {
  return off ? (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
interface InputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  isPassword?: boolean;
}
function Field({ id, label, type = "text", value, onChange, placeholder, required, autoComplete, isPassword }: InputProps) {
  const [show, setShow] = useState(false);
  const inputType = isPassword ? (show ? "text" : "password") : type;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-100 placeholder:text-gray-400"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            tabIndex={-1}
            aria-label={show ? "Скрыть пароль" : "Показать пароль"}
          >
            <EyeIcon off={show} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
export default function AuthModal() {
  const { isAuthModalOpen, authTab, setAuthTab, closeAuthModal, login, register, loginWithGoogle } = useAuth();

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);

  // Reset form on tab switch
  useEffect(() => {
    setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
    setError(null); setLoading(false); setSuccess(false);
  }, [authTab]);

  // Reset form when modal opens
  useEffect(() => {
    if (!isAuthModalOpen) return;
    setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
    setError(null); setLoading(false); setSuccess(false);
  }, [isAuthModalOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeAuthModal(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [closeAuthModal]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isAuthModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (authTab === "register" && password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    if (password.length < 6) {
      setError("Пароль должен содержать не менее 6 символов");
      return;
    }
    setLoading(true);
    const result = authTab === "login"
      ? await login(email, password)
      : await register(name, email, password);
    setLoading(false);
    if (result.error) { setError(result.error); return; }
    setSuccess(true);
    setTimeout(() => { closeAuthModal(); }, 800);
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    setError(null);
    await loginWithGoogle();
    setGoogleLoading(false);
    setSuccess(true);
    setTimeout(() => { closeAuthModal(); }, 800);
  }

  const isLogin = authTab === "login";

  return (
    /* Backdrop */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) closeAuthModal(); }}
      role="dialog"
      aria-modal="true"
      aria-label={isLogin ? "Вход в аккаунт" : "Регистрация"}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        style={{ animation: "authSlideIn 0.28s cubic-bezier(.22,1,.36,1)" }}
      >
        {/* Decorative top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-red-500 via-rose-400 to-red-600" />

        <div className="px-8 pt-8 pb-10">
          {/* Close button */}
          <button
            onClick={closeAuthModal}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 transition rounded-full p-1 hover:bg-gray-100"
            aria-label="Закрыть"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* Logo / Brand */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl font-extrabold tracking-tight text-red-600" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>
              MINIMALL
            </span>
            <span className="text-xs font-semibold text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">
              {isLogin ? "Вход" : "Регистрация"}
            </span>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6 gap-1">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setAuthTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  authTab === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                id={`auth-tab-${t}`}
              >
                {t === "login" ? "Войти" : "Регистрация"}
              </button>
            ))}
          </div>

          {/* Success state */}
          {success && (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                <svg width="32" height="32" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <p className="text-base font-semibold text-gray-800">
                {isLogin ? "Добро пожаловать!" : "Аккаунт создан!"}
              </p>
            </div>
          )}

          {/* Form */}
          {!success && (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {!isLogin && (
                <Field
                  id="auth-name"
                  label="Имя"
                  value={name}
                  onChange={setName}
                  placeholder="Ваше имя"
                  required
                  autoComplete="name"
                />
              )}
              <Field
                id="auth-email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="example@mail.com"
                required
                autoComplete={isLogin ? "email" : "email"}
              />
              <Field
                id="auth-password"
                label="Пароль"
                value={password}
                onChange={setPassword}
                placeholder="Минимум 6 символов"
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                isPassword
              />
              {!isLogin && (
                <Field
                  id="auth-confirm"
                  label="Подтверждение пароля"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Повторите пароль"
                  required
                  autoComplete="new-password"
                  isPassword
                />
              )}

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="shrink-0">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Forgot password (login only) */}
              {isLogin && (
                <div className="text-right">
                  <button type="button" className="text-xs text-red-500 hover:text-red-700 transition font-medium">
                    Забыли пароль?
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                id="auth-submit-btn"
                className="w-full py-3 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-red-100"
              >
                {loading ? <Spinner /> : null}
                {loading
                  ? "Загрузка..."
                  : isLogin
                  ? "Войти в аккаунт"
                  : "Создать аккаунт"}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 font-medium">или</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={googleLoading}
                id="auth-google-btn"
                className="w-full py-3 rounded-xl border border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-sm"
              >
                {googleLoading ? <Spinner /> : <GoogleIcon />}
                {googleLoading ? "Авторизация..." : "Продолжить через Google"}
              </button>
            </form>
          )}

          {/* Switch tab hint */}
          {!success && (
            <p className="mt-6 text-center text-xs text-gray-500">
              {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
              <button
                type="button"
                onClick={() => setAuthTab(isLogin ? "register" : "login")}
                className="text-red-600 font-semibold hover:text-red-700 transition"
              >
                {isLogin ? "Зарегистрироваться" : "Войти"}
              </button>
            </p>
          )}
        </div>
      </div>

      {/* keyframe animation */}
      <style>{`
        @keyframes authSlideIn {
          from { opacity: 0; transform: scale(0.94) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
