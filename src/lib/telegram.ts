import type { Order } from "@/data/orderTypes";
import { formatPrice } from "@/utils/formatPrice";
import { supabase } from "@/lib/supabase";

export interface TelegramSettings {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

const STORAGE_KEY = "minimall_telegram_settings";
export const DEFAULT_TELEGRAM_BOT_TOKEN = "8809570303:AAGL-2UCGPLoGrx7NBwX0ZzHraMyqSzWvNA";
export const DEFAULT_TELEGRAM_CHAT_ID = "1837377724";

/**
 * Get current Telegram settings from localStorage or fallback to defaults
 */
export function getTelegramSettings(): TelegramSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        botToken: parsed.botToken || (import.meta.env.VITE_TELEGRAM_BOT_TOKEN ?? DEFAULT_TELEGRAM_BOT_TOKEN),
        chatId: parsed.chatId || (import.meta.env.VITE_TELEGRAM_CHAT_ID ?? DEFAULT_TELEGRAM_CHAT_ID),
        enabled: parsed.enabled !== undefined ? parsed.enabled : true,
      };
    }
  } catch {
    // ignore JSON parse error
  }

  return {
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN ?? DEFAULT_TELEGRAM_BOT_TOKEN,
    chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID ?? DEFAULT_TELEGRAM_CHAT_ID,
    enabled: true,
  };
}

/**
 * Save Telegram settings to localStorage
 */
export function saveTelegramSettings(settings: TelegramSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

/**
 * Format order into Telegram HTML message
 */
export function formatOrderForTelegram(order: Order): string {
  // Read current exchange rate from localStorage (same key as CurrencyContext)
  let usdRate = 12700;
  try {
    const raw = localStorage.getItem("mm_usd_rate");
    if (raw) {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed) && parsed > 0) usdRate = parsed;
    }
  } catch {}

  const paymentLabels: Record<string, string> = {
    cash: "💵 Наличными курьеру",
    click: "📱 Click",
    payme: "💳 Payme",
    bank_transfer: "🏢 Безналичный расчет (юр. лица)",
  };

  const paymentStr = paymentLabels[order.customer.paymentMethod] || order.customer.paymentMethod;

  const dateStr = new Date(order.createdAt).toLocaleString("ru-RU", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const itemsList = order.items
    .map((item, idx) => {
      const sizeTag = item.selectedSize ? ` 📏 <i>[Размер: ${escapeHtml(item.selectedSize)}]</i>` : "";
      return `${idx + 1}. <b>${escapeHtml(item.name)}</b>${sizeTag}\n   └ ${item.count} шт. × ${formatPrice(item.selectedSizePrice ?? item.price)} = <b>${formatPrice((item.selectedSizePrice ?? item.price) * item.count)}</b>`;
    })
    .join("\n");

  const cleanedPhone = order.customer.phone.replace(/[^0-9+]/g, "");

  return `🚨 <b>НОВЫЙ ЗАКАЗ С САЙТА MINIMALL!</b>
━━━━━━━━━━━━━━━━━━
🆔 <b>Номер заказа:</b> <code>${order.id}</code>
📅 <b>Время:</b> ${dateStr} (Ташкент)

👤 <b>Покупатель:</b> ${escapeHtml(order.customer.name)}
📞 <b>Телефон:</b> <a href="tel:${cleanedPhone}">${order.customer.phone}</a>
📍 <b>Город:</b> ${escapeHtml(order.customer.city)}
🏠 <b>Адрес:</b> ${escapeHtml(order.customer.address)}
💳 <b>Оплата:</b> ${paymentStr}
${order.customer.comment ? `💬 <b>Комментарий:</b> <i>«${escapeHtml(order.customer.comment)}»</i>\n` : ""}
━━━━━━━━━━━━━━━━━━
📦 <b>Состав заказа (${order.items.reduce((s, i) => s + i.count, 0)} шт.):</b>
${itemsList}
━━━━━━━━━━━━━━━━━━
💰 <b>ИТОГО К ОПЛАТЕ: ${formatPrice(order.totalAmount, usdRate)}</b>

⚡ <i>Свяжитесь с клиентом для подтверждения доставки!</i>`;
}

/**
 * Sends order notification to Telegram - broadcasts to ALL verified admin accounts!
 */
export async function sendOrderTelegramNotification(order: Order): Promise<{ success: boolean; error?: string }> {
  // 1. Notify bot service (local or remote URL)
  try {
    const botServiceUrl = (import.meta.env.VITE_BOT_SERVICE_URL || "http://localhost:8444").replace(/\/+$/, "");
    fetch(`${botServiceUrl}/api/notify-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    }).catch(() => {});
  } catch {
    // daemon might not be reachable directly, safe ignore (background DB poller handles it)
  }

  const settings = getTelegramSettings();
  const botToken = settings.botToken || import.meta.env.VITE_TELEGRAM_BOT_TOKEN || DEFAULT_TELEGRAM_BOT_TOKEN;

  if (!settings.enabled || !botToken) {
    return { success: true };
  }

  // 2. Collect all active admin chat IDs from settings and database (mm_admins)
  const targetChatIds = new Set<string>();
  if (settings.chatId) {
    targetChatIds.add(String(settings.chatId).trim());
  }

  try {
    const { data: dbAdmins, error } = await supabase
      .from("mm_admins")
      .select("telegram_chat_id, is_active")
      .eq("is_active", true)
      .not("telegram_chat_id", "is", null);

    if (!error && Array.isArray(dbAdmins)) {
      for (const adm of dbAdmins) {
        if (adm.telegram_chat_id) {
          const cid = String(adm.telegram_chat_id).trim();
          if (cid) targetChatIds.add(cid);
        }
      }
    }
  } catch (err) {
    console.warn("[Telegram Bot] Could not fetch active admin chat IDs from database:", err);
  }

  if (targetChatIds.size === 0) {
    return { success: true };
  }

  const text = formatOrderForTelegram(order);

  // 3. Broadcast to all verified admins in parallel
  const sendPromises = Array.from(targetChatIds).map(async (chatId) => {
    try {
      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        console.warn(`[Telegram Bot] Send to ${chatId} failed:`, data.description);
      }
      return { chatId, ok: data.ok };
    } catch (err: unknown) {
      console.warn(`[Telegram Bot] Network error sending to ${chatId}:`, err);
      return { chatId, ok: false };
    }
  });

  await Promise.allSettled(sendPromises);
  return { success: true };
}

/**
 * Test Telegram bot connection with a test message
 */
export async function testTelegramConnection(
  botToken: string,
  chatId: string
): Promise<{ success: boolean; error?: string }> {
  if (!botToken.trim() || !chatId.trim()) {
    return { success: false, error: "Укажите токен бота и Chat ID" };
  }

  try {
    const url = `https://api.telegram.org/bot${botToken.trim()}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: `✅ <b>Minimall Marketplace</b>\nТестовое уведомление успешно доставлено!\nВаш бот готов принимать уведомления о новых заказах в реальном времени.`,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      return { success: false, error: data.description || "Ошибка Telegram API" };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Сетевая ошибка при запросе к Telegram";
    return { success: false, error: message };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
