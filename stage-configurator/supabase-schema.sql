-- New Direction Stage Configurator — Supabase Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor

-- ============================================================
-- PROJECTS TABLE
-- ============================================================
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  client      text default '',
  venue       text default '',
  notes       text default '',
  date        text not null,
  room_w      float8 not null default 12,
  room_d      float8 not null default 8,
  wall_h      float8 not null default 4.2,
  objects     jsonb not null default '[]'::jsonb,
  thumbnail   text default null,
  user_id     uuid references auth.users(id) on delete cascade default null,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Index for fast lookup by user
create index if not exists projects_user_id_idx on public.projects(user_id);
create index if not exists projects_name_idx    on public.projects(name);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_updated_at on public.projects;
create trigger projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.projects enable row level security;

-- Allow anonymous access (no login required for MVP)
-- Projects without user_id are public/shared
create policy "anon can read all projects"
  on public.projects for select
  using (true);

create policy "anon can insert projects"
  on public.projects for insert
  with check (true);

create policy "anon can update own projects"
  on public.projects for update
  using (true);

create policy "anon can delete own projects"
  on public.projects for delete
  using (true);

-- ============================================================
-- EQUIPMENT TABLE (for admin panel future use)
-- ============================================================
create table if not exists public.equipment (
  id          text primary key,
  cat         text not null,
  name        text not null,
  emoji       text default '📦',
  width_m     float8 not null,
  depth_m     float8 not null,
  height_m    float8 not null,
  weight_kg   float8 not null default 0,
  brand       text default '',
  model_url   text default null,  -- URL to GLB file in storage
  preview_url text default null,  -- URL to preview image
  active      boolean default true,
  created_at  timestamptz default now()
);

alter table public.equipment enable row level security;

create policy "anyone can read equipment"
  on public.equipment for select
  using (active = true);

-- Admin panel (anon key) needs to upsert / soft-delete custom models
create policy "anon can insert equipment"
  on public.equipment for insert
  with check (true);

create policy "anon can update equipment"
  on public.equipment for update
  using (true);

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
-- Public 'models' bucket — stores converted .glb files
insert into storage.buckets (id, name, public)
values ('models', 'models', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('renders', 'renders', true)
on conflict (id) do nothing;

-- Storage policies for models bucket
create policy "public read models"
  on storage.objects for select
  using (bucket_id = 'models');

create policy "service role upload models"
  on storage.objects for insert
  with check (bucket_id = 'models');

-- ============================================================
-- SAMPLE DATA (optional)
-- ============================================================
-- insert into public.projects (name, client, venue, date, room_w, room_d, wall_h, objects)
-- values ('Тест', 'Клиент', 'Площадка', '2026-06-23', 12, 8, 4.2, '[]');
