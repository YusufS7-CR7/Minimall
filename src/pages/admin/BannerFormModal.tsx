import { useState, useEffect, useRef } from "react";
import type { BannerSlide } from "@/data/bannerTypes";
import { uploadMediaFile } from "@/lib/storage";

interface BannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide: BannerSlide | null;
  onSave: (data: Omit<BannerSlide, "id">) => void;
}

export default function BannerFormModal({
  isOpen,
  onClose,
  slide,
  onSave,
}: BannerFormModalProps) {
  const isEditing = !!slide;

  const [image, setImage] = useState("");
  const [link, setLink] = useState("/catalog");
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (slide) {
      setImage(slide.image);
      setLink(slide.link || "/catalog");
      setIsActive(slide.isActive);
    } else {
      setImage("");
      setLink("/catalog");
      setIsActive(true);
    }
  }, [slide, isOpen]);

  if (!isOpen) return null;

  // Process a selected File
  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/") && !/\.(jpe?g|png|webp|gif|svg|avif|bmp)$/i.test(file.name)) {
      alert("Пожалуйста, выберите файл изображения (JPG, PNG, WEBP, GIF, SVG)");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadMediaFile(file, "banners");
      if (res.url) {
        setImage(res.url);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Banner upload error:", err);
      alert("Ошибка при загрузке файла баннера. Попробуйте другой файл.");
    } finally {
      setUploading(false);
    }
  };

  // Handle local file upload via input
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert("Пожалуйста, выберите файл изображения баннера с компьютера или устройства.");
      return;
    }

    onSave({
      titleRu: "Баннер",
      titleUz: "Banner",
      descRu: "",
      descUz: "",
      image,
      link: link.trim() || "/catalog",
      isActive,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh] animate-fadeIn text-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🖼️</span>
            <div>
              <h2
                className="text-xl font-bold tracking-wide"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                {isEditing ? "Редактирование баннера" : "Добавление нового баннера"}
              </h2>
              <p className="text-xs text-gray-400">
                Загрузите фото баннера с вашего устройства для главной карусели
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Image Upload Section — ONLY File Upload */}
          <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                <span>📸</span> Фото баннера <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200">
                Рекомендуемый размер: 1200 × 500 px
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*,image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml,image/avif"
              className="hidden"
            />

            {!image ? (
              /* Dropzone / Upload Box */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? "border-red-500 bg-red-50/70 scale-[0.99]"
                    : "border-gray-300 hover:border-red-500 bg-white hover:bg-red-50/20"
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <span className="w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                    <span className="font-bold text-gray-700 text-sm">Загрузка изображения...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-3xl shadow-xs">
                      📁
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm sm:text-base">
                        Нажмите для выбора файла или перетащите сюда
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Поддерживаются все виды фото: <strong>PNG, JPG, JPEG, WEBP, GIF, SVG</strong>
                      </p>
                    </div>
                    <span className="mt-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm inline-flex items-center gap-2">
                      <span>Выбрать файл с устройства</span>
                    </span>
                  </>
                )}
              </div>
            ) : (
              /* Uploaded Image Preview with Replace / Remove Actions */
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden border border-gray-300 shadow-sm bg-gray-900" style={{ height: 210 }}>
                  <img
                    src={image}
                    alt="Предпросмотр баннера"
                    className="w-full h-full object-cover"
                  />
                  {link && (
                    <div className="absolute bottom-4 left-4 z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md">
                        <span>Подробнее</span>
                        <span>→</span>
                      </span>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-2 text-white z-20">
                      <span className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold">Обновление файла...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Файл успешно выбран и готов к публикации
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🔄</span>
                      <span>Заменить файл</span>
                    </button>
                    <button
                      type="button"
                      disabled={uploading}
                      onClick={() => setImage("")}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Link */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Ссылка для перехода по кнопке «Подробнее» (и клику на баннер)
            </label>
            <input
              type="text"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="/catalog или /brand/makita"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white"
            />
            <p className="text-[11px] text-gray-400 mt-1">
              При нажатии на кнопку «Подробнее» или на сам баннер пользователь перейдет по этой ссылке.
            </p>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer accent-red-600"
              />
              <span className="text-xs font-semibold text-gray-800">
                Показывать баннер в карусели на главной странице
              </span>
            </label>
          </div>

          {/* Footer buttons */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              {isEditing ? "Сохранить изменения" : "Добавить баннер"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
