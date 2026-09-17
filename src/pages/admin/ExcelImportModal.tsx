import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { useCategories } from "@/context/CategoriesContext";
import { useProducts } from "@/context/ProductsContext";
import { useApp } from "@/context/AppContext";
import type { Product } from "@/data/types";
import { formatPrice } from "@/utils/formatPrice";
import CustomSelect from "@/components/ui/CustomSelect";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

interface ParsedRow {
  name: string;
  price: number;
  brand: string;
  isValid: boolean;
  error?: string;
}

export default function ExcelImportModal({
  isOpen,
  onClose,
  onSuccess,
}: ExcelImportModalProps) {
  const { lang } = useApp();
  const { categories } = useCategories();
  const { addProductsBatch, brands } = useProducts();

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [defaultCategory, setDefaultCategory] = useState<string>("drills");
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Clean and parse price strings like "1 250 000 сум", "1,250,000", "450000"
  const parsePrice = (raw: unknown): number => {
    if (typeof raw === "number") return Math.round(raw);
    if (!raw) return 0;
    const str = String(raw).trim();
    // Remove currency words, spaces, non-breaking spaces
    const cleaned = str
      .replace(/сум|so'm|som|uzs|руб|rub/gi, "")
      .replace(/[\s\u00a0]/g, "")
      .replace(/,/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) || num <= 0 ? 0 : Math.round(num);
  };

  // Detect brand in product name (e.g. "Дрель Makita HP1630" -> "Makita")
  const detectBrand = (title: string): string => {
    const titleLower = title.toLowerCase();
    for (const b of brands) {
      if (b !== "Без бренда" && titleLower.includes(b.toLowerCase())) {
        return b;
      }
    }
    return "Без бренда";
  };

  const handleFileProcess = async (file: File) => {
    setErrorMessage(null);
    setFileName(file.name);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        setErrorMessage(
          lang === "uz" ? "Faylda varaqlar topilmadi." : "В файле не найдено листов с данными."
        );
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawData = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });

      if (!rawData || rawData.length === 0) {
        setErrorMessage(
          lang === "uz" ? "Fayl bo'sh." : "Выбранный файл пуст."
        );
        return;
      }

      const rows: ParsedRow[] = [];

      // Check if row 0 is a header row (e.g. "Название", "Цена")
      let startIndex = 0;
      if (rawData.length > 0) {
        const firstRow = rawData[0] as unknown[];
        const col0 = String(firstRow[0] || "").toLowerCase();
        const col1 = String(firstRow[1] || "").toLowerCase();
        if (
          col0.includes("назван") ||
          col0.includes("наименов") ||
          col0.includes("товар") ||
          col0.includes("nom") ||
          col0.includes("name") ||
          col0.includes("mahsulot") ||
          col1.includes("цен") ||
          col1.includes("narx") ||
          col1.includes("cost") ||
          col1.includes("price")
        ) {
          startIndex = 1;
        }
      }

      for (let i = startIndex; i < rawData.length; i++) {
        const row = rawData[i] as unknown[];
        if (!row || row.length === 0) continue;

        const rawName = row[0] !== undefined ? String(row[0]).trim() : "";
        const rawPrice = row[1] !== undefined ? row[1] : 0;

        // Skip completely empty rows
        if (!rawName && !rawPrice) continue;

        const parsedPriceVal = parsePrice(rawPrice);
        const isValid = rawName.length > 0 && parsedPriceVal > 0;

        let err: string | undefined;
        if (!rawName) err = lang === "uz" ? "Nom kiritilmagan" : "Нет названия";
        else if (parsedPriceVal <= 0) err = lang === "uz" ? "Noto'g'ri narx" : "Некорректная цена";

        rows.push({
          name: rawName,
          price: parsedPriceVal,
          brand: detectBrand(rawName),
          isValid,
          error: err,
        });
      }

      if (rows.length === 0) {
        setErrorMessage(
          lang === "uz"
            ? "Faylda tovarlar topilmadi. 1-ustun — nom, 2-ustun — narx ekanligiga ishonch hosil qiling."
            : "В таблице не найдено строк с товарами. Убедитесь, что 1-я колонка содержит название, а 2-я — цену."
        );
        return;
      }

      setParsedRows(rows);
    } catch (err) {
      console.error("Error reading excel file:", err);
      setErrorMessage(
        lang === "uz"
          ? "Faylni o'qishda xatolik yuz berdi. Iltimos, to'g'ri Excel (.xlsx) yoki CSV faylini tanlang."
          : "Ошибка при чтении файла. Убедитесь, что это корректный файл Excel (.xlsx, .xls) или CSV."
      );
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const wsData = [
      ["Название товара", "Цена (сум)"],
      ["Перфоратор Makita HR2470", 1450000],
      ["Ударная дрель Bosch GSB 13 RE", 890000],
      ["Болгарка DeWalt DWE4057", 1100000],
      ["Аккумуляторный шуруповерт Milwaukee M12", 2150000],
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    // Set column widths
    ws["!cols"] = [{ wch: 45 }, { wch: 20 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Товары");
    XLSX.writeFile(wb, "shablon_tovarov_minimall.xlsx");
  };

  const handleImportSubmit = async () => {
    const validItems = parsedRows.filter((r) => r.isValid);
    if (validItems.length === 0) return;

    setIsImporting(true);

    try {
      const itemsToCreate: Array<Omit<Product, "id">> = validItems.map((item) => ({
        name: item.name,
        nameUz: item.name,
        price: item.price,
        brand: item.brand,
        category: defaultCategory || "drills",
        image: "",
        images: [],
        inStock: true,
        rating: 5,
        descRu: `Качественный инструмент ${item.name} с официальной гарантией.`,
        descUz: `${item.name} rasmiy kafolatli sifatli asbob.`,
        specs: {},
      }));

      const added = await addProductsBatch(itemsToCreate);
      setIsImporting(false);
      onSuccess(added.length || validItems.length);
      onClose();
    } catch (err) {
      console.error("Import error:", err);
      setIsImporting(false);
      setErrorMessage(
        lang === "uz" ? "Yuklashda xatolik yuz berdi" : "Произошла ошибка при импорте товаров."
      );
    }
  };

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl">
              📊
            </div>
            <div>
              <h2
                className="text-lg sm:text-xl font-bold tracking-wide"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                {lang === "uz" ? "Excel orqali tovarlarni ommaviy yuklash" : "Массовый импорт товаров из Excel"}
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-400">
                {lang === "uz"
                  ? "1-ustun: Nom, 2-ustun: Narx (.xlsx, .xls yoki .csv)"
                  : "Колонка 1: Название, Колонка 2: Цена (.xlsx, .xls или .csv)"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="bg-red-50 text-red-700 border border-red-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Template Download Tip */}
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-200/80 p-3.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl shrink-0">💡</span>
              <div className="text-xs text-emerald-950">
                <span className="font-bold block">
                  {lang === "uz" ? "Fayl formati qanday bo'lishi kerak?" : "Каким должен быть файл?"}
                </span>
                <span className="text-[11px] text-emerald-900/90 leading-relaxed">
                  {lang === "uz"
                    ? "Har bir qatorda 2 ta ustun: Mahsulot nomi va Narxi (so'mda)."
                    : "Каждая строка — один товар: 1-я колонка — Название, 2-я — Цена."}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-300 shadow-2xs transition-all shrink-0 cursor-pointer"
            >
              <span>📥</span>
              <span>{lang === "uz" ? "Shablonni yuklab olish" : "Скачать образец"}</span>
            </button>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-red-500 bg-red-50/50"
                : fileName
                ? "border-emerald-300 bg-emerald-50/30 hover:bg-emerald-50/50"
                : "border-gray-300 hover:border-red-400 bg-gray-50/50 hover:bg-gray-50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.csv"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileProcess(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2 select-none">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-gray-200 flex items-center justify-center text-2xl">
                {fileName ? "📄" : "📁"}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">
                  {fileName ? fileName : lang === "uz" ? "Excel faylni bu yerga tashlang" : "Перетащите Excel-файл сюда"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {lang === "uz"
                    ? "yoki kompyuterdan tanlash uchun bosing (.xlsx, .xls, .csv)"
                    : "или нажмите для выбора с устройства (.xlsx, .xls, .csv)"}
                </p>
              </div>
            </div>
          </div>

          {/* If Rows Parsed: Category selector and preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-4">
              {/* Category picker for imported items */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  📁 {lang === "uz" ? "Yuklanayotgan tovarlar uchun kategoriya:" : "Категория для загружаемых товаров:"}
                </label>
                <CustomSelect
                  value={defaultCategory}
                  onChange={(val) => setDefaultCategory(val)}
                  options={categories.map((c) => ({
                    value: c.key,
                    label: lang === "uz" ? c.labelUz || c.labelRu : c.labelRu,
                    icon: c.icon,
                  }))}
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  {lang === "uz"
                    ? "Keyinchalik har bir tovarning kategoriyasini alohida o'zgartirishingiz mumkin."
                    : "Позже категорию каждого товара можно индивидуально изменить в его карточке."}
                </p>
              </div>

              {/* Status counter badges */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  {lang === "uz" ? "Topilgan tovarlar ro'yxati:" : "Предпросмотр распознанных товаров:"}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                    ✓ {validCount} {lang === "uz" ? "ta tayyor" : "готово к загрузке"}
                  </span>
                  {invalidCount > 0 && (
                    <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md">
                      ⚠️ {invalidCount} {lang === "uz" ? "ta xato (o'tkaziladi)" : "пропущено"}
                    </span>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100/80 sticky top-0 text-gray-600 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center">#</th>
                      <th className="py-2 px-3">{lang === "uz" ? "Nomi" : "Название"}</th>
                      <th className="py-2 px-3 w-28">{lang === "uz" ? "Brend" : "Бренд"}</th>
                      <th className="py-2 px-3 w-28 text-right">{lang === "uz" ? "Narxi" : "Цена"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {parsedRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row.isValid ? "hover:bg-gray-50/50" : "bg-red-50/40 text-red-600"}
                      >
                        <td className="py-2 px-3 text-center text-gray-400 font-mono text-[10px]">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-medium text-gray-900 max-w-[200px] truncate">
                          {row.name || <span className="text-red-500 italic">—</span>}
                          {row.error && (
                            <span className="ml-2 text-[10px] text-red-500 font-normal">
                              ({row.error})
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-gray-500">
                          <span className="bg-gray-100 text-gray-700 font-semibold px-1.5 py-0.5 rounded text-[10px]">
                            {row.brand}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-gray-900 font-mono">
                          {row.price > 0 ? formatPrice(row.price) : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 sm:px-6 py-3.5 bg-gray-50 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isImporting}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
          >
            {lang === "uz" ? "Bekor qilish" : "Отмена"}
          </button>

          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={validCount === 0 || isImporting}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            {isImporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{lang === "uz" ? "Yuklanmoqda..." : "Импортируем..."}</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>
                  {lang === "uz"
                    ? `${validCount} ta tovarni yuklash`
                    : `Импортировать ${validCount} ${validCount === 1 ? "товар" : validCount > 1 && validCount < 5 ? "товара" : "товаров"}`}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
