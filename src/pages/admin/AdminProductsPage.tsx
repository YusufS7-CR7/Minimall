import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import type { Product } from "@/data/types";
import { CATEGORIES } from "@/data/categories";
import { useProducts } from "@/context/ProductsContext";
import { useApp } from "@/context/AppContext";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import ProductFormModal from "./ProductFormModal";
import CustomSelect from "@/components/ui/CustomSelect";

import { formatPrice } from "@/utils/formatPrice";

export default function AdminProductsPage() {
  const { products, deleteProduct, updateProduct, addProduct, brands } = useProducts();
  const { showToast } = useApp();
  const { isSuperAdmin, hasPermission } = useAdminAuth();

  const canView = isSuperAdmin || hasPermission("products_view");
  const canCreate = isSuperAdmin || hasPermission("products_create");
  const canEdit = isSuperAdmin || hasPermission("products_edit");
  const canDelete = isSuperAdmin || hasPermission("products_delete");

  useDocumentMeta({
    title: "Панель управления товарами | Minimall Admin",
    description: "Управление каталогом товаров маркетплейса mini-mall.uz",
    noIndex: true,
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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
      if (selectedCategory !== "all" && p.category !== selectedCategory) {
        return false;
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
    if (window.confirm(`Вы уверены, что хотите удалить товар "${name}"?`)) {
      deleteProduct(id);
      showToast(`Товар "${name}" удален`);
    }
  };

  const handleToggleStock = (product: Product) => {
    const nextStatus = !product.inStock;
    updateProduct(product.id, { inStock: nextStatus });
    showToast(
      nextStatus
        ? `"${product.name}" теперь в наличии`
        : `"${product.name}" отмечен как "Нет в наличии"`
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
      showToast(`Создана копия товара: "${duplicated.name}"`);
    }
  };

  if (!canView) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs text-center space-y-3">
        <div className="text-4xl">🔒</div>
        <h2 className="text-lg font-bold text-gray-900">Доступ ограничен</h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          У вашей учетной записи нет разрешения на просмотр каталога товаров. Обратитесь к Главному Администратору для получения прав.
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
            Товары каталога
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Добавляйте новые товары, редактируйте цены, параметры и управляйте складскими остатками
          </p>
        </div>
        {canCreate && (
          <button
            onClick={handleOpenCreate}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm px-5 py-3 rounded-2xl transition-all shadow-md shadow-red-600/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <span className="text-base font-black">+</span>
            <span>Добавить товар</span>
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Всего товаров
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-gray-900 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.total}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">активных позиций</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            В наличии
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.inStock}
          </div>
          <div className="text-[11px] text-emerald-600/80 mt-1">готовы к отгрузке</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Нет на складе
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-amber-600 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.outOfStock}
          </div>
          <div className="text-[11px] text-amber-600/80 mt-1">требуют пополнения</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Стоимость каталога
          </div>
          <div
            className="text-xl sm:text-2xl font-black text-gray-900 mt-1 truncate"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
            title={formatPrice(stats.totalCatalogValue)}
          >
            {formatPrice(stats.totalCatalogValue)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">суммарная стоимость</div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Поиск по названию, бренду, артикулу или slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2 text-xs text-gray-400 hover:text-gray-600"
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
              { value: "all", label: "Все категории" },
              ...CATEGORIES.map((c) => ({
                value: c.key,
                label: c.labelRu,
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
              { value: "all", label: "Все бренды" },
              { value: "Без бренда", label: "Без бренда", icon: "🏷️" },
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
              { value: "all", label: "Любой статус" },
              { value: "in", label: "В наличии", icon: "🟢" },
              { value: "out", label: "Нет в наличии", icon: "🔴" },
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
              {products.length === 0 ? "Каталог пока пуст" : "Товары не найдены"}
            </div>
            <div className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
              {products.length === 0
                ? "Нажмите кнопку «+ Добавить товар» выше, чтобы создать первую позицию."
                : "Попробуйте изменить параметры поиска или фильтров"}
            </div>
          </div>
        ) : (
          filteredProducts.map((p) => {
            const cat = CATEGORIES.find((c) => c.key === p.category);
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-3.5 shadow-xs flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-contain border border-gray-100 bg-white p-1 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&h=100&fit=crop";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">{p.brand}</span>
                      <span className="font-mono text-[10px] text-gray-400">#{p.id}</span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-xs line-clamp-2 leading-snug mt-0.5">{p.name}</h4>
                    <div className="text-[11px] text-gray-400 mt-0.5">{cat?.labelRu || p.category}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div>
                    <div className="text-sm font-black text-gray-900">{formatPrice(p.price)}</div>
                    {p.oldPrice && (
                      <div className="text-[10px] text-gray-400 line-through">{formatPrice(p.oldPrice)}</div>
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
                    <span>{p.inStock ? "В наличии" : "Нет на складе"}</span>
                  </button>
                </div>

                {/* Mobile action bar */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100">
                  <Link
                    to={`/product/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200"
                    title="Смотреть"
                  >
                    <span>👁️</span>
                    <span className="text-[10px]">Витрина</span>
                  </Link>
                  {canEdit && (
                    <button
                      onClick={() => handleOpenEdit(p)}
                      className="flex items-center justify-center gap-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 cursor-pointer"
                      title="Редактировать"
                    >
                      <span>✏️</span>
                      <span className="text-[10px]">Изменить</span>
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleDuplicate(p)}
                      className="flex items-center justify-center gap-1 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 cursor-pointer"
                      title="Копия"
                    >
                      <span>📄</span>
                      <span className="text-[10px]">Копия</span>
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="flex items-center justify-center gap-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl border border-red-200 cursor-pointer"
                      title="Удалить"
                    >
                      <span>🗑️</span>
                      <span className="text-[10px]">Удалить</span>
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
                <th className="py-3 px-4">Товар</th>
                <th className="py-3 px-4">Категория / Бренд</th>
                <th className="py-3 px-4">Цена</th>
                <th className="py-3 px-4">Наличие</th>
                <th className="py-3 px-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    <div className="text-3xl mb-2">{products.length === 0 ? "📦" : "🔍"}</div>
                    <div className="text-sm font-bold text-gray-800">
                      {products.length === 0 ? "Каталог пока пуст" : "Товары не найдены"}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                      {products.length === 0
                        ? "Нажмите кнопку «+ Добавить товар» выше, чтобы создать первую позицию."
                        : "Попробуйте изменить параметры поиска или фильтров"}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const cat = CATEGORIES.find((c) => c.key === p.category);
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-gray-50/60 transition-colors group"
                    >
                      {/* Product details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-contain border border-gray-100 bg-white p-1 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=100&h=100&fit=crop";
                            }}
                          />
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 line-clamp-1 text-xs sm:text-sm">
                              {p.name}
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
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-900">
                          {p.brand}
                        </div>
                        <div className="text-[11px] text-gray-400">
                          {cat?.labelRu || p.category}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-xs sm:text-sm font-bold text-gray-900">
                          {formatPrice(p.price)}
                        </div>
                        {p.oldPrice && (
                          <div className="text-[11px] text-gray-400 line-through">
                            {formatPrice(p.oldPrice)}
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
                          title={canEdit ? "Нажмите, чтобы переключить статус наличия" : "Статус наличия"}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.inStock ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          <span>{p.inStock ? "В наличии" : "Нет на складе"}</span>
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
                            title="Открыть страницу товара на витрине"
                          >
                            👁️
                          </Link>

                          {/* Edit */}
                          {canEdit && (
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="w-8 h-8 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                              title="Редактировать товар"
                            >
                              ✏️
                            </button>
                          )}

                          {/* Duplicate */}
                          {canEdit && (
                            <button
                              onClick={() => handleDuplicate(p)}
                              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 flex items-center justify-center text-xs transition-colors cursor-pointer"
                              title="Сделать копию товара"
                            >
                              📄
                            </button>
                          )}

                          {/* Delete */}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="w-8 h-8 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                              title="Удалить товар"
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
            Показано {filteredProducts.length} из {products.length} товаров
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
          showToast(
            editingProduct
              ? `Изменения товара "${saved.name}" сохранены`
              : `Новый товар "${saved.name}" успешно добавлен в каталог!`
          );
        }}
      />
    </div>
  );
}
