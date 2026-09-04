import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useOrders } from "@/context/OrdersContext";
import type { CustomerInfo } from "@/data/orderTypes";

import { formatPrice } from "@/utils/formatPrice";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { cart, totalCartPrice, clearCart, lang, showToast } = useApp();
  const { placeOrder } = useOrders();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [city, setCity] = useState("Ташкент");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<CustomerInfo["paymentMethod"]>("cash");
  const [comment, setComment] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+998")) {
      val = "+998 ";
    }
    setPhone(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("Пожалуйста, укажите ваше имя");
      return;
    }

    if (phone.trim().length < 9) {
      showToast("Пожалуйста, укажите контактный номер телефона");
      return;
    }

    if (!address.trim()) {
      showToast("Укажите адрес доставки");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const orderItems = cart.map((i) => ({
        productId: i.product.id,
        slug: i.product.slug,
        name: i.product.name,
        nameUz: i.product.nameUz,
        image: i.product.image,
        price: i.product.price,
        count: i.count,
      }));

      const res = placeOrder(
        {
          name: name.trim(),
          phone: phone.trim(),
          city: city.trim(),
          address: address.trim(),
          paymentMethod,
          comment: comment.trim() || undefined,
        },
        orderItems,
        totalCartPrice
      );

      setIsSubmitting(false);
      if (res.success) {
        clearCart();
        setCompletedOrderId(res.orderId);
      }
    }, 400);
  };

  const handleFinish = () => {
    setCompletedOrderId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <h2
                className="text-xl font-bold tracking-wide"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                {completedOrderId
                  ? (lang === "ru" ? "Заказ успешно оформлен!" : "Buyurtma muvaffaqiyatli rasmiylashtirildi!")
                  : (lang === "ru" ? "Оформление заказа" : "Buyurtmani rasmiylashtirish")}
              </h2>
              <p className="text-xs text-gray-400">
                {completedOrderId
                  ? (lang === "ru" ? "Заказ передан в обработку" : "Buyurtma qabul qilindi")
                  : (lang === "ru" ? "Заполните данные для быстрой доставки" : "Yetkazib berish ma'lumotlarini to'ldiring")}
              </p>
            </div>
          </div>
          <button
            onClick={completedOrderId ? handleFinish : onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Success screen */}
        {completedOrderId ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-20 h-20 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/20 animate-bounce">
              ✓
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-emerald-600 font-bold mb-1">
                {lang === "ru" ? "Номер вашего заказа" : "Buyurtma raqamingiz"}
              </div>
              <div
                className="text-3xl font-black text-gray-900 font-mono tracking-wider"
                style={{ fontFamily: "Barlow Condensed, sans-serif" }}
              >
                {completedOrderId}
              </div>
            </div>

            <p className="text-sm text-gray-600 max-w-sm mx-auto leading-relaxed">
              {lang === "ru"
                ? `Спасибо за заказ, ${name}! Менеджер Minimall свяжется с вами по номеру ${phone} для подтверждения деталей доставки.`
                : `Rahmat, ${name}! Minimall menejeri yetkazib berish tafsilotlarini tasdiqlash uchun tez orada siz bilan bog'lanadi.`}
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs text-gray-500 space-y-1">
              <div>📞 Горячая линия поддержки: <a href="tel:+998970363636" className="text-gray-900 font-bold hover:text-red-600">+998 (97) 036 36 36</a></div>
              <div>⏱ Режим работы: ежедневно с 9:00 до 19:00</div>
            </div>

            <button
              onClick={handleFinish}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3 px-6 rounded-xl shadow-md shadow-red-600/20 transition-all cursor-pointer"
            >
              {lang === "ru" ? "Вернуться в магазин" : "Do'konga qaytish"}
            </button>
          </div>
        ) : (
          /* Form screen */
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-gray-900">
            {/* Order sum summary */}
            <div className="bg-red-50/70 border border-red-100 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-600 font-medium">Товаров в заказе: {cart.length} шт.</div>
                <div className="text-xs text-gray-400">Доставка: по согласованию с менеджером</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400 font-bold uppercase">Сумма к оплате</div>
                <div className="text-lg font-black text-red-600">{formatPrice(totalCartPrice)}</div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Ваше имя и фамилия <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="например, Азиз Каримов"
                className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white transition-colors"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Контактный телефон <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={handlePhoneChange}
                placeholder="+998 90 123 45 67"
                className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white transition-colors font-mono"
              />
            </div>

            {/* City & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Город / Регион
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-sm px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-white"
                >
                  <option value="Ташкент">Ташкент</option>
                  <option value="Ташкентская область">Ташкентская обл.</option>
                  <option value="Самарканд">Самарканд</option>
                  <option value="Бухара">Бухара</option>
                  <option value="Андижан">Андижан</option>
                  <option value="Фергана">Фергана</option>
                  <option value="Наманган">Наманган</option>
                  <option value="Другой регион">Другой регион</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Адрес доставки <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Улица, дом, квартира или ориентир"
                  className="w-full text-sm px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Способ оплаты
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "cash", label: "Наличными курьеру", icon: "💵" },
                  { id: "click", label: "Click", icon: "📱" },
                  { id: "payme", label: "Payme", icon: "💳" },
                  { id: "bank_transfer", label: "Перевод (для юр. лиц)", icon: "🏢" },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      paymentMethod === m.id
                        ? "bg-red-50 border-red-300 font-bold text-red-700"
                        : "bg-gray-50/50 border-gray-100 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === m.id}
                      onChange={() => setPaymentMethod(m.id as any)}
                      className="sr-only"
                    />
                    <span>{m.icon}</span>
                    <span className="truncate">{m.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Комментарий к заказу (необязательно)
              </label>
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Время доставки, код домофона, пожелания..."
                className="w-full text-xs px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500 bg-gray-50/50 focus:bg-white transition-colors"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting || cart.length === 0}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Отправка заказа...</span>
                  </>
                ) : (
                  <>
                    <span>Подтвердить заказ на {formatPrice(totalCartPrice)}</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
