import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/types";
import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";
import { useApp } from "@/context/AppContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import ProductFormModal from "./ProductFormModal";
import ExcelImportModal from "./ExcelImportModal";
import CustomSelect from "@/components/ui/CustomSelect";
import { formatPrice } from "@/utils/formatPrice";
import { ADMIN_TRANSLATIONS } from "@/data/adminTranslations";

export default function AdminProductsPage() {
  const { products, deleteProduct, updateProduct, addProduct, brands } = useProducts();
  const { categories } = useCategories();
  const { lang, showToast } = useApp();
  const { isSuperAdmin, hasPermission } = useAdminAuth();
  const { usdRate } = useCurrency();

  const t = ADMIN_TRANSLATIONS[lang].products;

  const canView = isSuperAdmin || hasPermission("products_view");
  const canCreate = isSuperAdmin || hasPermission("products_create");
  const canEdit = isSuperAdmin || hasPermission("products_edit");
  const canDelete = isSuperAdmin || hasPermission("products_delete");

  useDocumentMeta({
    title: lang === "uz" ? "Tovarlar katalogi | Minimall Admin" : "Панель управления товарами | Minimall Admin",
    description: lang === "uz" ? "mini-mall.uz tovarlar katalogini boshqarish" : "Управление каталогом товаров маркетплейса mini-mall.uz",
    noIndex: true,
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  const handleExcelImportSuccess = (count: number) => {
    showToast(
      lang === "uz"
        ? `Muvaffaqiyatli: ${count} ta tovar katalogga yuklandi!`
        : `Успешно: ${count} ${count === 1 ? "товар добавлен" : count > 1 && count < 5 ? "товара добавлено" : "товаров добавлено"} в каталог!`
    );
  };

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [stockFilter, setStockFilter] = useState<"all" | "in" | "out">("all");

  // Statistics
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inStock).length;
    const outOfStock = total - inStock;
    const totalCatalogValue = products.reduce((sum, p) => sum + p.price, 0);
    return { total, inStock, outOfStock, totalCatalogValue };
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          (p.nameUz && p.nameUz.toLowerCase().includes(q)) ||
          p.brand.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.id.toString() === q;
        if (!matches) return false;
      }

      // Category
      if (selectedCategory !== "all") {
        const productCategories = (p.categories && p.categories.length > 0)
          ? p.categories
          : (p.category ? [p.category] : []);
        if (!productCategories.includes(selectedCategory)) {
          return false;
        }
      }

      // Brand
      if (selectedBrand !== "all" && p.brand !== selectedBrand) {
        return false;
      }

      // Stock
      if (stockFilter === "in" && !p.inStock) return false;
      if (stockFilter === "out" && p.inStock) return false;

      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedBrand, stockFilter]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`${t.deleteConfirm} "${name}"?`)) {
      deleteProduct(id);
      showToast(`${name} ${t.deletedToast}`);
    }
  };

  const handleToggleStock = (product: Product) => {
    const nextStatus = !product.inStock;
    updateProduct(product.id, { inStock: nextStatus });
    const pName = lang === "uz" ? product.nameUz || product.name : product.name;
    showToast(
      nextStatus
        ? lang === "uz" ? `"${pName}" endi mavjud` : `"${product.name}" теперь в наличии`
        : lang === "uz" ? `"${pName}" mavjud emas deb belgilandi` : `"${product.name}" отмечен как "Нет в наличии"`
    );
  };

  const handleDuplicate = async (product: Product) => {
    const duplicated = await addProduct({
      ...product,
      name: `${product.name} (Копия)`,
      nameUz: `${product.nameUz || product.name} (Nusxa)`,
      slug: `${product.slug}-copy`,
    });
    if (duplicated) {
      const pName = lang === "uz" ? duplicated.nameUz || duplicated.name : duplicated.name;
      showToast(lang === "uz" ? `Tovar nusxasi yaratildi: "${pName}"` : `Создана копия товара: "${duplicated.name}"`);
    }
  };

  if (!canView) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs text-center space-y-3">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-bold text-gray-900">
          {lang === "uz" ? "Ruxsat cheklangan" : "Доступ ограничен"}
        </h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          {lang === "uz"
            ? "Hisobingizda tovarlar katalogini ko'rish huquqi yo'q. Huquq olish uchun Bosh Administratorga murojaat qiling."
            : "У вашей учетной записи нет разрешения на просмотр каталога товаров. Обратитесь к Главному Администратору для получения прав."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <h1
            className="text-2xl sm:text-3xl font-black text-gray-900"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {t.title}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {t.subtitle}
          </p>
        </div>
        {canCreate && (
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => setIsExcelModalOpen(true)}
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs sm:text-sm px-4 py-3 rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
              title={lang === "uz" ? "Excel orqali tovarlarni yuklash" : "Загрузить товары списком из Excel"}
            >
              <span className="text-base">📊</span>
              <span>{lang === "uz" ? "Excel'dan import" : "Импорт из Excel"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenCreate}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer active:scale-95"
            >
              <span className="text-base font-black">+</span>
              <span>{t.addBtn}</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t.statTotal}
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-gray-900 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.total}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {lang === "uz" ? "faol tovarlar" : "активных позиций"}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t.statInStock}
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.inStock}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1">
            {lang === "uz" ? "jo'natishga tayyor" : "готовы к отгрузке"}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t.statOutOfStock}
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-amber-600 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.outOfStock}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-1">
            {lang === "uz" ? "to'ldirish talab etiladi" : "требуют пополнения"}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {t.statValue}
          </div>
          <div
            className="text-xl sm:text-2xl font-black text-gray-900 mt-1 truncate"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
            title={formatPrice(stats.totalCatalogValue, usdRate)}
          >
            {formatPrice(stats.totalCatalogValue, usdRate)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            {lang === "uz" ? "jami qiymat" : "суммарная стоимость"}
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-48">
          <CustomSelect
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val)}
            options={[
              { value: "all", label: t.allCategories },
              ...categories.map((c) => ({
                value: c.key,
                label: lang === "uz" ? c.labelUz || c.labelRu : c.labelRu,
                icon: c.icon,
              })),
            ]}
          />
        </div>

        {/* Brand Filter */}
        <div className="w-full md:w-44">
          <CustomSelect
            value={selectedBrand}
            onChange={(val) => setSelectedBrand(val)}
            options={[
              { value: "all", label: t.allBrands },
              { value: "Без бренда", label: lang === "uz" ? "Brendsiz" : "Без бренда", icon: "🏷️" },
              ...brands.filter((b) => b !== "Без бренда").map((b) => ({
                value: b,
                label: b,
              })),
            ]}
          />
        </div>

        {/* Stock Filter */}
        <div className="w-full md:w-44">
          <CustomSelect
            value={stockFilter}
            onChange={(val) => setStockFilter(val as "all" | "in" | "out")}
            options={[
              { value: "all", label: t.allStatuses },
              { value: "in", label: t.statusInStock, icon: "🟢" },
              { value: "out", label: t.statusOutOfStock, icon: "🔴" },
            ]}
          />
        </div>
      </div>

      {/* Mobile Products List (Cards) */}
      <div className="md:hidden space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
            <div className="text-3xl mb-2">{products.length === 0 ? "📦" : "🔍"}</div>
            <div className="text-sm font-bold text-gray-800">
              {t.emptyTitle}
            </div>
            <div className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              {t.emptyDesc}
            </div>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const productCats = (p.categories && p.categories.length > 0)
              ? p.categories
              : (p.category ? [p.category] : []);
            const primaryCat = categories.find((c) => c.key === productCats[0]);
            const pName = lang === "uz" ? p.nameUz || p.name : p.name;
            const sub = primaryCat?.subcategories?.find((s) => s.key === p.subcategory || s.slug === p.subcategory);
            const subLabel = lang === "uz" ? sub?.labelUz || sub?.labelRu || p.subcategory : sub?.labelRu || p.subcategory;

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-xs flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  {p.image && p.image.trim() !== "" ? (
                    <img
                      src={p.image}
                      alt={pName}
                      className="w-16 h-16 rounded-xl object-contain border border-gray-100 bg-white p-1 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&h=100&fit=crop";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 shrink-0 text-xl">
                      📦
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">{p.brand}</span>
                      <span className="font-mono text-[10px] text-gray-400">#{p.id}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-xs line-clamp-2 leading-snug mt-0.5">{pName}</h4>
                    <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                      {productCats.map((cKey) => {
                        const cObj = categories.find((c) => c.key === cKey);
                        const cLabel = lang === "uz" ? cObj?.labelUz || cObj?.labelRu || cKey : cObj?.labelRu || cKey;
                        return (
                          <span key={cKey} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-md text-[10px] font-medium">
                            {cObj?.icon && <span>{cObj.icon}</span>}
                            <span>{cLabel}</span>
                          </span>
                        );
                      })}
                      {p.subcategory && (
                        <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.2 rounded font-medium border border-red-100">
                          {subLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <div className="text-sm font-black text-gray-900">{formatPrice(p.price, usdRate)}</div>
                    {p.oldPrice && (
                      <div className="text-[10px] text-gray-400 line-through">{formatPrice(p.oldPrice, usdRate)}</div>
                    )}
                  </div>
                  <button
                    disabled={!canEdit}
                    onClick={() => canEdit && handleToggleStock(p)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      canEdit ? "cursor-pointer" : "cursor-default opacity-80"
                    } ${
                      p.inStock
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${p.inStock ? "bg-emerald-500" : "bg-amber-500"}`} />
                    <span>{p.inStock ? t.inStockBadge : t.outOfStockBadge}</span>
                  </button>
                </div>

                {/* Mobile action bar */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Link
                    to={`/product/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200"
                    title={lang === "uz" ? "Do'konda ko'rish" : "Смотреть"}
                  >
                    <span>👁️</span>
                  </Link>
                  {canEdit && (
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 cursor-pointer"
                      title={t.edit}
                    >
                      <span>✏️</span>
                      <span className="text-[10px]">{t.edit}</span>
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleDuplicate(p)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 cursor-pointer"
                      title={lang === "uz" ? "Nusxa olish" : "Копия"}
                    >
                      <span>📄</span>
                      <span className="text-[10px]">{lang === "uz" ? "Nusxa" : "Копия"}</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(p.id, pName)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 cursor-pointer"
                      title={t.delete}
                    >
                      <span>🗑️</span>
                      <span className="text-[10px]">{t.delete}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Products Table */}
      <div className="hidden md:block bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3 px-4">{t.colProduct}</th>
                <th className="py-3 px-4">{t.colCategory} / {t.allBrands.replace("Все ", "").replace("Barcha ", "")}</th>
                <th className="py-3 px-4">{t.colPrice}</th>
                <th className="py-3 px-4">{t.colStatus}</th>
                <th className="py-3 px-4 text-right">{t.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <div className="text-3xl mb-2">{products.length === 0 ? "📦" : "🔍"}</div>
                    <div className="text-sm font-bold text-gray-800">
                      {t.emptyTitle}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      {t.emptyDesc}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const productCats = (p.categories && p.categories.length > 0)
                    ? p.categories
                    : (p.category ? [p.category] : []);
                  const primaryCat = categories.find((c) => c.key === productCats[0]);
                  const pName = lang === "uz" ? p.nameUz || p.name : p.name;
                  const sub = primaryCat?.subcategories?.find((s) => s.key === p.subcategory || s.slug === p.subcategory);
                  const subLabel = lang === "uz" ? sub?.labelUz || sub?.labelRu || p.subcategory : sub?.labelRu || p.subcategory;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/60 transition-colors group"
                    >
                      {/* Product details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {p.image && p.image.trim() !== "" ? (
                            <img
                              src={p.image}
                              alt={pName}
                              className="w-12 h-12 rounded-xl object-contain border border-gray-100 bg-white p-1 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&h=100&fit=crop";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 text-base" title="Нет фото">
                              📦
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 line-clamp-1 text-xs sm:text-sm">
                              {pName}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-[11px] text-gray-400">
                                #{p.id}
                              </span>
                              <span className="text-[11px] text-gray-400 font-mono truncate max-w-[150px]">
                                /{p.slug}
                              </span>
                              {p.badge && (
                                <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.2 rounded">
                                  {p.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td className="py-3 px-4">
                        <div className="text-xs font-medium text-gray-900 mb-1">
                          {p.brand}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1.5 flex-wrap max-w-xs">
                          {productCats.map((cKey) => {
                            const cObj = categories.find((c) => c.key === cKey);
                            const cLabel = lang === "uz" ? cObj?.labelUz || cObj?.labelRu || cKey : cObj?.labelRu || cKey;
                            return (
                              <span key={cKey} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded-md text-[10px] font-medium whitespace-nowrap">
                                {cObj?.icon && <span>{cObj.icon}</span>}
                                <span>{cLabel}</span>
                              </span>
                            );
                          })}
                          {p.subcategory && (
                            <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded-md font-medium border border-red-100 whitespace-nowrap">
                              {subLabel}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-bold text-gray-900">
                          {formatPrice(p.price, usdRate)}
                        </div>
                        {p.oldPrice && (
                          <div className="text-[11px] text-gray-400 line-through">
                            {formatPrice(p.oldPrice, usdRate)}
                          </div>
                        )}
                      </td>

                      {/* Stock toggle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          disabled={!canEdit}
                          onClick={() => canEdit && handleToggleStock(p)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                            canEdit ? "cursor-pointer" : "cursor-default opacity-80"
                          } ${
                            p.inStock
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200"
                          }`}
                          title={canEdit ? (lang === "uz" ? "Mavjudlik holatini o'zgartirish uchun bosing" : "Нажмите, чтобы переключить статус наличия") : t.colStatus}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.inStock ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          <span>{p.inStock ? t.inStockBadge : t.outOfStockBadge}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View on Storefront */}
                          <Link
                            to={`/product/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center text-xs transition-colors"
                            title={lang === "uz" ? "Do'konda tovar sahifasini ochish" : "Открыть страницу товара на витрине"}
                          >
                            👁️
                          </Link>

                          {/* Edit */}
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                              title={t.edit}
                            >
                              ✏️
                            </button>
                          )}

                          {/* Duplicate */}
                          {canEdit && (
                            <button
                              onClick={() => handleDuplicate(p)}
                              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center text-xs transition-colors cursor-pointer"
                              title={lang === "uz" ? "Nusxa yaratish" : "Сделать копию товара"}
                            >
                              📄
                            </button>
                          )}

                          {/* Delete */}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(p.id, pName)}
                              className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                              title={t.delete}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table footer / count */}
        <div className="bg-gray-50/60 border-t border-gray-100 px-4 py-3 text-xs text-gray-400 flex items-center justify-between">
          <span>
            {lang === "uz"
              ? `${products.length} tadan ${filteredProducts.length} ta tovar ko'rsatildi`
              : `Показано ${filteredProducts.length} из ${products.length} товаров`}
          </span>
          <span className="font-mono text-[11px]">Minimall Catalog v1</span>
        </div>
      </div>

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        productToEdit={editingProduct}
        onSuccess={(saved) => {
          const sName = lang === "uz" ? saved.nameUz || saved.name : saved.name;
          showToast(
            editingProduct
              ? lang === "uz" ? `"${sName}" tovaridagi o'zgarishlar saqlandi` : `Изменения товара "${saved.name}" сохранены`
              : lang === "uz" ? `Yangi "${sName}" tovari katalogga muvaffaqiyatli qo'shildi!` : `Новый товар "${saved.name}" успешно добавлен в каталог!`
          );
        }}
      />

      {/* Excel / CSV Import Modal */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={handleExcelImportSuccess}
      />
    </div>
  );
}
