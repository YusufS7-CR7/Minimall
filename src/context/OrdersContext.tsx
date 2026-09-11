import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Order, OrderStatus, CustomerInfo, OrderItem } from "@/data/orderTypes";
import { supabase } from "@/lib/supabase";
import { sendOrderTelegramNotification } from "@/lib/telegram";

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

// ─── Offline Queue Helpers ───────────────────────────────────────────────────

const OFFLINE_ORDERS_KEY = "minimall_offline_orders";

function getOfflineOrders(): Order[] {
  try {
    const raw = localStorage.getItem(OFFLINE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOfflineOrders(orders: Order[]): void {
  try {
    localStorage.setItem(OFFLINE_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error("Failed to save offline orders to localStorage:", e);
  }
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

  // ── Sync any offline queued orders to Supabase ────────────────────────────
  const syncOfflineOrders = useCallback(async () => {
    const offline = getOfflineOrders();
    if (offline.length === 0) return;

    const remainingOffline: Order[] = [];
    for (const ord of offline) {
      try {
        const { error } = await supabase.from("orders").upsert([{
          id: ord.id,
          customer: ord.customer,
          items: ord.items,
          total_amount: ord.totalAmount,
          status: ord.status,
          user_id: ord.userId ?? null,
          created_at: ord.createdAt,
        }]);
        if (error) {
          remainingOffline.push(ord);
        }
      } catch {
        remainingOffline.push(ord);
      }
    }
    saveOfflineOrders(remainingOffline);
  }, []);

  // ── Fetch all (admin) ──────────────────────────────────────────────────────
  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    await syncOfflineOrders();

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const remoteOrders = (data as DbOrder[]).map(dbToOrder);
      // Combine with any remaining offline orders not yet in remote list
      const offline = getOfflineOrders();
      const existingIds = new Set(remoteOrders.map((o) => o.id));
      const combined = [...offline.filter((o) => !existingIds.has(o.id)), ...remoteOrders];
      setOrders(combined);
    } else {
      // If network fails, show offline cache
      const offline = getOfflineOrders();
      if (offline.length > 0) {
        setOrders(offline);
      }
    }
    setLoading(false);
  }, [syncOfflineOrders]);

  // Load all orders once on mount (for admin panel)
  useEffect(() => {
    fetchAllOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const newOrdersCount = orders.filter((o) => o.status === "new").length;

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
    const createdAt = new Date().toISOString();

    const newOrder: Order = {
      id: orderId,
      createdAt,
      customer,
      items,
      totalAmount,
      status: "new",
      userId,
    };

    // 1. Try to persist to Supabase
    let savedRemotely = false;
    try {
      const { error } = await supabase.from("orders").insert([{
        id: orderId,
        customer,
        items,
        total_amount: totalAmount,
        status: "new",
        user_id: userId ?? null,
        created_at: createdAt,
      }]);

      if (!error) {
        savedRemotely = true;
      } else {
        console.warn("[OrdersContext] Supabase insert warning:", error.message);
      }
    } catch (err) {
      console.warn("[OrdersContext] Supabase exception, saving to offline backup:", err);
    }

    // 2. If remote insert failed, save to guaranteed offline local storage
    if (!savedRemotely) {
      const currentOffline = getOfflineOrders();
      saveOfflineOrders([newOrder, ...currentOffline]);
    }

    // 3. Update local state immediately (optimistic UI)
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== orderId)]);
    if (userId) setUserOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== orderId)]);

    // 4. Send instant Telegram Notification to store manager
    sendOrderTelegramNotification(newOrder).catch((err) => {
      console.warn("[OrdersContext] Telegram notification error:", err);
    });

    return { success: true, orderId };
  }, []);

  // ── Update status ──────────────────────────────────────────────────────────
  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);

    // Update local state regardless
    const patch = (list: Order[]) =>
      list.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(patch);
    setUserOrders(patch);

    // Also update in offline storage if present
    const offline = getOfflineOrders();
    if (offline.some((o) => o.id === orderId)) {
      saveOfflineOrders(offline.map((o) => (o.id === orderId ? { ...o, status } : o)));
    }

    if (error) {
      console.warn("[OrdersContext] Status update remote error:", error.message);
    }
  }, []);

  // ── Delete order ───────────────────────────────────────────────────────────
  const deleteOrder = useCallback(async (orderId: string) => {
    await supabase
      .from("orders")
      .delete()
      .eq("id", orderId);

    const remove = (list: Order[]) => list.filter((o) => o.id !== orderId);
    setOrders(remove);
    setUserOrders(remove);

    const offline = getOfflineOrders();
    if (offline.some((o) => o.id === orderId)) {
      saveOfflineOrders(offline.filter((o) => o.id !== orderId));
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

