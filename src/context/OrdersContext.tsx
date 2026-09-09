import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Order, OrderStatus, CustomerInfo, OrderItem } from "@/data/orderTypes";
import { supabase } from "@/lib/supabase";

// ─── DB row type (Supabase snake_case) ───────────────────────────────────────

interface DbOrder {
  id: string;
  created_at: string;
  customer: CustomerInfo;
  items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  user_id: string | null;
}

function dbToOrder(row: DbOrder): Order {
  return {
    id: row.id,
    createdAt: row.created_at,
    customer: row.customer,
    items: row.items,
    totalAmount: row.total_amount,
    status: row.status,
    userId: row.user_id ?? undefined,
  };
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface OrdersContextType {
  orders: Order[];
  userOrders: Order[];           // Only current user's orders
  newOrdersCount: number;
  loading: boolean;
  placeOrder: (
    customer: CustomerInfo,
    items: OrderItem[],
    totalAmount: number,
    userId?: string
  ) => Promise<{ success: boolean; orderId: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  fetchUserOrders: (userId: string) => Promise<void>;
  fetchAllOrders: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function OrdersProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);         // Admin: all orders
  const [userOrders, setUserOrders] = useState<Order[]>([]);  // Buyer: my orders
  const [loading, setLoading] = useState(false);

  // Load all orders once on mount (for admin panel)
  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newOrdersCount = orders.filter((o) => o.status === "new").length;

  // ── Fetch all (admin) ──────────────────────────────────────────────────────
  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setOrders((data as DbOrder[]).map(dbToOrder));
    }
    setLoading(false);
  }, []);

  // ── Fetch user's own orders ────────────────────────────────────────────────
  const fetchUserOrders = useCallback(async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setUserOrders((data as DbOrder[]).map(dbToOrder));
    }
    setLoading(false);
  }, []);

  // ── Place order ────────────────────────────────────────────────────────────
  const placeOrder = useCallback(async (
    customer: CustomerInfo,
    items: OrderItem[],
    totalAmount: number,
    userId?: string
  ): Promise<{ success: boolean; orderId: string }> => {
    // Unique order ID: timestamp (ms) + 3 random chars → ORD-1751234567890-A3K
    const ts = Date.now();
    const rnd = Math.random().toString(36).slice(2, 5).toUpperCase();
    const orderId = `ORD-${ts}-${rnd}`;

    const { error } = await supabase.from("orders").insert([{
      id: orderId,
      customer,
      items,
      total_amount: totalAmount,
      status: "new",
      user_id: userId ?? null,
    }]);

    if (error) {
      console.error("Order insert error:", error.message);
      return { success: false, orderId: "" };
    }

    const newOrder: Order = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customer,
      items,
      totalAmount,
      status: "new",
      userId,
    };

    // Update local state immediately (optimistic)
    setOrders((prev) => [newOrder, ...prev]);
    if (userId) setUserOrders((prev) => [newOrder, ...prev]);

    return { success: true, orderId };
  }, []);

  // ── Update status ──────────────────────────────────────────────────────────
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    if (!error) {
      const patch = (list: Order[]) =>
        list.map((o) => (o.id === orderId ? { ...o, status } : o));
      setOrders(patch);
      setUserOrders(patch);
    }
  }, []);

  // ── Delete order ───────────────────────────────────────────────────────────
  const deleteOrder = useCallback(async (orderId: string) => {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    if (!error) {
      const remove = (list: Order[]) => list.filter((o) => o.id !== orderId);
      setOrders(remove);
      setUserOrders(remove);
    }
  }, []);

  return (
    <OrdersContext.Provider
      value={{
        orders,
        userOrders,
        newOrdersCount,
        loading,
        placeOrder,
        updateOrderStatus,
        deleteOrder,
        fetchUserOrders,
        fetchAllOrders,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders must be within OrdersProvider");
  return context;
}
