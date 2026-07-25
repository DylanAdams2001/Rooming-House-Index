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
