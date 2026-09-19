import { useState, useMemo, useRef } from "react";
import { uploadMediaFile } from "@/lib/storage";
import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";
import { useApp } from "@/context/AppContext";
import { ADMIN_TRANSLATIONS } from "@/data/adminTranslations";
import type { CategoryDef, SubcategoryDef } from "@/data/types";

const DEFAULT_EMOJIS = [
  "🔌", "🌿", "🏠", "💧", "🔧", "💡", "⚡", "🔩", "🪚", "🧰", "🚜", "📐", "🚗", "📦", "🏢",
  "🛠️", "🔨", "🪓", "🧱", "⚙️", "🔋", "🔦", "🦺", "🥽", "🧤", "🪜", "🪣", "🧲", "🏷️", "📏",
];

const SUGGESTED_EMOJIS = [
  "🪛", "⛏️", "🎨", "🧹", "🧺", "🧯", "🔒", "🔑", "🚛", "🚚",
  "🪵", "🎯", "💎", "⭐", "🔥", "🛡️", "🏷️", "🧤", "🥽", "🦺",
  "🪜", "🪣", "🧲", "🧱", "⚙️", "🔋", "🔦", "🛠️", "🔨", "🪓",
];

export default function AdminCategoriesPage() {
  const {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    resetCategories,
  } = useCategories();

  const { products } = useProducts();
  const { showToast, lang } = useApp();
  const t = ADMIN_TRANSLATIONS[lang].categories;

  const [search, setSearch] = useState("");
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategoryKey, setEditingCategoryKey] = useState<string | null>(null);
  const [catForm, setCatForm] = useState({
    labelRu: "",
    labelUz: "",
    slug: "",
    key: "",
    icon: "🔌",
    image: "",
  });

  // Custom Emojis State
  const [customEmojis, setCustomEmojis] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("minimall_category_emojis");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_EMOJIS;
  });
  const [isAddingEmoji, setIsAddingEmoji] = useState(false);
  const [newEmojiInput, setNewEmojiInput] = useState("");

  // Image upload state for category modal
  const [catImageUploading, setCatImageUploading] = useState(false);
  const [catImageDragging, setCatImageDragging] = useState(false);
  const [catImageShowUrl, setCatImageShowUrl] = useState(false);
  const catImageInputRef = useRef<HTMLInputElement>(null);

  const handleAddEmoji = () => {
    const trimmed = newEmojiInput.trim();
    if (!trimmed) return;

    if (!customEmojis.includes(trimmed)) {
      const updated = [trimmed, ...customEmojis];
      setCustomEmojis(updated);
      try {
        localStorage.setItem("minimall_category_emojis", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save emojis to localStorage", err);
      }
    }

    setCatForm((prev) => ({ ...prev, icon: trimmed }));
    setNewEmojiInput("");
    setIsAddingEmoji(false);
    showToast(lang === "uz" ? `Smaylik «${trimmed}» qo'shildi va tanlandi!` : `Смайлик «${trimmed}» добавлен и выбран!`);
  };

  const handleAddSpecificEmoji = (emoji: string) => {
    if (!customEmojis.includes(emoji)) {
      const updated = [emoji, ...customEmojis];
      setCustomEmojis(updated);
      try {
        localStorage.setItem("minimall_category_emojis", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save emojis to localStorage", err);
      }
    }
    setCatForm((prev) => ({ ...prev, icon: emoji }));
    setIsAddingEmoji(false);
    showToast(lang === "uz" ? `Smaylik «${emoji}» qo'shildi va tanlandi!` : `Смайлик «${emoji}» добавлен и выбран!`);
  };

  // Subcategory Modal State
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [targetCatKey, setTargetCatKey] = useState<string | null>(null);
  const [editingSubKey, setEditingSubKey] = useState<string | null>(null);
  const [subForm, setSubForm] = useState({
    labelRu: "",
    labelUz: "",
    slug: "",
    key: "",
  });

  // Count products by category and subcategory
  const productsByCat = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      const cats = (p.categories && p.categories.length > 0)
        ? p.categories
        : (p.category ? [p.category] : []);
      cats.forEach((cKey) => {
        map.set(cKey, (map.get(cKey) || 0) + 1);
      });
    });
    return map;
  }, [products]);

  const productsBySub = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach((p) => {
      if (p.subcategory) {
        const cats = (p.categories && p.categories.length > 0)
          ? p.categories
          : (p.category ? [p.category] : []);
        cats.forEach((cKey) => {
          const fullKey = `${cKey}::${p.subcategory}`;
          map.set(fullKey, (map.get(fullKey) || 0) + 1);
        });
      }
    });
    return map;
  }, [products]);

  const totalSubcategories = useMemo(() => {
    return categories.reduce((sum, c) => sum + (c.subcategories?.length || 0), 0);
  }, [categories]);

  // Toggle Category Expand
  const toggleExpand = (key: string) => {
    setExpandedCats((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    categories.forEach((c) => (next[c.key] = true));
    setExpandedCats(next);
  };

  const collapseAll = () => {
    setExpandedCats({});
  };

  // Filter categories
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase().trim();
    return categories.filter((c) => {
      const matchCat =
        c.labelRu.toLowerCase().includes(q) ||
        c.labelUz.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.key.toLowerCase().includes(q);
      const matchSub = c.subcategories?.some(
        (s) =>
          s.labelRu.toLowerCase().includes(q) ||
          s.labelUz.toLowerCase().includes(q) ||
          s.slug.toLowerCase().includes(q)
      );
      return matchCat || matchSub;
    });
  }, [categories, search]);

  // Helper to slugify
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яё_-]/gi, "-")
      .replace(/[а-яё]/gi, (c) => {
        const ruMap: Record<string, string> = {
          а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
          з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
          п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
          ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya"
        };
        return ruMap[c.toLowerCase()] || c;
      })
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  // Open Create Category Modal
  const handleOpenCreateCategory = () => {
    setEditingCategoryKey(null);
    setCatForm({
      labelRu: "",
      labelUz: "",
      slug: "",
      key: "",
      icon: "🔌",
      image: "",
    });
    setCatImageUploading(false);
    setCatImageDragging(false);
    setCatImageShowUrl(false);
    setCatModalOpen(true);
  };

  // Open Edit Category Modal
  const handleOpenEditCategory = (cat: CategoryDef) => {
    setEditingCategoryKey(cat.key);
    setCatForm({
      labelRu: cat.labelRu,
      labelUz: cat.labelUz,
      slug: cat.slug,
      key: cat.key,
      icon: cat.icon,
      image: cat.image,
    });
    setCatImageUploading(false);
    setCatImageDragging(false);
    setCatImageShowUrl(false);
    setCatModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.labelRu.trim()) {
      showToast(lang === "uz" ? "Kategoriya nomini kiriting" : "Укажите название категории на русском");
      return;
    }

    const finalSlug = (catForm.slug || generateSlug(catForm.labelRu)).trim();
    const finalKey = (catForm.key || finalSlug).trim();

    if (editingCategoryKey) {
      await updateCategory(editingCategoryKey, {
        labelRu: catForm.labelRu.trim(),
        labelUz: (catForm.labelUz || catForm.labelRu).trim(),
        slug: finalSlug,
        icon: catForm.icon.trim() || "📦",
        image: catForm.image.trim(),
      });
      showToast(lang === "uz" ? "Kategoriya muvaffaqiyatli yangilandi" : "Категория успешно обновлена");
    } else {
      await addCategory({
        key: finalKey,
        slug: finalSlug,
        labelRu: catForm.labelRu.trim(),
        labelUz: (catForm.labelUz || catForm.labelRu).trim(),
        icon: catForm.icon.trim() || "📦",
        image: catForm.image.trim(),
        subcategories: [],
      });
      showToast(lang === "uz" ? "Yangi kategoriya yaratildi va sinxronlandi" : "Новая категория создана и синхронизирована");
    }
    setCatModalOpen(false);
  };

  // Delete Category
  const handleDeleteCategory = async (cat: CategoryDef) => {
    const count = productsByCat.get(cat.key) || 0;
    const catName = lang === "uz" && cat.labelUz ? cat.labelUz : cat.labelRu;
    if (count > 0) {
      if (
        !window.confirm(
          lang === "uz"
            ? `Diqqat! «${catName}» toifasida ${count} ta mahsulot mavjud. Baribir o'chirasizmi?`
            : `Внимание! В категории «${cat.labelRu}» находится ${count} товаров. Удалить категорию всё равно?`
        )
      ) {
        return;
      }
    } else {
      if (
        !window.confirm(
          lang === "uz"
            ? `«${catName}» toifasi va uning barcha kichik toifalarini o'chirishni tasdiqlaysizmi?`
            : `Удалить категорию «${cat.labelRu}» и все её подкатегории?`
        )
      ) {
        return;
      }
    }
    await deleteCategory(cat.key);
    showToast(
      lang === "uz"
        ? `«${catName}» toifasi o'chirildi`
        : `Категория «${cat.labelRu}» удалена`
    );
  };

  // Open Create Subcategory Modal
  const handleOpenCreateSub = (catKey: string) => {
    setTargetCatKey(catKey);
    setEditingSubKey(null);
    setSubForm({
      labelRu: "",
      labelUz: "",
      slug: "",
      key: "",
    });
    setSubModalOpen(true);
  };

  // Open Edit Subcategory Modal
  const handleOpenEditSub = (catKey: string, sub: SubcategoryDef) => {
    setTargetCatKey(catKey);
    setEditingSubKey(sub.key);
    setSubForm({
      labelRu: sub.labelRu,
      labelUz: sub.labelUz,
      slug: sub.slug,
      key: sub.key,
    });
    setSubModalOpen(true);
  };

  // Save Subcategory
  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCatKey) return;
    if (!subForm.labelRu.trim()) {
      showToast(lang === "uz" ? "Kichik toifa nomini kiriting" : "Укажите название подкатегории");
      return;
    }

    const finalSlug = (subForm.slug || generateSlug(subForm.labelRu)).trim();
    const finalKey = (subForm.key || finalSlug).trim();

    if (editingSubKey) {
      await updateSubcategory(targetCatKey, editingSubKey, {
        labelRu: subForm.labelRu.trim(),
        labelUz: (subForm.labelUz || subForm.labelRu).trim(),
        slug: finalSlug,
      });
      showToast(lang === "uz" ? "Kichik toifa muvaffaqiyatli yangilandi" : "Подкатегория успешно обновлена");
    } else {
      await addSubcategory(targetCatKey, {
        key: finalKey,
        slug: finalSlug,
        labelRu: subForm.labelRu.trim(),
        labelUz: (subForm.labelUz || subForm.labelRu).trim(),
      });
      showToast(lang === "uz" ? "Kichik toifa muvaffaqiyatli qo'shildi" : "Подкатегория успешно добавлена");
      // Auto expand parent
      setExpandedCats((prev) => ({ ...prev, [targetCatKey]: true }));
    }
    setSubModalOpen(false);
  };

  // Delete Subcategory
  const handleDeleteSub = async (catKey: string, sub: SubcategoryDef) => {
    const fullKey = `${catKey}::${sub.key}`;
    const count = productsBySub.get(fullKey) || 0;
    const subName = lang === "uz" && sub.labelUz ? sub.labelUz : sub.labelRu;
    if (count > 0) {
      if (
        !window.confirm(
          lang === "uz"
            ? `«${subName}» kichik toifasida ${count} ta mahsulot bor. O'chirilsinmi?`
            : `В подкатегории «${sub.labelRu}» есть ${count} товаров. Удалить подкатегорию?`
        )
      ) {
        return;
      }
    } else {
      if (
        !window.confirm(
          lang === "uz"
            ? `«${subName}» kichik toifasini o'chirishni tasdiqlaysizmi?`
            : `Удалить подкатегорию «${sub.labelRu}»?`
        )
      ) {
        return;
      }
    }
    await deleteSubcategory(catKey, sub.key);
    showToast(
      lang === "uz"
        ? `«${subName}» kichik toifasi o'chirildi`
        : `Подкатегория «${sub.labelRu}» удалена`
    );
  };

  // Reset to default
  const handleReset = async () => {
    if (
      window.confirm(
        lang === "uz"
          ? "Kategoriyalar va kichik toifalar tuzilmasini Minimall standart sozlamalariga qaytarasizmi? Siz qo'shgan toifalar standart toifalar bilan almashtiriladi."
          : "Сбросить структуру категорий и подкатегорий к исходным настройкам Minimall? Ваши добавленные категории будут заменены стандартными."
      )
    ) {
      await resetCategories();
      showToast(lang === "uz" ? "Kategoriyalar standart holatga qaytarildi" : "Категории возвращены к стандартным");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
            <span>🗂️</span>
            <span>{lang === "uz" ? "Katalog va Tuzilma" : "Каталог и Структура"}</span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {t.title}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            {t.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="bg-red-50 text-red-700 font-bold px-3 py-1 rounded-full border border-red-100">
              {lang === "uz" ? `Toifalar: ${categories.length}` : `Категорий: ${categories.length}`}
            </span>
            <span className="bg-gray-100 text-gray-700 font-bold px-3 py-1 rounded-full">
              {lang === "uz" ? `Kichik toifalar: ${totalSubcategories}` : `Подкатегорий: ${totalSubcategories}`}
            </span>
            <span className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-100">
              {lang === "uz" ? `Tovarlar: ${products.length}` : `Товаров: ${products.length}`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={handleOpenCreateCategory}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-2xl shadow-md shadow-red-600/20 text-xs sm:text-sm transition-all cursor-pointer"
          >
            <span>➕</span>
            <span>{t.addBtn}</span>
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2.5 rounded-2xl text-xs transition-colors cursor-pointer"
            title={lang === "uz" ? "Toifalar tuzilmasini standart holatga qaytarish" : "Вернуть структуру категорий по умолчанию"}
          >
            <span>🔄</span>
            <span>{lang === "uz" ? "Qayta sozlash" : "Сброс"}</span>
          </button>
        </div>
      </div>

      {/* Filter and Expand controls */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-red-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end text-xs">
          <button
            onClick={expandAll}
            className="px-3 py-1.5 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            {t.expandAll}
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={collapseAll}
            className="px-3 py-1.5 text-gray-600 hover:text-gray-900 font-medium hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            {t.collapseAll}
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 text-gray-500">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-bold text-gray-800 text-base">
              {lang === "uz" ? "Toifalar topilmadi" : "Категории не найдены"}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {lang === "uz" ? "Qidiruv so'zini o'zgartirib ko'ring" : "Попробуйте изменить поисковый запрос"}
            </p>
          </div>
        ) : (
          filteredCategories.map((cat) => {
            const isExpanded = !!expandedCats[cat.key];
            const subs = cat.subcategories || [];
            const prodCount = productsByCat.get(cat.key) || 0;
            const primaryLabel = lang === "uz" && cat.labelUz ? cat.labelUz : cat.labelRu;
            const secondaryLabel = lang === "uz" ? cat.labelRu : (cat.labelUz || cat.labelRu);

            return (
              <div
                key={cat.key}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
              >
                {/* Category Main Row */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
                  {/* Left: icon, thumbnail, names */}
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleExpand(cat.key)}
                      className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold transition-colors shrink-0 cursor-pointer"
                      title={isExpanded ? t.collapseAll : t.expandAll}
                    >
                      {isExpanded ? "▼" : "▶"}
                    </button>

                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0 overflow-hidden relative">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={primaryLabel}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : null}
                      <span className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90">
                        {!cat.image && cat.icon}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base">{cat.icon}</span>
                        <h3 className="font-extrabold text-gray-900 text-base tracking-tight truncate">
                          {primaryLabel}
                        </h3>
                        <span className="text-xs text-gray-400 font-medium truncate">
                          / {secondaryLabel}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-500 font-mono">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                          slug: <strong className="text-gray-800">/catalog/{cat.slug}</strong>
                        </span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md">
                          key: <strong className="text-gray-800">{cat.key}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: stats & actions */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0 w-full lg:w-auto justify-between lg:justify-start pt-3 border-t border-gray-100 lg:border-t-0 lg:pt-0 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-xl border border-blue-100">
                        {subs.length} {lang === "uz" ? "ta kichik toifa" : "подкатегорий"}
                      </span>
                      <span className="bg-gray-100 text-gray-700 font-semibold px-2.5 py-1 rounded-xl">
                        {prodCount} {lang === "uz" ? "ta tovar" : "товаров"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => handleOpenCreateSub(cat.key)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-white bg-red-50 hover:bg-red-600 border border-red-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                      >
                        <span>➕</span>
                        <span className="hidden sm:inline">{t.addSubcategory}</span>
                      </button>

                      <button
                        onClick={() => handleOpenEditCategory(cat)}
                        className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs transition-colors cursor-pointer"
                        title={t.edit}
                      >
                        ✏️
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(cat)}
                        className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                        title={t.delete}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subcategories Accordion Content */}
                {isExpanded && (
                  <div className="bg-gray-50/80 border-t border-gray-200 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                        <span>📂</span>
                        <span>{lang === "uz" ? `«${primaryLabel}» kichik toifalari (${subs.length})` : `Подкатегории «${cat.labelRu}» (${subs.length})`}</span>
                      </div>
                      <button
                        onClick={() => handleOpenCreateSub(cat.key)}
                        className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                      >
                        <span>+ {lang === "uz" ? "Yana qo'shish" : "Добавить еще"}</span>
                      </button>
                    </div>

                    {subs.length === 0 ? (
                      <div className="p-6 bg-white rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-400">
                        {lang === "uz" ? "Ushbu toifada hali kichik toifalar mavjud emas." : "В этой категории пока нет подкатегорий."}{" "}
                        <button
                          onClick={() => handleOpenCreateSub(cat.key)}
                          className="text-red-600 font-bold hover:underline ml-1 cursor-pointer"
                        >
                          {lang === "uz" ? "Birinchisini qo'shish" : "Добавить первую"}
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {subs.map((sub) => {
                          const fullKey = `${cat.key}::${sub.key}`;
                          const subProdCount = productsBySub.get(fullKey) || 0;
                          const subPrimary = lang === "uz" && sub.labelUz ? sub.labelUz : sub.labelRu;
                          const subSecondary = lang === "uz" ? sub.labelRu : (sub.labelUz || sub.labelRu);

                          return (
                            <div
                              key={sub.key}
                              className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs hover:border-red-300 transition-colors flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-gray-900 text-xs truncate">
                                  {subPrimary}
                                </div>
                                <div className="text-[10px] text-gray-400 truncate">
                                  {subSecondary}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-gray-500">
                                  <span className="bg-gray-100 px-1.5 py-0.2 rounded">
                                    ?sub={sub.slug}
                                  </span>
                                  {subProdCount > 0 && (
                                    <span className="bg-red-50 text-red-600 font-semibold px-1.5 py-0.2 rounded">
                                      {subProdCount} {lang === "uz" ? "ta" : "тов."}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => handleOpenEditSub(cat.key, sub)}
                                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-[11px] transition-colors cursor-pointer"
                                  title={t.edit}
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteSub(cat.key, sub)}
                                  className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 flex items-center justify-center text-[11px] transition-colors cursor-pointer"
                                  title={t.delete}
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ── Modal: Category Create / Edit ── */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2
                className="text-xl font-black text-gray-900"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                {editingCategoryKey ? t.modalEditCat : t.modalCreateCat}
              </h2>
              <button
                onClick={() => setCatModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {t.labelRu} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "uz" ? "Masalan: O'lchov asboblari" : "Например: Измерительные приборы"}
                  value={catForm.labelRu}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCatForm((prev) => ({
                      ...prev,
                      labelRu: val,
                      slug: prev.slug || generateSlug(val),
                      key: prev.key || generateSlug(val),
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {t.labelUz}
                </label>
                <input
                  type="text"
                  placeholder={lang === "uz" ? "O'zbek tilidagi nomi..." : "Masalan: O'lchov asboblari"}
                  value={catForm.labelUz}
                  onChange={(e) => setCatForm((prev) => ({ ...prev, labelUz: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {t.slug} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="izmeritelnye-pribory"
                    value={catForm.slug}
                    onChange={(e) => setCatForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs font-mono"
                  />
                  <div className="text-[10px] text-gray-400 mt-0.5">/catalog/{catForm.slug || "..."}</div>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {lang === "uz" ? "Tizim kaliti (Key)" : "Системный ключ (Key)"}
                  </label>
                  <input
                    type="text"
                    placeholder="measuring_tools"
                    value={catForm.key}
                    disabled={!!editingCategoryKey}
                    onChange={(e) => setCatForm((prev) => ({ ...prev, key: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs font-mono disabled:opacity-60"
                  />
                  <div className="text-[10px] text-gray-400 mt-0.5">{lang === "uz" ? "Bazadagi identifikator" : "Идентификатор в базе"}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-gray-800 text-xs">
                    {t.icon}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingEmoji((prev) => !prev)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer border border-red-200"
                  >
                    <span className="text-xs font-bold">+</span>
                    <span>{lang === "uz" ? "Yangi smaylik qo'shish" : "Добавить смайлик"}</span>
                  </button>
                </div>

                <div className="flex items-start gap-3">
                  {/* Selected/current preview input */}
                  <div className="flex flex-col items-center shrink-0">
                    <input
                      type="text"
                      value={catForm.icon}
                      title={lang === "uz" ? "Tanlangan belgi / smaylik" : "Выбранный смайлик / иконка"}
                      onChange={(e) => setCatForm((prev) => ({ ...prev, icon: e.target.value }))}
                      className="w-14 h-14 text-center text-2xl bg-gray-50 border-2 border-red-500 rounded-2xl shadow-xs focus:bg-white focus:outline-hidden"
                    />
                    <span className="text-[10px] text-gray-400 mt-1">{lang === "uz" ? "Tanlandi" : "Выбран"}</span>
                  </div>

                  {/* Emoji presets + add button */}
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-gray-50/70 border border-gray-200 rounded-xl">
                      {customEmojis.map((emoji) => {
                        const isSelected = catForm.icon === emoji;
                        return (
                          <button
                            type="button"
                            key={emoji}
                            onClick={() => setCatForm((prev) => ({ ...prev, icon: emoji }))}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg cursor-pointer transition-all ${
                              isSelected
                                ? "bg-red-600 text-white shadow-xs scale-105 ring-2 ring-red-300"
                                : "bg-white hover:bg-gray-100 border border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {emoji}
                          </button>
                        );
                      })}

                      {/* Add new emoji quick button */}
                      <button
                        type="button"
                        onClick={() => setIsAddingEmoji(true)}
                        title={lang === "uz" ? "Yangi smaylik qo'shish" : "Добавить новый смайлик"}
                        className="w-9 h-9 rounded-xl border border-dashed border-red-300 bg-red-50/50 hover:bg-red-100 text-red-600 flex items-center justify-center text-base font-bold cursor-pointer transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add new emoji inline popover / form */}
                {isAddingEmoji && (
                  <div className="mt-2.5 p-3 bg-gradient-to-br from-red-50/70 to-orange-50/40 border border-red-200 rounded-xl space-y-2.5 animate-in fade-in zoom-in-95 duration-150 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        <span>✨</span>
                        <span>{lang === "uz" ? "Yangi smaylik qo'shish" : "Добавить новый смайлик"}</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingEmoji(false);
                          setNewEmojiInput("");
                        }}
                        className="text-gray-400 hover:text-gray-600 text-xs px-1.5 py-0.5 rounded cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newEmojiInput}
                        onChange={(e) => setNewEmojiInput(e.target.value)}
                        placeholder={lang === "uz" ? "Smaylikni kiriting yoki joylang (masalan: 🪛, 🎨)..." : "Вставьте или введите смайлик (например: 🪛, 🎨, ⛏️)..."}
                        className="flex-1 text-xs px-3 py-2 border border-gray-200 bg-white rounded-lg focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500 text-center"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddEmoji();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={handleAddEmoji}
                        disabled={!newEmojiInput.trim()}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shrink-0 shadow-xs"
                      >
                        {lang === "uz" ? "Qo'shish" : "Добавить"}
                      </button>
                    </div>

                    {/* Quick popular emojis suggestions */}
                    <div>
                      <div className="text-[10px] text-gray-500 font-medium mb-1">
                        {lang === "uz" ? "Tez tanlash uchun tavsiya etilganlar:" : "Быстрый выбор из популярных:"}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {SUGGESTED_EMOJIS.map((sug) => (
                          <button
                            type="button"
                            key={sug}
                            onClick={() => handleAddSpecificEmoji(sug)}
                            className="w-7 h-7 rounded-lg bg-white border border-gray-200 hover:bg-red-50 hover:border-red-300 flex items-center justify-center text-sm cursor-pointer transition-colors"
                            title={`Добавить ${sug}`}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Image Upload Widget ── */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-gray-800 text-xs">
                    {t.image}
                  </label>
                  <div className="flex items-center gap-1.5">
                    {catForm.image && (
                      <button
                        type="button"
                        onClick={() => {
                          setCatForm((prev) => ({ ...prev, image: "" }));
                          setCatImageShowUrl(false);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-lg transition-colors cursor-pointer border border-red-200"
                      >
                        🗑 {lang === "uz" ? "O'chirish" : "Удалить"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setCatImageShowUrl((prev) => !prev)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg transition-colors cursor-pointer border border-gray-200"
                    >
                      🔗 URL
                    </button>
                  </div>
                </div>

                {/* Drop zone / upload area */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setCatImageDragging(true); }}
                  onDragLeave={() => setCatImageDragging(false)}
                  onDrop={async (e) => {
                    e.preventDefault();
                    setCatImageDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (!file || !file.type.startsWith("image/")) return;
                    setCatImageUploading(true);
                    const res = await uploadMediaFile(file, "banners");
                    setCatImageUploading(false);
                    if (res.url) setCatForm((prev) => ({ ...prev, image: res.url }));
                  }}
                  className={`relative rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
                    catImageDragging
                      ? "border-red-400 bg-red-50/60 scale-[1.01]"
                      : catForm.image
                      ? "border-gray-200 bg-gray-50"
                      : "border-gray-300 bg-gray-50/60 hover:border-red-300 hover:bg-red-50/30"
                  }`}
                  style={{ minHeight: catForm.image ? "auto" : "100px" }}
                >
                  {/* Current image preview */}
                  {catForm.image && !catImageUploading && (
                    <div className="relative group">
                      <img
                        src={catForm.image}
                        alt="Превью категории"
                        className="w-full h-40 object-cover rounded-xl"
                        onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => catImageInputRef.current?.click()}
                          className="px-4 py-2 bg-white/90 text-gray-900 text-xs font-bold rounded-xl shadow-lg hover:bg-white cursor-pointer transition-all"
                        >
                          📷 {lang === "uz" ? "Rasmni almashtirish" : "Заменить фото"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Upload placeholder (no image) */}
                  {!catForm.image && !catImageUploading && (
                    <button
                      type="button"
                      onClick={() => catImageInputRef.current?.click()}
                      className="w-full h-full min-h-[100px] flex flex-col items-center justify-center gap-2 cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-white border border-gray-200 shadow-xs flex items-center justify-center text-xl">
                        🖼️
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-semibold text-gray-700">
                          {lang === "uz" ? "Rasm yuklash" : "Загрузить фото"}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">
                          {lang === "uz" ? "Bosing yoki bu yerga torting" : "Нажмите или перетащите файл"}
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Upload spinner */}
                  {catImageUploading && (
                    <div className="flex flex-col items-center justify-center h-24 gap-2">
                      <div className="w-7 h-7 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                      <div className="text-[11px] text-gray-500">
                        {lang === "uz" ? "Yuklanmoqda..." : "Загрузка..."}
                      </div>
                    </div>
                  )}

                  {/* Hidden file input */}
                  <input
                    ref={catImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setCatImageUploading(true);
                      const res = await uploadMediaFile(file, "banners");
                      setCatImageUploading(false);
                      if (res.url) setCatForm((prev) => ({ ...prev, image: res.url }));
                      e.target.value = "";
                    }}
                  />
                </div>

                {/* Replace button below image */}
                {catForm.image && !catImageUploading && (
                  <button
                    type="button"
                    onClick={() => catImageInputRef.current?.click()}
                    className="mt-2 w-full text-[11px] font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-gray-200"
                  >
                    📷 {lang === "uz" ? "Rasmni almashtirish" : "Заменить фото"}
                  </button>
                )}

                {/* URL input (collapsed by default, toggle with button) */}
                {catImageShowUrl && (
                  <div className="mt-2 animate-in fade-in zoom-in-95 duration-150">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={catForm.image}
                        onChange={(e) => setCatForm((prev) => ({ ...prev, image: e.target.value }))}
                        className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-[11px] font-mono"
                        autoFocus
                      />
                      <span className="absolute left-2.5 top-2 text-gray-400 text-xs">🔗</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      {lang === "uz" ? "Rasm URL manzilini kiriting" : "Вставьте прямую ссылку на изображение"}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Subcategory Create / Edit ── */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2
                  className="text-xl font-black text-gray-900"
                  style={{ fontFamily: "Barlow Condensed, sans-serif" }}
                >
                  {editingSubKey ? t.modalEditSub : t.modalCreateSub}
                </h2>
                <div className="text-[11px] text-gray-400 font-medium mt-0.5">
                  {lang === "uz" ? "Toifa: " : "Категория: "}
                  {categories.find((c) => c.key === targetCatKey)?.[lang === "uz" ? "labelUz" : "labelRu"]}
                </div>
              </div>
              <button
                onClick={() => setSubModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSubcategory} className="mt-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {t.labelRu} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "uz" ? "Masalan: Lobziklar" : "Например: Лобзики"}
                  value={subForm.labelRu}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSubForm((prev) => ({
                      ...prev,
                      labelRu: val,
                      slug: prev.slug || generateSlug(val),
                      key: prev.key || generateSlug(val),
                    }));
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {t.labelUz}
                </label>
                <input
                  type="text"
                  placeholder={lang === "uz" ? "O'zbek tilidagi nomi..." : "Masalan: Arra (lob)"}
                  value={subForm.labelUz}
                  onChange={(e) => setSubForm((prev) => ({ ...prev, labelUz: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {t.slug} (?sub=...) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="lobziki"
                    value={subForm.slug}
                    onChange={(e) => setSubForm((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {lang === "uz" ? "Tizim kaliti (Key)" : "Системный Key"}
                  </label>
                  <input
                    type="text"
                    placeholder="lobziki"
                    value={subForm.key}
                    disabled={!!editingSubKey}
                    onChange={(e) => setSubForm((prev) => ({ ...prev, key: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-red-500 text-xs font-mono disabled:opacity-60"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
