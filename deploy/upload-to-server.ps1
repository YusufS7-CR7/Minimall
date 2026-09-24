# =============================================================
# upload-to-server.ps1 — Загрузка файлов на сервер Ahost.uz
# Запустить в PowerShell из папки проекта:
#   .\deploy\upload-to-server.ps1
# =============================================================

$SERVER = "82.215.81.150"
$USER   = "root"
$REMOTE = "/var/www/minimall"

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  Minimall — Загрузка на сервер" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# Переходим в папку проекта
$ProjectDir = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectDir

Write-Host "`n[1/4] Создание папок на сервере..." -ForegroundColor Yellow
ssh "${USER}@${SERVER}" "mkdir -p ${REMOTE}/dist ${REMOTE}/server ${REMOTE}/deploy /var/log/minimall"

Write-Host "[2/4] Загрузка фронтенда (dist/)..." -ForegroundColor Yellow
scp -r "dist/" "${USER}@${SERVER}:${REMOTE}/"

Write-Host "[3/4] Загрузка бота и конфигов..." -ForegroundColor Yellow
scp -r "server/"              "${USER}@${SERVER}:${REMOTE}/"
scp    "package.json"         "${USER}@${SERVER}:${REMOTE}/"
scp    "package-lock.json"    "${USER}@${SERVER}:${REMOTE}/"
scp    "deploy/nginx.conf"    "${USER}@${SERVER}:${REMOTE}/deploy/"
scp    "deploy/deploy.sh"     "${USER}@${SERVER}:${REMOTE}/deploy/"
scp    "deploy/.env.server"   "${USER}@${SERVER}:${REMOTE}/deploy/"
scp    "deploy/ecosystem.config.json" "${USER}@${SERVER}:${REMOTE}/"

Write-Host "[4/4] Выставление прав на скрипты..." -ForegroundColor Yellow
ssh "${USER}@${SERVER}" "chmod +x ${REMOTE}/deploy/deploy.sh"

Write-Host "`n======================================" -ForegroundColor Green
Write-Host "  Файлы загружены!" -ForegroundColor Green
Write-Host ""
Write-Host "  Теперь на сервере запустите:" -ForegroundColor White
Write-Host "    bash /var/www/minimall/deploy/deploy.sh" -ForegroundColor Yellow
Write-Host "======================================" -ForegroundColor Green
