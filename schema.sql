-- Rooming House Index — Supabase schema
-- Run in the Supabase SQL editor, or via `supabase db push`.

-- ─────────────────────────────────────────────────────────────
-- users
-- Supabase already provides `auth.users` for authentication.
-- This table stores app-specific profile data, keyed to auth.users.id.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Auto-create a public.users row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────────────────────
-- suburbs
-- Core suburb-level rooming house market data.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.suburbs (
  id uuid primary key default gen_random_uuid(),
  suburb_name text not null,
  postcode text not null,
  state text not null default 'VIC',
  council text not null,
  demand_level text not null check (demand_level in ('High', 'Medium', 'Low')),
  avg_room_rate numeric(7, 2) not null,
  num_rooming_houses integer not null default 0,
  commentary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (suburb_name, postcode)
);

alter table public.suburbs enable row level security;

create policy "Authenticated users can read suburbs"
  on public.suburbs for select
  to authenticated
  using (true);

-- ─────────────────────────────────────────────────────────────
-- saved_suburbs
-- Join table between a user and the suburbs they've bookmarked.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.saved_suburbs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  suburb_id uuid not null references public.suburbs (id) on delete cascade,
  created_at timestamptz not null default now(),

  unique (user_id, suburb_id)
);

alter table public.saved_suburbs enable row level security;

create policy "Users can view their own saved suburbs"
  on public.saved_suburbs for select
  using (auth.uid() = user_id);

create policy "Users can save suburbs"
  on public.saved_suburbs for insert
  with check (auth.uid() = user_id);

create policy "Users can remove their own saved suburbs"
  on public.saved_suburbs for delete
  using (auth.uid() = user_id);

create index if not exists saved_suburbs_user_id_idx on public.saved_suburbs (user_id);
create index if not exists suburbs_demand_level_idx on public.suburbs (demand_level);
create index if not exists suburbs_postcode_idx on public.suburbs (postcode);
