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
  const [urlInput, setUrlInput] = useState("");
  const [link, setLink] = useState("/catalog");
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (slide) {
      setImage(slide.image);
      setUrlInput(slide.image.startsWith("data:") ? "" : slide.image);
      setLink(slide.link || "/catalog");
      setIsActive(slide.isActive);
    } else {
      setImage("https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&h=500&fit=crop&auto=format");
      setUrlInput("");
      setLink("/catalog");
      setIsActive(true);
    }
  }, [slide, isOpen]);

  if (!isOpen) return null;

  // Handle local file upload via Supabase Storage (with fallback)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите файл изображения (JPG, PNG, WEBP)");
      return;
    }

    setUploading(true);
    try {
      const res = await uploadMediaFile(file, "banners");
      if (res.url) {
        setImage(res.url);
        setUrlInput("");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Banner upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setImage(urlInput.trim());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) {
      alert("Пожалуйста, добавьте изображение баннера (с компьютера или по ссылке)");
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
                {isEditing ? "Редактирование слайда баннера" : "Добавление нового баннера в карусель"}
              </h2>
              <p className="text-xs text-gray-400">
                Баннер отображается в главной карусели на главной странице маркетплейса
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
          {/* Image Upload / URL Section */}
          <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 flex items-center gap-1.5 text-sm">
                <span>📸</span> Изображение баннера <span className="text-red-500">*</span>
              </span>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-1 rounded-lg border border-amber-200">
                1200 × 500 px (или 1920 × 800 px)
              </span>
            </div>

            <p className="text-xs text-gray-500">
              Баннер отображается в главной карусели как чистое изображение без перекрывающих текстов.
            </p>

            {/* Upload buttons row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: File from Computer */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-700">
                  Загрузить картинку с компьютера
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  {uploading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Загрузка в облако...</span>
                    </>
                  ) : (
                    <>
                      <span>📁</span>
                      <span>Выбрать файл на устройстве</span>
                    </>
                  )}
                </button>
              </div>

              {/* Option 2: Image URL */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-700">
                  Или вставить прямую ссылку (URL)
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 text-xs px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
                  >
                    Применить
                  </button>
                </div>
              </div>
            </div>

            {/* Live Banner Preview */}
            {image && (
              <div className="space-y-1.5 pt-2">
                <div className="text-[11px] font-bold text-gray-500">Предпросмотр баннера:</div>
                <div className="relative rounded-2xl overflow-hidden border border-gray-300 shadow-sm" style={{ height: 200 }}>
                  <img src={image} alt="Предпросмотр баннера" className="w-full h-full object-cover" />
                  {link && (
                    <div className="absolute bottom-4 left-4 z-10">
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md">
                        <span>Подробнее</span>
                        <span>→</span>
                      </span>
                    </div>
                  )}
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
