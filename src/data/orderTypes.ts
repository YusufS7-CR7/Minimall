import type { CartItem } from "./types";

export type OrderStatus = "new" | "processing" | "shipping" | "completed" | "cancelled";

export interface OrderItem {
  productId: number;
  slug: string;
  name: string;
  nameUz?: string;
  image: string;
  price: number;
  count: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  city: string;
  address: string;
  paymentMethod: "cash" | "payme" | "click" | "bank_transfer";
  comment?: string;
}

export interface Order {
  id: string; // e.g. "ORD-1042"
  createdAt: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  userId?: string;   // ID покупателя из user_profiles (undefined = гость)
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, { ru: string; uz: string; color: string }> = {
  new: { ru: "Новый", uz: "Yangi", color: "bg-blue-100 text-blue-700 border-blue-200" },
  processing: { ru: "В обработке", uz: "Jarayonda", color: "bg-amber-100 text-amber-700 border-amber-200" },
  shipping: { ru: "В доставке", uz: "Yetkazilmoqda", color: "bg-purple-100 text-purple-700 border-purple-200" },
  completed: { ru: "Выполнен", uz: "Bajarildi", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { ru: "Отменен", uz: "Bekor qilindi", color: "bg-red-100 text-red-700 border-red-200" },
};
