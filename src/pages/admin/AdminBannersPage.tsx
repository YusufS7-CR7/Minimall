import { useState } from "react";
import { useBanners } from "@/context/BannersContext";
import { useApp } from "@/context/AppContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { BannerSlide } from "@/data/bannerTypes";
import BannerFormModal from "./BannerFormModal";

export default function AdminBannersPage() {
  const { slides, addSlide, updateSlide, deleteSlide, toggleSlideActive, resetSlides } = useBanners();
  const { showToast } = useApp();

  useDocumentMeta({
    title: "Управление баннерами карусели | Minimall Admin",
    description: "Управление рекламными баннерами и акциями на главной странице",
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
    if (window.confirm(`Удалить баннер "${slide.titleRu}"?`)) {
      deleteSlide(slide.id);
      showToast(`Баннер "${slide.titleRu}" удален`);
    }
  };

  const handleReset = () => {
    if (window.confirm("Восстановить заводские 4 баннера? Все добавленные баннеры будут сброшены.")) {
      resetSlides();
      showToast("Баннеры сброшены к стандартным");
    }
  };

  const handleSave = (data: Omit<BannerSlide, "id">) => {
    if (editingSlide) {
      updateSlide(editingSlide.id, data);
      showToast(`Баннер "${data.titleRu}" успешно обновлен`);
    } else {
      addSlide(data);
      showToast(`Новый баннер "${data.titleRu}" добавлен в карусель!`);
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
              Баннеры и карусель новостей
            </h1>
            <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200">
              Главный экран
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Добавляйте новые слайды, загружайте фото с компьютера или по ссылке, редактируйте тексты и ссылки
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleReset}
            className="text-xs font-medium text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 border border-gray-200 px-3.5 py-2.5 rounded-2xl transition-colors cursor-pointer"
            title="Вернуть стандартные баннеры"
          >
            🔄 Сброс к дефолту
          </button>
          <button
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm px-5 py-3 rounded-2xl transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span className="text-base font-black">+</span>
            <span>Добавить баннер</span>
          </button>
        </div>
      </div>

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden flex flex-col transition-all hover:shadow-md ${
              !slide.isActive ? "opacity-60 bg-gray-50/50" : ""
            }`}
          >
            {/* Image Preview with overlay text */}
            <div className="relative bg-gray-900 overflow-hidden" style={{ height: 200 }}>
              <img
                src={slide.image}
                alt={slide.titleRu}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-between p-4 text-white">
                <div className="flex items-center justify-between">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                    Слайд #{index + 1}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      slide.isActive
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {slide.isActive ? "Показывается" : "Скрыт"}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold line-clamp-1 leading-snug">
                    {slide.titleRu}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-2 mt-0.5">
                    {slide.descRu}
                  </p>
                </div>
              </div>
            </div>

            {/* Meta info & Actions */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">🇺🇿 На узбекском:</span>
                  <span className="font-semibold text-gray-800 truncate">{slide.titleUz}</span>
                </div>
                {slide.link && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-gray-400">🔗 Ссылка:</span>
                    <span className="font-mono text-red-600 font-semibold">{slide.link}</span>
                  </div>
                )}
                {/* Badges preview */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {[slide.badge1, slide.badge2, slide.badge3].filter(Boolean).map((b, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-gray-200/60"
                    >
                      {b}
                    </span>
                  ))}
                </div>
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
                  {slide.isActive ? "✓ Активен" : "✕ Выключен"}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(slide)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>✏️</span>
                    <span>Редактировать</span>
                  </button>

                  <button
                    onClick={() => handleDelete(slide)}
                    className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                    title="Удалить слайд"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
