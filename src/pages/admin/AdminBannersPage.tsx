import { useState } from "react";
import { useBanners } from "@/context/BannersContext";
import { useApp } from "@/context/AppContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { BannerSlide } from "@/data/bannerTypes";
import BannerFormModal from "./BannerFormModal";
import { ADMIN_TRANSLATIONS } from "@/data/adminTranslations";

export default function AdminBannersPage() {
  const { slides, addSlide, updateSlide, deleteSlide, toggleSlideActive } = useBanners();
  const { showToast, lang } = useApp();
  const t = ADMIN_TRANSLATIONS[lang].banners;

  useDocumentMeta({
    title:
      lang === "uz"
        ? "Bannerlarni boshqarish | Minimall Admin"
        : "Управление баннерами карусели | Minimall Admin",
    description:
      lang === "uz"
        ? "Bosh sahifadagi reklama bannerlari va aksiyalarni boshqarish"
        : "Управление рекламными баннерами и акциями на главной странице",
    noIndex: true,
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<BannerSlide | null>(null);

  const handleOpenCreate = () => {
    setEditingSlide(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (slide: BannerSlide) => {
    setEditingSlide(slide);
    setModalOpen(true);
  };

  const handleDelete = (slide: BannerSlide) => {
    const title = lang === "uz" ? slide.titleUz || slide.titleRu : slide.titleRu;
    const confirmMsg =
      lang === "uz"
        ? `"${title}" bannerni o'chirmoqchimisiz?`
        : `Удалить баннер "${title}"?`;
    if (window.confirm(confirmMsg)) {
      deleteSlide(slide.id);
      showToast(
        lang === "uz"
          ? `"${title}" banneri o'chirildi`
          : `Баннер "${title}" удален`
      );
    }
  };

  const handleSave = (data: Omit<BannerSlide, "id">) => {
    const title = lang === "uz" ? data.titleUz || data.titleRu : data.titleRu;
    if (editingSlide) {
      updateSlide(editingSlide.id, data);
      showToast(
        lang === "uz"
          ? `"${title}" banneri muvaffaqiyatli yangilandi`
          : `Баннер "${title}" успешно обновлен`
      );
    } else {
      addSlide(data);
      showToast(
        lang === "uz"
          ? `Yangi "${title}" banneri karuselga qo'shildi!`
          : `Новый баннер "${title}" добавлен в карусель!`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl sm:text-3xl font-black text-gray-900"
              style={{ fontFamily: "Barlow Condensed, sans-serif" }}
            >
              {t.title}
            </h1>
            <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200">
              {t.badgeMainScreen}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm px-5 py-3 rounded-2xl transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span className="text-base font-black">+</span>
            <span>{t.addBtn}</span>
          </button>
        </div>
      </div>

      {/* Recommended Size Tip Bar */}
      <div className="bg-amber-50/80 border border-amber-200/80 text-amber-900 px-4 py-3 rounded-2xl text-xs flex items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <span className="text-lg shrink-0">💡</span>
          <div className="min-w-0">
            <span className="font-bold">{t.recommendedSize.split(":")[0]}:</span>{" "}
            <span className="font-extrabold text-amber-950 underline decoration-amber-400">1200 × 500 px</span>{" "}
            {lang === "uz"
              ? "(yoki 1920 × 800 px, nisbat 16:9 / 2.4:1)."
              : "(или 1920 × 800 px, пропорции 16:9 / 2.4:1)."}
            <span className="text-amber-800 ml-1 hidden sm:inline">
              {lang === "uz"
                ? "Yuqori sifatli gorizontal rasmlar ekranni qora chiziqsiz to'ldiradi."
                : "Горизонтальные фото высокого качества идеально заполняют экран без черных полос."}
            </span>
          </div>
        </div>
        <span className="text-[11px] font-bold text-amber-800 bg-white px-2 py-1 rounded-lg border border-amber-200 shrink-0 hidden sm:inline">
          HD 1200×500
        </span>
      </div>

      {/* Grid of Banners or Empty State */}
      {slides.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-10 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
            🖼️
          </div>
          <h3 className="text-lg font-extrabold text-gray-900 mb-1">
            {lang === "uz" ? "Hali bannerlar yo'q" : "Баннеров пока нет"}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mb-6 leading-relaxed">
            {lang === "uz"
              ? "Bannerlar yuklanmagan bo'lsa, saytning bosh sahifasida Minimall brendining vizit kartasi avtomatik ko'rsatiladi."
              : "Пока баннеры не загружены, на главной странице сайта будет автоматически отображаться брендовая визитка с новостями и преимуществами Minimall."}
          </p>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-md hover:from-red-700 hover:to-red-800 transition-all cursor-pointer"
          >
            <span>+</span>
            <span>
              {lang === "uz" ? "Birinchi bannerni qo'shish" : "Добавить первый баннер"}
            </span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden flex flex-col transition-all hover:shadow-md ${
                !slide.isActive ? "opacity-60 bg-gray-50/50" : ""
              }`}
            >
              {/* Image Preview */}
              <div className="relative bg-gray-100 overflow-hidden" style={{ height: 200 }}>
                <img
                  src={slide.image}
                  alt={`${lang === "uz" ? "Slayd" : "Слайд"} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow-xs">
                    {lang === "uz" ? `Slayd #${index + 1}` : `Слайд #${index + 1}`}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
                      slide.isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-800 text-gray-300"
                    }`}
                  >
                    {slide.isActive
                      ? `✓ ${t.activeBadge}`
                      : `✕ ${t.hiddenBadge}`}
                  </span>
                </div>
                {slide.link && (
                  <div className="absolute bottom-3 left-3 pointer-events-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-[11px] font-bold rounded-lg shadow-md">
                      <span>{lang === "uz" ? "Batafsil" : "Подробнее"}</span>
                      <span>→</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Meta info & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1 text-xs text-gray-600">
                  {slide.link ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-400">
                        🔗 {lang === "uz" ? "Bosganda havola:" : "Ссылка при клике:"}
                      </span>
                      <span className="font-mono text-red-600 font-semibold">{slide.link}</span>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      {lang === "uz"
                        ? "Havolasiz (faqat rasm ko'rsatiladi)"
                        : "Без ссылки (только показ изображения)"}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleSlideActive(slide.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors cursor-pointer ${
                      slide.isActive
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {slide.isActive
                      ? `✓ ${t.activeBadge}`
                      : `✕ ${lang === "uz" ? "O'chirilgan" : "Выключен"}`}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(slide)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>✏️</span>
                      <span>{lang === "uz" ? "Tahrirlash" : "Редактировать"}</span>
                    </button>

                    <button
                      onClick={() => handleDelete(slide)}
                      className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title={lang === "uz" ? "Slaydni o'chirish" : "Удалить слайд"}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <BannerFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        slide={editingSlide}
        onSave={handleSave}
      />
    </div>
  );
}
