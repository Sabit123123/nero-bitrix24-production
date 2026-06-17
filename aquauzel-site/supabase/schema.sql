-- ===================================================================
-- AquaUzel — схема Supabase для каталога товаров.
-- Запустите этот скрипт в Supabase → SQL Editor (один раз).
-- Безопасность: публичное ЧТЕНИЕ разрешено, ЗАПИСЬ — только авторизованным
-- (администратор входит через Supabase Auth).
-- ===================================================================

-- 1. Таблица товаров ------------------------------------------------
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  pack_quantity  text,
  price          numeric,
  characteristics text,
  category       text not null default 'Без категории',
  in_stock       boolean not null default true,
  image          text,
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category);
create index if not exists products_sort_idx     on public.products (sort_order);

-- 2. RLS: чтение всем, запись только авторизованным -----------------
alter table public.products enable row level security;

drop policy if exists "products public read"   on public.products;
drop policy if exists "products auth insert"    on public.products;
drop policy if exists "products auth update"    on public.products;
drop policy if exists "products auth delete"    on public.products;

create policy "products public read" on public.products
  for select to anon, authenticated using (true);

create policy "products auth insert" on public.products
  for insert to authenticated with check (true);

create policy "products auth update" on public.products
  for update to authenticated using (true) with check (true);

create policy "products auth delete" on public.products
  for delete to authenticated using (true);

-- 3. Хранилище фото: bucket product-images -------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 8388608,
        array['image/jpeg','image/png','image/webp','image/gif','image/heic','image/heif'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Политики Storage: публичное чтение, загрузка/удаление только авторизованным
drop policy if exists "product images public read"  on storage.objects;
drop policy if exists "product images auth write"    on storage.objects;
drop policy if exists "product images auth update"   on storage.objects;
drop policy if exists "product images auth delete"   on storage.objects;

create policy "product images public read" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');

create policy "product images auth write" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

create policy "product images auth update" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');

create policy "product images auth delete" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');

-- 4. ВАЖНО (вручную в дашборде):
--    Authentication → Providers → Email: ВКЛючить.
--    Authentication → Sign Up: ОТКЛючить публичную регистрацию,
--      чтобы создать аккаунт мог только владелец проекта.
--    Authentication → Users → Add user: создайте администратора
--      (email + пароль). Этими данными вы входите в /admin.html.
