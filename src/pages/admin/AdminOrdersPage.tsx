import { useState, useMemo } from "react";
import { useOrders } from "@/context/OrdersContext";
import { useApp } from "@/context/AppContext";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import type { Order, OrderStatus } from "@/data/orderTypes";
import { ORDER_STATUS_LABELS } from "@/data/orderTypes";
import { formatPrice } from "@/utils/formatPrice";
import CustomSelect from "@/components/ui/CustomSelect";
import OrderInvoiceModal from "./OrderInvoiceModal";
import TelegramSettingsModal from "./TelegramSettingsModal";

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, deleteOrder, fetchAllOrders, loading } = useOrders();
  const { showToast } = useApp();

  useDocumentMeta({
    title: "Управление заказами | Minimall Admin",
    description: "Просмотр и обработка заказов интернет-магазина mini-mall.uz",
    noIndex: true,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week">("all");

  // Modals state
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);

  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;

    return orders.filter((o) => {
      // Status filter
      if (selectedStatus !== "all" && o.status !== selectedStatus) {
        return false;
      }

      // Date filter
      if (dateFilter !== "all") {
        const orderTime = new Date(o.createdAt).getTime();
        if (dateFilter === "today" && orderTime < startOfToday) {
          return false;
        }
        if (dateFilter === "week" && orderTime < sevenDaysAgo) {
          return false;
        }
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
  }, [orders, selectedStatus, dateFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = orders.length;
    const newCount = orders.filter((o) => o.status === "new").length;
    const inProgress = orders.filter((o) => o.status === "processing" || o.status === "shipping").length;
    const totalValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { total, newCount, inProgress, totalValue };
  }, [orders]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    showToast(`Статус заказа ${orderId} обновлён: ${ORDER_STATUS_LABELS[newStatus].ru}`);
  };

  const handleDelete = async (orderId: string) => {
    if (window.confirm(`Удалить заказ ${orderId}? Это действие необратимо.`)) {
      await deleteOrder(orderId);
      showToast(`Заказ ${orderId} удалён`);
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

  // Export orders to Excel CSV with UTF-8 BOM
  const handleExportCsv = () => {
    if (filteredOrders.length === 0) {
      showToast("Нет заказов для экспорта");
      return;
    }

    const headers = [
      "№ Заказа",
      "Дата оформления",
      "ФИО Покупателя",
      "Телефон",
      "Город",
      "Адрес",
      "Способ оплаты",
      "Сумма (сум)",
      "Статус",
      "Комментарий",
      "Состав заказа",
    ];

    const rows = filteredOrders.map((o) => {
      const itemsStr = o.items.map((i) => `${i.name} (${i.count} шт. x ${i.price} сум)`).join(" | ");
      return [
        o.id,
        new Date(o.createdAt).toLocaleString("ru-RU"),
        `"${o.customer.name.replace(/"/g, '""')}"`,
        `"${o.customer.phone}"`,
        `"${o.customer.city.replace(/"/g, '""')}"`,
        `"${o.customer.address.replace(/"/g, '""')}"`,
        o.customer.paymentMethod,
        o.totalAmount,
        ORDER_STATUS_LABELS[o.status]?.ru || o.status,
        `"${(o.customer.comment || "").replace(/"/g, '""')}"`,
        `"${itemsStr.replace(/"/g, '""')}"`,
      ].join(";");
    });

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("href", url);
    link.setAttribute("download", `minimall_orders_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Файл заказов CSV успешно скачан");
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-gray-100 shadow-xs">
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

        {/* Top actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Telegram notifications setup */}
          <button
            onClick={() => setIsTelegramModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-xl transition-colors cursor-pointer"
            title="Настройка Telegram-бота для мгновенных оповещений"
          >
            <span>✈️</span>
            <span>Telegram бот</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
            title="Скачать заказы в Excel / CSV"
          >
            <span>📥</span>
            <span>Экспорт в CSV</span>
          </button>

          {/* Refresh button */}
          <button
            onClick={() => fetchAllOrders()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>🔄</span>
            )}
            <span>Обновить</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Всего заказов</div>
          <div className="text-2xl sm:text-3xl font-black text-gray-900 mt-1" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>{stats.total}</div>
          <div className="text-[11px] text-gray-400 mt-1">за все время</div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Новые</div>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>{stats.newCount}</div>
          <div className="text-[11px] text-blue-600/80 mt-1">требуют подтверждения</div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">В доставке</div>
          <div className="text-2xl sm:text-3xl font-black text-purple-600 mt-1" style={{ fontFamily: "Barlow Condensed, sans-serif" }}>{stats.inProgress}</div>
          <div className="text-[11px] text-purple-600/80 mt-1">активные отгрузки</div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Сумма</div>
          <div className="text-lg sm:text-2xl font-black text-gray-900 mt-1 truncate" style={{ fontFamily: "Barlow Condensed, sans-serif" }} title={formatPrice(stats.totalValue)}>{formatPrice(stats.totalValue)}</div>
          <div className="text-[11px] text-gray-400 mt-1">общий оборот</div>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:flex-1">
          <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Поиск по номеру заказа, имени, телефону, городу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full md:w-auto shrink-0 text-xs font-semibold">
          <button
            onClick={() => setDateFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              dateFilter === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Все даты
          </button>
          <button
            onClick={() => setDateFilter("today")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              dateFilter === "today" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Сегодня
          </button>
          <button
            onClick={() => setDateFilter("week")}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              dateFilter === "week" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            7 дней
          </button>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <CustomSelect
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            options={[
              { value: "all", label: "Все статусы" },
              { value: "new", label: "Новые", icon: "🔵" },
              { value: "processing", label: "В обработке", icon: "🟡" },
              { value: "shipping", label: "В доставке", icon: "🟣" },
              { value: "completed", label: "Выполненные", icon: "🟢" },
              { value: "cancelled", label: "Отмененные", icon: "🔴" },
            ]}
          />
        </div>
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
            const cleanedPhone = order.customer.phone.replace(/[^0-9]/g, "");

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-xs p-5 sm:p-6 transition-all hover:shadow-md space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center justify-between sm:justify-start gap-3">
                    <span className="text-base font-black font-mono text-gray-900 bg-gray-100 px-2.5 py-1 rounded-xl">
                      {order.id}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Status dropdown */}
                    <div className="flex items-center gap-1.5 flex-1 sm:flex-none">
                      <span className="text-xs text-gray-400 font-medium shrink-0">Статус:</span>
                      <div className="flex-1 sm:flex-none sm:w-36">
                        <CustomSelect
                          value={order.status}
                          onChange={(val) => handleStatusChange(order.id, val as OrderStatus)}
                          size="sm"
                          options={[
                            { value: "new", label: "Новый", icon: "🔵" },
                            { value: "processing", label: "В обработке", icon: "🟡" },
                            { value: "shipping", label: "В доставке", icon: "🟣" },
                            { value: "completed", label: "Выполнен", icon: "🟢" },
                            { value: "cancelled", label: "Отменен", icon: "🔴" },
                          ]}
                        />
                      </div>
                    </div>

                    {/* Print Invoice Button */}
                    <button
                      onClick={() => setInvoiceOrder(order)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      title="Открыть товарный чек / накладную для печати"
                    >
                      <span>🖨️</span>
                      <span className="hidden sm:inline">Чек</span>
                    </button>

                    {/* Delete Order Button */}
                    <button
                      onClick={() => handleDelete(order.id)}
                      className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center text-xs transition-colors cursor-pointer shrink-0"
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

                    {/* Phone + Quick Telegram Contact */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="font-mono text-gray-800 font-bold hover:text-red-600 underline underline-offset-2 flex items-center gap-1"
                      >
                        <span>📞</span>
                        <span>{order.customer.phone}</span>
                      </a>
                      {cleanedPhone && (
                        <a
                          href={`https://t.me/+${cleanedPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-sky-100 hover:bg-sky-200 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors flex items-center gap-0.5"
                          title="Написать клиенту в Telegram"
                        >
                          <span>✈️</span>
                          <span>Telegram</span>
                        </a>
                      )}
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

      {/* Invoice Modal for Printing */}
      <OrderInvoiceModal
        order={invoiceOrder}
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
      />

      {/* Telegram Settings Modal */}
      <TelegramSettingsModal
        isOpen={isTelegramModalOpen}
        onClose={() => setIsTelegramModalOpen(false)}
        onSuccessToast={showToast}
      />
    </div>
  );
}
