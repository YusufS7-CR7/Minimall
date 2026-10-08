import { useState, useMemo, useEffect } from "react";
import { useProducts } from "@/context/ProductsContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useApp } from "@/context/AppContext";
import { formatPrice } from "@/utils/formatPrice";
import { getUsdProductInfo, isUsdProduct } from "@/utils/usdProductUtils";

interface CurrencySyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRate?: number;
}

export default function CurrencySyncModal({
  isOpen,
  onClose,
  initialRate,
}: CurrencySyncModalProps) {
  const { products, syncProductsWithUsdRate } = useProducts();
  const { usdRate, setUsdRate } = useCurrency();
  const { lang, showToast } = useApp();

  const [targetRateInput, setTargetRateInput] = useState<string>(
    String(initialRate || usdRate)
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{
    current: number;
    total: number;
    percent: number;
  }>({ current: 0, total: 0, percent: 0 });
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    count: number;
    rate: number;
  } | null>(null);
  const [searchPreview, setSearchPreview] = useState("");

  // Sync rate input when modal opens or initialRate changes
  useEffect(() => {
    if (isOpen) {
      setTargetRateInput(String(initialRate || usdRate));
      setSyncResult(null);
      setIsSyncing(false);
      setSyncProgress({ current: 0, total: 0, percent: 0 });
    }
  }, [isOpen, initialRate, usdRate]);

  const parsedTargetRate = useMemo(() => {
    const val = parseFloat(targetRateInput.replace(/\s/g, "").replace(/,/g, "."));
    return !isNaN(val) && val > 0 ? val : usdRate;
  }, [targetRateInput, usdRate]);

  // Identify all USD products
  const usdProducts = useMemo(() => {
    return products.filter(isUsdProduct);
  }, [products]);

  // Compute live preview and stats for all USD products
  const previewItems = useMemo(() => {
    return usdProducts.map((p) => {
      const info = getUsdProductInfo(p, parsedTargetRate);
      return {
        product: p,
        ...info,
      };
    });
  }, [usdProducts, parsedTargetRate]);

  const stats = useMemo(() => {
    const totalUsd = previewItems.length;
    const willChange = previewItems.filter((item) => item.priceDiff !== 0).length;
    const unchanged = totalUsd - willChange;
    return { totalUsd, willChange, unchanged };
  }, [previewItems]);

  // Filter preview by search
  const filteredPreview = useMemo(() => {
    if (!searchPreview.trim()) return previewItems;
    const q = searchPreview.toLowerCase();
    return previewItems.filter(
      (item) =>
        item.product.name.toLowerCase().includes(q) ||
        item.product.brand.toLowerCase().includes(q) ||
        (item.product.nameUz && item.product.nameUz.toLowerCase().includes(q))
    );
  }, [previewItems, searchPreview]);

  if (!isOpen) return null;

  const handleStartSync = async () => {
    if (parsedTargetRate <= 0) return;
    setIsSyncing(true);
    setSyncResult(null);

    // If rate input differs from context, update context rate too
    if (parsedTargetRate !== usdRate) {
      setUsdRate(parsedTargetRate);
    }

    try {
      const result = await syncProductsWithUsdRate(
        parsedTargetRate,
        (progress) => {
          setSyncProgress(progress);
        }
      );

      setSyncResult({
        success: result.success,
        count: result.updatedCount,
        rate: parsedTargetRate,
      });

      showToast(
        lang === "uz"
          ? `${result.updatedCount} ta tovar narxi 1$ = ${parsedTargetRate.toLocaleString("ru")} so'm kursi bo'yicha muvaffaqiyatli yangilandi!`
          : `Цены для ${result.updatedCount} товаров успешно пересчитаны по курсу 1$ = ${parsedTargetRate.toLocaleString("ru")} сум!`
      );
    } catch (err) {
      console.error("Sync error:", err);
      showToast(
        lang === "uz"
          ? "Sinxronlashda xatolik yuz berdi"
          : "Произошла ошибка при синхронизации цен"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSyncing) onClose();
      }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-5 sm:p-6 shrink-0 relative">
          <button
            type="button"
            disabled={isSyncing}
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
            title={lang === "uz" ? "Yopish" : "Закрыть"}
          >
            ✕
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner shrink-0">
              💱
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">
                {lang === "uz"
                  ? "Dollardagi tovarlar narxini sinxronlash"
                  : "Синхронизация цен по курсу доллара"}
              </h2>
              <p className="text-xs text-amber-100 mt-0.5">
                {lang === "uz"
                  ? "Barcha USD narxli tovarlar yangi kurs bo'yicha so'mda qayta hisoblanadi"
                  : "Автоматический пересчёт цен в сумах для всех товаров, добавленных в долларах"}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Target Rate Setting Card */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-amber-900">
                  {lang === "uz" ? "Qo'llanadigan dollar kursi (1 USD = )" : "Применяемый курс доллара (1 USD = )"}
                </label>
                <p className="text-[11px] text-amber-700/80">
                  {lang === "uz"
                    ? `Joriy saqlangan kurs: 1$ = ${usdRate.toLocaleString("ru")} so'm`
                    : `Текущий сохранённый курс: 1$ = ${usdRate.toLocaleString("ru")} сум`}
                </p>
              </div>

              {/* Rate input */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="50"
                    disabled={isSyncing}
                    value={targetRateInput}
                    onChange={(e) => setTargetRateInput(e.target.value)}
                    className="w-36 text-base font-black px-3 py-2 bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-amber-950 text-right pr-12 shadow-2xs"
                    placeholder="12700"
                  />
                  <span className="absolute right-3 top-2.5 text-xs font-bold text-amber-700 pointer-events-none">
                    {lang === "uz" ? "so'm" : "сум"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick +/- rate adjustment buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-amber-200/60">
              <span className="text-[11px] text-amber-800 font-medium mr-1">
                {lang === "uz" ? "Tezkor sozlash:" : "Быстрая подгонка:"}
              </span>
              {[
                { label: "-500", delta: -500 },
                { label: "-100", delta: -100 },
                { label: "+100", delta: 100 },
                { label: "+500", delta: 500 },
              ].map(({ label, delta }) => (
                <button
                  key={label}
                  type="button"
                  disabled={isSyncing}
                  onClick={() => {
                    const next = Math.max(100, parsedTargetRate + delta);
                    setTargetRateInput(String(next));
                  }}
                  className="px-2 py-0.5 text-xs font-semibold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {label}
                </button>
              ))}
              {parsedTargetRate !== usdRate && (
                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={() => setTargetRateInput(String(usdRate))}
                  className="px-2 py-0.5 text-xs font-semibold text-amber-700 hover:text-amber-900 underline transition-colors cursor-pointer ml-auto disabled:opacity-50"
                >
                  {lang === "uz" ? "Asliga qaytarish" : "Сбросить к текущему"}
                </button>
              )}
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-gray-50 border border-gray-200/80 rounded-2xl p-3 text-center">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {lang === "uz" ? "Dollarda" : "В долларах"}
              </div>
              <div className="text-xl sm:text-2xl font-black text-gray-900 mt-0.5">
                {stats.totalUsd}
              </div>
              <div className="text-[10px] text-gray-500">
                {lang === "uz" ? "tovar topildi" : "товаров найдено"}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
              <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                {lang === "uz" ? "O'zgaradi" : "Изменят цену"}
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5">
                {stats.willChange}
              </div>
              <div className="text-[10px] text-amber-600">
                {lang === "uz" ? "kurs farqi sababli" : "из-за разницы курса"}
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center">
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                {lang === "uz" ? "So'mdagilar" : "В сумах"}
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5">
                {products.length - stats.totalUsd}
              </div>
              <div className="text-[10px] text-emerald-600">
                {lang === "uz" ? "o'zgarmaydi" : "не изменятся"}
              </div>
            </div>
          </div>

          {/* Sync Result Banner */}
          {syncResult && (
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3 animate-fade-in ${
                syncResult.success
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-red-50 border-red-300 text-red-950"
              }`}
            >
              <span className="text-2xl shrink-0">
                {syncResult.success ? "🎉" : "⚠️"}
              </span>
              <div className="flex-1 text-xs">
                <div className="font-bold text-sm">
                  {syncResult.success
                    ? lang === "uz"
                      ? "Sinxronlash muvaffaqiyatli yakunlandi!"
                      : "Синхронизация успешно завершена!"
                    : lang === "uz"
                    ? "Sinxronlashda ogohlantirishlar bo'ldi"
                    : "Синхронизация завершена с предупреждениями"}
                </div>
                <p className="mt-0.5 text-emerald-800">
                  {lang === "uz"
                    ? `${syncResult.count} ta tovar yangi kurs (1$ = ${syncResult.rate.toLocaleString("ru")} so'm) bo'yicha bazada yangilandi va butun saytda ko'rsatiladi.`
                    : `Цены для ${syncResult.count} товаров обновлены в базе данных по курсу 1$ = ${syncResult.rate.toLocaleString("ru")} сум и сразу видны покупателям на сайте.`}
                </p>
              </div>
            </div>
          )}

          {/* Progress Bar during Sync */}
          {isSyncing && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block animate-spin">🔄</span>
                  <span>
                    {lang === "uz"
                      ? "Baza bilan sinxronlanmoqda..."
                      : "Синхронизация с базой данных..."}
                  </span>
                </span>
                <span>
                  {syncProgress.current} / {syncProgress.total} ({syncProgress.percent}%)
                </span>
              </div>
              <div className="w-full bg-amber-200/80 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-2.5 rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${syncProgress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Preview Section */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <span>📋</span>
                <span>
                  {lang === "uz"
                    ? `Sinxronlanadigan tovarlar (${filteredPreview.length})`
                    : `Товары для синхронизации (${filteredPreview.length})`}
                </span>
              </div>

              {stats.totalUsd > 5 && (
                <input
                  type="text"
                  placeholder={lang === "uz" ? "Tovarni qidirish..." : "Поиск по названию..."}
                  value={searchPreview}
                  onChange={(e) => setSearchPreview(e.target.value)}
                  className="text-xs px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-400 w-44"
                />
              )}
            </div>

            {/* Preview List */}
            {usdProducts.length === 0 ? (
              <div className="p-6 text-center bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 text-xs space-y-1">
                <div className="text-2xl">📦</div>
                <div className="font-semibold text-gray-700">
                  {lang === "uz"
                    ? "Dollarda qo'shilgan tovarlar topilmadi"
                    : "Товаров с ценой в USD не найдено"}
                </div>
                <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
                  {lang === "uz"
                    ? "Tovarlarni dollarda kiritish uchun tovar qo'shish formasida USD rejimini tanlang yoki Excel orqali USD valyutasi bilan import qiling."
                    : "Чтобы товар пересчитывался по курсу, указывайте его цену в USD при создании или в Excel-импорте."}
                </p>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-gray-100 rounded-2xl divide-y divide-gray-100 bg-white">
                {filteredPreview.slice(0, 30).map((item) => {
                  const p = item.product;
                  const isDiff = item.priceDiff !== 0;

                  return (
                    <div
                      key={p.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors text-xs"
                    >
                      {/* Product identity */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt=""
                            className="w-9 h-9 rounded-lg object-contain bg-gray-50 border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs shrink-0 font-bold">
                            📦
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-gray-900 truncate">
                            {lang === "uz" ? p.nameUz || p.name : p.name}
                          </div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-amber-700">
                              {p.brand}
                            </span>
                            {item.usdPrice !== null && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-mono font-bold text-[10px]">
                                ${item.usdPrice.toFixed(2).replace(/\.00$/, "")}
                              </span>
                            )}
                            {item.hasUsdSizes && (
                              <span className="text-[10px] text-gray-500">
                                ({item.usdSizesCount} {lang === "uz" ? "ta variant" : "вариантов"})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Price Transition Display */}
                      <div className="text-right shrink-0">
                        <div className="flex items-center justify-end gap-1.5 font-mono">
                          <span className="text-gray-400 line-through text-[11px]">
                            {formatPrice(item.currentUzsPrice)}
                          </span>
                          <span className="text-gray-300">→</span>
                          <span className="font-extrabold text-gray-900 text-xs">
                            {formatPrice(item.calculatedUzsPrice)}
                          </span>
                        </div>

                        {isDiff ? (
                          <div
                            className={`text-[10px] font-bold mt-0.5 ${
                              item.priceDiff > 0
                                ? "text-emerald-600"
                                : "text-amber-600"
                            }`}
                          >
                            {item.priceDiff > 0 ? "+" : ""}
                            {item.priceDiff.toLocaleString("ru")} сум
                          </div>
                        ) : (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            ✓ {lang === "uz" ? "Mos keladi" : "Уже по курсу"}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filteredPreview.length > 30 && (
                  <div className="p-2.5 text-center text-xs text-gray-400 bg-gray-50">
                    {lang === "uz"
                      ? `Yana ${filteredPreview.length - 30} ta tovar ro'yxatda mavjud...`
                      : `И ещё ${filteredPreview.length - 30} товаров...`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            disabled={isSyncing}
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            {syncResult?.success
              ? lang === "uz"
                ? "Yopish"
                : "Закрыть"
              : lang === "uz"
              ? "Bekor qilish"
              : "Отмена"}
          </button>

          <button
            type="button"
            disabled={isSyncing || usdProducts.length === 0}
            onClick={handleStartSync}
            className={`px-6 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              syncResult?.success
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/25"
            }`}
          >
            <span className={isSyncing ? "animate-spin" : ""}>
              {isSyncing ? "🔄" : syncResult?.success ? "✓" : "⚡"}
            </span>
            <span>
              {isSyncing
                ? lang === "uz"
                  ? "Sinxronlanmoqda..."
                  : "Синхронизация..."
                : syncResult?.success
                ? lang === "uz"
                  ? "Yana sinxronlash"
                  : "Синхронизировать снова"
                : lang === "uz"
                ? `Narxlarni sinxronlash (${stats.totalUsd})`
                : `Синхронизировать цены (${stats.totalUsd})`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
