import React, { useState } from "react";
import PriceRangeSlider, { formatPriceShort } from "./PriceRangeSlider";
import type { Lang, Product } from "@/data/types";
import { T } from "@/data/translations";

export interface FilterState {
  priceRange: [number, number];
  selectedBrands: string[];
  inStockOnly: boolean;
  sortBy: "default" | "price_asc" | "price_desc" | "rating" | "discount";
}

export const DEFAULT_FILTER_STATE: FilterState = {
  priceRange: [0, 20_000_000],
  selectedBrands: [],
  inStockOnly: false,
  sortBy: "default",
};

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  lang: Lang;
  allBrands?: string[];
  totalProductsCount: number;
  filteredProductsCount: number;
  availableProducts?: Product[];
  hideBrandFilter?: boolean;
  className?: string;
}

export default function ProductFilters({
  filters,
  onChange,
  lang,
  allBrands = [],
  totalProductsCount,
  filteredProductsCount,
  availableProducts = [],
  hideBrandFilter = false,
  className = "",
}: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = T[lang];

  const isPriceFiltered =
    filters.priceRange[0] > 0 || filters.priceRange[1] < 20_000_000;
  const isBrandFiltered = filters.selectedBrands.length > 0;
  const isStockFiltered = filters.inStockOnly;
  const hasActiveFilters = isPriceFiltered || isBrandFiltered || isStockFiltered;

  const activeFiltersCount =
    (isPriceFiltered ? 1 : 0) +
    filters.selectedBrands.length +
    (isStockFiltered ? 1 : 0);

  // Count products per brand based on available products
  const brandCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    availableProducts.forEach((p) => {
      counts[p.brand] = (counts[p.brand] || 0) + 1;
    });
    return counts;
  }, [availableProducts]);

  const handlePriceChange = (newRange: [number, number]) => {
    onChange({ ...filters, priceRange: newRange });
  };

  const toggleBrand = (brand: string) => {
    const exists = filters.selectedBrands.includes(brand);
    const updated = exists
      ? filters.selectedBrands.filter((b) => b !== brand)
      : [...filters.selectedBrands, brand];
    onChange({ ...filters, selectedBrands: updated });
  };

  const handleReset = () => {
    onChange({
      ...filters,
      priceRange: [0, 20_000_000],
      selectedBrands: [],
      inStockOnly: false,
    });
  };

  const currencyLabel = lang === "ru" ? "сум" : "so'm";

  // Filter content rendered both in desktop sidebar and mobile drawer
  const filterContent = (
    <div className="space-y-6">
      {/* 1. PRICE FILTER with custom red range slider */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <PriceRangeSlider
          min={0}
          max={20_000_000}
          step={100_000}
          value={filters.priceRange}
          onChange={handlePriceChange}
          lang={lang}
          showInputs={true}
          showPresets={true}
          onReset={() => onChange({ ...filters, priceRange: [0, 20_000_000] })}
        />
      </div>

      {/* 2. BRANDS FILTER (if not hidden, e.g. on brand page) */}
      {!hideBrandFilter && allBrands.length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-900">
              {t.brand}
            </span>
            {isBrandFiltered && (
              <button
                type="button"
                onClick={() => onChange({ ...filters, selectedBrands: [] })}
                className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
              >
                {t.resetFilters}
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {allBrands.map((brand) => {
              const isChecked = filters.selectedBrands.includes(brand);
              const count = brandCounts[brand] || 0;
              return (
                <label
                  key={brand}
                  className="flex items-center justify-between text-xs text-gray-700 hover:text-gray-900 cursor-pointer py-1 px-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleBrand(brand)}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer accent-red-600"
                    />
                    <span className={isChecked ? "font-semibold text-gray-900" : ""}>
                      {brand}
                    </span>
                  </div>
                  {count > 0 && (
                    <span className="text-[11px] text-gray-400 font-medium">
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. AVAILABILITY FILTER */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs font-semibold text-gray-800">
            {lang === "ru" ? "Только товары в наличии" : "Faqat sotuvda mavjudlar"}
          </span>
          <div className="relative inline-flex items-center">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) =>
                onChange({ ...filters, inStockOnly: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600"></div>
          </div>
        </label>
      </div>

      {/* 4. RESET ALL BUTTON */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleReset}
          className="w-full py-2.5 px-4 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>✕</span>
          <span>{lang === "ru" ? "Сбросить все фильтры" : "Barcha filtrlarni tozalash"}</span>
        </button>
      )}
    </div>
  );

  return (
    <div className={className}>
      {/* Mobile Filter Toggle Button */}
      <div className="lg:hidden mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={`flex-1 py-2.5 px-4 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
            hasActiveFilters
              ? "bg-red-600 text-white border-red-600 shadow-sm"
              : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>{t.filters}</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-red-600 text-[10px] font-extrabold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:text-red-600 bg-white"
            title={lang === "ru" ? "Сбросить фильтры" : "Tozalash"}
          >
            ✕
          </button>
        )}
      </div>

      {/* Desktop Sidebar Layout */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span>{t.filters}</span>
            </h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-red-600 hover:text-red-700 font-semibold cursor-pointer"
              >
                {t.resetFilters}
              </button>
            )}
          </div>

          {filterContent}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl z-10 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900">
                  {t.filters}
                </h3>
                {activeFiltersCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Filter Content */}
            <div className="p-5 overflow-y-auto flex-1">
              {filterContent}
            </div>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {t.resetFilters}
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex-2 py-3 px-4 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold rounded-xl shadow-md hover:from-red-700 hover:to-red-600 transition-all text-center"
              >
                {lang === "ru"
                  ? `Показать ${filteredProductsCount} товаров`
                  : `${filteredProductsCount} ta tovarni ko'rish`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Active Filter Tags Toolbar Component ─────────────────────────────────────

interface ActiveFilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  lang: Lang;
  totalFound: number;
}

export function ActiveFilterBar({
  filters,
  onChange,
  lang,
  totalFound,
}: ActiveFilterBarProps) {
  const isPriceFiltered =
    filters.priceRange[0] > 0 || filters.priceRange[1] < 20_000_000;
  const hasActive =
    isPriceFiltered || filters.selectedBrands.length > 0 || filters.inStockOnly;

  if (!hasActive) return null;

  const currencyLabel = lang === "ru" ? "сум" : "so'm";

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-red-50/40 rounded-2xl border border-red-100/60">
      <span className="text-xs text-gray-500 font-medium ml-1">
        {lang === "ru" ? "Фильтры:" : "Filtrlar:"}
      </span>

      {/* Price tag */}
      {isPriceFiltered && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-red-200 text-red-700 rounded-xl text-xs font-semibold shadow-2xs">
          <span>
            {lang === "ru" ? "Цена:" : "Narx:"}{" "}
            {formatPriceShort(filters.priceRange[0], lang)} –{" "}
            {formatPriceShort(filters.priceRange[1], lang)} {currencyLabel}
          </span>
          <button
            type="button"
            onClick={() => onChange({ ...filters, priceRange: [0, 20_000_000] })}
            className="hover:text-red-900 ml-0.5 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </span>
      )}

      {/* Brand tags */}
      {filters.selectedBrands.map((b) => (
        <span
          key={b}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-800 rounded-xl text-xs font-semibold shadow-2xs"
        >
          <span>{b}</span>
          <button
            type="button"
            onClick={() =>
              onChange({
                ...filters,
                selectedBrands: filters.selectedBrands.filter((x) => x !== b),
              })
            }
            className="hover:text-red-600 ml-0.5 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </span>
      ))}

      {/* Stock tag */}
      {filters.inStockOnly && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold shadow-2xs">
          <span>{lang === "ru" ? "В наличии" : "Mavjud"}</span>
          <button
            type="button"
            onClick={() => onChange({ ...filters, inStockOnly: false })}
            className="hover:text-emerald-900 ml-0.5 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </span>
      )}

      {/* Reset all button */}
      <button
        type="button"
        onClick={() =>
          onChange({
            ...filters,
            priceRange: [0, 20_000_000],
            selectedBrands: [],
            inStockOnly: false,
          })
        }
        className="text-xs text-red-600 hover:text-red-800 font-bold ml-auto px-2 py-1 cursor-pointer"
      >
        {lang === "ru" ? "Очистить всё" : "Barchasini tozalash"}
      </button>
    </div>
  );
}
