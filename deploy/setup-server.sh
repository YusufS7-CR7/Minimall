#!/bin/bash
# =============================================================
# setup-server.sh — Первичная установка сервера Ahost.uz
# Запустить ОДИН РАЗ на сервере от root:
#   bash setup-server.sh
# =============================================================

set -e
echo "======================================"
echo "  Minimall — Установка сервера"
echo "======================================"

# 1. Обновление системы
echo "[1/7] Обновление системы..."
apt-get update -qq && apt-get upgrade -y -qq

# 2. Установка Node.js 20
echo "[2/7] Установка Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
apt-get install -y nodejs > /dev/null 2>&1
echo "  Node.js: $(node --version)"
echo "  npm: $(npm --version)"

# 3. Установка PM2
echo "[3/7] Установка PM2..."
npm install -g pm2 > /dev/null 2>&1
echo "  PM2: $(pm2 --version)"

# 4. Установка Nginx
echo "[4/7] Установка Nginx..."
apt-get install -y nginx > /dev/null 2>&1
systemctl enable nginx
systemctl start nginx
echo "  Nginx: $(nginx -v 2>&1)"

# 5. Установка Certbot
echo "[5/7] Установка Certbot..."
apt-get install -y certbot python3-certbot-nginx > /dev/null 2>&1
echo "  Certbot: $(certbot --version 2>&1)"

# 6. Создание папок
echo "[6/7] Создание папок..."
mkdir -p /var/www/minimall/dist
mkdir -p /var/log/minimall

# 7. Убрать дефолтный сайт Nginx
echo "[7/7] Настройка Nginx..."
rm -f /etc/nginx/sites-enabled/default

echo ""
echo "======================================"
echo "  ✅ Сервер готов к деплою!"
echo "  Теперь запустите: bash deploy.sh"
echo "======================================"
