import { useState } from "react";
import { Link } from "react-router-dom";
import { T } from "@/data/translations";
import { CATEGORIES } from "@/data/categories";
import { BRANDS } from "@/data/products";
import type { Lang } from "@/data/types";
import type { InfoModalSection } from "@/components/ui/InfoModal";

interface FooterProps {
  lang: Lang;
  onOpenInfo: (section: InfoModalSection) => void;
}

const SOCIAL = [
  {
    label: "Telegram",
    href: "https://t.me/minimall_uz",
    path: "M9.04 17.68l-.37 5.23 2.52-2.44 2.95 2.17c.33.24.79.1.95-.28l5.46-13.06c.2-.48-.28-.96-.77-.77L2.23 14.36c-.52.2-.51.93.01 1.12l3.97 1.37 9.29-5.85c.21-.13.45.15.27.32z",
  },
];

export default function Footer({ lang, onOpenInfo }: FooterProps) {
  const t = T[lang];
  const [copied, setCopied] = useState(false);

  const copyCoordinates = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText("41°21'21.1\"N 69°14'41.8\"E");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <footer className="bg-gray-950 text-white">
      {/* Store Location Map Section in Footer */}
      <div className="border-t border-white/5 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid lg:grid-cols-12 gap-8 items-center bg-gray-900/70 rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-red-500/10 to-transparent pointer-events-none" />

            {/* Left info column (5 cols) */}
            <div className="lg:col-span-5 space-y-5 z-10">
              <div>
                <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3 border border-red-500/30">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>{lang === "ru" ? "Наш магазин на карте" : "Do'konimiz xaritada"}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  {t.ourLocation}
                </h3>
                <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">
                  {t.locationDesc}
                </p>
              </div>

              {/* Coordinates Badge */}
              <div className="bg-white/5 hover:bg-white/10 transition-colors p-3.5 rounded-2xl border border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center shrink-0 text-red-400 text-base font-bold">
                    📍
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      {lang === "ru" ? "Координаты на карте" : "Xaritadagi koordinatalar"}
                    </div>
                    <div className="text-white font-mono font-bold text-sm sm:text-base tracking-tight truncate">
                      41°21'21.1"N 69°14'41.8"E
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyCoordinates}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 active:scale-95"
                  title={lang === "ru" ? "Скопировать координаты" : "Koordinatalarni nusxalash"}
                >
                  {copied
                    ? (lang === "ru" ? "Скопировано!" : "Nusxalandi!")
                    : (lang === "ru" ? "Скопировать" : "Nusxalash")}
                </button>
              </div>

              {/* Address, Phone, Hours */}
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2.5 text-gray-300">
                  <span className="text-gray-400">🏢</span>
                  <span className="font-medium text-gray-200">{t.address}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-gray-400">📞</span>
                  <a href="tel:+998970363636" className="text-white font-semibold hover:text-red-400 transition-colors">
                    +998 (97) 036 36 36
                  </a>
                </div>
                <div className="flex items-center gap-2.5 text-gray-300 font-medium">
                  <span className="text-gray-400">⏱</span>
                  <span>{lang === "ru" ? "Часы работы: с 9:00 до 19:00 каждый день" : "Ish vaqti: har kuni 9:00 dan 19:00 gacha"}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <a
                  href="https://yandex.uz/maps/?text=41.355861,69.244944"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition-all cursor-pointer text-center"
                >
                  <span>Яндекс Карты</span>
                  <span>↗</span>
                </a>
                <a
                  href="https://maps.google.com/?q=41%C2%B021'21.1%22N+69%C2%B014'41.8%22E"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer text-center"
                >
                  <span>Google Maps</span>
                  <span>↗</span>
                </a>
              </div>
            </div>

            {/* Right Map Column */}
            <div className="lg:col-span-7 h-[300px] sm:h-[380px] rounded-2xl overflow-hidden border border-white/15 relative shadow-inner group">
              <iframe
                title="Карта магазина Minimall: 41°21'21.1&quot;N 69°14'41.8&quot;E"
                src="https://www.openstreetmap.org/export/embed.html?bbox=69.2379%2C41.3518%2C69.2519%2C41.3598&layer=mapnik&marker=41.355861%2C69.244944"
                className="w-full h-full"
                style={{
                  border: 0,
                  filter: "invert(90%) hue-rotate(180deg) contrast(0.9) brightness(0.9)",
                }}
                loading="lazy"
              />

              {/* Coordinates Badge on top of Map */}
              <div className="absolute top-3 left-3 bg-gray-900/90 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl border border-white/20 shadow-lg flex items-center gap-2 pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-mono font-bold text-xs">41°21'21.1"N 69°14'41.8"E</span>
              </div>

              {/* Open in full screen button overlay */}
              <a
                href="https://maps.google.com/?q=41%C2%B021'21.1%22N+69%C2%B014'41.8%22E"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 bg-gray-900/90 hover:bg-red-600 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl border border-white/20 shadow-lg transition-colors flex items-center gap-1.5"
              >
                <span>{lang === "ru" ? "Открыть на весь экран" : "Kengaytirish"}</span>
                <span>↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <div className="bg-white p-1 rounded-xl shadow-xs inline-flex shrink-0">
                  <img src="/logo.jpg" alt="Minimall" className="h-10 w-auto object-contain rounded-lg" width={40} height={40} />
                </div>
                <div>
                  <div className="text-xl font-extrabold text-white leading-none" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                    minimall<span className="text-red-500">.uz</span>
                  </div>
                  <div className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">{t.tagline}</div>
                </div>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                {lang === "ru"
                  ? "Профессиональный строительный инструмент в Узбекистане. Оригинальные бренды, гарантия, доставка."
                  : "O'zbekistonda professional qurilish asboblari. Original brendlar, kafolat, yetkazib berish."}
              </p>
              {/* Only Telegram now */}
              <div className="flex gap-2">
                {SOCIAL.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="h-10 px-3.5 bg-sky-500/20 hover:bg-sky-600 rounded-xl flex items-center gap-2 transition-all group border border-sky-500/30 hover:border-sky-600 text-xs font-semibold text-sky-300 hover:text-white"
                  >
                    <svg className="w-4 h-4 text-sky-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                      <path d={s.path} />
                    </svg>
                    <span>Telegram</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Catalog */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{t.catalog}</h3>
              <ul className="space-y-2.5">
                {CATEGORIES.map((c) => (
                  <li key={c.key}>
                    <Link
                      to={`/catalog/${c.slug}`}
                      className="text-gray-400 hover:text-red-400 text-sm transition-colors"
                    >
                      {lang === "ru" ? c.labelRu : c.labelUz}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                {lang === "ru" ? "Компания" : "Kompaniya"}
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => onOpenInfo("about")} className="text-gray-400 hover:text-red-400 transition-colors text-left cursor-pointer">
                    {t.aboutUs}
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenInfo("contacts")} className="text-gray-400 hover:text-red-400 transition-colors text-left cursor-pointer">
                    {t.contacts}
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenInfo("careers")} className="text-gray-400 hover:text-red-400 transition-colors text-left cursor-pointer">
                    {lang === "ru" ? "Вакансии" : "Ish o'rinlari"}
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenInfo("blog")} className="text-gray-400 hover:text-red-400 transition-colors text-left cursor-pointer">
                    {lang === "ru" ? "Блог и статьи" : "Blog"}
                  </button>
                </li>
              </ul>
            </div>

            {/* Buyers */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
                {lang === "ru" ? "Покупателям" : "Xaridorlar"}
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => onOpenInfo("delivery")} className="text-gray-400 hover:text-red-400 transition-colors text-left cursor-pointer">
                    {t.delivery}
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenInfo("payment")} className="text-gray-400 hover:text-red-400 transition-colors text-left cursor-pointer">
                    {t.payment}
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenInfo("warranty")} className="text-gray-400 hover:text-red-400 transition-colors text-left cursor-pointer">
                    {t.warranty}
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenInfo("returns")} className="text-gray-400 hover:text-red-400 transition-colors text-left cursor-pointer">
                    {t.returns}
                  </button>
                </li>
              </ul>
            </div>

            {/* Business & Contacts */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{t.forBusiness}</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <button onClick={() => onOpenInfo("b2b")} className="text-gray-400 hover:text-red-400 transition-colors text-left cursor-pointer">
                    {t.wholesale}
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenInfo("b2b")} className="text-gray-400 hover:text-red-400 transition-colors text-left cursor-pointer">
                    {t.partnership}
                  </button>
                </li>
                <li>
                  <button onClick={() => onOpenInfo("b2b")} className="text-gray-400 hover:text-red-400 transition-colors text-left cursor-pointer">
                    {t.tenders}
                  </button>
                </li>
              </ul>

              {/* Brands */}
              <div className="mt-5 pt-5 border-t border-white/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-bold">{t.brands}</div>
                <ul className="flex flex-wrap gap-x-3 gap-y-1">
                  {BRANDS.map((b) => (
                    <li key={b}>
                      <Link
                        to={`/brand/${b.toLowerCase()}`}
                        className="text-gray-400 hover:text-red-400 text-xs transition-colors"
                      >
                        {b}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contacts */}
              <div className="mt-5 pt-5 border-t border-white/5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-bold">{t.contacts}</div>
                <a href="tel:+998970363636" className="text-white font-semibold text-sm hover:text-red-400 transition-colors">
                  {t.phone}
                </a>
                <div className="text-gray-400 text-xs mt-1">
                  {t.address}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {lang === "ru" ? "Пн–Вс: 9:00–19:00 каждый день" : "Du–Ya: 9:00–19:00 har kuni"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-600 text-xs">{t.copyright}</p>
          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => onOpenInfo("privacy")}
              className="text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
            >
              {t.privacyPolicy}
            </button>
            <button
              onClick={() => onOpenInfo("offer")}
              className="text-gray-600 hover:text-gray-400 transition-colors cursor-pointer"
            >
              {t.publicOffer}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
