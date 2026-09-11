import React, { useState, useEffect } from "react";
import {
  getTelegramSettings,
  saveTelegramSettings,
  testTelegramConnection,
  type TelegramSettings,
} from "@/lib/telegram";

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export default function TelegramSettingsModal({
  isOpen,
  onClose,
  onSuccessToast,
}: TelegramSettingsModalProps) {
  const [settings, setSettings] = useState<TelegramSettings>({
    botToken: "",
    chatId: "",
    enabled: true,
  });

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSettings(getTelegramSettings());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async () => {
    if (!settings.botToken.trim() || !settings.chatId.trim()) {
      setTestResult({
        success: false,
        message: "Пожалуйста, введите токен бота и Chat ID перед отправкой теста",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await testTelegramConnection(settings.botToken, settings.chatId);
    setIsTesting(false);

    if (res.success) {
      setTestResult({
        success: true,
        message: "Отлично! Тестовое сообщение успешно получено в Telegram.",
      });
    } else {
      setTestResult({
        success: false,
        message: `Ошибка отправки: ${res.error || "Проверьте токен и ID чата"}`,
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveTelegramSettings(settings);
    onSuccessToast("Настройки Telegram-уведомлений сохранены!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-auto animate-slideUp sm:animate-none">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">✈️</span>
            <div>
              <h2 className="text-lg font-bold">Уведомления в Telegram</h2>
              <p className="text-[11px] text-sky-100">Мгновенные оповещения менеджеров о новых заказах</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 text-xs">
          {/* Enabled toggle */}
          <div className="flex items-center justify-between p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl">
            <div>
              <div className="font-bold text-gray-900 text-sm">Включить уведомления</div>
              <div className="text-[11px] text-gray-500">Отправлять состав каждого нового заказа в Telegram</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings((s) => ({ ...s, enabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            </label>
          </div>

          {/* Bot Token input */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Telegram Bot Token <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required={settings.enabled}
              value={settings.botToken}
              onChange={(e) => setSettings((s) => ({ ...s, botToken: e.target.value.trim() }))}
              placeholder="например: 7123456789:AAHfkj92_ExampleToken..."
              className="w-full text-xs font-mono px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-sky-500 bg-gray-50/50 focus:bg-white transition-colors"
            />
          </div>

          {/* Chat ID input */}
          <div>
            <label className="block font-bold text-gray-700 mb-1">
              Chat ID или ID группы <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required={settings.enabled}
              value={settings.chatId}
              onChange={(e) => setSettings((s) => ({ ...s, chatId: e.target.value.trim() }))}
              placeholder="например: 123456789 или -1001234567890 (для групп)"
              className="w-full text-xs font-mono px-3.5 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-sky-500 bg-gray-50/50 focus:bg-white transition-colors"
            />
          </div>

          {/* Step-by-step instructions */}
          <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-[11px] text-gray-600 space-y-1.5 leading-relaxed">
            <div className="font-bold text-gray-800 flex items-center gap-1">
              <span>📖</span>
              <span>Как настроить за 2 минуты:</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-gray-600">
              <li>Откройте Telegram и найдите официального бота <strong>@BotFather</strong>.</li>
              <li>Отправьте команду <code>/newbot</code>, укажите имя и получите <strong>API Token</strong>.</li>
              <li>Чтобы узнать свой <strong>Chat ID</strong>, напишите боту <strong>@userinfobot</strong> и скопируйте <em>Id</em>.</li>
              <li>Если хотите слать заказы в группу сотрудников: добавьте вашего бота в группу и укажите ID группы со знаком «-» (минус).</li>
            </ol>
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium ${
                testResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {testResult.success ? "✅ " : "❌ "}
              {testResult.message}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <button
              type="button"
              onClick={handleTest}
              disabled={isTesting}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                  <span>Отправка...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Проверить связь</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-semibold transition-colors cursor-pointer text-center"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20 transition-all cursor-pointer text-center"
              >
                Сохранить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
