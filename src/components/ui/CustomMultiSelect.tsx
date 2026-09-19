import { useState, useRef, useEffect, type ReactNode } from "react";

export interface CustomMultiSelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface CustomMultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: CustomMultiSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  primaryLabel?: string;
  makePrimaryTooltip?: string;
  id?: string;
  disabled?: boolean;
}

export default function CustomMultiSelect({
  values,
  onChange,
  options,
  placeholder = "Выберите категории...",
  searchPlaceholder = "Поиск категорий...",
  primaryLabel = "★ Главная",
  makePrimaryTooltip = "Сделать основной категорией",
  id,
  disabled = false,
}: CustomMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleOption = (optValue: string) => {
    if (values.includes(optValue)) {
      // Don't allow unselecting all - keep at least one
      if (values.length === 1) {
        return;
      }
      onChange(values.filter((v) => v !== optValue));
    } else {
      onChange([...values, optValue]);
    }
  };

  const removeValue = (valToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (values.length <= 1) return;
    onChange(values.filter((v) => v !== valToRemove));
  };

  const setAsPrimary = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (values[0] === val) return;
    const rest = values.filter((v) => v !== val);
    onChange([val, ...rest]);
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="relative w-full" ref={containerRef} id={id}>
      {/* Selected tags list */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {values.map((val, idx) => {
          const opt = options.find((o) => o.value === val);
          const label = opt ? opt.label : val;
          const isPrimary = idx === 0;

          return (
            <span
              key={val}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium border transition-all ${
                isPrimary
                  ? "bg-red-50 text-red-700 border-red-200 shadow-2xs"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {opt?.icon && <span className="shrink-0 text-sm">{opt.icon}</span>}
              <span className="truncate max-w-[140px] sm:max-w-[180px]">{label}</span>

              {isPrimary ? (
                <span className="text-[10px] font-bold text-red-600 bg-red-100/80 px-1 py-0.2 rounded">
                  {primaryLabel}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={(e) => setAsPrimary(val, e)}
                  title={makePrimaryTooltip}
                  className="text-[10px] text-gray-400 hover:text-red-600 px-1 py-0.2 rounded hover:bg-gray-200/60 transition-colors"
                >
                  ☆
                </button>
              )}

              {values.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => removeValue(val, e)}
                  className="text-gray-400 hover:text-red-500 rounded-full p-0.5 ml-0.5 transition-colors focus:outline-hidden"
                  title="Удалить категорию"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </span>
          );
        })}
      </div>

      {/* Main trigger button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between text-left text-sm px-3.5 py-2.5 border rounded-xl bg-white transition-all cursor-pointer ${
          isOpen
            ? "border-red-500 ring-2 ring-red-500/10"
            : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-50" : ""}`}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-gray-500 text-xs">
            {values.length === 0
              ? placeholder
              : `Выбрано категорий: ${values.length} (нажмите для изменения)`}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ml-2 ${
            isOpen ? "rotate-180 text-red-500" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search bar */}
          <div className="p-2 border-b border-gray-100 bg-gray-50/70">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full text-xs px-3 py-2 pl-8 border border-gray-200 rounded-lg bg-white focus:outline-hidden focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              <svg
                className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* List of categories */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">
                Категории не найдены
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = values.includes(opt.value);
                const isPrimary = values[0] === opt.value;

                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none transition-colors ${
                      isSelected
                        ? "bg-red-50/70 text-red-900 font-medium"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? "bg-red-600 border-red-600 text-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {opt.icon && <span className="text-base shrink-0">{opt.icon}</span>}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {isPrimary ? (
                          <span className="text-[10px] text-red-600 bg-red-100 px-1.5 py-0.5 rounded font-bold">
                            {primaryLabel}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => setAsPrimary(opt.value, e)}
                            title={makePrimaryTooltip}
                            className="text-[10px] text-gray-400 hover:text-red-600 hover:bg-red-100 px-1.5 py-0.5 rounded transition-colors"
                          >
                            Сделать главной
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[11px] text-gray-500">
            <span>Выбрано: <strong className="text-gray-900">{values.length}</strong></span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-red-600 font-semibold hover:text-red-700 cursor-pointer"
            >
              Готово
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
