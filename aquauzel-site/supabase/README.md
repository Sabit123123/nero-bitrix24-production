# Админка AquaUzel на Supabase — настройка (один раз)

Сайт статический (GitHub Pages). Чтобы админка была безопасной (серверная
проверка пароля, хранение товаров и фото, защита записи), данные вынесены в
**Supabase** (бесплатный тариф). Публичная часть остаётся на GitHub Pages и
читает товары из Supabase. Пока Supabase не настроен — сайт работает на старом
статическом прайсе (ничего не ломается).

## Шаг 1. Создать проект Supabase
1. Зарегистрируйтесь на https://supabase.com → **New project** (регион ближе к KZ, напр. Frankfurt/Singapore).
2. Задайте надёжный пароль базы (он только для БД, не для админки сайта).

## Шаг 2. Создать таблицу, политики и хранилище
Supabase → **SQL Editor** → New query → вставьте и выполните файл
[`schema.sql`](./schema.sql). Он создаёт таблицу `products`, включает защиту
(RLS: публичное чтение, запись только авторизованным) и bucket `product-images`.

## Шаг 3. Перенести текущие 572 товара (миграция)
SQL Editor → выполните [`seed-products.sql`](./seed-products.sql)
(сгенерирован из текущего прайса; цены, категории и характеристики сохранены).
Файл пересоздаётся командой: `python3 build/migrate_to_products.py`.

## Шаг 4. Создать администратора
Supabase → **Authentication**:
- **Providers → Email**: включить.
- **Sign In / Providers → Allow new users to sign up**: ВЫКЛючить (чтобы регистрироваться могли только вы).
- **Users → Add user → Create new user**: введите email и пароль — это и есть логин/пароль для входа в `/admin.html`. Пароль нигде в коде не хранится, его проверяет Supabase.

Сменить пароль администратора позже: там же, Authentication → Users → … → Reset/Update.

## Шаг 5. Подключить сайт к проекту
Supabase → **Project Settings → API**, скопируйте:
- **Project URL**
- **anon public** ключ (он публичный — безопасно держать в коде; доступ ограничен политиками RLS).

Впишите их в `assets/js/supabase-config.js`:
```js
window.AQUA_SUPABASE = {
  url: "https://ВАШ-ПРОЕКТ.supabase.co",
  anonKey: "eyJ...ваш anon ключ...",
  bucket: "product-images"
};
```
Закоммитьте и запушьте — GitHub Pages пересоберёт сайт, и публичная часть
начнёт показывать товары из Supabase, а `/admin.html` пустит по логину.

> anon-ключ публичный по дизайну. Реальный пароль администратора в репозиторий
> не попадает (он в Supabase Auth). См. `.env.example`.
