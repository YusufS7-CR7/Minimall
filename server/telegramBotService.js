import fs from "fs";
import path from "path";
import http from "http";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to load .env in Node.js without external dependencies
function loadEnv() {
  try {
    const envPath = path.join(__dirname, "..", ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const k = trimmed.slice(0, idx).trim();
          const v = trimmed.slice(idx + 1).trim();
          if (!process.env[k]) process.env[k] = v;
        }
      });
    }
  } catch (e) {
    console.warn("Could not read .env file:", e.message);
  }
}
loadEnv();

const BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN ||
  process.env.VITE_TELEGRAM_BOT_TOKEN ||
  "8809570303:AAGL-2UCGPLoGrx7NBwX0ZzHraMyqSzWvNA";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://pptastuhmpzdyjeyhfts.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwdGFzdHVobXB6ZHlqZXloZnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg3MTc4ODUsImV4cCI6MjEwNDI5Mzg4NX0.tZazXTeRiAs8CaiGzr139JyBCPI7_0JQlpieMOOOxO8";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Cryptographic password hasher compatible with AdminAuthContext and crypto.ts */
function hashPassword(password, salt = "marketplace") {
  const prefix = "minimall_sec_v1_";
  return crypto
    .createHash("sha256")
    .update(`${prefix}${salt}_${password}`)
    .digest("hex");
}

const DATA_DIR = path.join(__dirname, "..", "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SUBSCRIBERS_FILE = path.join(DATA_DIR, "telegram_subscribers.json");
const NOTIFIED_FILE = path.join(DATA_DIR, "notified_orders.json");
const USER_LANGS_FILE = path.join(DATA_DIR, "telegram_user_languages.json");

// ─── Persistent Storage Helpers ──────────────────────────────────────────────

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

function loadUserLanguages() {
  try {
    if (fs.existsSync(USER_LANGS_FILE)) {
      return JSON.parse(fs.readFileSync(USER_LANGS_FILE, "utf-8"));
    }
  } catch (e) {
    console.error("Error loading user languages:", e);
  }
  return {};
}

function saveUserLanguages(langs) {
  try {
    fs.writeFileSync(USER_LANGS_FILE, JSON.stringify(langs, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving user languages:", e);
  }
}

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
let userLanguages = loadUserLanguages();
let notifiedOrders = loadNotifiedOrders();
let authSessions = {}; // chatId -> { step: 'awaiting_login' | 'awaiting_password', username?: string }

// Pre-seed known admin chat IDs so subscribers persist across Render container restarts
const DEFAULT_PRECONFIGURED_ADMINS = {
  "1837377724": {
    adminId: "superadmin-1",
    username: "admin",
    name: "Юсуф (Главный Администратор)",
    role: "superadmin",
    isSuperAdmin: true,
    lang: "ru",
    subscribedAt: new Date().toISOString(),
  },
};

const adminChatIdsEnv = (process.env.ADMIN_CHAT_IDS || "1837377724")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

for (const id of adminChatIdsEnv) {
  if (!subscribers[id]) {
    subscribers[id] = DEFAULT_PRECONFIGURED_ADMINS[id] || {
      adminId: "superadmin-1",
      username: "admin",
      name: "Администратор",
      role: "superadmin",
      isSuperAdmin: true,
      lang: userLanguages[id] || "ru",
      subscribedAt: new Date().toISOString(),
    };
  }
}
saveSubscribers(subscribers);

// Sync subscribers with userLanguages on startup
for (const [chatId, sub] of Object.entries(subscribers)) {
  if (sub && sub.lang && !userLanguages[chatId]) {
    userLanguages[chatId] = sub.lang;
  }
}

// ─── Telegram API Helpers ───────────────────────────────────────────────────

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

async function answerCallbackQuery(callbackQueryId, text = "") {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
      }),
    });
  } catch (e) {
    // ignore
  }
}

async function registerBotCommands() {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setMyCommands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commands: [
          { command: "start", description: "Boshlash / Начать" },
          { command: "lang", description: "Tilni tanlash / Выбрать язык" },
          { command: "status", description: "Holat / Статус" },
          { command: "logout", description: "Chiqish / Выйти" },
        ],
      }),
    });
  } catch (e) {
    // ignore
  }
}

function escapeHtml(text = "") {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatPrice(num = 0, lang = "ru") {
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return lang === "uz" ? `${formatted} so'm` : `${formatted} сум`;
}

function getLanguageKeyboard() {
  return {
    inline_keyboard: [
      [
        { text: "🇷🇺 Русский", callback_data: "setlang_ru" },
        { text: "🇺🇿 O'zbekcha", callback_data: "setlang_uz" },
      ],
    ],
  };
}

async function promptLanguageSelection(chatId) {
  return await sendTelegramMessage(
    chatId,
    `🌐 <b>Tilni tanlang / Выберите язык:</b>\n\nIltimos, botdan foydalanish uchun qulay tilni tanlang.\nПожалуйста, выберите удобный язык для работы с ботом:`,
    { reply_markup: getLanguageKeyboard() }
  );
}

// ─── Localized Order Notifications ──────────────────────────────────────────

function formatOrderMessage(order, lang = "ru") {
  const isUz = lang === "uz";

  const paymentLabelsRu = {
    cash: "💵 Наличными курьеру",
    click: "📱 Click (онлайн)",
    payme: "💳 Payme (онлайн)",
    bank_transfer: "🏢 Безналичный расчет (юр. лица)",
  };

  const paymentLabelsUz = {
    cash: "💵 Kuryerga naqd pul",
    click: "📱 Click (onlayn)",
    payme: "💳 Payme (onlayn)",
    bank_transfer: "🏢 Bank o'tkazmasi (yuridik shaxslar)",
  };

  const paymentMethodKey = order.customer?.paymentMethod;
  const paymentStr = isUz
    ? paymentLabelsUz[paymentMethodKey] || paymentMethodKey || "Naqd pul"
    : paymentLabelsRu[paymentMethodKey] || paymentMethodKey || "Наличными";

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
      const itemName = isUz ? item.nameUz || item.name : item.name;
      const pcsWord = isUz ? "ta" : "шт.";
      return `${idx + 1}. <b>${escapeHtml(itemName)}</b>\n   └ ${count} ${pcsWord} × ${formatPrice(price, lang)} = <b>${formatPrice(price * count, lang)}</b>`;
    })
    .join("\n");

  const totalCount = items.reduce((s, i) => s + (i.count || 1), 0);
  const totalAmount = order.total_amount || order.totalAmount || 0;
  const cleanedPhone = (order.customer?.phone || "").replace(/[^0-9+]/g, "");

  if (isUz) {
    return `🚨 <b>MINIMALL SAYTIDAN YANGI BUYURTMA!</b>
━━━━━━━━━━━━━━━━━━
🆔 <b>Buyurtma raqami:</b> <code>${escapeHtml(order.id)}</code>
📅 <b>Vaqt:</b> ${dateStr} (Toshkent)

👤 <b>Xaridor:</b> ${escapeHtml(order.customer?.name || "Xaridor")}
📞 <b>Telefon:</b> <a href="tel:${cleanedPhone}">${escapeHtml(order.customer?.phone || "Ko'rsatilmagan")}</a>
📍 <b>Shahar:</b> ${escapeHtml(order.customer?.city || "Toshkent")}
🏠 <b>Manzil:</b> ${escapeHtml(order.customer?.address || "Ko'rsatilmagan")}
💳 <b>To'lov:</b> ${paymentStr}
${order.customer?.comment ? `💬 <b>Izoh:</b> <i>«${escapeHtml(order.customer.comment)}»</i>\n` : ""}
━━━━━━━━━━━━━━━━━━
📦 <b>Buyurtma tarkibi (${totalCount} ta):</b>
${itemsList || "—"}
━━━━━━━━━━━━━━━━━━
💰 <b>JAMI TO'LOV: ${formatPrice(totalAmount, "uz")}</b>

⚡ <i>Yetkazib berishni tasdiqlash uchun mijoz bilan bog'laning!</i>`;
  }

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
💰 <b>ИТОГО К ОПЛАТЕ: ${formatPrice(totalAmount, "ru")}</b>

⚡ <i>Свяжитесь с клиентом для подтверждения доставки!</i>`;
}

// ─── Broadcast order to all verified admins ──────────────────────────────────

async function broadcastOrder(order) {
  const activeSubs = Object.entries(subscribers);
  if (activeSubs.length === 0) {
    console.log(`[Bot] New order ${order.id}, but no active admin subscribers yet.`);
    return;
  }

  console.log(`[Bot] Broadcasting order ${order.id} to ${activeSubs.length} admins...`);

  for (const [chatId, sub] of activeSubs) {
    const adminLang = sub.lang || userLanguages[chatId] || "uz";
    const text = formatOrderMessage(order, adminLang);
    await sendTelegramMessage(chatId, text);
  }
}

// ─── Telegram Bot Updates Handler (Long Polling) ─────────────────────────────

let lastUpdateId = 0;
let isPollingActive = false;

async function pollUpdates() {
  if (!isPollingActive) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=20`);
    const data = await res.json();

    if (!data.ok) {
      console.warn(`[Telegram Bot] getUpdates error (${data.error_code}): ${data.description}`);
      if (data.error_code === 409) {
        // Another instance or webhook active - back off for 5 seconds
        await new Promise((r) => setTimeout(r, 5000));
      }
    } else if (Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        if (update.callback_query) {
          await handleCallbackQuery(update.callback_query);
        } else if (update.message && update.message.text) {
          await handleIncomingMessage(update.message);
        }
      }
    }
  } catch (err) {
    // network timeout or glitch
  } finally {
    if (isPollingActive) {
      setTimeout(pollUpdates, 1000);
    }
  }
}

// ─── Handle Inline Keyboard Callbacks (Language selection) ───────────────────

async function handleCallbackQuery(callbackQuery) {
  const chatId = String(callbackQuery.message?.chat?.id);
  const data = callbackQuery.data;

  if (data === "setlang_ru" || data === "setlang_uz") {
    const lang = data === "setlang_uz" ? "uz" : "ru";
    userLanguages[chatId] = lang;
    saveUserLanguages(userLanguages);

    if (subscribers[chatId]) {
      subscribers[chatId].lang = lang;
      saveSubscribers(subscribers);
    }

    const isUz = lang === "uz";
    await answerCallbackQuery(
      callbackQuery.id,
      isUz ? "Til O'zbekcha 🇺🇿 ga o'rnatildi" : "Выбран Русский язык 🇷🇺"
    );

    // If user is already an authorized subscriber
    if (subscribers[chatId]) {
      const sub = subscribers[chatId];
      if (isUz) {
        await sendTelegramMessage(
          chatId,
          `✅ <b>Til O'zbekcha 🇺🇿 ga muvaffaqiyatli o'zgartirildi!</b>\n\nSiz <b>${escapeHtml(sub.name)}</b> (@${escapeHtml(sub.username)}) sifatida ulangan holatdasiz.\nYangi buyurtmalar ushbu chatga o'zbek tilida yuboriladi.\n\n/status — holatni tekshirish\n/lang — tilni o'zgartirish\n/logout — chiqish`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `✅ <b>Язык успешно изменен на Русский 🇷🇺!</b>\n\nВы подключены как <b>${escapeHtml(sub.name)}</b> (@${escapeHtml(sub.username)}).\nНовые заказы приходят на русском языке.\n\n/status — проверить статус\n/lang — сменить язык\n/logout — выйти`
        );
      }
      return;
    }

    // Unauthenticated user -> start admin authentication flow in selected language
    authSessions[chatId] = { step: "awaiting_login" };
    if (isUz) {
      await sendTelegramMessage(
        chatId,
        `✅ <b>O'zbek tili tanlandi 🇺🇿</b>\n\n👋 <b>Minimall buyurtmalar tizimiga xush kelibsiz!</b>\n\nUshbu bot do'kon administratorlari uchun mo'ljallangan. Yangi buyurtmalar haqida tezkor bildirishnomalarni olish uchun profilingizni tasdiqlang.\n\n👤 <b>Administrator loginingizni kiriting:</b>`
      );
    } else {
      await sendTelegramMessage(
        chatId,
        `✅ <b>Выбран Русский язык 🇷🇺</b>\n\n👋 <b>Добро пожаловать в систему заказов Minimall!</b>\n\nЭтот бот предназначен для администраторов магазина. Чтобы получать оповещения о новых заказах, подтвердите вашу учетную запись.\n\n👤 <b>Введите ваш логин администратора:</b>`
      );
    }
  }
}

// ─── Handle Text Messages & Commands ─────────────────────────────────────────

async function handleIncomingMessage(msg) {
  const chatId = String(msg.chat.id);
  const text = (msg.text || "").trim();

  // Command /start: Always prompt language selection first (Russian / Uzbek)
  if (text === "/start" || text.startsWith("/start")) {
    await promptLanguageSelection(chatId);
    return;
  }

  // Command /lang or /language: allows changing language at any time
  if (text === "/lang" || text === "/language") {
    await promptLanguageSelection(chatId);
    return;
  }

  // If user hasn't selected language yet, prompt language first
  if (!userLanguages[chatId]) {
    await promptLanguageSelection(chatId);
    return;
  }

  const lang = userLanguages[chatId] || "ru";
  const isUz = lang === "uz";

  // Command /login (if user wants to re-authenticate)
  if (text === "/login") {
    if (subscribers[chatId]) {
      const sub = subscribers[chatId];
      if (isUz) {
        await sendTelegramMessage(
          chatId,
          `✅ <b>Siz allaqachon tizimga kirgansiz!</b>\n\nSiz <b>${escapeHtml(sub.name)}</b> (@${escapeHtml(sub.username)}) sifatida ulangansiz.\nmini-mall.uz saytidan yangi buyurtmalar avtomatik ravishda ushbu chatga yuboriladi.\n\n/status — holatni tekshirish\n/lang — tilni o'zgartirish\n/logout — chiqish`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `✅ <b>Вы уже авторизованы!</b>\n\nВы подключены как <b>${escapeHtml(sub.name)}</b> (@${escapeHtml(sub.username)}).\nНовые заказы автоматически приходят вам в этот чат.\n\n/status — проверить статус\n/lang — сменить язык\n/logout — выйти`
        );
      }
      return;
    }

    authSessions[chatId] = { step: "awaiting_login" };
    if (isUz) {
      await sendTelegramMessage(
        chatId,
        `👋 <b>Minimall buyurtmalar tizimiga xush kelibsiz!</b>\n\nUshbu bot do'kon administratorlari uchun mo'ljallangan. Yangi buyurtmalar haqida tezkor xabarnomalar olish uchun hisobingizni tasdiqlang.\n\n👤 <b>Administrator loginingizni kiriting:</b>`
      );
    } else {
      await sendTelegramMessage(
        chatId,
        `👋 <b>Добро пожаловать в систему заказов Minimall!</b>\n\nЭтот бот предназначен для администраторов магазина. Чтобы получать оповещения о новых заказах, подтвердите вашу учетную запись.\n\n👤 <b>Введите ваш логин администратора:</b>`
      );
    }
    return;
  }

  // Command /status
  if (text === "/status") {
    if (subscribers[chatId]) {
      const sub = subscribers[chatId];
      const roleLabel = isUz
        ? sub.isSuperAdmin
          ? "Bosh Administrator"
          : sub.role === "manager"
          ? "Kontent-menejer"
          : "Administrator"
        : sub.isSuperAdmin
        ? "Главный Администратор"
        : sub.role === "manager"
        ? "Контент-менеджер"
        : "Администратор";

      const subscribedDate = new Date(sub.subscribedAt).toLocaleString(isUz ? "uz-UZ" : "ru-RU");

      if (isUz) {
        await sendTelegramMessage(
          chatId,
          `🟢 <b>Holat: Faol</b>\n\nAdministrator: <b>${escapeHtml(sub.name)}</b>\nLogin: <code>@${escapeHtml(sub.username)}</code>\nRol: <b>${escapeHtml(roleLabel)}</b>\nTanlangan til: <b>O'zbekcha 🇺🇿</b>\nUlangan: ${subscribedDate}\n\n✅ Buyurtma bildirishnomalari yoqilgan.`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `🟢 <b>Статус: Активен</b>\n\nАдминистратор: <b>${escapeHtml(sub.name)}</b>\nЛогин: <code>@${escapeHtml(sub.username)}</code>\nРоль: <b>${escapeHtml(roleLabel)}</b>\nВыбранный язык: <b>Русский 🇷🇺</b>\nПодключен: ${subscribedDate}\n\n✅ Оповещения о заказах включены.`
        );
      }
    } else {
      if (isUz) {
        await sendTelegramMessage(
          chatId,
          `🔴 <b>Siz tizimga kirmagansiz.</b>\nTizimga kirish uchun /start buyrug'ini yuboring.`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `🔴 <b>Вы не авторизованы.</b>\nОтправьте команду /start для входа в систему.`
        );
      }
    }
    return;
  }

  // Command /logout
  if (text === "/logout") {
    if (subscribers[chatId]) {
      delete subscribers[chatId];
      saveSubscribers(subscribers);
      delete authSessions[chatId];
      if (isUz) {
        await sendTelegramMessage(
          chatId,
          `👋 <b>Siz tizimdan chiqdingiz.</b>\nUshbu chat uchun bildirishnomalar o'chirildi.\nQayta kirish uchun /start ni yuboring.`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `👋 <b>Вы вышли из системы.</b>\nОповещения о заказах для этого чата отключены.\nЧтобы войти снова, отправьте /start.`
        );
      }
    } else {
      await sendTelegramMessage(chatId, isUz ? `Siz tizimga kirmagan edingiz.` : `Вы не были авторизованы.`);
    }
    return;
  }

  // Session state handling
  const session = authSessions[chatId];
  if (!session) {
    if (isUz) {
      await sendTelegramMessage(chatId, `Boshlash uchun /start buyrug'ini yuboring yoki tilni o'zgartirish uchun /lang bosing.`);
    } else {
      await sendTelegramMessage(chatId, `Для начала работы отправьте команду /start или для смены языка /lang.`);
    }
    return;
  }

  if (session.step === "awaiting_login") {
    session.username = text;
    session.step = "awaiting_password";
    if (isUz) {
      await sendTelegramMessage(
        chatId,
        `🔑 Qabul qilindi. Endi <b>${escapeHtml(text)}</b> logini uchun administrator <b>parolini</b> kiriting:`
      );
    } else {
      await sendTelegramMessage(
        chatId,
        `🔑 Принято. Теперь введите <b>пароль</b> администратора для логина <b>${escapeHtml(text)}</b>:`
      );
    }
    return;
  }

  if (session.step === "awaiting_password") {
    const username = (session.username || "").trim().toLowerCase();
    const password = text;

    // Verify against Supabase mm_admins
    const { data: admin, error } = await supabase
      .from("mm_admins")
      .select("*")
      .ilike("username", username)
      .maybeSingle();

    const hashedInput = hashPassword(password);
    const isMatch = admin && (admin.password === hashedInput || admin.password === password);

    if (error || !admin || !isMatch) {
      delete authSessions[chatId];
      if (isUz) {
        await sendTelegramMessage(
          chatId,
          `❌ <b>Noto'g'ri login yoki parol!</b>\n\nKirish taqiqlandi. Ma'lumotlarni tekshiring va qayta urinish uchun /start ni yuboring.`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `❌ <b>Неверный логин или пароль!</b>\n\nДоступ запрещен. Проверьте данные и отправьте /start, чтобы попробовать снова.`
        );
      }
      return;
    }

    if (admin.is_active === false) {
      delete authSessions[chatId];
      if (isUz) {
        await sendTelegramMessage(
          chatId,
          `⛔ <b>Hisob o'chirilgan!</b>\nBosh administratorga murojaat qiling.`
        );
      } else {
        await sendTelegramMessage(
          chatId,
          `⛔ <b>Учетная запись отключена!</b>\nОбратитесь к главному администратору.`
        );
      }
      return;
    }

    // Success!
    subscribers[chatId] = {
      adminId: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
      isSuperAdmin: admin.is_super_admin,
      lang: lang,
      subscribedAt: new Date().toISOString(),
    };
    saveSubscribers(subscribers);
    delete authSessions[chatId];

    if (isUz) {
      await sendTelegramMessage(
        chatId,
        `🎉 <b>Muvaffaqiyatli kirdingiz!</b>\n\nAssalomu alaykum, <b>${escapeHtml(admin.name)}</b>!\nSizning <code>@${escapeHtml(admin.username)}</code> hisobingiz muvaffaqiyatli ulandi.\n\n📦 <b>mini-mall.uz saytidan barcha yangi buyurtmalar shu yerga darhol yuboriladi.</b>\nEndi siz barcha buyurtmalarni o'z vaqtida ko'rib borasiz!`
      );
    } else {
      await sendTelegramMessage(
        chatId,
        `🎉 <b>Авторизация успешна!</b>\n\nЗдравствуйте, <b>${escapeHtml(admin.name)}</b>!\nВаш аккаунт <code>@${escapeHtml(admin.username)}</code> успешно привязан.\n\n📦 <b>Все новые заказы с сайта mini-mall.uz будут мгновенно приходить вам сюда.</b>\nВам больше не нужно постоянно сидеть на сайте — вы не пропустите ни одного клиента!`
      );
    }
  }
}

// ─── Background Order Polling (Detects any new orders in DB) ─────────────────

let isFirstOrderPoll = notifiedOrders.size === 0;

async function pollSupabaseOrders() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error && data) {
      if (isFirstOrderPoll) {
        // Cold start: remember existing orders so we do not spam old orders on reboot
        for (const order of data) {
          notifiedOrders.add(order.id);
        }
        saveNotifiedOrders(notifiedOrders);
        isFirstOrderPoll = false;
        console.log(`[Bot] Initialized order cache with ${notifiedOrders.size} existing orders.`);
      } else {
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
    }
  } catch (err) {
    // ignore
  } finally {
    setTimeout(pollSupabaseOrders, 4000);
  }
}

// ─── Local HTTP Server for instant web pushes & Telegram Webhooks ────────────

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  // Telegram Webhook receiver (works reliably on Render Free Tier without sleeping)
  if (req.method === "POST" && (req.url === "/api/telegram-webhook" || req.url === "/webhook")) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const update = JSON.parse(body);
        if (update.callback_query) {
          await handleCallbackQuery(update.callback_query);
        } else if (update.message && update.message.text) {
          await handleIncomingMessage(update.message);
        }
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        console.error("[Webhook Error]:", e.message);
        res.writeHead(200);
        res.end();
      }
    });
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

  if (req.method === "GET" && (req.url === "/" || req.url === "/health" || req.url === "/ping")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "minimall-telegram-bot",
        subscribers: Object.keys(subscribers).length,
        isPolling: isPollingActive,
        uptime: Math.round(process.uptime()),
      })
    );
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

const PORT = Number(process.env.PORT) || 8444;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`⚡ [Minimall Bot Service] HTTP API listening on port ${PORT}`);
});

// ─── Initialize Telegram Updates (Webhook or Long Polling) ───────────────────

const EXTERNAL_URL = process.env.RENDER_EXTERNAL_URL || process.env.WEBHOOK_URL;
const SHOULD_USE_WEBHOOK = Boolean(EXTERNAL_URL && process.env.FORCE_POLLING !== "true");

async function startBot() {
  console.log("🤖 [Minimall Bot Service] Starting Telegram Bot @MiniMall_Uz_bot with RU/UZ bilingual support...");
  console.log(`📋 [Minimall Bot Service] Active subscribers: ${Object.keys(subscribers).length}`);

  await registerBotCommands();

  if (SHOULD_USE_WEBHOOK) {
    const webhookUrl = `${EXTERNAL_URL.replace(/\/$/, "")}/api/telegram-webhook`;
    console.log(`🌐 [Minimall Bot Service] Setting Telegram Webhook: ${webhookUrl}`);
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          drop_pending_updates: false,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        console.log("✅ [Minimall Bot Service] Webhook successfully registered with Telegram!");
        pollSupabaseOrders();
        return;
      }
      console.warn("⚠️ [Minimall Bot Service] Webhook registration failed, falling back to polling:", data);
    } catch (e) {
      console.error("⚠️ [Minimall Bot Service] Webhook registration error, falling back to polling:", e.message);
    }
  }

  // Fallback / default: Long Polling
  try {
    // Delete any active webhook so getUpdates won't return 409 Conflict
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
  } catch (e) {
    // ignore
  }

  console.log("🚀 [Minimall Bot Service] Starting Telegram Long Polling...");
  isPollingActive = true;
  pollUpdates();
  pollSupabaseOrders();
}

startBot();
