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
  phone text,
  avatar_url text,
  -- Tracks progress through the post-signup onboarding wizard: basics -> intent ->
  -- investor_details (only when signup_intent='investor') -> photo. Deliberately light
  -- — the rental application (tenant_profiles, filled in from /account/application) is
  -- never a signup requirement, only ever something a room-seeker fills in later.
  onboarding_step text not null default 'basics'
    check (onboarding_step in ('basics', 'intent', 'investor_details', 'photo', 'complete')),
  -- Self-reported at signup ("what brings you here?") — purely a data/segmentation
  -- signal, not an access gate (investor_access above still controls /dashboard).
  -- Feeds the investor_details onboarding questions and, later, per-audience landing pages.
  signup_intent text check (signup_intent in ('investor', 'tenant')),
  -- 'member': the one account type everyone signs up as — browses/enquires on room listings,
  --           and can optionally unlock investor dashboard access (see investor_access below).
  -- 'provider': runs one or more service_providers listings (insurance, legal, etc.) and chats with members.
  -- 'admin': platform owner — can see every conversation across every provider, for payment/compliance oversight.
  role text not null default 'member' check (role in ('member', 'provider', 'admin')),
  -- Gates /dashboard (suburb/market data, saved suburbs, provider messaging). A 'member' with
  -- investor_access='active' gets the same login into both the listings side and the investor
  -- side — no separate account needed. 'none' until they pay the $29/mo add-on.
  investor_access text not null default 'none' check (investor_access in ('none', 'active')),
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "Users can view their own profile"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

-- Auto-create a public.users row whenever a new auth user signs up. Every signup starts
-- as a plain 'member' — becoming a provider (provider-join-form.tsx) or unlocking investor
-- access (the $29/mo upsell) both happen as later updates to an existing account, not at signup.
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
-- investor_profiles
-- Lead-quality data collected during onboarding when signup_intent='investor' —
-- do they already run a rooming house, and its average room price. Required
-- (free text, not a bucketed range) when has_rooming_house is true — no skipping
-- this step. One row per account, filled in once at signup for now.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.investor_profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  has_rooming_house boolean,
  average_room_price text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.investor_profiles enable row level security;

create policy "Investors can view and manage their own investor profile"
  on public.investor_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can view every investor profile"
  on public.investor_profiles for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

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

-- ─────────────────────────────────────────────────────────────
-- service_providers
-- One generic table for every provider marketplace category (insurance,
-- conveyancing/legal, inspectors, maintenance, and — later — building,
-- property management, furnishing). `category` is what filters the
-- directory; `credentials` holds the compliance fields that differ per
-- category (AFSL number + insurers represented for insurance, practising
-- certificate number for legal, trade licence for maintenance, etc.) so
-- the schema doesn't need to change every time a new category goes live.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.service_providers (
  id uuid primary key default gen_random_uuid(),
  -- Nullable: seeded/unclaimed directory listings (see migrate-seed-providers.sql)
  -- have no owning account yet — a real provider can claim one later.
  user_id uuid references public.users (id) on delete cascade,
  -- Stable, human-readable identifier for the /dashboard/services/<category>/<slug>
  -- URLs and for seeding, independent of the internal uuid.
  slug text unique,
  category text not null check (category in (
    'insurance', 'conveyancing_legal', 'inspectors', 'maintenance',
    'building', 'property_management', 'furnishing', 'finance'
  )),
  business_name text not null,
  description text,
  logo_url text,
  contact_email text not null,
  contact_phone text,
  coverage_areas text[] not null default '{}',
  license_number text,
  -- Category-specific compliance fields, e.g.
  -- insurance: {"afsl_number": "...", "insurers_represented": ["...", "..."]}
  -- conveyancing_legal: {"practising_certificate_number": "..."}
  credentials jsonb not null default '{}',
  -- New listings start 'pending' so you can review before they appear in the
  -- public directory — approve/reject from an admin view (not built yet).
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_providers enable row level security;

create policy "Anyone can view approved providers"
  on public.service_providers for select
  to authenticated
  using (status = 'approved');

create policy "Providers can view and manage their own listing"
  on public.service_providers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can view every provider listing"
  on public.service_providers for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create index if not exists service_providers_category_idx on public.service_providers (category);
create index if not exists service_providers_user_id_idx on public.service_providers (user_id);

-- ─────────────────────────────────────────────────────────────
-- conversations
-- One thread per member/provider pair, across any category. `investor_id` is really
-- just "the member who started the conversation" — kept named investor_id since that's
-- the only side of the marketplace that messages providers today (needs investor_access).
-- ─────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid not null references public.users (id) on delete cascade,
  provider_id uuid not null references public.service_providers (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),

  unique (investor_id, provider_id)
);

alter table public.conversations enable row level security;

create policy "Participants can view their conversations"
  on public.conversations for select
  using (
    auth.uid() = investor_id
    or auth.uid() in (
      select user_id from public.service_providers where id = provider_id
    )
  );

create policy "Investors can start a conversation"
  on public.conversations for insert
  with check (auth.uid() = investor_id);

create policy "Admins can view every conversation"
  on public.conversations for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- ─────────────────────────────────────────────────────────────
-- tenant_profiles
-- The "easy application" data a landlord actually wants to see before approving an
-- enquiry — filled in from /account/application whenever someone actually wants to
-- apply for a room, not a signup requirement. One row per account.
-- Placed after conversations/service_providers since its RLS policies reference both.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.tenant_profiles (
  user_id uuid primary key references public.users (id) on delete cascade,
  employment_status text check (
    employment_status in ('Full-time', 'Part-time', 'Casual', 'Student', 'Self-employed', 'Other')
  ),
  occupation text,
  weekly_income_range text, -- e.g. "$800-1000" — a range, not an exact figure, by design
  num_occupants integer not null default 1,
  has_pets boolean not null default false,
  pet_details text,
  is_smoker boolean not null default false,
  preferred_move_in_date date,
  reference_name text,
  reference_phone text,
  additional_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tenant_profiles enable row level security;

create policy "Tenants can view and manage their own application profile"
  on public.tenant_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Providers/investors need to read a tenant's application details once that tenant has
-- messaged them — mirrors the conversations visibility rule in the messaging section below.
create policy "Conversation partners can view a tenant's application profile"
  on public.tenant_profiles for select
  using (
    exists (
      select 1 from public.conversations c
      where c.investor_id = tenant_profiles.user_id
        and (
          auth.uid() = c.investor_id
          or auth.uid() in (select user_id from public.service_providers where id = c.provider_id)
        )
    )
  );

create policy "Admins can view every tenant application profile"
  on public.tenant_profiles for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

-- ─────────────────────────────────────────────────────────────
-- messages
-- Individual chat messages within a conversation. Kept for as long as the
-- conversation exists — this table IS the compliance record, so nothing
-- should ever hard-delete from it outside of a defined retention policy.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

create policy "Participants can view messages in their conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (
          c.investor_id = auth.uid()
          or auth.uid() in (
            select user_id from public.service_providers where id = c.provider_id
          )
        )
    )
  );

create policy "Participants can send messages in their conversations"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (
          c.investor_id = auth.uid()
          or auth.uid() in (
            select user_id from public.service_providers where id = c.provider_id
          )
        )
    )
  );

create policy "Admins can view every message"
  on public.messages for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create index if not exists messages_conversation_id_idx on public.messages (conversation_id);
create index if not exists conversations_investor_id_idx on public.conversations (investor_id);
create index if not exists conversations_provider_id_idx on public.conversations (provider_id);

-- Keep conversations.last_message_at current so inbox views can sort by recency.
create or replace function public.handle_new_message()
returns trigger as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_message_inserted
  after insert on public.messages
  for each row execute procedure public.handle_new_message();

-- Enable Realtime so chat UIs can subscribe to new messages as they arrive.
alter publication supabase_realtime add table public.messages;

-- ─────────────────────────────────────────────────────────────
-- listing_conversations / listing_messages
-- Messaging for room enquiries — deliberately separate from conversations/messages
-- above, which is the investor <-> service_provider marketplace. A tenant enquiring
-- on a listing is talking to "the property team" about that specific room (confirming
-- an inspection, asking questions), not a service provider, so it gets its own table
-- rather than overloading the marketplace schema.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.listing_conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,
  tenant_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),

  unique (listing_id, tenant_id)
);

alter table public.listing_conversations enable row level security;

create policy "Tenants can view their own listing conversations"
  on public.listing_conversations for select
  using (auth.uid() = tenant_id);

create policy "Admins can view every listing conversation"
  on public.listing_conversations for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create table if not exists public.listing_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.listing_conversations (id) on delete cascade,
  -- null + is_manager=true is the auto-attributed "Property Team" reply, sent only via
  -- the enquire_on_listing() function below — no live manager-reply UI exists yet.
  sender_id uuid references public.users (id) on delete set null,
  is_manager boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.listing_messages enable row level security;

create policy "Tenants can view messages in their own listing conversations"
  on public.listing_messages for select
  using (exists (
    select 1 from public.listing_conversations c
    where c.id = conversation_id and c.tenant_id = auth.uid()
  ));

create policy "Tenants can send messages in their own listing conversations"
  on public.listing_messages for insert
  with check (
    auth.uid() = sender_id
    and is_manager = false
    and exists (
      select 1 from public.listing_conversations c
      where c.id = conversation_id and c.tenant_id = auth.uid()
    )
  );

create policy "Admins can view every listing message"
  on public.listing_messages for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create index if not exists listing_messages_conversation_id_idx on public.listing_messages (conversation_id);
create index if not exists listing_conversations_tenant_id_idx on public.listing_conversations (tenant_id);

create or replace function public.handle_new_listing_message()
returns trigger as $$
begin
  update public.listing_conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_listing_message_inserted
  after insert on public.listing_messages
  for each row execute procedure public.handle_new_listing_message();

alter publication supabase_realtime add table public.listing_messages;

-- Creates (or reuses) a tenant's conversation for a listing and seeds the opening
-- "Property Team" message. security definer so it can insert the manager-attributed
-- row (sender_id null, is_manager true) despite the insert policy above only ever
-- allowing a tenant to insert their own messages — this function is the one
-- controlled exception, not a general bypass.
create or replace function public.enquire_on_listing(
  p_listing_id text,
  p_listing_title text,
  p_inspection_time text default null,
  p_message text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_conversation_id uuid;
  v_is_new boolean := false;
begin
  select id into v_conversation_id
  from public.listing_conversations
  where listing_id = p_listing_id and tenant_id = auth.uid();

  if v_conversation_id is null then
    insert into public.listing_conversations (listing_id, tenant_id)
    values (p_listing_id, auth.uid())
    returning id into v_conversation_id;
    v_is_new := true;
  end if;

  -- The tenant's own message (what they actually typed) comes first, like sending a
  -- Marketplace enquiry — the property team's confirmation is an auto-reply after it,
  -- not the opening message. Only sent on a brand-new conversation; re-enquiring on an
  -- already-open thread just adds the tenant's message without another auto-reply.
  if p_message is not null and length(trim(p_message)) > 0 then
    insert into public.listing_messages (conversation_id, sender_id, is_manager, body)
    values (v_conversation_id, auth.uid(), false, trim(p_message));
  end if;

  if v_is_new then
    insert into public.listing_messages (conversation_id, sender_id, is_manager, body)
    values (
      v_conversation_id,
      null,
      true,
      case
        when p_inspection_time is not null then
          'Thanks for your interest in ' || p_listing_title || '. We''ll see you at the inspection: '
            || p_inspection_time || '. Reply here if you have any questions or need to reschedule.'
        else
          'Thanks for your interest in ' || p_listing_title
            || '. Reply here with any questions — we''ll be in touch about next steps.'
      end
    );
  end if;

  return v_conversation_id;
end;
$$;

grant execute on function public.enquire_on_listing(text, text, text, text) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- Storage: profile-photos
-- Public bucket for onboarding profile pictures (users.avatar_url points here).
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', true)
on conflict (id) do nothing;

create policy "Anyone can view profile photos"
  on storage.objects for select
  using (bucket_id = 'profile-photos');

create policy "Users can upload their own profile photo"
  on storage.objects for insert
  with check (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own profile photo"
  on storage.objects for update
  using (bucket_id = 'profile-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- ─────────────────────────────────────────────────────────────
-- service_quote_requests / service_quote_quotes
-- Shared table for every "run in-house" service category (Property
-- Management, Insurance, ...) rather than a self-serve provider directory: an
-- investor submits their details once, tagged with `category`, and Rooming
-- House Index sources multiple quotes and enters them back in — a
-- comparison-site model instead of a marketplace listing. No provider-facing
-- UI for quotes yet, so they're added directly (e.g. via the Supabase table
-- editor) once actually sourced.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.service_quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  category text not null check (category in ('property_management', 'insurance')),
  property_address text not null,
  number_of_rooms integer,
  current_arrangement text,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'quoted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.service_quote_requests enable row level security;

create policy "Investors can view and manage their own quote requests"
  on public.service_quote_requests for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can view every quote request"
  on public.service_quote_requests for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create index if not exists service_quote_requests_user_id_idx
  on public.service_quote_requests (user_id);

create table if not exists public.service_quote_quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_quote_requests (id) on delete cascade,
  provider_name text not null,
  monthly_fee_pct numeric,
  flat_fee text,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.service_quote_quotes enable row level security;

create policy "Investors can view quotes for their own requests"
  on public.service_quote_quotes for select
  using (
    exists (
      select 1 from public.service_quote_requests r
      where r.id = service_quote_quotes.request_id and r.user_id = auth.uid()
    )
  );

create policy "Admins can manage every quote"
  on public.service_quote_quotes for all
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ))
  with check (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create index if not exists service_quote_quotes_request_id_idx
  on public.service_quote_quotes (request_id);

-- Hard floor on quote requests, independent of any client-side check: blocks
-- a new request in a category while one is still pending there — guards
-- against double-click duplicates and spamming providers, while letting an
-- account request again as soon as quotes actually come back (no arbitrary
-- timer to wait out).
create or replace function public.enforce_quote_request_rate_limit()
returns trigger
language plpgsql
security definer
as $$
begin
  if exists (
    select 1 from public.service_quote_requests
    where user_id = new.user_id
      and category = new.category
      and status = 'pending'
  ) then
    raise exception 'You already have a quote request in progress for this category.' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger trg_enforce_quote_request_rate_limit
  before insert on public.service_quote_requests
  for each row execute procedure public.enforce_quote_request_rate_limit();

-- ═════════════════════════════════════════════════════════════
-- Partner Portal: property managers & real room listings
-- Adds a 'property_manager' account type (rooms they list, replacing what
-- used to be mock-only data) alongside the existing 'provider' type — both
-- get a single shared /partners portal, gated by role.
-- ═════════════════════════════════════════════════════════════

alter table public.users drop constraint if exists users_role_check;
alter table public.users add constraint users_role_check
  check (role in ('member', 'provider', 'admin', 'property_manager'));

-- ─────────────────────────────────────────────────────────────
-- listings
-- Real room listings, replacing lib/mock-listings.ts. suburb_id/suburb_name
-- stay loose text (no suburbs table to FK to, same as elsewhere in this
-- schema). available_from stays free text ("Available now", "Available 1
-- Aug") to match how property managers actually describe it, not a real date.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  -- Nullable: the seeded sample listings below have no owning account.
  owner_id uuid references public.users (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  suburb_id text not null,
  suburb_name text not null,
  address text not null,
  address_verified boolean not null default false,
  room_type text not null check (room_type in ('Single', 'Shared')),
  weekly_rate integer not null,
  available_from text not null,
  description text not null,
  photos text[] not null default '{}',
  inspection_time text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.listings enable row level security;

create policy "Anyone can view approved listings"
  on public.listings for select
  using (status = 'approved');

create policy "Owners can view and manage their own listings"
  on public.listings for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Admins can view and manage all listings"
  on public.listings for all
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ))
  with check (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create index if not exists listings_owner_id_idx on public.listings (owner_id);
create index if not exists listings_status_idx on public.listings (status);

-- ─────────────────────────────────────────────────────────────
-- Storage: listing-photos
-- Public bucket for property-manager-uploaded room photos, same folder-per-
-- owner convention as the existing profile-photos bucket.
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('listing-photos', 'listing-photos', true)
on conflict (id) do nothing;

create policy "Anyone can view listing photos"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

create policy "Owners can upload their own listing photos"
  on storage.objects for insert
  with check (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners can update their own listing photos"
  on storage.objects for update
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Owners can delete their own listing photos"
  on storage.objects for delete
  using (bucket_id = 'listing-photos' and (storage.foldername(name))[1] = auth.uid()::text);

-- One-time seed of the 14 sample listings previously hardcoded in
-- lib/mock-listings.ts, so /listings doesn't go blank the moment it switches
-- from mock data to this table. Unowned (owner_id null), pre-approved.
-- Photos keep pointing at their existing /public/listings/... paths.
insert into public.listings
  (status, suburb_id, suburb_name, address, address_verified, room_type, weekly_rate, available_from, description, photos, inspection_time)
values
  ('approved', 'st-albans-3021', 'St Albans', '15 Grace Street, St Albans', true, 'Single', 380, 'Available now',
   'Immaculately presented studio room in a near-new, purpose-built rooming house — a rare standard for the area. This light-filled room is fully self-contained with its own kitchenette, reverse-cycle split-system air conditioning, built-in mirrored robe, and a private study nook, all finished with quality laminate flooring throughout. Residents also enjoy a large shared kitchen and dining space, perfect for entertaining or unwinding after work. Positioned in a quiet, well-maintained street close to St Albans station, Chinatown''s shops and eateries, and local bus routes. Presented in outstanding condition and available now — inspections highly recommended, this one won''t last.',
   array['/listings/st-albans-example/room.jpg', '/listings/st-albans-example/kitchen.jpg'], 'Saturday 25 Jul, 10:00am - 10:30am'),
  ('approved', 'footscray-3011', 'Footscray', '8 Nicholson Street, Footscray', false, 'Single', 350, 'Available now',
   'Furnished single room, close to Footscray station and Vic Uni campus. Bills included.',
   array['/listings/dandenong-example/bedroom-1.jpg', '/listings/dandenong-example/kitchenette-1.jpg'], 'Saturday 25 Jul, 11:00am - 11:30am'),
  ('approved', 'footscray-3011', 'Footscray', '142 Barkly Street, Footscray', false, 'Shared', 350, 'Available 1 Aug',
   'Shared twin room in a quiet 6-room house. Walking distance to Barkly Street shops.',
   array['/listings/dandenong-example/bedroom-2.jpg', '/listings/dandenong-example/kitchenette-2.jpg'], null),
  ('approved', 'werribee-3030', 'Werribee', '21 Watton Street, Werribee', false, 'Single', 350, 'Available now',
   'Bright single room near Werribee Plaza. Off-street parking available.',
   array['/listings/dandenong-example/bedroom-3.jpg', '/listings/dandenong-example/kitchen-dining.jpg'], null),
  ('approved', 'werribee-3030', 'Werribee', '5 Comben Drive, Werribee', false, 'Single', 350, 'Available 15 Aug',
   'Recently renovated room, walking distance to Werribee station.',
   array['/listings/dandenong-example/bedroom-4.jpg', '/listings/dandenong-example/common-dining-laundry.jpg'], null),
  ('approved', 'clayton-3168', 'Clayton', '33 Carinish Road, Clayton', false, 'Single', 350, 'Available now',
   'Student-friendly single room, 5 minutes'' walk to Monash University Clayton campus.',
   array['/listings/dandenong-example/bedroom-1.jpg', '/listings/dandenong-example/kitchen-dining.jpg'], 'Saturday 25 Jul, 1:00pm - 1:30pm'),
  ('approved', 'clayton-3168', 'Clayton', '97 Clayton Road, Clayton', false, 'Shared', 350, 'Available now',
   'Shared room in a well-maintained 8-room house, all bills and NBN included.',
   array['/listings/dandenong-example/bedroom-2.jpg', '/listings/dandenong-example/common-dining-laundry.jpg'], null),
  ('approved', 'dandenong-3175', 'Dandenong', '14 Foster Street, Dandenong', false, 'Single', 350, 'Available now',
   'Modern single room near Dandenong Market, close to bus interchange.',
   array['/listings/dandenong-example/bedroom-3.jpg', '/listings/dandenong-example/kitchenette-1.jpg', '/listings/dandenong-example/facade-sunset.jpg'], null),
  ('approved', 'sunshine-3020', 'Sunshine', '6 Hampshire Road, Sunshine', false, 'Single', 350, 'Available now',
   'Spacious single room, 8 minutes'' walk to Sunshine station. Onsite laundry.',
   array['/listings/dandenong-example/bedroom-4.jpg', '/listings/dandenong-example/kitchenette-2.jpg'], null),
  ('approved', 'sunshine-3020', 'Sunshine', '58 Anderson Road, Sunshine', false, 'Shared', 350, 'Available 1 Aug',
   'Shared room in a renovated 7-room house near Sunshine Marketplace.',
   array['/listings/dandenong-example/bedroom-1.jpg', '/listings/dandenong-example/bathroom.jpg'], null),
  ('approved', 'broadmeadows-3047', 'Broadmeadows', '19 Dimboola Road, Broadmeadows', false, 'Single', 350, 'Available now',
   'Single room close to Broadmeadows station and Hume Central shopping centre.',
   array['/listings/dandenong-example/bedroom-2.jpg', '/listings/dandenong-example/kitchenette-1.jpg'], null),
  ('approved', 'reservoir-3073', 'Reservoir', '11 Broadhurst Avenue, Reservoir', false, 'Single', 350, 'Available 1 Aug',
   'Quiet single room in a well-kept house, close to Edwardes Lake Park.',
   array['/listings/dandenong-example/bedroom-3.jpg', '/listings/dandenong-example/kitchenette-2.jpg'], null),
  ('approved', 'frankston-3199', 'Frankston', '27 Beach Street, Frankston', false, 'Single', 350, 'Available now',
   'Single room 10 minutes'' walk from Frankston station and the beach.',
   array['/listings/dandenong-example/bedroom-4.jpg', '/listings/dandenong-example/kitchen-dining.jpg'], 'Saturday 25 Jul, 2:00pm - 2:30pm'),
  ('approved', 'altona-3018', 'Altona', '4 Queen Street, Altona', false, 'Single', 350, 'Available now',
   'Bright single room in a quiet street, short drive to Altona beach and station.',
   array['/listings/dandenong-example/bedroom-1.jpg', '/listings/dandenong-example/kitchenette-2.jpg', '/listings/dandenong-example/facade-gate.jpg'], null),
  ('approved', 'springvale-3171', 'Springvale', '70 Springvale Road, Springvale', false, 'Shared', 350, 'Available now',
   'Shared room close to Springvale station and the shopping precinct on Springvale Road.',
   array['/listings/dandenong-example/bedroom-2.jpg', '/listings/dandenong-example/kitchen-dining.jpg'], null);

-- ─────────────────────────────────────────────────────────────
-- listings: exact geocoded location
-- Previously the listing detail map only ever showed the suburb's centroid
-- (lib/mock-data.ts Suburb.lat/lng) regardless of address_verified — that flag
-- only toggled the "approximate" caption, it never had real per-listing
-- coordinates to plot instead. Adding these lets a property manager's actual
-- selected address (captured via Places autocomplete) pin the exact spot.
-- ─────────────────────────────────────────────────────────────
alter table public.listings add column if not exists lat double precision;
alter table public.listings add column if not exists lng double precision;

-- ─────────────────────────────────────────────────────────────
-- listing_conversations / listing_messages: property manager access
-- Originally only the tenant and admins could see a room enquiry — there was
-- no live manager-reply UI, just the auto "Property Team" message. Now that
-- listings have a real owner_id, the property manager who owns that room
-- needs the same access a tenant has: view the conversation, and reply
-- (attributed to them, is_manager=true, rather than the anonymous system
-- reply enquire_on_listing() sends on a brand-new conversation).
-- ─────────────────────────────────────────────────────────────
create policy "Listing owners can view conversations about their listings"
  on public.listing_conversations for select
  using (exists (
    select 1 from public.listings l
    where l.id::text = listing_conversations.listing_id and l.owner_id = auth.uid()
  ));

create policy "Listing owners can view messages about their listings"
  on public.listing_messages for select
  using (exists (
    select 1 from public.listing_conversations c
    join public.listings l on l.id::text = c.listing_id
    where c.id = conversation_id and l.owner_id = auth.uid()
  ));

create policy "Listing owners can reply about their listings"
  on public.listing_messages for insert
  with check (
    auth.uid() = sender_id
    and is_manager = true
    and exists (
      select 1 from public.listing_conversations c
      join public.listings l on l.id::text = c.listing_id
      where c.id = conversation_id and l.owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- enquire_on_listing: drop the automated "Property Team" welcome reply
-- Now that a property manager has a real inbox (/partners/enquiries) and gets
-- emailed the moment a tenant enquires, the canned welcome message (which
-- always mentioned the inspection time whenever one existed, regardless of
-- what the tenant actually asked) is no longer needed and risked looking like
-- a mismatched, inaccurate auto-reply on a custom question. The tenant's
-- message now just waits for a real reply.
-- ─────────────────────────────────────────────────────────────
create or replace function public.enquire_on_listing(
  p_listing_id text,
  p_listing_title text,
  p_inspection_time text default null,
  p_message text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_conversation_id uuid;
begin
  select id into v_conversation_id
  from public.listing_conversations
  where listing_id = p_listing_id and tenant_id = auth.uid();

  if v_conversation_id is null then
    insert into public.listing_conversations (listing_id, tenant_id)
    values (p_listing_id, auth.uid())
    returning id into v_conversation_id;
  end if;

  if p_message is not null and length(trim(p_message)) > 0 then
    insert into public.listing_messages (conversation_id, sender_id, is_manager, body)
    values (v_conversation_id, auth.uid(), false, trim(p_message));
  end if;

  return v_conversation_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────
-- tenant_profiles: let listing owners see the applicant's details
-- A tenant already fills this in before they can enquire at all (see
-- enquire-button.tsx) — this just lets the property manager whose room
-- they enquired about actually read it, mirroring the existing
-- "Conversation partners can view a tenant's application profile" policy
-- which only covers the investor/service_provider marketplace, not listings.
-- ─────────────────────────────────────────────────────────────
create policy "Listing owners can view an enquiring tenant's application profile"
  on public.tenant_profiles for select
  using (
    exists (
      select 1 from public.listing_conversations c
      join public.listings l on l.id::text = c.listing_id
      where c.tenant_id = tenant_profiles.user_id and l.owner_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────────────────────
-- listing_conversations: per-side read tracking
-- Lets each side's inbox show an unread indicator — otherwise the only way to
-- know a new reply had arrived was to already be inside that conversation.
-- Two separate columns since there are exactly two sides to a listing
-- conversation (the tenant, and whichever single account owns the listing).
-- ─────────────────────────────────────────────────────────────
alter table public.listing_conversations add column if not exists tenant_last_read_at timestamptz;
alter table public.listing_conversations add column if not exists manager_last_read_at timestamptz;

create policy "Tenants can update their own listing conversation read state"
  on public.listing_conversations for update
  using (auth.uid() = tenant_id)
  with check (auth.uid() = tenant_id);

create policy "Listing owners can update their own listing conversation read state"
  on public.listing_conversations for update
  using (exists (
    select 1 from public.listings l
    where l.id::text = listing_conversations.listing_id and l.owner_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.listings l
    where l.id::text = listing_conversations.listing_id and l.owner_id = auth.uid()
  ));

-- ═════════════════════════════════════════════════════════════
-- Quote request messaging: investor <-> quote-based providers
-- Insurance/property-management quote requests broadcast to every provider in
-- that category (see app/api/webhooks/quote-request/route.ts) — this is what
-- lets any of them start their own private thread with the investor about a
-- specific request, independent of whether other providers also respond.
-- Kept as its own table pair rather than overloading `conversations` (which
-- is unique per investor+provider pair, and would collide across multiple
-- requests to the same provider) or `listing_conversations` (a different
-- domain entirely).
-- ═════════════════════════════════════════════════════════════
create table if not exists public.quote_conversations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_quote_requests (id) on delete cascade,
  provider_id uuid not null references public.service_providers (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  investor_last_read_at timestamptz,
  provider_last_read_at timestamptz,

  unique (request_id, provider_id)
);

alter table public.quote_conversations enable row level security;

create policy "Investors can view conversations about their own quote requests"
  on public.quote_conversations for select
  using (exists (
    select 1 from public.service_quote_requests r
    where r.id = quote_conversations.request_id and r.user_id = auth.uid()
  ));

create policy "Investors can update read state on their own quote conversations"
  on public.quote_conversations for update
  using (exists (
    select 1 from public.service_quote_requests r
    where r.id = quote_conversations.request_id and r.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.service_quote_requests r
    where r.id = quote_conversations.request_id and r.user_id = auth.uid()
  ));

create policy "Providers can view and manage conversations on their own requests"
  on public.quote_conversations for all
  using (exists (
    select 1 from public.service_providers p
    where p.id = quote_conversations.provider_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.service_providers p
    where p.id = quote_conversations.provider_id and p.user_id = auth.uid()
  ));

create policy "Admins can view every quote conversation"
  on public.quote_conversations for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create index if not exists quote_conversations_request_id_idx on public.quote_conversations (request_id);
create index if not exists quote_conversations_provider_id_idx on public.quote_conversations (provider_id);

create table if not exists public.quote_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.quote_conversations (id) on delete cascade,
  sender_id uuid references public.users (id) on delete set null,
  is_provider boolean not null default false,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.quote_messages enable row level security;

create policy "Participants can view quote messages"
  on public.quote_messages for select
  using (exists (
    select 1 from public.quote_conversations c
    join public.service_quote_requests r on r.id = c.request_id
    where c.id = conversation_id
      and (
        r.user_id = auth.uid()
        or exists (
          select 1 from public.service_providers p
          where p.id = c.provider_id and p.user_id = auth.uid()
        )
      )
  ));

create policy "Participants can send quote messages"
  on public.quote_messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.quote_conversations c
      join public.service_quote_requests r on r.id = c.request_id
      where c.id = conversation_id
        and (
          (is_provider = false and r.user_id = auth.uid())
          or (
            is_provider = true
            and exists (
              select 1 from public.service_providers p
              where p.id = c.provider_id and p.user_id = auth.uid()
            )
          )
        )
    )
  );

create policy "Admins can view every quote message"
  on public.quote_messages for select
  using (exists (
    select 1 from public.users where id = auth.uid() and role = 'admin'
  ));

create index if not exists quote_messages_conversation_id_idx on public.quote_messages (conversation_id);

create or replace function public.handle_new_quote_message()
returns trigger as $$
begin
  update public.quote_conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_quote_message_inserted
  after insert on public.quote_messages
  for each row execute procedure public.handle_new_quote_message();

alter publication supabase_realtime add table public.quote_messages;

-- Missing piece: providers could never actually SELECT service_quote_requests
-- at all — only the investor who submitted one, or an admin, had a policy
-- covering it. The email notification still worked (that route uses the
-- service-role client, which bypasses RLS entirely), but /partners/quotes
-- silently returned zero rows for every provider since nothing granted them
-- read access to requests in their own category.
create policy "Providers can view quote requests in their own category"
  on public.service_quote_requests for select
  using (exists (
    select 1 from public.service_providers p
    where p.user_id = auth.uid()
      and p.category = service_quote_requests.category
      and p.status = 'approved'
  ));

-- ─────────────────────────────────────────────────────────────
-- service_quote_quotes: let providers submit their own formal quote
-- Previously admin-only (rows added by hand via the Supabase table editor).
-- provider_id links a quote back to the submitting provider so RLS can grant
-- them insert/update/delete on their own rows; document_url is an optional
-- attached PDF, stored in a new quote-documents bucket alongside the
-- structured price fields already on this table.
-- ─────────────────────────────────────────────────────────────
alter table public.service_quote_quotes add column if not exists provider_id uuid references public.service_providers (id) on delete set null;
alter table public.service_quote_quotes add column if not exists document_url text;

create policy "Providers can manage their own submitted quotes"
  on public.service_quote_quotes for all
  using (exists (
    select 1 from public.service_providers p
    where p.id = service_quote_quotes.provider_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.service_providers p
    where p.id = service_quote_quotes.provider_id and p.user_id = auth.uid()
  ));

create index if not exists service_quote_quotes_provider_id_idx on public.service_quote_quotes (provider_id);

-- ─────────────────────────────────────────────────────────────
-- Storage: quote-documents
-- Public bucket for a provider's optional attached quote PDF, same
-- folder-per-owner convention as profile-photos/listing-photos.
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('quote-documents', 'quote-documents', true)
on conflict (id) do nothing;

create policy "Anyone can view quote documents"
  on storage.objects for select
  using (bucket_id = 'quote-documents');

create policy "Providers can upload their own quote documents"
  on storage.objects for insert
  with check (bucket_id = 'quote-documents' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Providers can update their own quote documents"
  on storage.objects for update
  using (bucket_id = 'quote-documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- Nothing previously moved a request out of 'pending' once a provider
-- actually submitted a quote — admin used to flip this by hand when quotes
-- were entered manually. Now that providers self-submit, the rate limiter
-- (which blocks a new request in a category while one is still 'pending')
-- would otherwise block forever even after a quote arrives.
create or replace function public.handle_new_quote_submission()
returns trigger as $$
begin
  update public.service_quote_requests
  set status = 'quoted'
  where id = new.request_id and status = 'pending';
  return new;
end;
$$ language plpgsql security definer;

create trigger on_quote_submitted
  after insert on public.service_quote_quotes
  for each row execute procedure public.handle_new_quote_submission();

-- ─────────────────────────────────────────────────────────────
-- conversations: per-side read tracking
-- Same pattern already added to listing_conversations/quote_conversations —
-- needed so the unified Messages inbox (marketplace conversations + quote
-- conversations merged into one list) can show a consistent unread indicator
-- across both kinds of item instead of only some of them.
-- ─────────────────────────────────────────────────────────────
alter table public.conversations add column if not exists investor_last_read_at timestamptz;
alter table public.conversations add column if not exists provider_last_read_at timestamptz;

create policy "Investors can update read state on their own conversations"
  on public.conversations for update
  using (auth.uid() = investor_id)
  with check (auth.uid() = investor_id);

create policy "Providers can update read state on their own conversations"
  on public.conversations for update
  using (exists (
    select 1 from public.service_providers p
    where p.id = conversations.provider_id and p.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.service_providers p
    where p.id = conversations.provider_id and p.user_id = auth.uid()
  ));

-- ─────────────────────────────────────────────────────────────
-- users: let providers/property managers see who they're talking to
-- public.users previously only had "view your own row" — nothing let a
-- provider read even the basic name/email of the investor in a conversation
-- with them, or a property manager read an enquiring tenant's name/email.
-- That's why quote-request-summary.tsx was showing "Not provided": the
-- query wasn't erroring, RLS was just silently returning nothing.
-- ─────────────────────────────────────────────────────────────
create policy "Providers can view basic info of investors they're talking to"
  on public.users for select
  using (
    exists (
      select 1 from public.conversations c
      join public.service_providers p on p.id = c.provider_id
      where c.investor_id = users.id and p.user_id = auth.uid()
    )
    or exists (
      select 1 from public.quote_conversations qc
      join public.service_quote_requests r on r.id = qc.request_id
      join public.service_providers p on p.id = qc.provider_id
      where r.user_id = users.id and p.user_id = auth.uid()
    )
  );

create policy "Listing owners can view basic info of enquiring tenants"
  on public.users for select
  using (
    exists (
      select 1 from public.listing_conversations lc
      join public.listings l on l.id::text = lc.listing_id
      where lc.tenant_id = users.id and l.owner_id = auth.uid()
    )
  );
