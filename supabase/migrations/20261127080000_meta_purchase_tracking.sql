-- Checkout attribution and delivery state are only accessible to the server.
create table public.meta_purchase_events (
  order_id uuid primary key references public.orders(id) on delete cascade,
  cart_id uuid not null references public.carts(id) on delete cascade,
  consent boolean not null default false,
  fbp text,
  fbc text,
  client_ip_address text,
  client_user_agent text,
  consent_updated_at timestamptz not null default now(),
  claimed_at timestamptz,
  sent_at timestamptz,
  last_error text
);

create index meta_purchase_events_cart_id_idx on public.meta_purchase_events(cart_id);
alter table public.meta_purchase_events enable row level security;
revoke all on public.meta_purchase_events from public, anon, authenticated;
grant select, insert, update, delete on public.meta_purchase_events to service_role;
