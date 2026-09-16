import React from "react";
import type { Order } from "@/data/orderTypes";
import { ORDER_STATUS_LABELS } from "@/data/orderTypes";
import { formatPrice } from "@/utils/formatPrice";
import { useApp } from "@/context/AppContext";
import { ADMIN_TRANSLATIONS } from "@/data/adminTranslations";
import { LOGO_DATA_URI } from "@/assets/logoDataUri";

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderInvoiceModal({ order, isOpen, onClose }: OrderInvoiceModalProps) {
  const { lang } = useApp();
  const t = ADMIN_TRANSLATIONS[lang].invoice;

  if (!isOpen || !order) return null;

  const paymentLabels: Record<string, { ru: string; uz: string }> = {
    cash: { ru: "Наличными курьеру при получении", uz: "Qabul qilishda kuryerga naqd" },
    click: { ru: "Click (онлайн)", uz: "Click (onlayn)" },
    payme: { ru: "Payme (онлайн)", uz: "Payme (onlayn)" },
    bank_transfer: { ru: "Перевод на р/с (юр. лица)", uz: "Hisob-kitob raqamiga o'tkazish (yuridik shaxslar)" },
  };

  const paymentMethodText =
    paymentLabels[order.customer.paymentMethod]?.[lang] || order.customer.paymentMethod;

  const orderDate = new Date(order.createdAt).toLocaleString(lang === "uz" ? "uz-UZ" : "ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalItemsCount = order.items.reduce((sum, item) => sum + item.count, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      {/* Container — styled for screen and ready for window.print() */}
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-auto max-h-[96vh]">
        {/* Modal Toolbar (hidden on print) */}
        <div className="bg-gray-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🖨️</span>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {lang === "uz" ? `${order.id} buyurtma schot-fakturasi` : `Накладная заказа ${order.id}`}
              </h3>
              <p className="text-[11px] text-gray-400">
                {lang === "uz" ? "Kuryer va ombor uchun tovar cheki" : "Товарный чек для курьера и склада"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t.printBtn}</span>
              <span>🖨️</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 sm:p-8 overflow-y-auto print:p-0 print:m-0 print:overflow-visible print:max-h-none text-gray-900 font-sans" id="invoice-printable-area">
          {/* Print specific CSS */}
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #invoice-printable-area, #invoice-printable-area * {
                visibility: visible;
              }
              #invoice-printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                margin: 0;
                padding: 15mm;
                font-size: 11pt;
                color: #000;
              }
            }
          `}</style>

          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-gray-900">
            <div className="flex items-start gap-3">
              <img
                src={LOGO_DATA_URI}
                alt="Minimall"
                className="w-12 h-12 rounded-xl object-contain border border-gray-200 p-0.5"
              />
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  MINIMALL MARKETPLACE
                </h1>
                <p className="text-xs text-gray-600">
                  {lang === "uz" ? "Qurilish asboblari va texnikalari internet-do'koni" : "Интернет-магазин строительных инструментов и техники"}
                </p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">
                  mini-mall.uz | {lang === "uz" ? "Toshkent, O'zbekiston" : "Ташкент, Узбекистан"}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-gray-600 space-y-0.5">
              <div className="font-bold text-gray-900">
                {lang === "uz" ? "Qo'llab-quvvatlash va logistika:" : "Служба поддержки & логистика:"}
              </div>
              <div>📞 +998 (97) 036 36 36</div>
              <div>{lang === "uz" ? "Ish vaqti: 09:00 — 19:00" : "Режим работы: 09:00 — 19:00"}</div>
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="py-4 my-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200">
            <div>
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                {lang === "uz" ? "HUJJAT" : "Документ"}
              </span>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 font-mono">
                {lang === "uz" ? `TOVAR CHEKI № ${order.id}` : `ТОВАРНЫЙ ЧЕК № ${order.id}`}
              </h2>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="text-gray-500">{t.date}: </span>
              <span className="font-bold text-gray-900">{orderDate}</span>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                {t.customer}
              </div>
              <div className="font-bold text-sm text-gray-900">{order.customer.name}</div>
              <div className="font-mono text-gray-800">
                📞 <strong>{order.customer.phone}</strong>
              </div>
              <div className="text-gray-600">
                📍 {t.city}: <strong>{order.customer.city}</strong>
              </div>
              <div className="text-gray-800">
                🏠 {t.address}: <strong>{order.customer.address}</strong>
              </div>
            </div>

            <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-4">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                {lang === "uz" ? "Yetkazib berish va to'lov tafsilotlari" : "Детали доставки и оплаты"}
              </div>
              <div>
                💳 {t.payment}: <span className="font-bold text-gray-900">{paymentMethodText}</span>
              </div>
              <div>
                🚚 {lang === "uz" ? "Holati: " : "Статус доставки: "}
                <span className="font-bold uppercase text-red-600">
                  {ORDER_STATUS_LABELS[order.status]?.[lang] || order.status}
                </span>
              </div>
              {order.customer.comment && (
                <div className="bg-white p-2 rounded-xl border border-gray-200 text-[11px] text-gray-700">
                  <span className="font-bold">{lang === "uz" ? "Izoh:" : "Комментарий:"}</span> «{order.customer.comment}»
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="my-6 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 text-center w-8">{t.colNum}</th>
                  <th className="py-2.5 px-3">{t.colItem}</th>
                  <th className="py-2.5 px-3 text-center w-16">{t.colQty}</th>
                  <th className="py-2.5 px-3 text-right w-28">{t.colPrice}</th>
                  <th className="py-2.5 px-3 text-right w-32">{t.colSum}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    <td className="py-2.5 px-3 text-center text-gray-400 font-mono">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-gray-900">
                      <div className="flex items-center gap-2">
                        {item.image && (
                          <img
                            src={item.image}
                            alt=""
                            className="w-7 h-7 rounded object-cover border border-gray-200 shrink-0 print:hidden"
                          />
                        )}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                      {item.count} {lang === "uz" ? "dona" : "шт."}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-gray-700">{formatPrice(item.price)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">
                      {formatPrice(item.price * item.count)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Calculation */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 my-4">
            <div className="text-xs text-gray-500 space-y-1">
              <div>
                {lang === "uz"
                  ? <>Jami pozitsiyalar: <strong>{order.items.length}</strong> | Umumiy soni: <strong>{totalItemsCount} dona</strong></>
                  : <>Всего позиций: <strong>{order.items.length}</strong> | Общее кол-во: <strong>{totalItemsCount} шт.</strong></>}
              </div>
              <div>
                {lang === "uz"
                  ? <>Yetkazib berish: <strong>{order.totalAmount >= 1_000_000 ? "Bepul" : "Kelishuv asosida"}</strong></>
                  : <>Доставка: <strong>{order.totalAmount >= 1_000_000 ? "Бесплатно" : "По договоренности"}</strong></>}
              </div>
            </div>

            <div className="text-right w-full sm:w-auto">
              <div className="text-[11px] uppercase font-bold text-gray-400">
                {t.totalToPay}:
              </div>
              <div className="text-2xl font-black text-red-600 font-mono">
                {formatPrice(order.totalAmount)}
              </div>
            </div>
          </div>

          {/* Warranty & Return terms */}
          <div className="text-[11px] text-gray-500 bg-white p-3 rounded-xl border border-dashed border-gray-300 my-4 leading-relaxed">
            <strong>{lang === "uz" ? "Qoidalar va shartlar:" : "Правила и условия:"}</strong>{" "}
            {lang === "uz"
              ? "Xaridor tovar ko'rinishi, zavod qadog'i, yorliqlar va ushbu tovar cheki saqlangan holda, xarid qilingan paytdan boshlab 4 (to'rt) kalendar kun ichida tovarlarni qaytarish yoki almashtirish huquqiga ega."
              : "Покупатель имеет право на возврат или обмен товара надлежащего качества в течение 4 (четырех) календарных дней с момента покупки при условии сохранения товарного вида, заводской упаковки, ярлыков и данного товарного чека."}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t-2 border-gray-900 text-xs">
            <div>
              <div className="font-bold text-gray-900 mb-6">
                {lang === "uz" ? "Ombordan topshirdi / Kuryer:" : "Отпустил со склада / Курьер:"}
              </div>
              <div className="border-b border-gray-400 pb-1 text-gray-400 text-[10px]">
                {lang === "uz" ? "Imzo / Familiya: ___________________________" : "Подпись / Фамилия: ___________________________"}
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-6">{t.buyerSign}:</div>
              <div className="border-b border-gray-400 pb-1 text-gray-400 text-[10px]">
                {lang === "uz"
                  ? "Butligi va tashqi ko'rinishi bo'yicha e'tirozlarim yo'q. Imzo: _________"
                  : "Претензий по комплектности и внешнему виду не имею. Подпись: _________"}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions (screen only) */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {lang === "uz" ? "Yopish" : "Закрыть"}
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>🖨️ {t.printBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
