import { useState, useRef, useEffect, type ReactNode } from "react";

export interface CustomSelectOption<T extends string | number = string> {
  value: T;
  label: string;
  subLabel?: string;
  icon?: ReactNode;
}

interface CustomSelectProps<T extends string | number = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  id?: string;
  size?: "sm" | "md" | "lg";
}

export default function CustomSelect<T extends string | number = string>({
  value,
  onChange,
  options,
  placeholder = "Выберите значение...",
  disabled = false,
  className = "",
  menuClassName = "",
  id,
  size = "md",
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close when clicking outside
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

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen((prev) => !prev);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const currentIndex = options.findIndex((opt) => opt.value === value);
      if (currentIndex < options.length - 1) {
        onChange(options[currentIndex + 1].value);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      const currentIndex = options.findIndex((opt) => opt.value === value);
      if (currentIndex > 0) {
        onChange(options[currentIndex - 1].value);
      }
    }
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs rounded-xl",
    md: "px-3.5 py-2.5 text-sm rounded-xl",
    lg: "px-4 py-3 text-base rounded-2xl",
  };

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full select-none ${className}`}
      id={id}
    >
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2.5 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-2xs hover:border-red-400 dark:hover:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          sizeClasses[size]
        } ${isOpen ? "ring-2 ring-red-500/20 border-red-500" : ""}`}
      >
        <span className="flex items-center gap-2 truncate text-left font-medium">
          {selectedOption?.icon && (
            <span className="shrink-0 text-base leading-none">{selectedOption.icon}</span>
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : <span className="text-gray-400 font-normal">{placeholder}</span>}
          </span>
          {selectedOption?.subLabel && (
            <span className="text-xs text-gray-400 font-normal truncate">
              {selectedOption.subLabel}
            </span>
          )}
        </span>

        {/* Custom Chevron Indicator */}
        <svg
          className={`w-4 h-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180 text-red-500" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Menu Popover */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute left-0 right-0 z-50 mt-1.5 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-900/10 p-1.5 focus:outline-none animate-fadeIn scrollbar-thin ${menuClassName}`}
          style={{ animationDuration: "140ms" }}
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={String(option.value)}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`group flex items-center justify-between gap-2.5 px-3 py-2 text-xs sm:text-sm rounded-xl cursor-pointer transition-all duration-120 ${
                  isSelected
                    ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800 font-medium"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {option.icon && (
                    <span className="shrink-0 text-base leading-none">{option.icon}</span>
                  )}
                  <div className="truncate">
                    <span className="truncate block">{option.label}</span>
                    {option.subLabel && (
                      <span className="text-[11px] text-gray-400 font-normal block truncate">
                        {option.subLabel}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <svg
                    className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
