import { useEffect, useState } from "react";
import { useOrders } from "@/context/OrdersContext";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { ORDER_STATUS_LABELS } from "@/data/orderTypes";
import type { Order } from "@/data/orderTypes";
import { formatPrice } from "@/utils/formatPrice";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_STEPS = ["new", "processing", "shipping", "completed"] as const;

function StatusTracker({ status, lang }: { status: string; lang: "ru" | "uz" }) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl border border-red-200">
        <span className="text-red-500 text-lg">✕</span>
        <span className="text-xs font-bold text-red-600">
          {lang === "ru" ? "Заказ отменён" : "Buyurtma bekor qilindi"}
        </span>
      </div>
    );
  }

  const currentIdx = STATUS_STEPS.indexOf(status as typeof STATUS_STEPS[number]);

  const labels: Record<string, { ru: string; uz: string; icon: string }> = {
    new: { ru: "Принят", uz: "Qabul", icon: "📋" },
    processing: { ru: "Обработка", uz: "Jarayon", icon: "⚙️" },
    shipping: { ru: "Доставка", uz: "Yetkazish", icon: "🚚" },
    completed: { ru: "Выполнен", uz: "Bajarildi", icon: "✅" },
  };

  return (
    <div className="flex items-center gap-1 w-full">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        const lbl = labels[step];
        return (
          <div key={step} className="flex-1 flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all ${
                done
                  ? active
                    ? "bg-red-500 text-white shadow-md shadow-red-500/30 scale-110"
                    : "bg-emerald-500 text-white"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {done && !active ? "✓" : lbl.icon}
            </div>
            <span className={`text-[9px] font-medium text-center leading-tight ${done ? "text-gray-700" : "text-gray-400"}`}>
              {lang === "ru" ? lbl.ru : lbl.uz}
            </span>
            {/* Connector line (not after last) */}
            {idx < STATUS_STEPS.length - 1 && (
              <div
                className={`absolute h-0.5 mt-3.5 transition-all`}
                style={{
                  width: "calc(100% / 4)",
                  left: `calc(${idx} * 25% + 12.5%)`,
                  backgroundColor: idx < currentIdx ? "#10b981" : "#e5e7eb",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OrderCard({ order, lang, onExpand, expanded }: {
  order: Order;
  lang: "ru" | "uz";
  onExpand: () => void;
  expanded: boolean;
}) {
  const statusInfo = ORDER_STATUS_LABELS[order.status];
  const date = new Date(order.createdAt);
  const dateStr = date.toLocaleDateString(lang === "ru" ? "ru-RU" : "uz-UZ", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  const payLabels: Record<string, string> = {
    cash: "💵 Наличными",
    click: "📱 Click",
    payme: "💳 Payme",
    bank_transfer: "🏢 Перевод",
  };

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all ${
      order.status === "cancelled" ? "border-red-100 bg-red-50/30" : "border-gray-100 bg-white"
    }`}>
      {/* Card header */}
      <button
        onClick={onExpand}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
            {order.items[0]?.image
              ? <img src={order.items[0].image} alt="" className="w-full h-full object-cover rounded-xl" />
              : "📦"}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-gray-900 font-mono">{order.id}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                {lang === "ru" ? statusInfo.ru : statusInfo.uz}
              </span>
            </div>
            <div className="text-[11px] text-gray-400 mt-0.5">{dateStr}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-bold text-sm text-gray-900">{formatPrice(order.totalAmount)}</span>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-3">
          {/* Status tracker */}
          <div className="relative">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              {lang === "ru" ? "Статус заказа" : "Buyurtma holati"}
            </p>
            <StatusTracker status={order.status} lang={lang} />
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {lang === "ru" ? "Товары" : "Tovarlar"}
            </p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-10 h-10 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-[11px] text-gray-500">{item.count} шт. × {formatPrice(item.price)}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-900 shrink-0">{formatPrice(item.price * item.count)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery info */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">📍 Адрес</p>
              <p className="text-gray-700">{order.customer.city}</p>
              <p className="text-gray-600 text-[11px]">{order.customer.address}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">💳 Оплата</p>
              <p className="text-gray-700">{payLabels[order.customer.paymentMethod] ?? order.customer.paymentMethod}</p>
              {order.customer.comment && (
                <p className="text-gray-500 text-[11px] mt-1">💬 {order.customer.comment}</p>
              )}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            <span className="text-xs font-bold text-gray-700">
              {lang === "ru" ? "Итого к оплате" : "Jami to'lov"}
            </span>
            <span className="text-base font-black text-red-600">{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderHistoryModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const { userOrders, fetchUserOrders, loading } = useOrders();
  const { lang } = useApp();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserOrders(user.id);
    }
  }, [isOpen, user, fetchUserOrders]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧾</span>
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>
                {lang === "ru" ? "Мои заказы" : "Mening buyurtmalarim"}
              </h2>
              <p className="text-xs text-gray-400">
                {userOrders.length > 0
                  ? (lang === "ru" ? `${userOrders.length} заказ(а) в истории` : `Tarixda ${userOrders.length} ta buyurtma`)
                  : (lang === "ru" ? "История заказов" : "Buyurtmalar tarixi")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">
                {lang === "ru" ? "Загрузка заказов..." : "Buyurtmalar yuklanmoqda..."}
              </p>
            </div>
          ) : userOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-4xl">
                🛒
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900">
                  {lang === "ru" ? "Заказов пока нет" : "Hozircha buyurtmalar yo'q"}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {lang === "ru"
                    ? "Оформите первый заказ и он появится здесь"
                    : "Birinchi buyurtmangizni rasmiylashtiring"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {userOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  lang={lang}
                  expanded={expandedId === order.id}
                  onExpand={() => setExpandedId(expandedId === order.id ? null : order.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[11px] text-center text-gray-400">
            📞 {lang === "ru" ? "Вопросы по заказу?" : "Buyurtma bo'yicha savollar?"}
            {" "}
            <a href="tel:+998970363636" className="text-red-600 font-bold hover:underline">
              +998 (97) 036 36 36
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
