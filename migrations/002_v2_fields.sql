-- ============================================================
-- SClub migration 002 — movieclub-style v2 fields
-- ============================================================

alter table videos add column if not exists language text not null default '';
alter table videos add column if not exists quality_links jsonb not null default '{}';
alter table videos add column if not exists year text not null default '';

create table if not exists movie_requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  details text not null default '',
  status text not null default 'pending',
  created_at timestamptz default now()
);
create index if not exists idx_requests_created on movie_requests (created_at desc);
