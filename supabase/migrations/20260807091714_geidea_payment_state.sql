alter table public.orders
  add column if not exists geidea_session_id text,
  add column if not exists geidea_session_expires_at timestamptz,
  add column if not exists geidea_reference text,
  add column if not exists payment_status text not null default 'not_started',
  add column if not exists payment_method text,
  add column if not exists payment_confirmed_at timestamptz;

alter table public.carts
  add column if not exists checkout_session_expires_at timestamptz;

create index if not exists orders_pending_geidea_session_idx
  on public.orders (geidea_session_id)
  where status = 'pending' and geidea_session_id is not null;

comment on column public.orders.geidea_session_id is
  'Geidea checkout session ID. This is distinct from the paid Geidea order ID.';
comment on column public.orders.payment_status is
  'Last payment status reported by Geidea; order status remains the fulfillment authority.';
