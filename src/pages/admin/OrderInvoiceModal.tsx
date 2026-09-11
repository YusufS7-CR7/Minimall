import React from "react";
import type { Order } from "@/data/orderTypes";
import { formatPrice } from "@/utils/formatPrice";

interface OrderInvoiceModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function OrderInvoiceModal({ order, isOpen, onClose }: OrderInvoiceModalProps) {
  if (!isOpen || !order) return null;

  const paymentLabels: Record<string, string> = {
    cash: "Наличными курьеру при получении",
    click: "Click (онлайн)",
    payme: "Payme (онлайн)",
    bank_transfer: "Перевод на р/с (юр. лица)",
  };

  const paymentMethodText = paymentLabels[order.customer.paymentMethod] || order.customer.paymentMethod;

  const orderDate = new Date(order.createdAt).toLocaleString("ru-RU", {
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
              <h3 className="font-bold text-sm sm:text-base">Накладная заказа {order.id}</h3>
              <p className="text-[11px] text-gray-400">Товарный чек для курьера и склада</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm px-4 py-2 rounded-xl transition-all shadow-md shadow-red-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Печать / Сохранить PDF</span>
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
                src="/logo.jpg"
                alt="Minimall"
                className="w-12 h-12 rounded-xl object-contain border border-gray-200 p-0.5"
              />
              <div>
                <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                  MINIMALL MARKETPLACE
                </h1>
                <p className="text-xs text-gray-600">Интернет-магазин строительных инструментов и техники</p>
                <p className="text-xs text-gray-500 font-mono mt-0.5">mini-mall.uz | Ташкент, Узбекистан</p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs text-gray-600 space-y-0.5">
              <div className="font-bold text-gray-900">Служба поддержки & логистика:</div>
              <div>📞 +998 (97) 036 36 36</div>
              <div>📞 +998 (71) 200 00 00</div>
              <div>Режим работы: 09:00 — 19:00</div>
            </div>
          </div>

          {/* Title & Metadata */}
          <div className="py-4 my-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200">
            <div>
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">Документ</span>
              <h2 className="text-lg sm:text-xl font-black text-gray-900 font-mono">
                ТОВАРНЫЙ ЧЕК № {order.id}
              </h2>
            </div>
            <div className="text-left sm:text-right text-xs">
              <span className="text-gray-500">Дата оформления: </span>
              <span className="font-bold text-gray-900">{orderDate}</span>
            </div>
          </div>

          {/* Customer & Delivery Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 p-4 rounded-2xl bg-gray-50 border border-gray-200 text-xs">
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Получатель (клиент)</div>
              <div className="font-bold text-sm text-gray-900">{order.customer.name}</div>
              <div className="font-mono text-gray-800">
                📞 <strong>{order.customer.phone}</strong>
              </div>
              <div className="text-gray-600">
                📍 Город/Регион: <strong>{order.customer.city}</strong>
              </div>
              <div className="text-gray-800">
                🏠 Адрес: <strong>{order.customer.address}</strong>
              </div>
            </div>

            <div className="space-y-1.5 border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-4">
              <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Детали доставки и оплаты</div>
              <div>
                💳 Оплата: <span className="font-bold text-gray-900">{paymentMethodText}</span>
              </div>
              <div>
                🚚 Статус доставки:{" "}
                <span className="font-bold uppercase text-red-600">
                  {order.status === "new" ? "Новый заказ" : order.status === "processing" ? "В обработке" : order.status === "shipping" ? "В доставке" : order.status === "completed" ? "Выполнен" : "Отменен"}
                </span>
              </div>
              {order.customer.comment && (
                <div className="bg-white p-2 rounded-xl border border-gray-200 text-[11px] text-gray-700">
                  <span className="font-bold">Комментарий:</span> «{order.customer.comment}»
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="my-6">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 text-center w-8">№</th>
                  <th className="py-2.5 px-3">Наименование товара</th>
                  <th className="py-2.5 px-3 text-center w-16">Кол-во</th>
                  <th className="py-2.5 px-3 text-right w-28">Цена (сум)</th>
                  <th className="py-2.5 px-3 text-right w-32">Сумма (сум)</th>
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
                    <td className="py-2.5 px-3 text-center font-bold text-gray-800">{item.count} шт.</td>
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
              <div>Всего позиций: <strong>{order.items.length}</strong> | Общее кол-во: <strong>{totalItemsCount} шт.</strong></div>
              <div>Доставка: <strong>{order.totalAmount >= 1_000_000 ? "Бесплатно" : "По договоренности"}</strong></div>
            </div>

            <div className="text-right w-full sm:w-auto">
              <div className="text-[11px] uppercase font-bold text-gray-400">Итого к оплате курьеру:</div>
              <div className="text-2xl font-black text-red-600 font-mono">
                {formatPrice(order.totalAmount)}
              </div>
            </div>
          </div>

          {/* Warranty & Return terms */}
          <div className="text-[11px] text-gray-500 bg-white p-3 rounded-xl border border-dashed border-gray-300 my-4 leading-relaxed">
            <strong>Правила и условия:</strong> Покупатель имеет право на возврат или обмен товара надлежащего качества в течение <strong>4 (четырех) календарных дней</strong> с момента покупки при условии сохранения товарного вида, заводской упаковки, ярлыков и данного товарного чека.
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t-2 border-gray-900 text-xs">
            <div>
              <div className="font-bold text-gray-900 mb-6">Отпустил со склада / Курьер:</div>
              <div className="border-b border-gray-400 pb-1 text-gray-400 text-[10px]">
                Подпись / Фамилия: ___________________________
              </div>
            </div>
            <div>
              <div className="font-bold text-gray-900 mb-6">Заказ принял Покупатель:</div>
              <div className="border-b border-gray-400 pb-1 text-gray-400 text-[10px]">
                Претензий по комплектности и внешнему виду не имею. Подпись: _________
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
            Закрыть
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>🖨️ Распечатать чек</span>
          </button>
        </div>
      </div>
    </div>
  );
}
