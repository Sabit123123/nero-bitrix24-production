#!/usr/bin/env bash
# ===================================================================
# AquaUzel — обновление сайта на VPS из git.
# Запускать НА СЕРВЕРЕ: тянет ветку main и копирует статику в вебрут.
#   sudo REPO_DIR=/opt/aquauzel-repo WEBROOT=/var/www/aquauzel bash deploy/deploy.sh
# или просто:  bash deploy/deploy.sh   (значения по умолчанию ниже)
# ===================================================================
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/aquauzel-repo}"   # где лежит клон репозитория
WEBROOT="${WEBROOT:-/var/www/aquauzel}"      # что отдаёт nginx
BRANCH="${BRANCH:-main}"

echo "→ Обновляю репозиторий в $REPO_DIR (ветка $BRANCH)"
cd "$REPO_DIR"
git fetch --depth=1 origin "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "→ Копирую aquauzel-site/ в $WEBROOT"
mkdir -p "$WEBROOT"
rsync -a --delete "$REPO_DIR/aquauzel-site/" "$WEBROOT/"

# по желанию перезагрузить nginx (обычно не требуется для статики)
# nginx -t && systemctl reload nginx

echo "✓ Готово: сайт обновлён в $WEBROOT"
