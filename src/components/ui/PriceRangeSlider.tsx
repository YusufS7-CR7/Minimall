import React, { useState, useEffect, useRef, useCallback } from "react";

export interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: [number, number];
  onChange: (val: [number, number]) => void;
  lang?: "ru" | "uz";
  showInputs?: boolean;
  showPresets?: boolean;
  className?: string;
  onReset?: () => void;
}

export function formatPriceUZ(amount: number): string {
  return new Intl.NumberFormat("ru-RU").format(amount);
}

export function formatPriceShort(amount: number, lang: "ru" | "uz" = "ru"): string {
  if (amount === 0) return "0";
  const mln = lang === "ru" ? "млн" : "mln";
  const tys = lang === "ru" ? "тыс" : "ming";

  if (amount >= 1_000_000) {
    const val = amount / 1_000_000;
    const formatted = val % 1 === 0 ? val.toString() : val.toFixed(1).replace(".", ",");
    return `${formatted} ${mln}`;
  }
  if (amount >= 1_000) {
    const val = amount / 1_000;
    const formatted = val % 1 === 0 ? val.toString() : val.toFixed(0);
    return `${formatted} ${tys}`;
  }
  return amount.toString();
}

export default function PriceRangeSlider({
  min = 0,
  max = 20_000_000,
  step = 100_000,
  value,
  onChange,
  lang = "ru",
  showInputs = true,
  showPresets = true,
  className = "",
  onReset,
}: PriceRangeSliderProps) {
  const [minVal, maxVal] = value;
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeThumb, setActiveThumb] = useState<"min" | "max" | "bar" | null>(null);
  const [hoveredThumb, setHoveredThumb] = useState<"min" | "max" | null>(null);

  // Local string representation for input boxes
  const [inputMin, setInputMin] = useState<string>(formatPriceUZ(minVal));
  const [inputMax, setInputMax] = useState<string>(formatPriceUZ(maxVal));

  useEffect(() => {
    setInputMin(formatPriceUZ(minVal));
  }, [minVal]);

  useEffect(() => {
    setInputMax(formatPriceUZ(maxVal));
  }, [maxVal]);

  // Safe percentage calculation
  const getPercent = useCallback(
    (val: number) => {
      const clamped = Math.max(min, Math.min(max, val));
      return Math.min(100, Math.max(0, ((clamped - min) / (max - min)) * 100));
    },
    [min, max]
  );

  const leftPercent = getPercent(minVal);
  const rightPercent = getPercent(maxVal);

  // Dragging logic
  const dragInfoRef = useRef<{
    type: "min" | "max" | "bar";
    startX: number;
    startMin: number;
    startMax: number;
  } | null>(null);

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragInfoRef.current || !trackRef.current) return;
      const { type, startX, startMin, startMax } = dragInfoRef.current;
      const rect = trackRef.current.getBoundingClientRect();
      const trackWidth = rect.width;
      if (trackWidth <= 0) return;

      if (type === "bar") {
        const deltaX = e.clientX - startX;
        const deltaVal = Math.round(((deltaX / trackWidth) * (max - min)) / step) * step;
        const rangeWidth = startMax - startMin;

        let newMin = startMin + deltaVal;
        let newMax = startMax + deltaVal;

        if (newMin < min) {
          newMin = min;
          newMax = min + rangeWidth;
        } else if (newMax > max) {
          newMax = max;
          newMin = max - rangeWidth;
        }

        onChange([newMin, newMax]);
      } else {
        const currentX = e.clientX - rect.left;
        const rawRatio = Math.max(0, Math.min(1, currentX / trackWidth));
        const rawVal = min + rawRatio * (max - min);
        const steppedVal = Math.round(rawVal / step) * step;

        if (type === "min") {
          const clamped = Math.max(min, Math.min(maxVal - step, steppedVal));
          onChange([clamped, maxVal]);
        } else if (type === "max") {
          const clamped = Math.min(max, Math.max(minVal + step, steppedVal));
          onChange([minVal, clamped]);
        }
      }
    },
    [min, max, step, minVal, maxVal, onChange]
  );

  const handlePointerUp = useCallback(() => {
    dragInfoRef.current = null;
    setActiveThumb(null);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, [handlePointerMove]);

  const startDrag = (
    e: React.PointerEvent,
    type: "min" | "max" | "bar"
  ) => {
    e.preventDefault();
    e.stopPropagation();

    dragInfoRef.current = {
      type,
      startX: e.clientX,
      startMin: minVal,
      startMax: maxVal,
    };
    setActiveThumb(type);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  // Track click handler
  const handleTrackClick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const rawVal = min + ratio * (max - min);
    const steppedVal = Math.round(rawVal / step) * step;

    const distToMin = Math.abs(steppedVal - minVal);
    const distToMax = Math.abs(steppedVal - maxVal);

    if (distToMin < distToMax) {
      const clamped = Math.max(min, Math.min(maxVal - step, steppedVal));
      onChange([clamped, maxVal]);
      startDrag(e, "min");
    } else {
      const clamped = Math.min(max, Math.max(minVal + step, steppedVal));
      onChange([minVal, clamped]);
      startDrag(e, "max");
    }
  };

  // Keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent,
    type: "min" | "max"
  ) => {
    let delta = 0;
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") delta = -step;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") delta = step;
    if (e.key === "PageDown") delta = -step * 5;
    if (e.key === "PageUp") delta = step * 5;
    if (e.key === "Home") {
      if (type === "min") onChange([min, maxVal]);
      else onChange([minVal, minVal + step]);
      e.preventDefault();
      return;
    }
    if (e.key === "End") {
      if (type === "min") onChange([maxVal - step, maxVal]);
      else onChange([minVal, max]);
      e.preventDefault();
      return;
    }

    if (delta !== 0) {
      e.preventDefault();
      if (type === "min") {
        const next = Math.max(min, Math.min(maxVal - step, minVal + delta));
        onChange([next, maxVal]);
      } else {
        const next = Math.min(max, Math.max(minVal + step, maxVal + delta));
        onChange([minVal, next]);
      }
    }
  };

  // Direct input commits
  const commitMinInput = () => {
    const parsed = parseInt(inputMin.replace(/\s+/g, ""), 10);
    if (isNaN(parsed)) {
      setInputMin(formatPriceUZ(minVal));
      return;
    }
    const clamped = Math.max(min, Math.min(maxVal - step, Math.round(parsed / step) * step));
    onChange([clamped, maxVal]);
    setInputMin(formatPriceUZ(clamped));
  };

  const commitMaxInput = () => {
    const parsed = parseInt(inputMax.replace(/\s+/g, ""), 10);
    if (isNaN(parsed)) {
      setInputMax(formatPriceUZ(maxVal));
      return;
    }
    const clamped = Math.min(max, Math.max(minVal + step, Math.round(parsed / step) * step));
    onChange([minVal, clamped]);
    setInputMax(formatPriceUZ(clamped));
  };

  const isFiltered = minVal > min || maxVal < max;

  const presets = [
    { labelRu: "Все", labelUz: "Barchasi", range: [0, 20_000_000] as [number, number] },
    { labelRu: "до 1 млн", labelUz: "1 mlngacha", range: [0, 1_000_000] as [number, number] },
    { labelRu: "1 – 3 млн", labelUz: "1 – 3 mln", range: [1_000_000, 3_000_000] as [number, number] },
    { labelRu: "3 – 7 млн", labelUz: "3 – 7 mln", range: [3_000_000, 7_000_000] as [number, number] },
    { labelRu: "от 7 млн", labelUz: "7 mlndan", range: [7_000_000, 20_000_000] as [number, number] },
  ];

  const currencyLabel = lang === "ru" ? "сум" : "so'm";

  return (
    <div className={`w-full ${className}`}>
      {/* Header with Title and Reset */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
          <span>{lang === "ru" ? "Цена" : "Narx"}</span>
          <span className="text-xs text-gray-400 font-normal">({currencyLabel})</span>
        </span>
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              onChange([min, max]);
              if (onReset) onReset();
            }}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>✕</span>
            <span>{lang === "ru" ? "Сбросить" : "Tozalash"}</span>
          </button>
        )}
      </div>

      {/* Numerical Input Boxes (От - До) */}
      {showInputs && (
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium select-none pointer-events-none">
              {lang === "ru" ? "от" : "dan"}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={inputMin}
              onChange={(e) => setInputMin(e.target.value)}
              onBlur={commitMinInput}
              onKeyDown={(e) => e.key === "Enter" && commitMinInput()}
              className="w-full pl-7 pr-2 py-2 text-xs font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none transition-all"
              placeholder="0"
            />
          </div>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium select-none pointer-events-none">
              {lang === "ru" ? "до" : "gacha"}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={inputMax}
              onChange={(e) => setInputMax(e.target.value)}
              onBlur={commitMaxInput}
              onKeyDown={(e) => e.key === "Enter" && commitMaxInput()}
              className="w-full pl-7 pr-2 py-2 text-xs font-semibold text-gray-900 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-100 focus:outline-none transition-all"
              placeholder="20 000 000"
            />
          </div>
        </div>
      )}

      {/* Dual Slider Container matching user's image exactly */}
      <div className="relative pt-6 pb-4 px-2 select-none">
        {/* Track wrapper */}
        <div
          ref={trackRef}
          onPointerDown={handleTrackClick}
          className="relative w-full h-8 flex items-center cursor-pointer group"
        >
          {/* Light gray background track */}
          <div className="absolute inset-x-0 h-2.5 bg-gray-200 rounded-full transition-colors group-hover:bg-gray-300/80" />

          {/* Active red bar in between thumbs */}
          <div
            className="absolute h-2.5 bg-red-600 rounded-full cursor-grab active:cursor-grabbing transition-shadow hover:shadow-xs"
            style={{
              left: `${leftPercent}%`,
              width: `${Math.max(0, rightPercent - leftPercent)}%`,
            }}
            onPointerDown={(e) => startDrag(e, "bar")}
            title={lang === "ru" ? "Потяните для перемещения диапазона" : "Oraliqni siljitish uchun torting"}
          />

          {/* Left Thumb (Min Handle) */}
          <div
            role="slider"
            tabIndex={0}
            aria-valuemin={min}
            aria-valuemax={maxVal - step}
            aria-valuenow={minVal}
            aria-label={lang === "ru" ? "Минимальная цена" : "Minimal narx"}
            onPointerDown={(e) => startDrag(e, "min")}
            onKeyDown={(e) => handleKeyDown(e, "min")}
            onMouseEnter={() => setHoveredThumb("min")}
            onMouseLeave={() => setHoveredThumb(null)}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-red-600 cursor-grab active:cursor-grabbing shadow-md shadow-red-500/30 transition-transform duration-100 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-red-200/80 ${
              activeThumb === "min" ? "scale-125 ring-2 ring-white z-30" : "hover:scale-125 z-20"
            }`}
            style={{ left: `${leftPercent}%` }}
          >
            {/* Floating tooltip on hover / active */}
            {(activeThumb === "min" || hoveredThumb === "min") && (
              <div className="absolute bottom-7 -translate-x-1/2 left-1/2 pointer-events-none whitespace-nowrap z-40 animate-fade-in">
                <div className="bg-gray-900 text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-lg">
                  {formatPriceShort(minVal, lang)} {currencyLabel}
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
              </div>
            )}
          </div>

          {/* Right Thumb (Max Handle) */}
          <div
            role="slider"
            tabIndex={0}
            aria-valuemin={minVal + step}
            aria-valuemax={max}
            aria-valuenow={maxVal}
            aria-label={lang === "ru" ? "Максимальная цена" : "Maksimal narx"}
            onPointerDown={(e) => startDrag(e, "max")}
            onKeyDown={(e) => handleKeyDown(e, "max")}
            onMouseEnter={() => setHoveredThumb("max")}
            onMouseLeave={() => setHoveredThumb(null)}
            className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-red-600 cursor-grab active:cursor-grabbing shadow-md shadow-red-500/30 transition-transform duration-100 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-red-200/80 ${
              activeThumb === "max" ? "scale-125 ring-2 ring-white z-30" : "hover:scale-125 z-20"
            }`}
            style={{ left: `${rightPercent}%` }}
          >
            {/* Floating tooltip on hover / active */}
            {(activeThumb === "max" || hoveredThumb === "max") && (
              <div className="absolute bottom-7 -translate-x-1/2 left-1/2 pointer-events-none whitespace-nowrap z-40 animate-fade-in">
                <div className="bg-gray-900 text-white text-[11px] font-bold px-2 py-1 rounded-lg shadow-lg">
                  {formatPriceShort(maxVal, lang)} {currencyLabel}
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
              </div>
            )}
          </div>
        </div>

        {/* Lower min / max label cues */}
        <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium mt-1">
          <span>0 {currencyLabel}</span>
          <span>10 млн</span>
          <span>20 млн {currencyLabel}</span>
        </div>
      </div>

      {/* Quick Presets Pills */}
      {showPresets && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {presets.map((p, idx) => {
            const isSelected = minVal === p.range[0] && maxVal === p.range[1];
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(p.range)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? "bg-red-600 text-white shadow-xs font-semibold"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200/80"
                }`}
              >
                {lang === "ru" ? p.labelRu : p.labelUz}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
