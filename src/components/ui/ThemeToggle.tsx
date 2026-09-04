import { useApp } from "@/context/AppContext";

interface ThemeToggleProps {
  className?: string;
  showIcon?: boolean;
}

/**
 * iOS-style pill switch toggle for Light/Dark theme transition.
 * Matches the green pill with sliding circular knob from user specifications.
 */
export default function ThemeToggle({ className = "", showIcon = true }: ThemeToggleProps) {
  const { theme, toggleTheme } = useApp();
  const isDark = theme === "dark";

  return (
    <div
      className={`inline-flex items-center gap-2 select-none ${className}`}
      title={isDark ? "Тёмная тема включена (нажмите для светлой)" : "Светлая тема (нажмите для тёмной)"}
    >
      {showIcon && (
        <span className="text-sm shrink-0 transition-transform duration-300 hover:rotate-12">
          {isDark ? "🌙" : "☀️"}
        </span>
      )}

      {/* Pill Toggle Button */}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={toggleTheme}
        aria-label={isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
        className={`relative inline-flex items-center h-[26px] w-[48px] shrink-0 cursor-pointer rounded-full p-[2px] transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 shadow-inner ${
          isDark
            ? "bg-[#22c55e] border border-[#16a34a]"
            : "bg-gray-300 hover:bg-gray-400/70 border border-gray-300"
        }`}
      >
        <span className="sr-only">
          {isDark ? "Включить светлую тему" : "Включить тёмную тему"}
        </span>
        {/* Sliding knob */}
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-[20px] w-[20px] transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
            isDark ? "translate-x-[22px]" : "translate-x-[1px]"
          }`}
        />
      </button>
    </div>
  );
}
