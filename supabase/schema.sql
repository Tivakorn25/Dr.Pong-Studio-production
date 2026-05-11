-- Dr.Pong Studio — full schema + realtime helpers.
-- Run in Supabase SQL Editor after `rooms.sql` (or run this file alone; it is idempotent where possible).
--
-- After applying: Dashboard → Database → Replication → enable Realtime for each table
-- (or use publication statements at bottom).

-- ---------------------------------------------------------------------------
-- Shared trigger helper (may already exist from rooms.sql)
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Rooms: add description for studio UI (status already exists)
-- ---------------------------------------------------------------------------
alter table public.rooms
  add column if not exists description text not null default 'สตูผลิตสื่อคุณภาพ';

-- ---------------------------------------------------------------------------
-- Warehouse equipment
-- ---------------------------------------------------------------------------
create table if not exists public.equipment (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  total_quantity int not null default 1 check (total_quantity >= 0),
  available_quantity int not null default 1 check (available_quantity >= 0),
  updated_at timestamptz not null default now()
);

create index if not exists equipment_name_idx on public.equipment (lower(name));
create index if not exists equipment_updated_at_idx on public.equipment (updated_at desc);

drop trigger if exists set_equipment_updated_at on public.equipment;
create trigger set_equipment_updated_at
before update on public.equipment
for each row
execute function public.set_updated_at();

alter table public.equipment replica identity full;

-- ---------------------------------------------------------------------------
-- Room sections (checklist groups inside a room)
-- ---------------------------------------------------------------------------
create table if not exists public.room_sections (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms (id) on delete cascade,
  title text not null,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists room_sections_room_id_idx on public.room_sections (room_id);
create index if not exists room_sections_sort_idx on public.room_sections (room_id, sort_order);

drop trigger if exists set_room_sections_updated_at on public.room_sections;
create trigger set_room_sections_updated_at
before update on public.room_sections
for each row
execute function public.set_updated_at();

alter table public.room_sections replica identity full;

-- ---------------------------------------------------------------------------
-- Checklist items inside a section (equipment-in-room)
-- ---------------------------------------------------------------------------
create table if not exists public.section_checklist_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.room_sections (id) on delete cascade,
  equipment_id uuid references public.equipment (id) on delete set null,
  name text not null,
  quantity int not null default 1 check (quantity > 0),
  status text not null default 'good' check (status in ('good', 'damaged', 'missing')),
  note text,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists section_checklist_items_section_id_idx on public.section_checklist_items (section_id);

drop trigger if exists set_section_checklist_items_updated_at on public.section_checklist_items;
create trigger set_section_checklist_items_updated_at
before update on public.section_checklist_items
for each row
execute function public.set_updated_at();

alter table public.section_checklist_items replica identity full;

-- ---------------------------------------------------------------------------
-- Equipment checkout / requests
-- ---------------------------------------------------------------------------
create table if not exists public.equipment_requests (
  id uuid primary key default gen_random_uuid(),
  equipment_id uuid references public.equipment (id) on delete set null,
  equipment_name text not null,
  category text not null,
  quantity int not null default 1 check (quantity > 0),
  requested_by text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'ready', 'returned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists equipment_requests_created_at_idx on public.equipment_requests (created_at desc);

drop trigger if exists set_equipment_requests_updated_at on public.equipment_requests;
create trigger set_equipment_requests_updated_at
before update on public.equipment_requests
for each row
execute function public.set_updated_at();

alter table public.equipment_requests replica identity full;

-- ---------------------------------------------------------------------------
-- Realtime publication (ignore errors if already member)
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.equipment;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.room_sections;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.section_checklist_items;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.equipment_requests;
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.rooms;
exception
  when duplicate_object then null;
end $$;
