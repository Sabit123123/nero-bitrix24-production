# Перенос AquaUzel на VPS (ps.kz)

Сайт — чистая статика (HTML/CSS/JS). Бэкенд остаётся прежним: **Supabase** (товары,
вход в админку, фото) — его переносить не нужно, он работает из браузера по HTTPS.
На VPS нужен только веб-сервер **nginx**, отдающий папку `aquauzel-site/`, + **SSL**.

> Для чистой статики GitHub Pages тоже подходит (и он бесплатный). VPS имеет смысл,
> если нужен полный контроль, хостинг в КЗ или серверная логика в будущем.

Файлы для деплоя лежат в папке `deploy/` (в публикацию сайта они НЕ попадают):
- `deploy/nginx/aquauzel.kz.conf` — конфиг nginx;
- `deploy/deploy.sh` — обновление сайта на сервере из git;
- `.github/workflows/deploy-vps.yml` — авто-деплой из GitHub по SSH (по желанию).

---

## 1. Создать VPS на ps.kz

1. В панели <https://console.ps.kz/vps> создайте сервер: **Ubuntu 22.04 LTS**,
   1–2 vCPU / 1–2 ГБ RAM (с запасом хватит). Запишите **IP-адрес** и пароль root.
2. В фаерволе/настройках сервера откройте порты **22 (SSH), 80 (HTTP), 443 (HTTPS)**.

Подключитесь по SSH:
```bash
ssh root@IP_СЕРВЕРА
```

## 2. Базовая настройка сервера
```bash
apt update && apt upgrade -y
apt install -y nginx git rsync ufw certbot python3-certbot-nginx

ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

## 3. Залить сайт на сервер
```bash
# клон репозитория (публичный)
git clone https://github.com/Sabit123123/nero-bitrix24-production.git /opt/aquauzel-repo

# вебрут и первая выкладка
mkdir -p /var/www/aquauzel
rsync -a /opt/aquauzel-repo/aquauzel-site/ /var/www/aquauzel/
chown -R www-data:www-data /var/www/aquauzel
```

## 4. Настроить nginx
```bash
cp /opt/aquauzel-repo/deploy/nginx/aquauzel.kz.conf /etc/nginx/sites-available/aquauzel.kz
ln -s /etc/nginx/sites-available/aquauzel.kz /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default   # убрать дефолтную заглушку
nginx -t && systemctl reload nginx
```
Проверка по IP: откройте `http://IP_СЕРВЕРА` — должен открыться сайт.

## 5. Домен и DNS
В DNS домена **aquauzel.kz** (там, где он управляется) укажите на IP сервера:
- `A` запись: `@`  → `IP_СЕРВЕРА`
- `A` запись: `www` → `IP_СЕРВЕРА`

> Важно: сейчас домен указывает на GitHub Pages. Домен может вести только в одно
> место — после смены DNS сайт начнёт открываться с VPS (обычно в течение 10–60 мин).
> GitHub Pages можно оставить как есть (он просто перестанет быть «живым» для домена)
> или позже отключить workflow `deploy-pages.yml`.

## 6. Включить HTTPS (Let's Encrypt)
Когда DNS уже указывает на сервер:
```bash
certbot --nginx -d aquauzel.kz -d www.aquauzel.kz --redirect -m ВАШ_EMAIL --agree-tos --no-eff-email
```
certbot сам добавит блок `443`, сертификат и редирект с http→https, и настроит
авто-продление. Проверка: <https://aquauzel.kz>.

## 7. Обновление сайта дальше

**Вариант А — вручную на сервере** (тянет последние изменения из main):
```bash
bash /opt/aquauzel-repo/deploy/deploy.sh
```

**Вариант Б — автоматически из GitHub** (push → деплой на VPS):
1. Создайте на сервере отдельного пользователя и SSH-ключ для деплоя
   (или используйте существующий доступ). Публичный ключ добавьте в
   `~/.ssh/authorized_keys` нужного пользователя на VPS.
2. В GitHub: **Settings → Secrets and variables → Actions → New repository secret**:
   - `VPS_HOST` — IP/домен сервера
   - `VPS_USER` — пользователь SSH (например, `deploy` или `root`)
   - `VPS_SSH_KEY` — приватный ключ целиком
   - `VPS_PATH` — (необязательно) `/var/www/aquauzel`
3. В `.github/workflows/deploy-vps.yml` раскомментируйте блок `push:` —
   теперь при каждом изменении `aquauzel-site/` сайт выкладывается на VPS.
   (Пока секретов нет, workflow можно запускать только вручную и он не падает.)

---

## Проверка после переноса
- `https://aquauzel.kz` открывается, замок (SSL) валиден.
- Прайс грузится (это Supabase — работает с любого хоста).
- Вход в админку `https://aquauzel.kz/admin.html` по паролю работает.
- `https://aquauzel.kz/robots.txt` и `https://aquauzel.kz/sitemap.xml` отдаются.

## Если нужны www→без-www и т.п.
В конфиге nginx есть комментарии. Скажите — настрою редиректы под ваш вкус.
