#!/bin/bash
# =============================================================
# deploy.sh — Деплой Minimall на сервер Ahost.uz
# Запускать на СЕРВЕРЕ каждый раз при обновлении:
#   bash deploy.sh
# =============================================================

set -e
APP_DIR="/var/www/minimall"
LOG_DIR="/var/log/minimall"

echo "======================================"
echo "  Minimall — Деплой"
echo "======================================"

# 1. Проверка что файлы уже загружены
if [ ! -f "$APP_DIR/server/telegramBotService.js" ]; then
    echo "❌ Ошибка: файлы проекта не найдены в $APP_DIR"
    echo "   Сначала загрузите файлы через SCP или SFTP!"
    exit 1
fi

# 2. Установка зависимостей
echo "[1/5] Установка npm зависимостей..."
cd "$APP_DIR"
npm install --production --silent
echo "  ✅ Зависимости установлены"

# 3. Настройка .env
echo "[2/5] Настройка переменных окружения..."
if [ ! -f "$APP_DIR/.env" ]; then
    if [ -f "$APP_DIR/deploy/.env.server" ]; then
        cp "$APP_DIR/deploy/.env.server" "$APP_DIR/.env"
        echo "  ✅ .env создан из deploy/.env.server"
    else
        echo "  ⚠️  .env не найден! Создайте вручную."
    fi
else
    echo "  ✅ .env уже существует"
fi

# 4. Настройка Nginx
echo "[3/5] Настройка Nginx..."
if [ -f "$APP_DIR/deploy/nginx.conf" ]; then
    cp "$APP_DIR/deploy/nginx.conf" /etc/nginx/sites-available/minimall
    ln -sf /etc/nginx/sites-available/minimall /etc/nginx/sites-enabled/minimall
    nginx -t && systemctl reload nginx
    echo "  ✅ Nginx обновлён"
else
    echo "  ⚠️  nginx.conf не найден, пропускаю..."
fi

# 5. Запуск / перезапуск Telegram бота через PM2
echo "[4/5] Запуск Telegram бота..."
mkdir -p "$LOG_DIR"
cd "$APP_DIR"

if pm2 list | grep -q "minimall-bot"; then
    pm2 reload ecosystem.config.json --env production
    echo "  ✅ Бот перезапущен"
else
    pm2 start ecosystem.config.json
    pm2 save
    echo "  ✅ Бот запущен"
fi

# 6. Включить автозапуск PM2
echo "[5/5] Настройка автозапуска..."
pm2 startup systemd -u root --hp /root > /dev/null 2>&1 || true
pm2 save > /dev/null 2>&1
echo "  ✅ Автозапуск настроен"

echo ""
echo "======================================"
echo "  ✅ Деплой завершён успешно!"
echo ""
echo "  Статус бота:   pm2 status"
echo "  Логи бота:     pm2 logs minimall-bot"
echo "  Статус nginx:  systemctl status nginx"
echo "======================================"
