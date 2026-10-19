-- ===========================================================================
-- Ardmst — 01_schema.sql
-- Tables, indexes, updated_at trigger and Row Level Security for the
-- portfolio CMS. Mirrors PRD chapter 4.
--
-- Run with:  supabase db push
--        or: paste into the Supabase SQL editor.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  slug varchar(255) unique not null,
  category varchar(50) not null check (category in ('game', 'web_app', 'design')),
  summary text not null,
  description_markdown text not null,
  tech_stack text[] not null default '{}',
  thumbnail_url text not null,
  gallery_urls text[] default '{}',
  demo_url text,
  github_url text,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_category_idx on public.projects (category);
create index if not exists projects_featured_idx on public.projects (featured) where featured;
create index if not exists projects_created_at_idx on public.projects (created_at desc);

-- ---------------------------------------------------------------------------
-- skills
-- ---------------------------------------------------------------------------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  category varchar(50) not null check (category in ('programming', 'game_dev', 'design')),
  proficiency int not null check (proficiency between 1 and 100),
  icon_name varchar(50),
  display_order int not null default 0
);

create index if not exists skills_category_idx on public.skills (category, display_order);

-- ---------------------------------------------------------------------------
-- messages
-- ---------------------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_name varchar(100) not null,
  sender_email varchar(150) not null,
  subject varchar(200),
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists messages_unread_idx on public.messages (is_read, created_at desc);

-- ---------------------------------------------------------------------------
-- site_settings
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  key varchar(100) primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- updated_at maintenance
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists projects_touch_updated_at on public.projects;
create trigger projects_touch_updated_at
  before update on public.projects
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
--
-- Public (anon) visitors may read the published portfolio content and write
-- contact messages. Everything else is authenticated-only; the CMS server
-- routes use the service-role key, which bypasses RLS entirely.
-- ---------------------------------------------------------------------------
alter table public.projects enable row level security;
alter table public.skills   enable row level security;
alter table public.messages enable row level security;
alter table public.site_settings enable row level security;

-- projects: world-readable, authenticated-only writes
drop policy if exists "projects are publicly readable" on public.projects;
create policy "projects are publicly readable"
  on public.projects for select
  using (true);

drop policy if exists "projects are writable by authenticated" on public.projects;
create policy "projects are writable by authenticated"
  on public.projects for all
  to authenticated
  using (true)
  with check (true);

-- skills: world-readable, authenticated-only writes
drop policy if exists "skills are publicly readable" on public.skills;
create policy "skills are publicly readable"
  on public.skills for select
  using (true);

drop policy if exists "skills are writable by authenticated" on public.skills;
create policy "skills are writable by authenticated"
  on public.skills for all
  to authenticated
  using (true)
  with check (true);

-- site_settings: world-readable, authenticated-only writes
drop policy if exists "site_settings are publicly readable" on public.site_settings;
create policy "site_settings are publicly readable"
  on public.site_settings for select
  using (true);

drop policy if exists "site_settings are writable by authenticated" on public.site_settings;
create policy "site_settings are writable by authenticated"
  on public.site_settings for all
  to authenticated
  using (true)
  with check (true);

-- messages: anyone may submit, only authenticated admins may read or modify
drop policy if exists "messages are insertable by anyone" on public.messages;
create policy "messages are insertable by anyone"
  on public.messages for insert
  to anon, authenticated
  with check (true);

drop policy if exists "messages are readable by authenticated" on public.messages;
create policy "messages are readable by authenticated"
  on public.messages for select
  to authenticated
  using (true);

drop policy if exists "messages are modifiable by authenticated" on public.messages;
create policy "messages are modifiable by authenticated"
  on public.messages for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "messages are deletable by authenticated" on public.messages;
create policy "messages are deletable by authenticated"
  on public.messages for delete
  to authenticated
  using (true);
