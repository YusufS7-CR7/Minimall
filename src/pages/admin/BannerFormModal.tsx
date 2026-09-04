import { useState, useEffect, useRef } from "react";
import type { BannerSlide } from "@/data/bannerTypes";
import { translateText } from "@/utils/googleTranslate";

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

  const [titleRu, setTitleRu] = useState("");
  const [titleUz, setTitleUz] = useState("");
  const [descRu, setDescRu] = useState("");
  const [descUz, setDescUz] = useState("");
  const [image, setImage] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [link, setLink] = useState("/catalog");
  const [isActive, setIsActive] = useState(true);
  const [badge1, setBadge1] = useState("Оригинал");
  const [badge2, setBadge2] = useState("Быстрая доставка");
  const [badge3, setBadge3] = useState("Лучшие цены");

  const [translatingTitle, setTranslatingTitle] = useState(false);
  const [translatingDesc, setTranslatingDesc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (slide) {
      setTitleRu(slide.titleRu);
      setTitleUz(slide.titleUz);
      setDescRu(slide.descRu);
      setDescUz(slide.descUz);
      setImage(slide.image);
      setUrlInput(slide.image.startsWith("data:") ? "" : slide.image);
      setLink(slide.link || "/catalog");
      setIsActive(slide.isActive);
      setBadge1(slide.badge1 || "");
      setBadge2(slide.badge2 || "");
      setBadge3(slide.badge3 || "");
    } else {
      setTitleRu("");
      setTitleUz("");
      setDescRu("");
      setDescUz("");
      setImage("https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&h=500&fit=crop&auto=format");
      setUrlInput("");
      setLink("/catalog");
      setIsActive(true);
      setBadge1("Оригинал");
      setBadge2("Быстрая доставка");
      setBadge3("Лучшие цены");
    }
  }, [slide, isOpen]);

  if (!isOpen) return null;

  // Handle local file upload via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Пожалуйста, выберите файл изображения (JPG, PNG, WEBP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setImage(result);
        setUrlInput("");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setImage(urlInput.trim());
    }
  };

  const handleTranslateTitle = async () => {
    if (!titleRu.trim()) return;
    setTranslatingTitle(true);
    const res = await translateText(titleRu);
    setTranslatingTitle(false);
    if (res) setTitleUz(res);
  };

  const handleTranslateDesc = async () => {
    if (!descRu.trim()) return;
    setTranslatingDesc(true);
    const res = await translateText(descRu);
    setTranslatingDesc(false);
    if (res) setDescUz(res);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleRu.trim()) {
      alert("Укажите заголовок баннера");
      return;
    }
    if (!image) {
      alert("Добавьте изображение баннера");
      return;
    }

    onSave({
      titleRu: titleRu.trim(),
      titleUz: titleUz.trim() || titleRu.trim(),
      descRu: descRu.trim(),
      descUz: descUz.trim() || descRu.trim(),
      image,
      link: link.trim() || "/catalog",
      isActive,
      badge1: badge1.trim() || undefined,
      badge2: badge2.trim() || undefined,
      badge3: badge3.trim() || undefined,
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
          <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                <span>📸</span> Фотография баннера
              </span>
              <span className="text-[11px] text-gray-500">Рекомендуемый размер: 1200 × 500 px</span>
            </div>

            {/* Upload buttons row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: File from Computer */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-700">
                  Вариант 1: Загрузить файл с компьютера
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
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <span>📁</span>
                  <span>Добавить фотку с компьютера</span>
                </button>
              </div>

              {/* Option 2: Image URL */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-gray-700">
                  Вариант 2: Вставить прямую ссылку на фото (URL)
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
                    + Добавить фотку
                  </button>
                </div>
              </div>
            </div>

            {/* Live Banner Preview */}
            {image && (
              <div className="relative rounded-2xl overflow-hidden border border-gray-300 shadow-sm mt-2" style={{ height: 160 }}>
                <img src={image} alt="Предпросмотр баннера" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex flex-col justify-center p-5 text-white">
                  <div className="text-xs uppercase font-bold tracking-wider text-red-400">Предпросмотр на сайте</div>
                  <div className="text-base sm:text-xl font-bold truncate max-w-md mt-0.5">
                    {titleRu || "Заголовок баннера"}
                  </div>
                  <div className="text-xs text-white/70 truncate max-w-sm mt-1">
                    {descRu || "Краткое описание акции или предложения"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Titles RU & UZ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Заголовок на русском (RU) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={titleRu}
                onChange={(e) => setTitleRu(e.target.value)}
                placeholder="Новое поступление Bosch Professional"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Заголовок на узбекском (UZ)
                </label>
                <button
                  type="button"
                  onClick={handleTranslateTitle}
                  disabled={translatingTitle || !titleRu.trim()}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <span>🌐</span>
                  <span>{translatingTitle ? "Перевод..." : "Google Перевод"}</span>
                </button>
              </div>
              <input
                type="text"
                value={titleUz}
                onChange={(e) => setTitleUz(e.target.value)}
                placeholder="Bosch Professional yangi mahsulotlar"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          {/* Descriptions RU & UZ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Описание акции (RU)
              </label>
              <textarea
                rows={3}
                value={descRu}
                onChange={(e) => setDescRu(e.target.value)}
                placeholder="Официальные поставки профессионального инструмента с гарантией..."
                className="w-full text-xs sm:text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Описание акции (UZ)
                </label>
                <button
                  type="button"
                  onClick={handleTranslateDesc}
                  disabled={translatingDesc || !descRu.trim()}
                  className="text-[11px] text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1"
                >
                  <span>🌐</span>
                  <span>{translatingDesc ? "Перевод..." : "Google Перевод"}</span>
                </button>
              </div>
              <textarea
                rows={3}
                value={descUz}
                onChange={(e) => setDescUz(e.target.value)}
                placeholder="Rasmiy kafolat bilan professional asboblarni yetkazib berish..."
                className="w-full text-xs sm:text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          {/* Link & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ссылка при клике
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/catalog или /brand/bosch"
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Бейдж 1
              </label>
              <input
                type="text"
                value={badge1}
                onChange={(e) => setBadge1(e.target.value)}
                placeholder="Оригинал"
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Бейдж 2
              </label>
              <input
                type="text"
                value={badge2}
                onChange={(e) => setBadge2(e.target.value)}
                placeholder="Быстрая доставка"
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Бейдж 3
              </label>
              <input
                type="text"
                value={badge3}
                onChange={(e) => setBadge3(e.target.value)}
                placeholder="Лучшие цены"
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-xl"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer accent-red-600"
              />
              <span className="text-xs font-semibold text-gray-800">
                Показывать баннер на главной странице сайта
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
