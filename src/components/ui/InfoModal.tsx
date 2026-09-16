import { useEffect } from "react";
import type { Lang } from "@/data/types";
import { useHelpCenter } from "@/context/HelpCenterContext";

export type InfoModalSection =
  | "about"
  | "delivery"
  | "payment"
  | "warranty"
  | "returns"
  | "service"
  | "contacts"
  | "b2b"
  | "offer"
  | "privacy";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: InfoModalSection;
  onSelectSection: (s: InfoModalSection) => void;
  lang: Lang;
}

export default function InfoModal({
  isOpen,
  onClose,
  section,
  onSelectSection,
  lang,
}: InfoModalProps) {
  const { sections, getSection } = useHelpCenter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const currentSection = getSection(section);

  const sectionKeys: InfoModalSection[] = [
    "about",
    "delivery",
    "payment",
    "warranty",
    "returns",
    "service",
    "contacts",
    "b2b",
    "offer",
    "privacy",
  ];

  const menuItems = sectionKeys.map((key) => {
    const s = sections[key];
    return {
      id: key,
      labelRu: s?.labelRu || key,
      labelUz: s?.labelUz || key,
      icon: s?.icon || "ℹ️",
    };
  });

  const badge = lang === "ru" ? currentSection.badgeRu : currentSection.badgeUz;
  const title = lang === "ru" ? currentSection.titleRu : currentSection.titleUz;
  const description = lang === "ru" ? currentSection.descriptionRu : currentSection.descriptionUz;
  const content = lang === "ru" ? currentSection.contentRu : currentSection.contentUz;
  const contacts = currentSection.contacts;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col md:flex-row animate-fadeIn">
        {/* Sidebar Tabs */}
        <aside className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex flex-col shrink-0">
          <div className="p-3 sm:p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              <span
                className="font-bold text-gray-900 text-sm"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                {lang === "ru" ? "Справочный центр" : "Ma'lumotlar markazi"}
              </span>
            </div>
            <button
              onClick={onClose}
              className="md:hidden w-7 h-7 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>

          <nav className="p-2 flex md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 gap-1.5 scrollbar-hide text-xs">
            {menuItems.map((item) => {
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectSection(item.id)}
                  className={`flex md:w-full items-center gap-2 px-3 py-2 rounded-xl text-left font-semibold transition-all shrink-0 cursor-pointer whitespace-nowrap ${
                    active
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-gray-700 bg-white md:bg-transparent border md:border-0 border-gray-200 hover:bg-gray-200/60"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{lang === "ru" ? item.labelRu : item.labelUz}</span>
                </button>
              );
            })}
          </nav>

          <div className="hidden md:block p-4 border-t border-gray-200 bg-white/50 text-[11px] text-gray-500 space-y-1">
            <div>
              📞{" "}
              <a href="tel:+998970363636" className="text-gray-800 font-bold hover:text-red-600">
                +998 (97) 036 36 36
              </a>
            </div>
            <div>⏱ {lang === "ru" ? "9:00 – 19:00 (ежедневно)" : "9:00 – 19:00 (har kuni)"}</div>
          </div>
        </aside>

        {/* Content Body */}
        <main className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Header bar */}
          <div className="hidden md:flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <span className="text-xs text-gray-400 font-medium">Minimall Knowledge Base</span>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Section details */}
          <div className="p-6 md:p-8 overflow-y-auto flex-1 text-gray-800 leading-relaxed text-sm space-y-5">
            {/* Header Badge & Title */}
            <div>
              {badge && (
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-2 border border-red-100">
                  <span>{currentSection.icon}</span>
                  <span>{badge}</span>
                </div>
              )}
              <h2
                className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                {title}
              </h2>
              {description && (
                <p className="text-gray-600 text-sm mt-2 leading-relaxed">{description}</p>
              )}
            </div>

            {/* Special blocks for About: Stats */}
            {section === "about" && currentSection.stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {currentSection.stats.map((s, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-red-50/70 to-white p-4 rounded-2xl border border-red-100/80 text-center"
                  >
                    <div
                      className="text-2xl sm:text-3xl font-black text-red-600"
                      style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                    >
                      {s.value}
                    </div>
                    <div className="text-[11px] font-semibold text-gray-700 mt-1">
                      {lang === "ru" ? s.labelRu : s.labelUz}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Formatted Content Paragraphs */}
            <div className="space-y-3 text-xs leading-relaxed text-gray-700">
              {content
                .split("\n\n")
                .map((para, pIdx) => {
                  const trimmed = para.trim();
                  if (!trimmed) return null;

                  // Check if it's a bulleted block
                  if (trimmed.includes("\n• ") || trimmed.startsWith("• ")) {
                    const lines = trimmed.split("\n");
                    return (
                      <div
                        key={pIdx}
                        className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-1.5"
                      >
                        {lines.map((line, lIdx) => {
                          const lTrim = line.trim();
                          if (lTrim.startsWith("• ")) {
                            return (
                              <div key={lIdx} className="flex items-start gap-2 pl-1">
                                <span className="text-red-500 font-bold">•</span>
                                <span>{lTrim.replace(/^•\s*/, "")}</span>
                              </div>
                            );
                          }
                          return (
                            <div key={lIdx} className="font-bold text-gray-900 mb-1">
                              {lTrim}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  // Numbered list block
                  if (trimmed.includes("\n1. ") || trimmed.startsWith("1. ")) {
                    const lines = trimmed.split("\n");
                    return (
                      <div
                        key={pIdx}
                        className="bg-gray-50 p-4 rounded-2xl border border-gray-200/80 space-y-2"
                      >
                        {lines.map((line, lIdx) => {
                          const lTrim = line.trim();
                          if (/^\d+\.\s/.test(lTrim)) {
                            return (
                              <div key={lIdx} className="flex items-start gap-2">
                                <span className="font-bold text-red-600">
                                  {lTrim.match(/^\d+\./)?.[0]}
                                </span>
                                <span>{lTrim.replace(/^\d+\.\s*/, "")}</span>
                              </div>
                            );
                          }
                          return (
                            <div key={lIdx} className="font-bold text-gray-900 mb-1">
                              {lTrim}
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  // Highlight card for legal / policy sections
                  if (trimmed.startsWith("§") || trimmed.startsWith("1.") || trimmed.startsWith("2.")) {
                    return (
                      <div
                        key={pIdx}
                        className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs space-y-1"
                      >
                        <p className="font-medium">{trimmed}</p>
                      </div>
                    );
                  }

                  return (
                    <p key={pIdx} className="text-gray-700">
                      {trimmed}
                    </p>
                  );
                })}
            </div>

            {/* Special Contacts Footer for contacts / service / about */}
            {(section === "contacts" || section === "service" || section === "about") && contacts && (
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs mt-4">
                <div className="space-y-0.5">
                  <div className="font-bold text-sm">
                    {lang === "ru" ? "Свяжитесь с нами прямо сейчас" : "Biz bilan hoziroq bog'laning"}
                  </div>
                  <div className="text-gray-300 text-[11px]">
                    📍 {lang === "ru" ? contacts.addressRu : contacts.addressUz} • ⏱{" "}
                    {lang === "ru" ? contacts.hoursRu : contacts.hoursUz}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <a
                    href={`tel:${contacts.phone.replace(/[^+\d]/g, "")}`}
                    className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-md"
                  >
                    <span>📞 {contacts.phone}</span>
                  </a>
                  {contacts.telegram && (
                    <a
                      href={`https://t.me/${contacts.telegram.replace("@", "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-md"
                    >
                      <span>✈️ Telegram</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
