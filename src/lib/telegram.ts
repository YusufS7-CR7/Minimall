import type { Order } from "@/data/orderTypes";
import { formatPrice } from "@/utils/formatPrice";

export interface TelegramSettings {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

const STORAGE_KEY = "minimall_telegram_settings";

/**
 * Get current Telegram settings from localStorage or fallback to .env
 */
export function getTelegramSettings(): TelegramSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        botToken: parsed.botToken || (import.meta.env.VITE_TELEGRAM_BOT_TOKEN ?? ""),
        chatId: parsed.chatId || (import.meta.env.VITE_TELEGRAM_CHAT_ID ?? ""),
        enabled: parsed.enabled !== undefined ? parsed.enabled : true,
      };
    }
  } catch {
    // ignore JSON parse error
  }

  return {
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN ?? "",
    chatId: import.meta.env.VITE_TELEGRAM_CHAT_ID ?? "",
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
      return `${idx + 1}. <b>${escapeHtml(item.name)}</b>\n   └ ${item.count} шт. × ${formatPrice(item.price)} = <b>${formatPrice(item.price * item.count)}</b>`;
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
💰 <b>ИТОГО К ОПЛАТЕ: ${formatPrice(order.totalAmount)}</b>

⚡ <i>Свяжитесь с клиентом для подтверждения доставки!</i>`;
}

/**
 * Sends order notification to Telegram
 */
export async function sendOrderTelegramNotification(order: Order): Promise<{ success: boolean; error?: string }> {
  // 1. Notify local bot daemon (broadcasts to all admins logged into the bot)
  try {
    fetch("http://localhost:8444/api/notify-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order }),
    }).catch(() => {});
  } catch {
    // daemon might not be running locally, safe ignore
  }

  const settings = getTelegramSettings();

  if (!settings.enabled || !settings.botToken || !settings.chatId) {
    // If specific chat ID not set, local daemon handles it
    return { success: true };
  }

  const text = formatOrderForTelegram(order);

  try {
    const url = `https://api.telegram.org/bot${settings.botToken}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: settings.chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    const data = await response.json();
    if (!data.ok) {
      console.warn("[Telegram Bot] API error:", data.description);
      return { success: false, error: data.description };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    console.warn("[Telegram Bot] Send error:", message);
    return { success: false, error: message };
  }
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
