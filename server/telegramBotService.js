import fs from "fs";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || "8809570303:AAGL-2UCGPLoGrx7NBwX0ZzHraMyqSzWvNA";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://pptastuhmpzdyjeyhfts.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdGFzdHVobXB6ZHlqZXloZnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTc4ODUsImV4cCI6MjEwNDI5Mzg4NX0.tZazXTeRiAs8CaiGzr139JyBCPI7_0JQlpieMOOOxO8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SUBSCRIBERS_FILE = path.join(DATA_DIR, "telegram_subscribers.json");
const NOTIFIED_FILE = path.join(DATA_DIR, "notified_orders.json");

// ─── Subscribers storage ─────────────────────────────────────────────────────

function loadSubscribers() {
  try {
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error loading subscribers:", e);
  }
  return {};
}

function saveSubscribers(subs) {
  try {
    fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(subs, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving subscribers:", e);
  }
}

// ─── Notified orders cache ───────────────────────────────────────────────────

function loadNotifiedOrders() {
  try {
    if (fs.existsSync(NOTIFIED_FILE)) {
      return new Set(JSON.parse(fs.readFileSync(NOTIFIED_FILE, "utf-8")));
    }
  } catch (e) {
    console.error("Error loading notified orders:", e);
  }
  return new Set();
}

function saveNotifiedOrders(set) {
  try {
    fs.writeFileSync(NOTIFIED_FILE, JSON.stringify([...set].slice(-200), null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving notified orders:", e);
  }
}

let subscribers = loadSubscribers();
let notifiedOrders = loadNotifiedOrders();
let authSessions = {}; // chatId -> { step: 'awaiting_login' | 'awaiting_password', username?: string }

// ─── Telegram API Helper ─────────────────────────────────────────────────────

async function sendTelegramMessage(chatId, text, extra = {}) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
        ...extra,
      }),
    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`[Telegram] Send error to ${chatId}:`, err.message);
    return { ok: false, error: err.message };
  }
}

function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatPrice(num = 0) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " сум";
}

function formatOrderMessage(order) {
  const paymentLabels = {
    cash: "💵 Наличными курьеру",
    click: "📱 Click",
    payme: "💳 Payme",
    bank_transfer: "🏢 Безналичный расчет (юр. лица)",
  };

  const paymentStr = paymentLabels[order.customer?.paymentMethod] || order.customer?.paymentMethod || "Наличными";

  const dateStr = new Date(order.created_at || order.createdAt || Date.now()).toLocaleString("ru-RU", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const items = order.items || [];
  const itemsList = items
    .map((item, idx) => {
      const price = item.price || 0;
      const count = item.count || 1;
      return `${idx + 1}. <b>${escapeHtml(item.name)}</b>\n   └ ${count} шт. × ${formatPrice(price)} = <b>${formatPrice(price * count)}</b>`;
    })
    .join("\n");

  const totalCount = items.reduce((s, i) => s + (i.count || 1), 0);
  const totalAmount = order.total_amount || order.totalAmount || 0;
  const cleanedPhone = (order.customer?.phone || "").replace(/[^0-9+]/g, "");

  return `🚨 <b>НОВЫЙ ЗАКАЗ С САЙТА MINIMALL!</b>
━━━━━━━━━━━━━━━━━━
🆔 <b>Номер заказа:</b> <code>${escapeHtml(order.id)}</code>
📅 <b>Время:</b> ${dateStr} (Ташкент)

👤 <b>Покупатель:</b> ${escapeHtml(order.customer?.name || "Покупатель")}
📞 <b>Телефон:</b> <a href="tel:${cleanedPhone}">${escapeHtml(order.customer?.phone || "Не указан")}</a>
📍 <b>Город:</b> ${escapeHtml(order.customer?.city || "Ташкент")}
🏠 <b>Адрес:</b> ${escapeHtml(order.customer?.address || "Не указан")}
💳 <b>Оплата:</b> ${paymentStr}
${order.customer?.comment ? `💬 <b>Комментарий:</b> <i>«${escapeHtml(order.customer.comment)}»</i>\n` : ""}
━━━━━━━━━━━━━━━━━━
📦 <b>Состав заказа (${totalCount} шт.):</b>
${itemsList || "—"}
━━━━━━━━━━━━━━━━━━
💰 <b>ИТОГО К ОПЛАТЕ: ${formatPrice(totalAmount)}</b>

⚡ <i>Свяжитесь с клиентом для подтверждения доставки!</i>`;
}

// ─── Broadcast order to all verified admins ──────────────────────────────────

async function broadcastOrder(order) {
  const activeSubs = Object.keys(subscribers);
  if (activeSubs.length === 0) {
    console.log(`[Bot] New order ${order.id}, but no active admin subscribers yet.`);
    return;
  }

  const text = formatOrderMessage(order);
  console.log(`[Bot] Broadcasting order ${order.id} to ${activeSubs.length} admins...`);

  for (const chatId of activeSubs) {
    await sendTelegramMessage(chatId, text);
  }
}

// ─── Telegram Bot Updates Handler (Long Polling) ─────────────────────────────

let lastUpdateId = 0;

async function pollUpdates() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=25`);
    const data = await res.json();

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        if (update.message && update.message.text) {
          await handleIncomingMessage(update.message);
        }
      }
    }
  } catch (err) {
    // network timeout or glitch
  } finally {
    setTimeout(pollUpdates, 1000);
  }
}

async function handleIncomingMessage(msg) {
  const chatId = String(msg.chat.id);
  const text = (msg.text || "").trim();

  // Command /start
  if (text === "/start" || text === "/login") {
    if (subscribers[chatId]) {
      const sub = subscribers[chatId];
      await sendTelegramMessage(
        chatId,
        `✅ <b>Вы уже авторизованы!</b>\n\nВы подключены как <b>${escapeHtml(sub.name)}</b> (@${escapeHtml(sub.username)}).\nНовые заказы автоматически приходят вам в этот чат.\n\nДля проверки статуса: /status\nДля выхода: /logout`
      );
      return;
    }

    authSessions[chatId] = { step: "awaiting_login" };
    await sendTelegramMessage(
      chatId,
      `👋 <b>Добро пожаловать в систему заказов Minimall!</b>\n\nЭтот бот предназначен для администраторов магазина. Чтобы получать оповещения о новых заказах, подтвердите вашу учетную запись.\n\n👤 <b>Введите ваш логин администратора:</b>`
    );
    return;
  }

  // Command /status
  if (text === "/status") {
    if (subscribers[chatId]) {
      const sub = subscribers[chatId];
      await sendTelegramMessage(
        chatId,
        `🟢 <b>Статус: Активен</b>\n\nАдминистратор: <b>${escapeHtml(sub.name)}</b>\nЛогин: <code>@${escapeHtml(sub.username)}</code>\nРоль: <b>${escapeHtml(sub.role || "Администратор")}</b>\nПодключен: ${new Date(sub.subscribedAt).toLocaleString("ru-RU")}\n\n✅ Оповещения о заказах включены.`
      );
    } else {
      await sendTelegramMessage(
        chatId,
        `🔴 <b>Вы не авторизованы.</b>\nОтправьте команду /start для входа в систему.`
      );
    }
    return;
  }

  // Command /logout
  if (text === "/logout") {
    if (subscribers[chatId]) {
      delete subscribers[chatId];
      saveSubscribers(subscribers);
      delete authSessions[chatId];
      await sendTelegramMessage(
        chatId,
        `👋 <b>Вы вышли из системы.</b>\nОповещения о заказах для этого чата отключены.\nЧтобы войти снова, отправьте /start.`
      );
    } else {
      await sendTelegramMessage(chatId, `Вы не были авторизованы.`);
    }
    return;
  }

  // Session state handling
  const session = authSessions[chatId];
  if (!session) {
    await sendTelegramMessage(
      chatId,
      `Для начала работы отправьте команду /start`
    );
    return;
  }

  if (session.step === "awaiting_login") {
    session.username = text;
    session.step = "awaiting_password";
    await sendTelegramMessage(
      chatId,
      `🔑 Принято. Теперь введите <b>пароль</b> администратора для логина <b>${escapeHtml(text)}</b>:`
    );
    return;
  }

  if (session.step === "awaiting_password") {
    const username = session.username;
    const password = text;

    // Verify against Supabase mm_admins
    const { data: admin, error } = await supabase
      .from("mm_admins")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .maybeSingle();

    if (error || !admin) {
      delete authSessions[chatId];
      await sendTelegramMessage(
        chatId,
        `❌ <b>Неверный логин или пароль!</b>\n\nДоступ запрещен. Проверьте данные и отправьте /start, чтобы попробовать снова.`
      );
      return;
    }

    if (admin.is_active === false) {
      delete authSessions[chatId];
      await sendTelegramMessage(
        chatId,
        `⛔ <b>Учетная запись отключена!</b>\nОбратитесь к главному администратору.`
      );
      return;
    }

    // Success!
    subscribers[chatId] = {
      adminId: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      isSuperAdmin: admin.is_super_admin,
      subscribedAt: new Date().toISOString(),
    };
    saveSubscribers(subscribers);
    delete authSessions[chatId];

    await sendTelegramMessage(
      chatId,
      `🎉 <b>Авторизация успешна!</b>\n\nЗдравствуйте, <b>${escapeHtml(admin.name)}</b>!\nВаш аккаунт <code>@${escapeHtml(admin.username)}</code> успешно привязан.\n\n📦 <b>Все новые заказы с сайта mini-mall.uz будут мгновенно приходить вам сюда.</b>\nВам больше не нужно постоянно сидеть на сайте — вы не пропустите ни одного клиента!`
    );
  }
}

// ─── Background Order Polling (Detects any new orders in DB) ─────────────────

async function pollSupabaseOrders() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      for (const order of data.reverse()) {
        if (!notifiedOrders.has(order.id)) {
          notifiedOrders.add(order.id);
          saveNotifiedOrders(notifiedOrders);

          // Only notify if order is recent (created in last 24h)
          const createdAt = new Date(order.created_at).getTime();
          if (Date.now() - createdAt < 24 * 60 * 60 * 1000) {
            await broadcastOrder(order);
          }
        }
      }
    }
  } catch (err) {
    // ignore
  } finally {
    setTimeout(pollSupabaseOrders, 4000);
  }
}

// ─── Local HTTP Server for instant web pushes (Port 8444) ────────────────────

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/notify-order") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        if (payload && payload.order) {
          notifiedOrders.add(payload.order.id);
          saveNotifiedOrders(notifiedOrders);
          await broadcastOrder(payload.order);
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: true, subscribersCount: Object.keys(subscribers).length }));
      } catch (e) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.method === "GET" && req.url === "/api/subscribers") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ count: Object.keys(subscribers).length, subscribers }));
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(8444, "127.0.0.1", () => {
  console.log("⚡ [Minimall Bot Service] Local HTTP API listening on http://127.0.0.1:8444");
});

// Initialize
console.log("🤖 [Minimall Bot Service] Starting Telegram Bot @MiniMall_Uz_bot...");
console.log(`📋 [Minimall Bot Service] Active subscribers: ${Object.keys(subscribers).length}`);

pollUpdates();
pollSupabaseOrders();
