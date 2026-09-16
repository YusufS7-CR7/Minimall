import { Link } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import type { Lang } from "@/data/types";
import type { InfoModalSection } from "@/components/ui/InfoModal";

interface TopBarProps {
  lang: Lang;
  onOpenInfo: (section: InfoModalSection) => void;
}

export default function TopBar({ lang, onOpenInfo }: TopBarProps) {
  const { setLang } = useApp();

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-red-950 text-white text-xs">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-9">
        <div className="flex items-center gap-4">
          {/* Language switcher */}
          <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
            <button
              id="lang-uz-btn"
              onClick={() => setLang("uz")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer ${
                lang === "uz"
                  ? "bg-red-600 text-white font-bold shadow-xs"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title="O'zbek tili"
            >
              <span>🇺🇿</span>
              <span>O&apos;zbek</span>
            </button>
            <button
              id="lang-ru-btn"
              onClick={() => setLang("ru")}
              className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all cursor-pointer ${
                lang === "ru"
                  ? "bg-red-600 text-white font-bold shadow-xs"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              title="Русский язык"
            >
              <span>🇷🇺</span>
              <span>Русский</span>
            </button>
          </div>

          {/* Quick nav - no more dead '#' links! */}
          <nav aria-label="Top navigation" className="hidden lg:flex items-center gap-3 text-gray-400">
            <Link
              to="/catalog"
              className="hover:text-red-400 transition-colors whitespace-nowrap text-red-400 font-semibold"
            >
              {lang === "ru" ? "🔥 Скидки" : "🔥 Chegirmalar"}
            </Link>

            <Link
              to="/catalog"
              className="hover:text-white transition-colors whitespace-nowrap"
            >
              {lang === "ru" ? "Бренды" : "Brendlar"}
            </Link>

            <button
              onClick={() => onOpenInfo("about")}
              className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              {lang === "ru" ? "О нас" : "Biz haqimizda"}
            </button>

            <button
              onClick={() => onOpenInfo("delivery")}
              className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              {lang === "ru" ? "Доставка" : "Yetkazish"}
            </button>

            <button
              onClick={() => onOpenInfo("payment")}
              className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              {lang === "ru" ? "Оплата" : "To'lov"}
            </button>

            <button
              onClick={() => onOpenInfo("returns")}
              className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              {lang === "ru" ? "Возврат" : "Qaytarish"}
            </button>

            <button
              onClick={() => onOpenInfo("service")}
              className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              {lang === "ru" ? "Сервисные центры" : "Servis markazlari"}
            </button>

            <button
              onClick={() => onOpenInfo("contacts")}
              className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              {lang === "ru" ? "Контакты" : "Aloqa"}
            </button>

            <button
              onClick={() => onOpenInfo("b2b")}
              className="hover:text-white transition-colors whitespace-nowrap cursor-pointer text-amber-300 font-medium"
            >
              {lang === "ru" ? "Для юр. лиц" : "Yuridik shaxslarga"}
            </button>
          </nav>
        </div>

        {/* Contacts info */}
        <div className="hidden sm:flex items-center gap-3 text-gray-400">
          <a
            href="https://t.me/minimall_uzb"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-400 transition-colors flex items-center gap-1 text-sky-300 font-medium"
            title="Написать нам в Telegram"
          >
            <span>✈️</span>
            <span>@minimall_uzb</span>
          </a>
          <span className="text-white/10">|</span>
          <a href="mailto:info@mini-mall.uz" className="hover:text-white transition-colors">
            info@mini-mall.uz
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
