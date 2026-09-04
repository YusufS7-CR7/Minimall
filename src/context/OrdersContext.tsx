import React, { createContext, useContext, useState, useEffect } from "react";
import type { Order, OrderStatus, CustomerInfo, OrderItem } from "@/data/orderTypes";

const STORAGE_KEY = "minimall_orders_data";

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: "ORD-9421",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
    customer: {
      name: "Шерзод Рустамов",
      phone: "+998 90 123-45-67",
      city: "Ташкент",
      address: "Юнусабадский район, кв-л 4, дом 12, кв 45",
      paymentMethod: "click",
      comment: "Пожалуйста, позвоните за полчаса до доставки",
    },
    items: [
      {
        productId: 1,
        slug: "bosch-gbh-2-26-dre",
        name: "Перфоратор Bosch GBH 2-26 DRE Professional",
        nameUz: "Bosch GBH 2-26 DRE Professional Perforatori",
        image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop&auto=format",
        price: 1850000,
        count: 1,
      },
    ],
    totalAmount: 1850000,
    status: "new",
  },
  {
    id: "ORD-9420",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // yesterday
    customer: {
      name: "Алишер Махмудов",
      phone: "+998 93 987-65-43",
      city: "Самарканд",
      address: "ул. Рудаки, дом 88",
      paymentMethod: "cash",
      comment: "Оплата наличными курьеру при получении",
    },
    items: [
      {
        productId: 2,
        slug: "makita-df333dwye",
        name: "Дрель-шуруповерт Makita DF333DWYE 12V",
        nameUz: "Makita DF333DWYE 12V Burg'ulash-buragich",
        image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop&auto=format",
        price: 1150000,
        count: 2,
      },
    ],
    totalAmount: 2300000,
    status: "processing",
  },
];

interface OrdersContextType {
  orders: Order[];
  newOrdersCount: number;
  placeOrder: (customer: CustomerInfo, items: OrderItem[], totalAmount: number) => { success: boolean; orderId: string };
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === "undefined") return INITIAL_DEMO_ORDERS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load orders from storage:", e);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_ORDERS));
    return INITIAL_DEMO_ORDERS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error("Failed to persist orders:", e);
    }
  }, [orders]);

  const newOrdersCount = orders.filter((o) => o.status === "new").length;

  const placeOrder = (customer: CustomerInfo, items: OrderItem[], totalAmount: number) => {
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer,
      items,
      totalAmount,
      status: "new",
    };

    setOrders((prev) => [newOrder, ...prev]);
    return { success: true, orderId };
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        newOrdersCount,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
