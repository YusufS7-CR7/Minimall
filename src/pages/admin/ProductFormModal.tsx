import { useState, useEffect } from "react";
import type { Product } from "@/data/types";
import { CATEGORIES } from "@/data/categories";
import { useProducts } from "@/context/ProductsContext";
import { slugify } from "@/data/products";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onSuccess: (savedProduct: Product) => void;
}

const PRESET_IMAGES = [
  {
    label: "Дрель / Шуруповёрт",
    url: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=600&fit=crop&auto=format",
  },
  {
    label: "Болгарка / Шлифмашина",
    url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&h=600&fit=crop&auto=format",
  },
  {
    label: "Перфоратор",
    url: "https://images.unsplash.com/photo-1530124566582-a45a7e3e29f0?w=600&h=600&fit=crop&auto=format",
  },
  {
    label: "Пила / Лобзик",
    url: "https://images.unsplash.com/photo-1504382103100-db7e92322d95?w=600&h=600&fit=crop&auto=format",
  },
  {
    label: "Лазер / Измеритель",
    url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop&auto=format",
  },
];

export default function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  onSuccess,
}: ProductFormModalProps) {
  const { addProduct, updateProduct, brands } = useProducts();

  const [activeTab, setActiveTab] = useState<"general" | "media" | "specs" | "seo">("general");

  // Form State
  const [name, setName] = useState("");
  const [nameUz, setNameUz] = useState("");
  const [brand, setBrand] = useState("Makita");
  const [customBrand, setCustomBrand] = useState("");
  const [category, setCategory] = useState("drills");
  const [price, setPrice] = useState<string>("");
  const [oldPrice, setOldPrice] = useState<string>("");
  const [inStock, setInStock] = useState(true);
  const [badge, setBadge] = useState<string>("");
  const [rating, setRating] = useState<number>(5);

  const [image, setImage] = useState("");
  const [descRu, setDescRu] = useState("");
  const [descUz, setDescUz] = useState("");

  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Specs state: array of { key, value }
  const [specsList, setSpecsList] = useState<{ key: string; value: string }[]>([
    { key: "Мощность", value: "750 Вт" },
    { key: "Вес", value: "2.1 кг" },
  ]);

  const [error, setError] = useState<string | null>(null);

  // Initialize form when opening or changing productToEdit
  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setNameUz(productToEdit.nameUz || productToEdit.name);
      setBrand(productToEdit.brand);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price.toString());
      setOldPrice(productToEdit.oldPrice ? productToEdit.oldPrice.toString() : "");
      setInStock(productToEdit.inStock);
      setBadge(productToEdit.badge || "");
      setRating(productToEdit.rating || 5);
      setImage(productToEdit.image);
      setDescRu(productToEdit.descRu || "");
      setDescUz(productToEdit.descUz || "");
      setSlug(productToEdit.slug);
      setSlugManuallyEdited(true);

      const parsedSpecs = Object.entries(productToEdit.specs || {}).map(([k, v]) => ({
        key: k,
        value: v,
      }));
      setSpecsList(parsedSpecs.length > 0 ? parsedSpecs : [{ key: "", value: "" }]);
    } else {
      // Defaults for new product
      setName("");
      setNameUz("");
      setBrand("Makita");
      setCustomBrand("");
      setCategory("drills");
      setPrice("");
      setOldPrice("");
      setInStock(true);
      setBadge("");
      setRating(5);
      setImage(PRESET_IMAGES[0].url);
      setDescRu("");
      setDescUz("");
      setSlug("");
      setSlugManuallyEdited(false);
      setSpecsList([
        { key: "Мощность", value: "" },
        { key: "Вес", value: "" },
      ]);
    }
    setError(null);
    setActiveTab("general");
  }, [productToEdit, isOpen]);

  // Auto-generate slug when name changes (if not manually edited)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  const handleAddSpec = () => {
    setSpecsList([...specsList, { key: "", value: "" }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecsList(specsList.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx: number, field: "key" | "value", val: string) => {
    const updated = [...specsList];
    updated[idx][field] = val;
    setSpecsList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedPrice = parseInt(price, 10);
    if (!name.trim()) {
      setError("Пожалуйста, укажите название товара на русском языке.");
      setActiveTab("general");
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Пожалуйста, укажите корректную стоимость товара в сумах.");
      setActiveTab("general");
      return;
    }
    if (!image.trim()) {
      setError("Пожалуйста, укажите URL изображения товара.");
      setActiveTab("media");
      return;
    }

    const effectiveBrand = brand === "__custom__" ? (customBrand.trim() || "Прочее") : brand;

    const specsRecord: Record<string, string> = {};
    specsList.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        specsRecord[item.key.trim()] = item.value.trim();
      }
    });

    const parsedOldPrice = oldPrice ? parseInt(oldPrice, 10) : undefined;

    if (productToEdit) {
      updateProduct(productToEdit.id, {
        name: name.trim(),
        nameUz: nameUz.trim() || name.trim(),
        brand: effectiveBrand,
        category,
        price: parsedPrice,
        oldPrice: parsedOldPrice,
        inStock,
        badge: badge || undefined,
        rating,
        image: image.trim(),
        images: [image.trim()],
        descRu: descRu.trim() || `Качественный инструмент ${name.trim()} с официальной гарантией.`,
        descUz: descUz.trim() || `${name.trim()} rasmiy kafolatli sifatli asbob.`,
        slug: slug.trim() || slugify(name.trim()),
        specs: specsRecord,
      });

      onSuccess({
        ...productToEdit,
        name: name.trim(),
        price: parsedPrice,
        slug: slug.trim() || slugify(name.trim()),
      });
    } else {
      const created = addProduct({
        name: name.trim(),
        nameUz: nameUz.trim() || name.trim(),
        brand: effectiveBrand,
        category,
        price: parsedPrice,
        oldPrice: parsedOldPrice,
        inStock,
        badge: badge || undefined,
        rating,
        image: image.trim(),
        images: [image.trim()],
        descRu: descRu.trim() || `Качественный инструмент ${name.trim()} с официальной гарантией.`,
        descUz: descUz.trim() || `${name.trim()} rasmiy kafolatli sifatli asbob.`,
        slug: slug.trim() || slugify(name.trim()),
        type: "corded",
        specs: specsRecord,
      });

      onSuccess(created);
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between border-b border-gray-800 shrink-0">
          <div>
            <h2
              className="text-xl font-bold tracking-wide"
              style={{ fontFamily: "Barlow Condensed, sans-serif" }}
            >
              {productToEdit ? "Редактирование товара" : "Добавить новый товар"}
            </h2>
            <p className="text-xs text-gray-400">
              {productToEdit
                ? `ID: #${productToEdit.id} | ${productToEdit.slug}`
                : "Заполните данные для публикации товара в каталоге Minimall"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-100 px-6 bg-gray-50/70 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "general"
                ? "border-red-600 text-red-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            1. Основная информация
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "media"
                ? "border-red-600 text-red-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            2. Фото и описание
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "specs"
                ? "border-red-600 text-red-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            3. Характеристики
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
              activeTab === "seo"
                ? "border-red-600 text-red-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            4. SEO & URL
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
          {error && (
            <div className="mb-4 bg-red-50 text-red-700 border border-red-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: General */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Название товара (RU) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="например: Ударная дрель Makita HP1630"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Название товара (UZ)
                </label>
                <input
                  type="text"
                  placeholder="masalan: Makita HP1630 zarbli burg'u"
                  value={nameUz}
                  onChange={(e) => setNameUz(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Бренд производителя
                  </label>
                  <select
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-white"
                  >
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                    <option value="__custom__">+ Другой бренд (ввести вручную)</option>
                  </select>
                  {brand === "__custom__" && (
                    <input
                      type="text"
                      placeholder="Название нового бренда"
                      value={customBrand}
                      onChange={(e) => setCustomBrand(e.target.value)}
                      className="mt-2 w-full text-sm px-3.5 py-2 border border-red-200 rounded-xl focus:outline-none focus:border-red-500"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Категория каталога
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.labelRu} ({c.labelUz})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Цена в сумах <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="850000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">
                      UZS
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Старая цена (для показа скидки)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="1050000"
                      value={oldPrice}
                      onChange={(e) => setOldPrice(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-medium">
                      UZS
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Бейдж на карточке
                  </label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-white"
                  >
                    <option value="">Без бейджа</option>
                    <option value="Хит">Хит продаж</option>
                    <option value="Новинка">Новинка</option>
                    <option value="Скидка">Акция / Скидка</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Рейтинг (1-5)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value, 10))}
                    className="w-full text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-white"
                  >
                    <option value={5}>★★★★★ (5)</option>
                    <option value={4}>★★★★☆ (4)</option>
                    <option value={3}>★★★☆☆ (3)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={inStock}
                      onChange={(e) => setInStock(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500"
                    />
                    <span className="text-xs font-semibold text-gray-800">
                      В наличии на складе
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Media & Description */}
          {activeTab === "media" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL изображения <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 mb-2"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className="text-xs text-gray-400 font-medium">Быстрый выбор фото:</span>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImage(preset.url)}
                      className="text-xs bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700 px-2.5 py-1 rounded-lg transition-colors border border-gray-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Live Preview */}
                {image && (
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <img
                      src={image}
                      alt="Превью товара"
                      className="w-20 h-20 object-contain rounded-xl border border-gray-200 bg-white"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = PRESET_IMAGES[0].url;
                      }}
                    />
                    <div className="text-xs text-gray-500">
                      <p className="font-semibold text-gray-800">Предпросмотр фото</p>
                      <p className="text-gray-400">Изображение будет отображаться в карточке и галерее товара</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Описание на русском языке (RU)
                </label>
                <textarea
                  rows={3}
                  placeholder="Подробное описание назначения, комплектации и преимуществ инструмента..."
                  value={descRu}
                  onChange={(e) => setDescRu(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Описание на узбекском языке (UZ)
                </label>
                <textarea
                  rows={3}
                  placeholder="Asbobning maqsadi, to'plami va afzalliklari haqida batafsil tavsif..."
                  value={descUz}
                  onChange={(e) => setDescUz(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: Specs */}
          {activeTab === "specs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Технические характеристики
                  </h3>
                  <p className="text-xs text-gray-400">
                    Добавьте ключевые параметры (Мощность, Обороты, Вес, Тип патрона и т.д.)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                >
                  + Добавить параметр
                </button>
              </div>

              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                {specsList.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Параметр (напр. Крутящий момент)"
                      value={spec.key}
                      onChange={(e) => handleSpecChange(idx, "key", e.target.value)}
                      className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                    />
                    <input
                      type="text"
                      placeholder="Значение (напр. 55 Нм)"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(idx, "value", e.target.value)}
                      className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
                      title="Удалить строку"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SEO & URL */}
          {activeTab === "seo" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  URL Slug (адрес страницы товара)
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 font-mono">
                    https://minimall.uz/product/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    placeholder="makita-hp1630"
                    className="flex-1 text-sm font-mono px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Генерируется автоматически из названия товара. Пользователи смогут находить этот товар в Google именно по этому URL.
                </p>
              </div>

              {/* Google Search Snippet Preview */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-white mt-4 shadow-xs">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Предпросмотр сниппета в Google:
                </p>
                <div className="text-xs text-gray-600 mb-1 font-mono">
                  https://minimall.uz &gt; product &gt; {slug || "primer-tovara"}
                </div>
                <div className="text-blue-700 hover:underline text-base font-medium cursor-pointer line-clamp-1">
                  {name || "Название товара"} — купить в Ташкенте | Minimall
                </div>
                <div className="text-gray-600 text-xs mt-1 line-clamp-2">
                  {descRu ||
                    "Купить профессиональный инструмент в Ташкенте с официальной гарантией и оперативной доставкой по всему Узбекистану."}
                </div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="border-t border-gray-100 pt-4 mt-6 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 text-sm font-semibold transition-colors"
            >
              Отмена
            </button>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-md shadow-red-600/20"
              >
                {productToEdit ? "Сохранить изменения" : "Опубликовать товар"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
