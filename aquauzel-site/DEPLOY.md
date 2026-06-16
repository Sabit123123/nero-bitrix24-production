# Публикация AquaUzel и привязка домена aquauzel.kz

Сайт публикуется на GitHub Pages из папки `aquauzel-site/` (workflow
`.github/workflows/deploy-pages.yml`). Файл `aquauzel-site/CNAME`
уже содержит `aquauzel.kz`, поэтому после настройки DNS сайт откроется
по адресу **https://aquauzel.kz**.

## 1. Включить GitHub Pages
Settings → Pages → Build and deployment → **Source: GitHub Actions**.
Затем влейте PR в `main` (или запустите workflow «Deploy AquaUzel site to
GitHub Pages» вручную через Run workflow). После сборки появится адрес.

## 2. Настроить DNS у регистратора домена aquauzel.kz
Добавьте записи (значения — официальные IP GitHub Pages):

**Apex-домен `aquauzel.kz` — A-записи:**
```
A   @   185.199.108.153
A   @   185.199.109.153
A   @   185.199.110.153
A   @   185.199.111.153
```
(желательно также AAAA для IPv6)
```
AAAA @  2606:50c0:8000::153
AAAA @  2606:50c0:8001::153
AAAA @  2606:50c0:8002::153
AAAA @  2606:50c0:8003::153
```

**www-поддомен — CNAME:**
```
CNAME  www   sabit123123.github.io.
```

## 3. Указать домен в GitHub
Settings → Pages → Custom domain → введите `aquauzel.kz` → Save.
Дождитесь проверки DNS и включите **Enforce HTTPS**.

DNS обычно обновляется от 15 минут до нескольких часов. После этого
QR-код (`assets/img/qr.png`) и ссылки на сайте уже ведут на `https://aquauzel.kz`.

## Прайс в PDF
Файл прайса лежит в `aquauzel-site/assets/files/AquaUzel-price.pdf`.
Кнопка «Скачать прайс (PDF)» в блоке прайс-листа ссылается на него.
Чтобы обновить — замените этот файл (имя оставьте прежним).

## Карта
Блок «Как нас найти» показывает встроенную карту (Google Maps, без ключа)
по адресу **г. Алматы, ул. Амангельды, 70** и кнопки «2ГИС / Яндекс / Google».
Если нужна именно встроенная карта 2ГИС — пришлите ссылку на карточку
организации в 2ГИС, и я заменю виджет.
