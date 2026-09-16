import { useState } from "react";
import { useHelpCenter, type HelpSectionData } from "@/context/HelpCenterContext";
import { useApp } from "@/context/AppContext";
import InfoModal, { type InfoModalSection } from "@/components/ui/InfoModal";
import { ADMIN_TRANSLATIONS } from "@/data/adminTranslations";

const SECTION_KEYS: InfoModalSection[] = [
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

export default function AdminHelpPage() {
  const { sections, updateSection, resetSection, resetAllSections } = useHelpCenter();
  const { showToast, lang } = useApp();
  const t = ADMIN_TRANSLATIONS[lang].help;

  const [activeSectionId, setActiveSectionId] = useState<InfoModalSection>("about");
  const [activeLangTab, setActiveLangTab] = useState<"ru" | "uz">("ru");
  const [previewOpen, setPreviewOpen] = useState(false);

  const currentSection = sections[activeSectionId];

  // Local draft state for editing currently selected section
  const [draft, setDraft] = useState<HelpSectionData>(currentSection);

  // When activeSectionId changes, load draft
  const handleSelectSection = (id: InfoModalSection) => {
    setActiveSectionId(id);
    setDraft(sections[id]);
  };

  const handleSave = () => {
    updateSection(activeSectionId, draft);
    showToast(
      lang === "uz"
        ? `«${draft.labelUz || draft.labelRu}» bo'limi muvaffaqiyatli saqlandi`
        : `Раздел «${draft.labelRu}» успешно сохранен`
    );
  };

  const handleResetCurrent = () => {
    const label = lang === "uz" ? currentSection.labelUz || currentSection.labelRu : currentSection.labelRu;
    const confirmMsg =
      lang === "uz"
        ? `«${label}» bo'limini asl holiga qaytarmoqchimisiz?`
        : `Сбросить раздел «${currentSection.labelRu}» к исходному состоянию?`;
    if (window.confirm(confirmMsg)) {
      resetSection(activeSectionId);
      setDraft(sections[activeSectionId]);
      showToast(
        lang === "uz"
          ? `«${label}» bo'limi asl holiga qaytarildi`
          : `Раздел «${currentSection.labelRu}» сброшен к исходным данным`
      );
    }
  };

  const handleResetAll = () => {
    const confirmMsg =
      lang === "uz"
        ? "Butun ma'lumot markazini Minimall standart matnlariga qaytarmoqchimisiz?"
        : "Сбросить ВЕСЬ справочный центр к заводским текстам Minimall?";
    if (window.confirm(confirmMsg)) {
      resetAllSections();
      setDraft(sections[activeSectionId]);
      showToast(
        lang === "uz"
          ? "Ma'lumot markazining barcha bo'limlari tiklandi"
          : "Все разделы справочного центра сброшены"
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            <span>ℹ️</span>
            <span>{lang === "uz" ? "Kontent va Bilimlar Bazasi" : "Контент и База Знаний"}</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {t.title}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">{t.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-black text-white font-bold px-4 py-2.5 rounded-2xl shadow-md text-xs transition-colors cursor-pointer"
          >
            <span>👁️</span>
            <span>{t.preview}</span>
          </button>
          <button
            onClick={handleResetAll}
            className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-2xl text-xs transition-colors cursor-pointer"
            title={t.resetAll}
          >
            <span>🔄</span>
            <span>{lang === "uz" ? "Barchasini tiklash" : "Сброс всего"}</span>
          </button>
        </div>
      </div>

      {/* Editor Layout: Sidebar + Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: 10 Sections Menu */}
        <aside className="lg:col-span-4 space-y-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-3 shadow-2xs">
            <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-1.5 hidden lg:block">
              {lang === "uz" ? "Ma'lumot bo'limlari (10)" : "Разделы справки (10)"}
            </div>
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible scrollbar-hide gap-1.5 p-1 lg:p-0">
              {SECTION_KEYS.map((key) => {
                const sec = sections[key];
                const isActive = activeSectionId === key;
                const label = lang === "uz" ? sec.labelUz || sec.labelRu : sec.labelRu;
                return (
                  <button
                    key={key}
                    onClick={() => handleSelectSection(key)}
                    className={`flex items-center justify-between px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-left font-semibold text-xs transition-all cursor-pointer shrink-0 whitespace-nowrap lg:whitespace-normal lg:w-full ${
                      isActive
                        ? "bg-red-600 text-white shadow-xs font-bold"
                        : "text-gray-700 bg-gray-50 lg:bg-transparent hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{sec.icon}</span>
                      <span className="truncate">{label}</span>
                    </div>
                    <span
                      className={`hidden lg:inline text-[10px] px-1.5 py-0.5 rounded-md ml-2 ${
                        isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {key}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Right column: Active Section Editor */}
        <main className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Header with section title, language selector & save button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl p-2 bg-gray-50 rounded-2xl border border-gray-100">
                  {draft.icon}
                </span>
                <div>
                  <h2
                    className="text-xl sm:text-2xl font-black text-gray-900 leading-tight"
                    style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                  >
                    {lang === "uz" ? draft.labelUz || draft.labelRu : draft.labelRu}
                  </h2>
                  <div className="text-xs text-gray-400 font-mono">
                    ID: {draft.id} • {draft.labelUz}
                  </div>
                </div>
              </div>

              {/* Language switcher tabs */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <div className="inline-flex bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    onClick={() => setActiveLangTab("ru")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeLangTab === "ru"
                        ? "bg-white text-gray-900 shadow-2xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    🇷🇺 {t.tabRu}
                  </button>
                  <button
                    onClick={() => setActiveLangTab("uz")}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeLangTab === "uz"
                        ? "bg-white text-gray-900 shadow-2xs"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    🇺🇿 {t.tabUz}
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  💾 {lang === "uz" ? "Saqlash" : "Сохранить"}
                </button>
              </div>
            </div>

            {/* Basic Info (Icon + Menu labels) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === "uz" ? "Belgi / Emotsiya" : "Иконка / Эмодзи"}
                </label>
                <input
                  type="text"
                  value={draft.icon}
                  onChange={(e) => setDraft((p) => ({ ...p, icon: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-center text-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === "uz" ? "Menyu nomi (RU)" : "Название в меню (RU)"}
                </label>
                <input
                  type="text"
                  value={draft.labelRu}
                  onChange={(e) => setDraft((p) => ({ ...p, labelRu: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === "uz" ? "Menyu nomi (UZ)" : "Название в меню (UZ)"}
                </label>
                <input
                  type="text"
                  value={draft.labelUz}
                  onChange={(e) => setDraft((p) => ({ ...p, labelUz: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs"
                />
              </div>
            </div>

            {/* Language-dependent Content Fields */}
            {activeLangTab === "ru" ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {lang === "uz" ? "Yuqori nishon (RU)" : "Верхний бейдж (RU)"}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        lang === "uz" ? "Masalan: Rasmiy yetkazib beruvchi" : "Например: Официальный поставщик"
                      }
                      value={draft.badgeRu || ""}
                      onChange={(e) => setDraft((p) => ({ ...p, badgeRu: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {lang === "uz" ? "Asosiy sarlavha (RU)" : "Главный заголовок (RU)"}
                    </label>
                    <input
                      type="text"
                      value={draft.titleRu}
                      onChange={(e) => setDraft((p) => ({ ...p, titleRu: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === "uz" ? "Qisqacha tavsif (RU)" : "Краткое описание / Лид (RU)"}
                  </label>
                  <textarea
                    rows={2}
                    value={draft.descriptionRu || ""}
                    onChange={(e) => setDraft((p) => ({ ...p, descriptionRu: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === "uz" ? "To'liq matn (RU)" : "Полный текст и содержание (RU)"}
                  </label>
                  <textarea
                    rows={12}
                    value={draft.contentRu}
                    onChange={(e) => setDraft((p) => ({ ...p, contentRu: e.target.value }))}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs font-mono leading-relaxed"
                  />
                  <div className="text-[11px] text-gray-400 mt-1">
                    {lang === "uz"
                      ? "Xatboshilar, ro'yxatlar va matnlarni kiritishingiz mumkin. Bo'sh qator bilan ajrating."
                      : "Поддерживаются абзацы, списки и текст. Разделяйте абзацы пустой строкой."}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {lang === "uz" ? "Yuqori nishon (UZ)" : "Верхний бейдж (UZ)"}
                    </label>
                    <input
                      type="text"
                      placeholder={
                        lang === "uz"
                          ? "Masalan: Rasmiy asboblar yetkazib beruvchi"
                          : "Например: Официальный поставщик"
                      }
                      value={draft.badgeUz || ""}
                      onChange={(e) => setDraft((p) => ({ ...p, badgeUz: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {lang === "uz" ? "Asosiy sarlavha (UZ)" : "Главный заголовок (UZ)"}
                    </label>
                    <input
                      type="text"
                      value={draft.titleUz}
                      onChange={(e) => setDraft((p) => ({ ...p, titleUz: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === "uz" ? "Qisqacha tavsif (UZ)" : "Краткое описание (UZ)"}
                  </label>
                  <textarea
                    rows={2}
                    value={draft.descriptionUz || ""}
                    onChange={(e) => setDraft((p) => ({ ...p, descriptionUz: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    {lang === "uz" ? "To'liq matn va mazmun (UZ)" : "Полный текст и содержание (UZ)"}
                  </label>
                  <textarea
                    rows={12}
                    value={draft.contentUz}
                    onChange={(e) => setDraft((p) => ({ ...p, contentUz: e.target.value }))}
                    className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs font-mono leading-relaxed"
                  />
                  <div className="text-[11px] text-gray-400 mt-1">
                    {lang === "uz"
                      ? "Xatboshilar, ro'yxatlar va matnlarni kiritishingiz mumkin."
                      : "Поддерживаются абзацы, списки и текст. Разделяйте абзацы пустой строкой."}
                  </div>
                </div>
              </div>
            )}

            {/* Contacts fields if relevant */}
            {(activeSectionId === "contacts" || activeSectionId === "about" || activeSectionId === "service") && (
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 space-y-3 text-xs">
                <div className="font-bold text-gray-900 flex items-center gap-2">
                  <span>📞</span>
                  <span>
                    {lang === "uz" ? "Aloqa va manzil ma'lumotlari" : "Контакты и реквизиты точки"}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      {lang === "uz" ? "Telefon" : "Телефон"}
                    </label>
                    <input
                      type="text"
                      value={draft.contacts?.phone || "+998 (97) 036 36 36"}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          contacts: { ...(p.contacts as any), phone: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Email
                    </label>
                    <input
                      type="text"
                      value={draft.contacts?.email || "info@mini-mall.uz"}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          contacts: { ...(p.contacts as any), email: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      Telegram
                    </label>
                    <input
                      type="text"
                      value={draft.contacts?.telegram || "@minimall_uzb"}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          contacts: { ...(p.contacts as any), telegram: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      {lang === "uz" ? "Showrum manzili (RU)" : "Адрес шоу-рума (RU)"}
                    </label>
                    <input
                      type="text"
                      value={draft.contacts?.addressRu || ""}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          contacts: { ...(p.contacts as any), addressRu: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                      {lang === "uz" ? "Ish vaqti (RU)" : "Часы работы (RU)"}
                    </label>
                    <input
                      type="text"
                      value={draft.contacts?.hoursRu || (lang === "uz" ? "Du–Ya 9:00 dan 19:00 gacha" : "Пн–Вс с 9:00 до 19:00")}
                      onChange={(e) =>
                        setDraft((p) => ({
                          ...p,
                          contacts: { ...(p.contacts as any), hoursRu: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleResetCurrent}
                className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
              >
                {t.resetSection}
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {t.preview}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  {t.saveSection}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* InfoModal Live Preview */}
      <InfoModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        section={activeSectionId}
        onSelectSection={setActiveSectionId}
        lang={activeLangTab}
      />
    </div>
  );
}
