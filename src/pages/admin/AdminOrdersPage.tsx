import { useState, useMemo } from "react";
import { useOrders } from "@/context/OrdersContext";
import { useApp } from "@/context/AppContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { OrderStatus } from "@/data/orderTypes";
import { ORDER_STATUS_LABELS } from "@/data/orderTypes";

const formatPrice = (p: number) =>
  new Intl.NumberFormat("ru-UZ", { style: "decimal" }).format(p) + " сум";

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const { showToast } = useApp();

  useDocumentMeta({
    title: "Управление заказами | Minimall Admin",
    description: "Просмотр и обработка заказов интернет-магазина Minimall.uz",
    noIndex: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status filter
      if (selectedStatus !== "all" && o.status !== selectedStatus) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          o.id.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.toLowerCase().includes(q) ||
          o.customer.city.toLowerCase().includes(q) ||
          o.customer.address.toLowerCase().includes(q) ||
          o.items.some((item) => item.name.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [orders, selectedStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = orders.length;
    const newCount = orders.filter((o) => o.status === "new").length;
    const inProgress = orders.filter((o) => o.status === "processing" || o.status === "shipping").length;
    const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { total, newCount, inProgress, totalValue };
  }, [orders]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    showToast(`Статус заказа ${orderId} обновлен: ${ORDER_STATUS_LABELS[newStatus].ru}`);
  };

  const handleDelete = (orderId: string) => {
    if (window.confirm(`Удалить заказ ${orderId}? Это действие необратимо.`)) {
      deleteOrder(orderId);
      showToast(`Заказ ${orderId} удален`);
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString("ru-RU", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="text-2xl sm:text-3xl font-black text-gray-900"
              style={{ fontFamily: "Barlow Condensed, sans-serif" }}
            >
              Заказы покупателей
            </h1>
            {stats.newCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full animate-pulse shadow-xs">
                +{stats.newCount} новых
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Все заказы, оформленные покупателями на сайте, поступают сюда в реальном времени
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Всего заказов
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-gray-900 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.total}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">за все время</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Новые заказы
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-blue-600 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.newCount}
          </div>
          <div className="text-[11px] text-blue-600/80 mt-1">требуют подтверждения</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            В доставке / работе
          </div>
          <div
            className="text-2xl sm:text-3xl font-black text-purple-600 mt-1"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
          >
            {stats.inProgress}
          </div>
          <div className="text-[11px] text-purple-600/80 mt-1">активные отгрузки</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Сумма заказов
          </div>
          <div
            className="text-xl sm:text-2xl font-black text-gray-900 mt-1 truncate"
            style={{ fontFamily: "Barlow Condensed, sans-serif" }}
            title={formatPrice(stats.totalValue)}
          >
            {formatPrice(stats.totalValue)}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">общий оборот</div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:flex-1">
          <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Поиск по номеру заказа, имени, телефону, городу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="w-full sm:w-auto text-xs sm:text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-white"
        >
          <option value="all">Все статусы</option>
          <option value="new">Новые</option>
          <option value="processing">В обработке</option>
          <option value="shipping">В доставке</option>
          <option value="completed">Выполненные</option>
          <option value="cancelled">Отмененные</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-100 shadow-xs">
            <div className="text-4xl mb-2">🛒</div>
            <p className="text-sm font-semibold">Заказы не найдены</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusMeta = ORDER_STATUS_LABELS[order.status];
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 transition-all hover:shadow-md space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-black font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded-xl">
                      {order.id}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status dropdown */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 font-medium">Статус:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer ${statusMeta.color}`}
                      >
                        <option value="new">🔵 Новый</option>
                        <option value="processing">🟡 В обработке</option>
                        <option value="shipping">🟣 В доставке</option>
                        <option value="completed">🟢 Выполнен</option>
                        <option value="cancelled">🔴 Отменен</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleDelete(order.id)}
                      className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                      title="Удалить заказ"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Body: Customer info & Items grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Customer details */}
                  <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-100 space-y-2 text-xs">
                    <div className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                      <span>👤</span>
                      <span>{order.customer.name}</span>
                    </div>
                    <div className="font-mono text-gray-800 font-semibold">
                      📞 <a href={`tel:${order.customer.phone}`} className="hover:text-red-600 underline underline-offset-2">{order.customer.phone}</a>
                    </div>
                    <div className="text-gray-600">
                      📍 <strong>{order.customer.city}</strong>, {order.customer.address}
                    </div>
                    <div className="text-gray-500 pt-1 border-t border-gray-200/60">
                      💳 Оплата:{" "}
                      <span className="font-bold text-gray-800">
                        {order.customer.paymentMethod === "cash"
                          ? "Наличными курьеру"
                          : order.customer.paymentMethod === "click"
                          ? "Click"
                          : order.customer.paymentMethod === "payme"
                          ? "Payme"
                          : "Безналичный расчет (юр. лица)"}
                      </span>
                    </div>
                    {order.customer.comment && (
                      <div className="bg-amber-50 text-amber-800 p-2 rounded-lg text-[11px] border border-amber-200/60">
                        💬 <em>«{order.customer.comment}»</em>
                      </div>
                    )}
                  </div>

                  {/* Order items */}
                  <div className="md:col-span-2 space-y-2">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Состав заказа ({order.items.reduce((s, i) => s + i.count, 0)} шт.)
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-gray-100 hover:bg-gray-50/50 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover bg-white border border-gray-100 shrink-0"
                            />
                            <div className="truncate font-semibold text-gray-800">
                              {item.name}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-gray-400 text-[11px]">{item.count} × </span>
                            <span className="font-bold text-gray-900">{formatPrice(item.price)}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-gray-100">
                      <span className="text-gray-500 text-xs uppercase tracking-wider">Итого к оплате:</span>
                      <span className="text-lg font-black text-red-600 font-mono">
                        {formatPrice(order.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
