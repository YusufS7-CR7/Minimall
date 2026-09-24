# 📦 Папка deploy — Инструкция по деплою на Ahost.uz

## Файлы в папке

| Файл | Назначение |
|------|-----------|
| `nginx.conf` | Конфиг Nginx для сайта |
| `ecosystem.config.json` | PM2 конфиг для Telegram бота |
| `.env.server` | Переменные окружения для сервера |
| `setup-server.sh` | Первичная установка сервера (один раз) |
| `deploy.sh` | Деплой / обновление (каждый раз) |
| `upload-to-server.ps1` | Загрузка файлов через SCP (Windows) |

---

## 🚀 Шаги деплоя

### Шаг 1 — На вашем компьютере: сборка
```powershell
npm run build
```

### Шаг 2 — Первичная установка сервера (ОДИН РАЗ)
Подключитесь по SSH и запустите:
```bash
ssh root@uz01.ahost.uz
bash /tmp/setup-server.sh
```

### Шаг 3 — Загрузить файлы на сервер (Windows PowerShell)
```powershell
.\deploy\upload-to-server.ps1
```

### Шаг 4 — На сервере: запуск
```bash
ssh root@uz01.ahost.uz
bash /var/www/minimall/deploy/deploy.sh
```

### Шаг 5 — DNS (в панели регистратора домена)
| Тип | Имя | Значение |
|-----|-----|---------|
| A | @ | `<IP сервера>` |
| A | www | `<IP сервера>` |

### Шаг 6 — SSL (после обновления DNS)
```bash
certbot --nginx -d mini-mall.uz -d www.mini-mall.uz
```

---

## 🔄 Обновление сайта в будущем
```powershell
# 1. Локально
npm run build
.\deploy\upload-to-server.ps1

# 2. На сервере
bash /var/www/minimall/deploy/deploy.sh
```

## 🛠 Полезные команды на сервере
```bash
pm2 status                    # статус бота
pm2 logs minimall-bot         # логи бота
pm2 restart minimall-bot      # перезапуск бота
systemctl status nginx         # статус nginx
nginx -t                      # проверка конфига nginx
```
