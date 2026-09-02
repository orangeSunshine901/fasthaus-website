alter table public.carts
  add column if not exists checkout_session_mode text;

alter table public.orders
  add column if not exists geidea_session_mode text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'carts_checkout_session_mode_check'
      and conrelid = 'public.carts'::regclass
  ) then
    alter table public.carts
      add constraint carts_checkout_session_mode_check
      check (checkout_session_mode in ('express', 'standard')) not valid;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_geidea_session_mode_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_geidea_session_mode_check
      check (geidea_session_mode in ('express', 'standard')) not valid;
  end if;
end;
$$;

alter table public.carts validate constraint carts_checkout_session_mode_check;
alter table public.orders validate constraint orders_geidea_session_mode_check;

comment on column public.carts.checkout_session_mode is
  'Geidea configuration used by the active checkout session: express or standard.';
comment on column public.orders.geidea_session_mode is
  'Geidea configuration used by the order checkout session: express or standard.';

drop function if exists public.prepare_checkout_order(
  uuid, text, numeric, numeric, jsonb, jsonb, timestamptz
);

create function public.prepare_checkout_order(
  p_cart_id uuid,
  p_guest_email text,
  p_subtotal numeric,
  p_total numeric,
  p_shipping_address jsonb,
  p_items jsonb,
  p_claim_expires_at timestamptz,
  p_session_mode text
) returns table (
  order_id uuid,
  order_total numeric,
  create_session boolean,
  checkout_session_id text,
  checkout_session_expires_at timestamptz,
  checkout_url text
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  cart_row public.carts%rowtype;
  order_row public.orders%rowtype;
  session_input_changed boolean;
begin
  if p_session_mode is null or p_session_mode not in ('express', 'standard') then
    raise exception 'Checkout session mode must be express or standard.';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Checkout order items are required.';
  end if;
  if p_claim_expires_at <= now() then
    raise exception 'Checkout session claim must expire in the future.';
  end if;

  select carts.* into cart_row
  from public.carts
  where carts.id = p_cart_id
  for update;

  if not found or cart_row.status not in ('ACTIVE', 'CHECKOUT_STARTED') then
    raise exception 'Cart is not available for checkout.';
  end if;

  select orders.* into order_row
  from public.orders
  where orders.cart_id = p_cart_id and orders.status = 'pending';

  if found then
    session_input_changed :=
      round(order_row.total * 100) <> round(p_total * 100)
      or order_row.guest_email is distinct from p_guest_email
      or order_row.shipping_address is distinct from p_shipping_address
      or order_row.geidea_session_mode is distinct from p_session_mode;

    update public.orders
    set guest_email = p_guest_email,
        subtotal = p_subtotal,
        total = p_total,
        shipping_address = p_shipping_address,
        geidea_session_mode = p_session_mode
    where id = order_row.id
    returning * into order_row;
  else
    session_input_changed := true;
    insert into public.orders (
      cart_id,
      guest_email,
      status,
      subtotal,
      shipping_total,
      total,
      shipping_address,
      payment_status,
      geidea_session_mode
    ) values (
      p_cart_id,
      p_guest_email,
      'pending',
      p_subtotal,
      0,
      p_total,
      p_shipping_address,
      'not_started',
      p_session_mode
    )
    returning * into order_row;
  end if;

  delete from public.order_items where public.order_items.order_id = order_row.id;
  insert into public.order_items (
    order_id,
    variant_id,
    catalog_variant_id,
    product_name,
    variant_name,
    quantity,
    unit_price
  )
  select
    order_row.id,
    null,
    item.catalog_variant_id,
    item.product_name,
    item.variant_name,
    item.quantity,
    item.unit_price
  from jsonb_to_recordset(p_items) as item(
    catalog_variant_id text,
    product_name text,
    variant_name text,
    quantity integer,
    unit_price numeric
  );

  if not session_input_changed
    and cart_row.checkout_session_mode = p_session_mode
    and cart_row.checkout_session_id is not null
    and cart_row.checkout_url is not null
    and cart_row.checkout_session_expires_at > now() + interval '30 seconds'
  then
    return query select
      order_row.id,
      order_row.total,
      false,
      cart_row.checkout_session_id,
      cart_row.checkout_session_expires_at,
      cart_row.checkout_url;
    return;
  end if;

  if not session_input_changed
    and cart_row.checkout_session_mode = p_session_mode
    and cart_row.status = 'CHECKOUT_STARTED'
    and cart_row.checkout_session_id is null
    and cart_row.checkout_session_expires_at > now()
  then
    return query select order_row.id, order_row.total, false, null::text, null::timestamptz, null::text;
    return;
  end if;

  update public.carts
  set status = 'CHECKOUT_STARTED',
      checkout_session_id = null,
      checkout_session_expires_at = p_claim_expires_at,
      checkout_session_mode = p_session_mode,
      checkout_url = null,
      updated_at = now()
  where id = p_cart_id;

  update public.orders
  set geidea_session_id = null,
      geidea_session_expires_at = p_claim_expires_at,
      geidea_session_mode = p_session_mode,
      payment_status = 'session_creating'
  where id = order_row.id;

  return query select order_row.id, order_row.total, true, null::text, null::timestamptz, null::text;
end;
$$;

revoke execute on function public.prepare_checkout_order(
  uuid, text, numeric, numeric, jsonb, jsonb, timestamptz, text
) from public, anon, authenticated;
grant execute on function public.prepare_checkout_order(
  uuid, text, numeric, numeric, jsonb, jsonb, timestamptz, text
) to service_role;

comment on function public.prepare_checkout_order(
  uuid, text, numeric, numeric, jsonb, jsonb, timestamptz, text
) is 'Atomically prepares one pending order and one mode-specific Geidea session-creation lease per cart.';
