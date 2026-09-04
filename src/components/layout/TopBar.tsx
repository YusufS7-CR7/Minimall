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
          {/* Language switcher */}
          <div className="flex items-center gap-1.5 border-r border-white/10 pr-3">
            <button
              onClick={() => setLang("ru")}
              className={`transition-colors ${lang === "ru" ? "text-white font-semibold" : "text-gray-400 hover:text-white"}`}
            >
              🇷🇺 Русский
            </button>
            <span className="text-white/20 mx-1">|</span>
            <button
              onClick={() => setLang("uz")}
              className={`transition-colors ${lang === "uz" ? "text-white font-semibold" : "text-gray-400 hover:text-white"}`}
            >
              O&apos;zbek
            </button>
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
