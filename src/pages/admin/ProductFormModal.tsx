import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import type { Product } from "@/data/types";
import { CATEGORIES } from "@/data/categories";
import { useProducts } from "@/context/ProductsContext";
import { slugify } from "@/data/products";
import { translateText } from "@/utils/googleTranslate";
import { matchBrandFuzzy } from "@/utils/brandSearch";
import CustomSelect from "@/components/ui/CustomSelect";
import { uploadMediaFile } from "@/lib/storage";

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
  const { addProduct, updateProduct, brands, addBrand } = useProducts();

  const [activeTab, setActiveTab] = useState<"general" | "media" | "specs" | "seo">("general");

  // Form State
  const [name, setName] = useState("");
  const [nameUz, setNameUz] = useState("");
  const [brand, setBrand] = useState("Makita");
  const [customBrand, setCustomBrand] = useState("");
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [newBrandInput, setNewBrandInput] = useState("");
  const [showAddBrandInline, setShowAddBrandInline] = useState(false);
  const [brandSuccessMsg, setBrandSuccessMsg] = useState("");
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close brand dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(event.target as Node)) {
        setBrandDropdownOpen(false);
      }
    }
    if (brandDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [brandDropdownOpen]);

  // Matching brands using typo-tolerant fuzzy matching
  const matchingBrands = useMemo(() => {
    if (!brandSearchQuery.trim()) return brands;
    return brands.filter((b) => matchBrandFuzzy(b, brandSearchQuery));
  }, [brands, brandSearchQuery]);

  // Handle adding a new brand and syncing across entire website
  const handleCreateNewBrand = (brandName: string) => {
    const trimmed = brandName.trim();
    if (!trimmed) return;
    addBrand(trimmed);
    setBrand(trimmed);
    setBrandSearchQuery("");
    setNewBrandInput("");
    setShowAddBrandInline(false);
    setBrandDropdownOpen(false);
    setBrandSuccessMsg(`Бренд «${trimmed}» сохранен и синхронизирован со всем сайтом!`);
    setTimeout(() => setBrandSuccessMsg(""), 3500);
  };
  const [category, setCategory] = useState("drills");
  const [price, setPrice] = useState<string>("");
  const [oldPrice, setOldPrice] = useState<string>("");
  const [inStock, setInStock] = useState(true);
  const [badge, setBadge] = useState<string>("");
  const [rating, setRating] = useState<number>(5);

  // Images state: array of images (first image is primary on product card)
  const [imagesList, setImagesList] = useState<string[]>([]);
  const [imageInputUrl, setImageInputUrl] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [translatingName, setTranslatingName] = useState(false);
  const [translatingDesc, setTranslatingDesc] = useState(false);

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

      const existingImages = productToEdit.images && productToEdit.images.length > 0
        ? productToEdit.images
        : (productToEdit.image ? [productToEdit.image] : []);
      setImagesList(existingImages.length > 0 ? existingImages : [PRESET_IMAGES[0].url]);
      setImageInputUrl("");

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
      setImagesList([PRESET_IMAGES[0].url]);
      setImageInputUrl("");
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

  // Handle adding image by URL (supports single URL or multiple URLs separated by spaces/newlines/commas)
  const handleAddImageUrl = () => {
    const trimmed = imageInputUrl.trim();
    if (!trimmed) return;

    // Split on whitespace or commas or newlines if multiple URLs were pasted
    const splitUrls = trimmed
      .split(/[\r\n,\s]+/)
      .map((u) => u.trim())
      .filter(Boolean);

    if (splitUrls.length > 0) {
      setImagesList((prev) => [...prev, ...splitUrls]);
      setImageInputUrl("");
    }
  };

  // Handle adding multiple images from local computer files via Supabase Storage (with fallback)
  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map((file) => uploadMediaFile(file, "products"));
      const results = await Promise.all(uploadPromises);
      const urls = results.map((r) => r.url).filter(Boolean);
      setImagesList((prev) => [...prev, ...urls]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Image upload error:", err);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImagesList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSetMainImage = (indexToMakeMain: number) => {
    setImagesList((prev) => {
      const target = prev[indexToMakeMain];
      const rest = prev.filter((_, idx) => idx !== indexToMakeMain);
      return [target, ...rest];
    });
  };

  // Auto-generate slug when name changes (if not manually edited)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!slugManuallyEdited) {
      setSlug(slugify(val));
    }
  };

  // Auto-translate name RU→UZ
  const handleTranslateName = useCallback(async () => {
    if (!name.trim()) return;
    setTranslatingName(true);
    const result = await translateText(name);
    setTranslatingName(false);
    if (result) setNameUz(result);
  }, [name]);

  // Auto-translate description RU→UZ
  const handleTranslateDesc = useCallback(async () => {
    if (!descRu.trim()) return;
    setTranslatingDesc(true);
    const result = await translateText(descRu);
    setTranslatingDesc(false);
    if (result) setDescUz(result);
  }, [descRu]);

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

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (imagesList.length === 0) {
      setError("Пожалуйста, добавьте хотя бы одно фото товара (по ссылке или с компьютера).");
      setActiveTab("media");
      return;
    }

    const effectiveBrand = brand.trim() || (customBrand.trim() || "Makita");
    addBrand(effectiveBrand);

    const specsRecord: Record<string, string> = {};
    specsList.forEach((item) => {
      if (item.key.trim() && item.value.trim()) {
        specsRecord[item.key.trim()] = item.value.trim();
      }
    });

    const parsedOldPrice = oldPrice ? parseInt(oldPrice, 10) : undefined;
    const primaryImage = imagesList[0];

    if (productToEdit) {
      await updateProduct(productToEdit.id, {
        name: name.trim(),
        nameUz: nameUz.trim() || name.trim(),
        brand: effectiveBrand,
        category,
        price: parsedPrice,
        oldPrice: parsedOldPrice,
        inStock,
        badge: badge || undefined,
        rating,
        image: primaryImage,
        images: imagesList,
        descRu: descRu.trim() || `Качественный инструмент ${name.trim()} с официальной гарантией.`,
        descUz: descUz.trim() || `${name.trim()} rasmiy kafolatli sifatli asbob.`,
        slug: slug.trim() || slugify(name.trim()),
        specs: specsRecord,
      });

      onSuccess({
        ...productToEdit,
        name: name.trim(),
        price: parsedPrice,
        image: primaryImage,
        images: imagesList,
        slug: slug.trim() || slugify(name.trim()),
      });
    } else {
      const created = await addProduct({
        name: name.trim(),
        nameUz: nameUz.trim() || name.trim(),
        brand: effectiveBrand,
        category,
        price: parsedPrice,
        oldPrice: parsedOldPrice,
        inStock,
        badge: badge || undefined,
        rating,
        image: primaryImage,
        images: imagesList,
        descRu: descRu.trim() || `Качественный инструмент ${name.trim()} с официальной гарантией.`,
        descUz: descUz.trim() || `${name.trim()} rasmiy kafolatli sifatli asbob.`,
        slug: slug.trim() || slugify(name.trim()),
        type: "corded",
        specs: specsRecord,
      });

      if (created) onSuccess(created);
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
                  Название товара <span className="text-red-500">*</span>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Brand Selector with Fuzzy Search & New Brand Addition */}
                <div ref={brandDropdownRef} className="relative">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Бренд производителя <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddBrandInline((prev) => !prev);
                        setBrandDropdownOpen(true);
                      }}
                      className="text-[11px] text-red-600 hover:text-red-700 font-bold cursor-pointer hover:underline"
                    >
                      + Добавить бренд
                    </button>
                  </div>

                  {/* Brand Display Trigger */}
                  <div
                    onClick={() => setBrandDropdownOpen((prev) => !prev)}
                    className="w-full text-sm px-3.5 py-2.5 border border-gray-200 hover:border-red-400 rounded-xl bg-white flex items-center justify-between cursor-pointer shadow-2xs transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
                      <span className="font-bold text-gray-900 truncate">{brand || "Выберите бренд"}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                        brandDropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Success notification if brand was just created */}
                  {brandSuccessMsg && (
                    <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] rounded-lg font-medium animate-fadeIn flex items-center gap-1.5">
                      <span>✓</span>
                      <span>{brandSuccessMsg}</span>
                    </div>
                  )}

                  {/* Dropdown Menu */}
                  {brandDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-3 space-y-2.5 animate-fadeIn">
                      {/* Search Bar inside dropdown */}
                      <div className="relative">
                        <input
                          type="text"
                          value={brandSearchQuery}
                          onChange={(e) => setBrandSearchQuery(e.target.value)}
                          placeholder="Поиск бренда (напр. Bosch, Sparta)..."
                          autoFocus
                          className="w-full text-xs pl-8 pr-7 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/70 focus:bg-white transition-colors"
                        />
                        <svg
                          className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {brandSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setBrandSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs font-bold cursor-pointer"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      {/* Inline Add Brand Input */}
                      {(showAddBrandInline || (brandSearchQuery.trim() && !brands.some((b) => b.toLowerCase() === brandSearchQuery.trim().toLowerCase()))) && (
                        <div className="p-2.5 bg-red-50/60 rounded-xl border border-red-200/80 space-y-1.5">
                          <div className="text-[11px] font-bold text-gray-800">
                            Добавить новый бренд в систему:
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newBrandInput || brandSearchQuery}
                              onChange={(e) => setNewBrandInput(e.target.value)}
                              placeholder="Название нового бренда..."
                              className="flex-1 text-xs px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-red-500"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleCreateNewBrand(newBrandInput || brandSearchQuery);
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleCreateNewBrand(newBrandInput || brandSearchQuery)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-xs shrink-0"
                            >
                              + Сохранить
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Brand List */}
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                        {matchingBrands.length === 0 ? (
                          <div className="py-3 text-center text-xs text-gray-500">
                            <div>Бренд не найден</div>
                            {brandSearchQuery && (
                              <button
                                type="button"
                                onClick={() => handleCreateNewBrand(brandSearchQuery)}
                                className="mt-1.5 inline-flex items-center gap-1 text-red-600 hover:underline font-bold cursor-pointer"
                              >
                                <span>+ Добавить «{brandSearchQuery}» во все фильтры сайта</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          matchingBrands.map((b) => {
                            const isSelected = brand === b;
                            return (
                              <button
                                key={b}
                                type="button"
                                onClick={() => {
                                  setBrand(b);
                                  setBrandDropdownOpen(false);
                                  setBrandSearchQuery("");
                                }}
                                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                  isSelected
                                    ? "bg-red-600 text-white font-bold shadow-xs"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                }`}
                              >
                                <span>{b}</span>
                                {isSelected && <span>✓</span>}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Категория каталога
                  </label>
                  <CustomSelect
                    value={category}
                    onChange={(val) => setCategory(val)}
                    options={CATEGORIES.map((c) => ({
                      value: c.key,
                      label: c.labelRu,
                      icon: c.icon,
                    }))}
                  />
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
                  <CustomSelect
                    value={badge}
                    onChange={(val) => setBadge(val)}
                    options={[
                      { value: "", label: "Без бейджа" },
                      { value: "Хит", label: "Хит продаж", icon: "🔥" },
                      { value: "Новинка", label: "Новинка", icon: "✨" },
                      { value: "Скидка", label: "Акция / Скидка", icon: "🏷️" },
                    ]}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Рейтинг (1-5)
                  </label>
                  <CustomSelect
                    value={rating}
                    onChange={(val) => setRating(val)}
                    options={[
                      { value: 5, label: "★★★★★ (5.0)" },
                      { value: 4, label: "★★★★☆ (4.0)" },
                      { value: 3, label: "★★★☆☆ (3.0)" },
                    ]}
                  />
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
            <div className="space-y-6">
              {/* Image Upload & Management Box */}
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <span>🖼️</span> Фотографии товара ({imagesList.length} шт.)
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-200 w-fit">
                    Идеально для карточек: 800 × 800 px (1:1 квадрат)
                  </span>
                </div>

                {/* Recommendation info callout */}
                <div className="bg-amber-50/90 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs flex items-start gap-2.5">
                  <span className="text-base shrink-0">💡</span>
                  <div className="leading-relaxed">
                    <span className="font-bold">Рекомендуемый размер для карточек и галереи товара:</span>{" "}
                    <strong className="text-amber-950 font-extrabold underline decoration-amber-500">800 × 800 px</strong> (или 1000 × 1000 px, пропорция 1:1, квадрат).
                    <div className="text-[11px] text-amber-800 mt-1 space-y-0.5">
                      <p>• <strong>Первое фото</strong> в списке отображается на карточке товара в каталоге и на главной.</p>
                      <p>• <strong>Остальные фото</strong> покупатели смогут листать в галерее на странице товара при клике.</p>
                      <p>• Квадратные изображения на белом или нейтральном фоне идеально центрируются без обрезки.</p>
                    </div>
                  </div>
                </div>

                {/* Upload Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option 1: Files from computer */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                    <label className="block text-xs font-bold text-gray-800">
                      Вариант 1: Выбрать фото с компьютера
                    </label>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleUploadFiles}
                      multiple
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingImages}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-2.5 px-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {uploadingImages ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Загрузка фото в облако...</span>
                        </>
                      ) : (
                        <>
                          <span>📁</span>
                          <span>Добавить фотку с компьютера (выбрать файлы)</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-gray-400 text-center">
                      Можно выбрать сразу несколько фото с компьютера (JPG, PNG, WEBP)
                    </p>
                  </div>

                  {/* Option 2: Image URL */}
                  <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                    <label className="block text-xs font-bold text-gray-800">
                      Вариант 2: Добавить фото по прямой ссылке (URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Вставьте ссылку или несколько ссылок (через пробел)..."
                        value={imageInputUrl}
                        onChange={(e) => setImageInputUrl(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImageUrl();
                          }
                        }}
                        className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={handleAddImageUrl}
                        className="bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer shrink-0"
                      >
                        + Добавить фотку
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Можно вставить одну или несколько ссылок и нажать «+ Добавить фотку»
                    </p>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-xs text-gray-400 font-medium">Быстрые шаблоны фото:</span>
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setImagesList((prev) => [...prev, preset.url])}
                      className="text-xs bg-white hover:bg-red-50 hover:text-red-600 text-gray-700 px-2.5 py-1 rounded-lg transition-colors border border-gray-200 shadow-2xs cursor-pointer"
                      title="Нажмите, чтобы добавить в галерею"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>

                {/* Gallery of Uploaded Images */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-xs font-bold text-gray-700 mb-2">
                    Галерея фотографий товара:
                  </div>

                  {imagesList.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400 bg-white rounded-xl border border-dashed border-gray-300">
                      Фотографии пока не добавлены. Загрузите фото с компьютера или укажите ссылку выше.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {imagesList.map((imgUrl, idx) => {
                        const isPrimary = idx === 0;
                        return (
                          <div
                            key={idx}
                            className={`relative bg-white rounded-2xl border p-2 flex flex-col items-center gap-2 group transition-all ${
                              isPrimary
                                ? "border-red-500 shadow-xs ring-1 ring-red-500/30"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {/* Primary or Secondary Badge */}
                            <div className="w-full flex items-center justify-between text-[10px]">
                              {isPrimary ? (
                                <span className="bg-red-600 text-white font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                  ⭐ Главное фото
                                </span>
                              ) : (
                                <span className="text-gray-400 font-medium px-1">
                                  Фото #{idx + 1}
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="w-5 h-5 rounded-full bg-gray-100 hover:bg-red-100 text-gray-400 hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                                title="Удалить фото"
                              >
                                ✕
                              </button>
                            </div>

                            {/* Thumbnail image */}
                            <div className="w-full h-28 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-100">
                              <img
                                src={imgUrl}
                                alt={`Фото ${idx + 1}`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = PRESET_IMAGES[0].url;
                                }}
                              />
                            </div>

                            {/* Set as Primary Button if not already primary */}
                            {!isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(idx)}
                                className="w-full py-1 text-[11px] font-semibold text-gray-600 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors border border-gray-200 cursor-pointer"
                              >
                                Сделать главным
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Описание товара
                </label>
                <textarea
                  rows={4}
                  placeholder="Подробное описание назначения, комплектации и преимуществ инструмента..."
                  value={descRu}
                  onChange={(e) => {
                    setDescRu(e.target.value);
                    setDescUz(e.target.value);
                  }}
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
                    https://mini-mall.uz/product/
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
                  https://mini-mall.uz &gt; product &gt; {slug || "primer-tovara"}
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
