import { useApp } from "@/context/AppContext";
import type { Lang } from "@/data/types";

interface TopBarProps {
  lang: Lang;
}

export default function TopBar({ lang }: TopBarProps) {
  const { setLang } = useApp();

  const links =
    lang === "ru"
      ? ["Скидки", "Бренды", "О нас", "Доставка", "Оплата", "Возврат", "Сервисные центры", "Контакты", "Для юридических лиц"]
      : ["Chegirmalar", "Brendlar", "Biz haqimizda", "Yetkazish", "To'lov", "Qaytarish", "Servis markazlari", "Aloqa", "Yuridik shaxslar"];

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-red-950 text-white text-xs">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9">
        <div className="flex items-center gap-4">
          {/* Language switcher with Google Translate */}
          <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
            <button
              id="lang-uz-btn"
              onClick={() => setLang("uz")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                lang === "uz"
                  ? "bg-red-600 text-white font-bold shadow-xs"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title="O'zbek tiliga o'tkazish (Google Tarjima)"
            >
              <span>🇺🇿</span>
              <span>O&apos;zbek</span>
            </button>
            <button
              id="lang-ru-btn"
              onClick={() => setLang("ru")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                lang === "ru"
                  ? "bg-red-600 text-white font-bold shadow-xs"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title="Переключить на русский язык (Google Перевод)"
            >
              <span>🇷🇺</span>
              <span>Русский</span>
            </button>
            <span
              className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40 ml-1"
              title="Сайт переводится автоматически через Google Translate"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
              </svg>
              <span>Google</span>
            </span>
          </div>
          {/* Quick nav */}
          <nav aria-label="Top navigation" className="hidden lg:flex items-center gap-3 text-gray-400">
            {links.map((item) => (
              <a key={item} href="#" className="hover:text-white transition-colors whitespace-nowrap">
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-gray-400">
          <a href="mailto:info@minimall.uz" className="hover:text-white transition-colors">
            info@minimall.uz
          </a>
          <span className="text-white/10">|</span>
          <a href="tel:+998970363636" className="hover:text-white transition-colors font-semibold text-white">
            +998 (97) 036 36 36
          </a>
        </div>
      </div>
    </div>
  );
}
