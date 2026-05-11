-- Rooms table for the realtime dashboard.
-- Run this in Supabase SQL Editor, then enable Realtime for "public.rooms".
-- For equipment, room sections, checklist items, and requests, run `schema.sql` too.

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'available' check (status in ('available', 'in_use', 'maintenance')),
  updated_at timestamptz not null default now()
);

create index if not exists rooms_updated_at_idx on public.rooms (updated_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
before update on public.rooms
for each row
execute function public.set_updated_at();

-- Optional but recommended for realtime UPDATE payloads:
alter table public.rooms replica identity full;

