import { useState, useRef } from "react";
import { useHelpCenter, type HelpSectionData, type PartnerCompany } from "@/context/HelpCenterContext";
import { useApp } from "@/context/AppContext";
import { uploadMediaFile } from "@/lib/storage";
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

  // Partner Modal State
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerCompany | null>(null);
  const [partnerName, setPartnerName] = useState("");
  const [partnerLogo, setPartnerLogo] = useState("");
  const [partnerDescRu, setPartnerDescRu] = useState("");
  const [partnerDescUz, setPartnerDescUz] = useState("");
  const [partnerWebsite, setPartnerWebsite] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoIsDragging, setLogoIsDragging] = useState(false);
  const partnerLogoInputRef = useRef<HTMLInputElement>(null);

  const currentSection = sections[activeSectionId];

  // Local draft state for editing currently selected section
  const [draft, setDraft] = useState<HelpSectionData>(currentSection);

  // When activeSectionId changes, load draft
  const handleSelectSection = (id: InfoModalSection) => {
    setActiveSectionId(id);
    setDraft(sections[id]);
  };

  const handleOpenAddPartner = () => {
    setEditingPartner(null);
    setPartnerName("");
    setPartnerLogo("");
    setPartnerDescRu("");
    setPartnerDescUz("");
    setPartnerWebsite("");
    setIsPartnerModalOpen(true);
  };

  const handleOpenEditPartner = (p: PartnerCompany) => {
    setEditingPartner(p);
    setPartnerName(p.name);
    setPartnerLogo(p.logo);
    setPartnerDescRu(p.descriptionRu || "");
    setPartnerDescUz(p.descriptionUz || "");
    setPartnerWebsite(p.website || "");
    setIsPartnerModalOpen(true);
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) return;

    const newPartner: PartnerCompany = {
      id: editingPartner ? editingPartner.id : `partner-${Date.now()}`,
      name: partnerName.trim(),
      logo: partnerLogo.trim() || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=200&h=200&fit=crop",
      descriptionRu: partnerDescRu.trim() || undefined,
      descriptionUz: partnerDescUz.trim() || undefined,
      website: partnerWebsite.trim() || undefined,
    };

    const currentPartners = draft.partners || [];
    let updatedPartners: PartnerCompany[];
    if (editingPartner) {
      updatedPartners = currentPartners.map((p) => (p.id === editingPartner.id ? newPartner : p));
    } else {
      updatedPartners = [...currentPartners, newPartner];
    }

    setDraft((prev) => ({ ...prev, partners: updatedPartners }));
    setIsPartnerModalOpen(false);
    showToast(
      lang === "uz"
        ? `«${newPartner.name}» kompaniyasi saqlandi`
        : `Компания «${newPartner.name}» сохранена`
    );
  };

  const handleDeletePartner = (id: string, name: string) => {
    const confirmMsg =
      lang === "uz"
        ? `«${name}» kompaniyasini o'chirmoqchimisiz?`
        : `Удалить компанию «${name}» из списка партнеров?`;
    if (window.confirm(confirmMsg)) {
      const updatedPartners = (draft.partners || []).filter((p) => p.id !== id);
      setDraft((prev) => ({ ...prev, partners: updatedPartners }));
      showToast(
        lang === "uz"
          ? `«${name}» kompaniyasi o'chirildi`
          : `Компания «${name}» удалена`
      );
    }
  };

  const handleLogoFileUpload = async (file: File) => {
    setUploadingLogo(true);
    try {
      const res = await uploadMediaFile(file, "banners");
      setPartnerLogo(res.url);
    } catch (err) {
      console.error("Logo upload failed", err);
    } finally {
      setUploadingLogo(false);
    }
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

            {/* Partner Companies Management (when section is "about") */}
            {activeSectionId === "about" && (
              <div className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                      <span>🏢</span>
                      <span>
                        {lang === "uz"
                          ? "Hamkor kompaniyalar va mijozlar (kartochkalar)"
                          : "Компании-партнёры и клиенты (карточки с логотипами)"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {lang === "uz"
                        ? "Minimall hamkorlik qilgan kompaniyalar ro'yxati «Kompaniya haqida» bo'limida ko'rsatiladi."
                        : "Компании, с которыми сотрудничал Minimall — отображаются в виде карточек с логотипом в разделе «О компании»."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddPartner}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    <span>+</span>
                    <span>{lang === "uz" ? "Kompaniya qo'shish" : "Добавить компанию"}</span>
                  </button>
                </div>

                {/* Partners List / Grid */}
                {draft.partners && draft.partners.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {draft.partners.map((p) => {
                      const desc = activeLangTab === "ru" ? p.descriptionRu : p.descriptionUz;

                      return (
                        <div
                          key={p.id}
                          className="bg-white p-3.5 rounded-2xl border border-gray-200/90 shadow-2xs hover:border-red-200 transition-all flex flex-col justify-between space-y-2.5"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
                              {p.logo ? (
                                <img
                                  src={p.logo}
                                  alt={p.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop";
                                  }}
                                />
                              ) : (
                                <span className="text-xl">🏢</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-gray-900 text-xs truncate">
                                {p.name}
                              </h4>
                              {desc && (
                                <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5 leading-snug">
                                  {desc}
                                </p>
                              )}
                              {p.website && (
                                <a
                                  href={p.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-sky-600 hover:underline font-semibold block truncate mt-0.5"
                                >
                                  {p.website.replace(/^https?:\/\//, "")}
                                </a>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-gray-100">
                            <button
                              type="button"
                              onClick={() => handleOpenEditPartner(p)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                              ✏️ {lang === "uz" ? "Tahrirlash" : "Изменить"}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePartner(p.id, p.name)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              🗑️ {lang === "uz" ? "O'chirish" : "Удалить"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-white rounded-2xl border border-dashed border-gray-300 space-y-2">
                    <span className="text-2xl">🏢</span>
                    <div className="text-xs font-semibold text-gray-700">
                      {lang === "uz" ? "Hamkor kompaniyalar mavjud emas" : "Компании пока не добавлены"}
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddPartner}
                      className="text-xs text-red-600 hover:underline font-bold cursor-pointer"
                    >
                      + {lang === "uz" ? "Birinchi kompaniyani qo'shish" : "Добавить первую компанию"}
                    </button>
                  </div>
                )}
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

      {/* Add / Edit Partner Modal */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🏢</span>
                <h3 className="font-bold text-base sm:text-lg" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  {editingPartner
                    ? (lang === "uz" ? "Kompaniyani tahrirlash" : "Редактировать компанию")
                    : (lang === "uz" ? "Yangi hamkor kompaniya qo'shish" : "Добавить компанию-партнёра")}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPartnerModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePartner} className="p-4 sm:p-6 space-y-4 overflow-y-auto text-xs text-gray-800 flex-1">
              {/* Company Name */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === "uz" ? "Kompaniya nomi" : "Название компании"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={partnerName}
                  onChange={(e) => setPartnerName(e.target.value)}
                  placeholder={lang === "uz" ? "Masalan: Discover Invest" : "Например: Discover Invest"}
                  className="w-full text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Logo Upload & Preview */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-700">
                  {lang === "uz" ? "Kompaniya logotipi" : "Логотип компании"}
                </label>

                <div className="flex gap-3 items-center">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-200 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    {partnerLogo ? (
                      <img
                        src={partnerLogo}
                        alt="Logo preview"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop";
                        }}
                      />
                    ) : (
                      <span className="text-gray-400 text-xs">{lang === "uz" ? "Logotip" : "Лого"}</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      ref={partnerLogoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoFileUpload(file);
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => partnerLogoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {uploadingLogo ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                          <span>{lang === "uz" ? "Yuklanmoqda..." : "Загрузка..."}</span>
                        </>
                      ) : (
                        <>
                          <span>📁</span>
                          <span>{lang === "uz" ? "Fayldan logotip tanlash (PNG/JPG/WEBP)" : "Выбрать файл логотипа (PNG/JPG/WEBP)"}</span>
                        </>
                      )}
                    </button>

                    <input
                      type="url"
                      value={partnerLogo}
                      onChange={(e) => setPartnerLogo(e.target.value)}
                      placeholder={lang === "uz" ? "Yoki to'g'ridan-to'g'ri rasm havolasi..." : "Или прямая ссылка на логотип..."}
                      className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === "uz" ? "Sayt havolasi (ixtiyoriy)" : "Ссылка на сайт компании (необязательно)"}
                </label>
                <input
                  type="text"
                  value={partnerWebsite}
                  onChange={(e) => setPartnerWebsite(e.target.value)}
                  placeholder="https://company.uz"
                  className="w-full text-xs px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 font-mono"
                />
              </div>

              {/* Description RU */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === "uz" ? "Qisqa tavsif (RU, ixtiyoriy)" : "Краткое описание (RU, необязательно)"}
                </label>
                <input
                  type="text"
                  value={partnerDescRu}
                  onChange={(e) => setPartnerDescRu(e.target.value)}
                  placeholder={lang === "uz" ? "Masalan: O'zbekistondagi yirik qurilish xoldingi" : "Например: Крупнейший строительный холдинг Узбекистана"}
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Description UZ */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {lang === "uz" ? "Qisqa tavsif (UZ, ixtiyoriy)" : "Краткое описание (UZ, необязательно)"}
                </label>
                <input
                  type="text"
                  value={partnerDescUz}
                  onChange={(e) => setPartnerDescUz(e.target.value)}
                  placeholder={lang === "uz" ? "Masalan: O'zbekistondagi yirik qurilish xoldingi" : "Masalan: O'zbekistondagi yirik qurilish xoldingi"}
                  className="w-full text-xs px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  {lang === "uz" ? "Bekor qilish" : "Отмена"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  {lang === "uz" ? "Saqlash" : "Сохранить компанию"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
