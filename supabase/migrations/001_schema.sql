-- ============================================================
-- Village Opinion Poll Platform — Supabase schema (MVP)
-- Run this in the Supabase SQL editor (or as a migration).
-- ============================================================

-- ---------- villages ----------
-- Only user-entered villages live here initially (source =
-- 'custom_user_entry'). Never fabricate official village records.
create table if not exists villages (
  id uuid primary key default gen_random_uuid(),
  state text not null,
  district text not null,
  block text,
  gram_panchayat text,
  village_name text not null,
  source text not null default 'custom_user_entry'
    check (source in ('custom_user_entry', 'official_import')),
  verification_status text not null default 'pending'
    check (verification_status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists villages_state_district_idx on villages (state, district);
create index if not exists villages_status_idx on villages (verification_status);

-- ---------- polls ----------
create table if not exists polls (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  creator_token_hash text not null,
  state text not null,
  district text not null,
  block text,
  village_name text not null,
  village_id uuid references villages (id) on delete set null,
  poll_type text not null check (poll_type in ('sarpanch', 'ward_panch', 'zila_parishad')),
  ward_number text,
  title text not null,
  status text not null default 'active' check (status in ('active', 'closed', 'hidden')),
  expires_at timestamptz,
  views integer not null default 0,
  shares integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists polls_slug_idx on polls (slug);
create index if not exists polls_state_district_idx on polls (state, district);
create index if not exists polls_status_created_idx on polls (status, created_at desc);
create index if not exists polls_type_idx on polls (poll_type);

-- ---------- candidates ----------
create table if not exists candidates (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls (id) on delete cascade,
  name text not null,
  photo_url text,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists candidates_poll_idx on candidates (poll_id, position);

-- ---------- votes ----------
-- voter_hash = sha256(poll_id + voter_session_id + server salt).
-- The UNIQUE constraint enforces one vote per session/device per poll.
-- ip_hash is stored only for abuse detection, never exposed publicly.
create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls (id) on delete cascade,
  candidate_id uuid not null references candidates (id) on delete cascade,
  voter_hash text not null,
  ip_hash text not null,
  created_at timestamptz not null default now(),
  unique (poll_id, voter_hash)
);
create index if not exists votes_poll_candidate_idx on votes (poll_id, candidate_id);
create index if not exists votes_created_idx on votes (created_at);

-- ---------- reports ----------
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls (id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);
create index if not exists reports_status_idx on reports (status, created_at desc);

-- ---------- poll_events (anonymous analytics aggregates) ----------
create table if not exists poll_events (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references polls (id) on delete cascade,
  event text not null check (event in ('view', 'share', 'vote', 'create')),
  created_at timestamptz not null default now()
);
create index if not exists poll_events_poll_idx on poll_events (poll_id, event);

-- ============================================================
-- Row Level Security
-- Public site reads go through the anon key with these policies.
-- All writes happen server-side via API routes using the
-- SERVICE ROLE key (which bypasses RLS). Never expose the
-- service role key to the browser.
-- ============================================================
alter table villages enable row level security;
alter table polls enable row level security;
alter table candidates enable row level security;
alter table votes enable row level security;
alter table reports enable row level security;
alter table poll_events enable row level security;

-- Public can read active/closed polls (never 'hidden' ones)
create policy "public_read_polls"
  on polls for select
  using (status in ('active', 'closed'));

-- Public can read candidates of visible polls
create policy "public_read_candidates"
  on candidates for select
  using (
    exists (
      select 1 from polls p
      where p.id = candidates.poll_id
        and p.status in ('active', 'closed')
    )
  );

-- Public can read approved villages only
create policy "public_read_villages"
  on villages for select
  using (verification_status = 'approved');

-- No public access to votes / reports / events (service role only).
-- (No policies = deny by default.)
