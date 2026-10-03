-- ============================================================
-- SClub database migration 001
-- Run once in Neon dashboard → SQL Editor (or any psql client)
-- ============================================================

create table if not exists admins (
  id serial primary key,
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  color text default '#d4a437',
  created_at timestamptz default now()
);

create table if not exists videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  category_id uuid references categories(id) on delete set null,
  thumbnail_url text default '',
  video_url text not null default '',
  video_type text default 'drive' check (video_type in ('drive','mp4','youtube')),
  description text default '',
  duration text default '',
  featured boolean default false,
  published boolean default true,
  views int default 0,
  created_at timestamptz default now()
);

create table if not exists settings (
  id int primary key default 1,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- default website settings (admin panel edits these)
insert into settings (id, data) values (1, '{
  "site_name": "SClub",
  "tagline": "Latest movie trailers, teasers & entertainment",
  "logo_emoji": "🎬",
  "primary_color": "#d4a437",
  "hero_title": "Watch. <span>Enjoy.</span> Share.",
  "hero_subtitle": "The hottest movie trailers and entertainment picks, all in one place. New trailers added regularly — join our Facebook community!",
  "hero_banner_url": "",
  "footer_text": "Made for movie lovers.",
  "facebook_url": "",
  "instagram_url": "",
  "ad_header_code": "",
  "ad_infeed_code": "",
  "ad_popunder_code": "",
  "meta_description": "SClub — latest Hollywood & Bollywood movie trailers, teasers and entertainment. Watch and download."
}'::jsonb)
on conflict (id) do nothing;

-- seed categories
insert into categories (name, color) values
  ('Hollywood Trailers', '#e5484d'),
  ('Bollywood', '#d4a437'),
  ('Lollywood', '#3fb68b'),
  ('Web Series', '#4f8ef7'),
  ('Coming Soon', '#a855f7')
on conflict (name) do nothing;

-- seed sample videos (edit/delete from admin panel)
insert into videos (title, category_id, video_url, video_type, description, duration, featured, published)
values
  ('Avengers: Doomsday — Official Trailer (SAMPLE, edit me)',
   (select id from categories where name = 'Hollywood Trailers'),
   '', 'youtube', 'Sample entry — open the admin panel, edit it and paste the real trailer link.', '2:31', true, true),
  ('Dune: Part Three — Official Trailer (SAMPLE, edit me)',
   (select id from categories where name = 'Hollywood Trailers'),
   '', 'youtube', 'Sample entry — open the admin panel, edit it and paste the real trailer link.', '', false, true),
  ('Coming Soon — Teaser (SAMPLE, edit me)',
   (select id from categories where name = 'Coming Soon'),
   '', 'youtube', 'Sample entry showing how a teaser looks.', '', false, true);
