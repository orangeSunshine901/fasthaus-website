-- The editor writes through protected server routes; public API roles cannot mutate media.
create table public.product_media (
  variant_id text primary key,
  media jsonb not null check (jsonb_typeof(media) = 'object'),
  version integer not null default 1 check (version > 0),
  updated_at timestamptz not null default now()
);
create table public.product_media_assets (
  url text primary key,
  path text unique not null,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  created_at timestamptz not null default now()
);
alter table public.product_media enable row level security;
alter table public.product_media_assets enable row level security;
revoke all on public.product_media, public.product_media_assets from anon, authenticated;
grant select, insert, update, delete on public.product_media, public.product_media_assets to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-media', 'product-media', true, 4194304, array['image/webp']);
-- Public reads serve storefront images. No client upload/update/delete policies are added.
