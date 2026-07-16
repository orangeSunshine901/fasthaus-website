create table public.carts (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'ACTIVE'
    check (status in ('ACTIVE', 'CHECKOUT_STARTED', 'CONVERTED', 'EXPIRED')),
  currency text not null default 'AED' check (currency = 'AED'),
  checkout_session_id text,
  checkout_url text,
  converted_order_id uuid references public.orders(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  product_id text not null,
  variant_id text not null,
  quantity integer not null check (quantity between 1 and 10),
  add_ons jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create index carts_expiry_idx on public.carts (expires_at) where status = 'ACTIVE';
create index cart_items_cart_id_idx on public.cart_items (cart_id);

alter table public.carts enable row level security;
alter table public.cart_items enable row level security;

revoke all on public.carts, public.cart_items from anon, authenticated;
grant select, insert, update, delete on public.carts, public.cart_items to service_role;

create or replace function public.add_anonymous_cart_item(
  p_cart_id uuid,
  p_product_id text,
  p_variant_id text,
  p_quantity integer,
  p_add_ons jsonb
) returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.cart_items (cart_id, product_id, variant_id, quantity, add_ons)
  values (p_cart_id, p_product_id, p_variant_id, p_quantity, p_add_ons)
  on conflict (cart_id, variant_id) do update
    set quantity = public.cart_items.quantity + excluded.quantity,
        add_ons = excluded.add_ons,
        updated_at = now();

  update public.carts
  set updated_at = now(), expires_at = now() + interval '30 days'
  where id = p_cart_id and status = 'ACTIVE';
end;
$$;

revoke execute on function public.add_anonymous_cart_item(uuid, text, text, integer, jsonb) from public, anon, authenticated;
grant execute on function public.add_anonymous_cart_item(uuid, text, text, integer, jsonb) to service_role;

comment on table public.carts is 'Server-side anonymous shopping carts; IDs are stored only in HttpOnly first-party cookies.';

create or replace function public.expire_anonymous_carts()
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare affected integer;
begin
  update public.carts set status = 'EXPIRED', updated_at = now()
  where status = 'ACTIVE' and expires_at <= now();
  get diagnostics affected = row_count;
  return affected;
end;
$$;
revoke execute on function public.expire_anonymous_carts() from public, anon, authenticated;
grant execute on function public.expire_anonymous_carts() to service_role;

alter table public.orders add column cart_id uuid references public.carts(id);
create unique index orders_cart_id_idx on public.orders (cart_id)
where cart_id is not null and status in ('pending', 'confirmed');
alter table public.order_items add column catalog_variant_id text;
alter table public.order_items add column product_name text;
alter table public.order_items add column variant_name text;
