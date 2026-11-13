-- One private offer record, not a promotions administration system.
create table public.checkout_customer_discount (
  code text primary key check (code = 'MAXINE100'),
  customer_email text not null,
  expires_at timestamptz not null,
  reserved_order_id uuid references public.orders(id),
  redeemed_order_id uuid references public.orders(id),
  redeemed_at timestamptz
);
alter table public.checkout_customer_discount enable row level security;
revoke all on public.checkout_customer_discount from public, anon, authenticated;
grant select, update on public.checkout_customer_discount to service_role;
insert into public.checkout_customer_discount (code, customer_email, expires_at)
values ('MAXINE100', 'maxine.chehab@gmail.com', '2027-05-14T00:00:00+04:00');

alter table public.orders
  add column discount_code text,
  add column discount_amount numeric(10,2) not null default 0 check (discount_amount >= 0);

create function public.checkout_discount_amount(p_code text, p_email text, p_subtotal numeric, p_order_id uuid)
returns numeric language plpgsql security invoker set search_path = '' as $$
declare offer public.checkout_customer_discount%rowtype;
begin
  if p_subtotal is null or p_subtotal < 0 then raise exception 'Invalid subtotal.'; end if;
  case upper(btrim(coalesce(p_code, '')))
    when '' then return 0;
    when 'FASTE10' then return round(p_subtotal * 0.1, 2);
    when 'MAXINE100' then
      select * into strict offer from public.checkout_customer_discount where code = 'MAXINE100';
      if lower(btrim(p_email)) is distinct from offer.customer_email then
        raise exception 'DISCOUNT_EMAIL: This code is unavailable for the checkout email.';
      end if;
      if clock_timestamp() >= offer.expires_at then
        raise exception 'DISCOUNT_EXPIRED: This discount code has expired.';
      end if;
      if offer.redeemed_order_id is not null then
        raise exception 'DISCOUNT_USED: This discount code has already been used.';
      end if;
      if offer.reserved_order_id is not null and offer.reserved_order_id is distinct from p_order_id then
        raise exception 'DISCOUNT_RESERVED: This code is reserved by another payment. Please try again after that payment expires.';
      end if;
      return least(p_subtotal, 100);
    else raise exception 'DISCOUNT_INVALID: That discount code is not valid. Use only one code.';
  end case;
end;
$$;

create function public.quote_checkout_discount(p_cart_id uuid, p_code text, p_email text, p_subtotal numeric)
returns numeric language sql security invoker set search_path = '' as $$
  select public.checkout_discount_amount(p_code, p_email, p_subtotal,
    (select id from public.orders where cart_id = p_cart_id and status = 'pending'));
$$;

-- Keep the legacy RPC callable during rollout; new checkout sends a code instead of a total.
create function public.prepare_checkout_order_with_discount(
  p_cart_id uuid, p_guest_email text, p_subtotal numeric, p_discount_code text,
  p_shipping_address jsonb, p_items jsonb, p_claim_expires_at timestamptz, p_session_mode text
) returns table (
  order_id uuid, order_total numeric, create_session boolean,
  checkout_session_id text, checkout_session_expires_at timestamptz, checkout_url text
) language plpgsql security invoker set search_path = '' as $$
declare
  cart_row public.carts%rowtype;
  order_row public.orders%rowtype;
  normalized_code text := nullif(upper(btrim(p_discount_code)), '');
  email text := lower(btrim(p_guest_email));
  discount numeric;
  changed boolean;
begin
  -- All payment mutations lock offer -> cart -> order, including callbacks.
  perform 1 from public.checkout_customer_discount where checkout_customer_discount.code = 'MAXINE100' for update;
  if p_session_mode is null or p_session_mode not in ('express', 'standard') then raise exception 'Invalid checkout mode.'; end if;
  if jsonb_typeof(p_items) is distinct from 'array' or jsonb_array_length(p_items) = 0 then raise exception 'Checkout order items are required.'; end if;
  if p_claim_expires_at <= clock_timestamp() or p_claim_expires_at > clock_timestamp() + interval '1 minute' then raise exception 'Invalid checkout claim expiry.'; end if;
  select * into cart_row from public.carts where id = p_cart_id for update;
  if not found or cart_row.status not in ('ACTIVE', 'CHECKOUT_STARTED') then raise exception 'Cart is not available for checkout.'; end if;
  select * into order_row from public.orders where cart_id = p_cart_id and status = 'pending' for update;

  discount := public.checkout_discount_amount(normalized_code, email, p_subtotal, order_row.id);
  changed := order_row.id is null or order_row.subtotal is distinct from p_subtotal
    or order_row.discount_code is distinct from normalized_code or order_row.guest_email is distinct from email
    or order_row.shipping_address is distinct from p_shipping_address
    or order_row.geidea_session_mode is distinct from p_session_mode;

  if order_row.id is not null and order_row.geidea_session_expires_at > clock_timestamp() then
    if changed then
      raise exception 'DISCOUNT_CHECKOUT_ACTIVE: A payment is already open with different checkout details. Wait for it to expire before changing them.';
    end if;
    return query select order_row.id, order_row.total, false,
      cart_row.checkout_session_id, cart_row.checkout_session_expires_at, cart_row.checkout_url;
    return;
  end if;

  if order_row.id is not null then
    -- A delivered MAXINE100 session must be reconciled by the server before reuse.
    if order_row.discount_code = 'MAXINE100' and order_row.geidea_session_id is not null then
      raise exception 'DISCOUNT_RESERVED: The previous payment is being checked. Please try again shortly.';
    end if;
    update public.orders set status = 'cancelled' where id = order_row.id;
    update public.checkout_customer_discount set reserved_order_id = null where reserved_order_id = order_row.id;
  end if;

  insert into public.orders (cart_id, guest_email, status, subtotal, shipping_total, total,
    shipping_address, payment_status, geidea_session_mode, discount_code, discount_amount,
    geidea_session_expires_at)
  values (p_cart_id, email, 'pending', p_subtotal, 0, greatest(0, p_subtotal - discount),
    p_shipping_address, 'session_creating', p_session_mode, normalized_code, discount, p_claim_expires_at)
  returning * into order_row;

  insert into public.order_items (order_id, variant_id, catalog_variant_id, product_name, variant_name, quantity, unit_price)
  select order_row.id, null, item.catalog_variant_id, item.product_name, item.variant_name, item.quantity, item.unit_price
  from jsonb_to_recordset(p_items) as item(catalog_variant_id text, product_name text, variant_name text, quantity integer, unit_price numeric);

  if normalized_code = 'MAXINE100' then
    update public.checkout_customer_discount set reserved_order_id = order_row.id where checkout_customer_discount.code = normalized_code;
  end if;
  update public.carts set status = 'CHECKOUT_STARTED', checkout_session_id = null,
    checkout_session_expires_at = p_claim_expires_at, checkout_session_mode = p_session_mode,
    checkout_url = null, updated_at = now() where id = p_cart_id;
  return query select order_row.id, order_row.total, true, null::text, null::timestamptz, null::text;
end;
$$;

-- Persist both session records before the URL can reach the browser. A stale creator cannot publish a session.
create function public.complete_checkout_session(p_order_id uuid, p_claim_expires_at timestamptz,
  p_session_id text, p_expires_at timestamptz, p_url text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare order_row public.orders%rowtype;
begin
  perform 1 from public.checkout_customer_discount where code = 'MAXINE100' for update;
  perform 1 from public.carts where id = (select cart_id from public.orders where id = p_order_id) for update;
  select * into order_row from public.orders where id = p_order_id for update;
  if order_row.status <> 'pending' or order_row.geidea_session_expires_at is distinct from p_claim_expires_at
    or p_claim_expires_at <= clock_timestamp() then return false; end if;
  update public.orders set geidea_session_id = p_session_id, geidea_session_expires_at = p_expires_at,
    payment_status = case when p_session_id is null then 'session_failed' else 'Initiated' end where id = p_order_id;
  update public.carts set checkout_session_id = p_session_id, checkout_session_expires_at = p_expires_at,
    checkout_url = p_url, status = case when p_session_id is null then 'ACTIVE' else 'CHECKOUT_STARTED' end,
    updated_at = now() where id = order_row.cart_id;
  if p_session_id is null then
    update public.checkout_customer_discount set reserved_order_id = null where reserved_order_id = p_order_id;
  end if;
  return true;
end;
$$;

-- Called only with a server-verified provider result, never an SDK/browser success.
create function public.record_checkout_payment(p_order_id uuid, p_provider_order_id text, p_amount numeric,
  p_currency text, p_paid boolean, p_terminal boolean, p_status text, p_reference text, p_method text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  order_row public.orders%rowtype;
  offer public.checkout_customer_discount%rowtype;
begin
  select * into strict offer from public.checkout_customer_discount where code = 'MAXINE100' for update;
  perform 1 from public.carts where id = (select cart_id from public.orders where id = p_order_id) for update;
  select * into strict order_row from public.orders where id = p_order_id for update;
  if p_currency <> 'AED' or p_amount is distinct from order_row.total then raise exception 'Payment amount does not match.'; end if;
  if order_row.payment_confirmed_at is not null then return order_row.geidea_order_id = p_provider_order_id; end if;
  if p_paid then
    if order_row.discount_code = 'MAXINE100' then
      if (offer.redeemed_order_id is not null and offer.redeemed_order_id <> p_order_id)
        or (offer.reserved_order_id is not null and offer.reserved_order_id <> p_order_id) then
        raise exception 'Discount already redeemed by another order; payment requires reconciliation.';
      end if;
      update public.checkout_customer_discount set redeemed_order_id = p_order_id, redeemed_at = now(), reserved_order_id = null
      where code = 'MAXINE100';
    end if;
    update public.orders set status = 'confirmed', payment_confirmed_at = now(),
      geidea_order_id = p_provider_order_id, payment_status = p_status, geidea_reference = p_reference,
      payment_method = p_method where id = p_order_id;
    update public.carts set status = 'CONVERTED', converted_order_id = p_order_id, updated_at = now()
    where id = order_row.cart_id;
  else
    if order_row.status <> 'pending' then return false; end if;
    update public.orders set payment_status = p_status, geidea_order_id = p_provider_order_id,
      geidea_reference = p_reference, payment_method = p_method,
      status = case when p_terminal then 'failed' else status end where id = p_order_id;
    if p_terminal then
      update public.checkout_customer_discount set reserved_order_id = null where reserved_order_id = p_order_id;
      update public.carts set status = 'ACTIVE', checkout_session_id = null, checkout_url = null,
        checkout_session_expires_at = null, updated_at = now()
      where id = order_row.cart_id and status = 'CHECKOUT_STARTED';
    end if;
  end if;
  return true;
end;
$$;

-- Lazy recovery: the server first checks Geidea by the immutable order reference.
create function public.release_expired_checkout_discount(p_order_id uuid, p_session_id text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare order_row public.orders%rowtype;
begin
  perform 1 from public.checkout_customer_discount where code = 'MAXINE100' for update;
  perform 1 from public.carts where id = (select cart_id from public.orders where id = p_order_id) for update;
  select * into order_row from public.orders where id = p_order_id for update;
  if order_row.status <> 'pending' or order_row.geidea_session_id is distinct from p_session_id
    or order_row.geidea_session_expires_at > clock_timestamp() then return false; end if;
  update public.checkout_customer_discount set reserved_order_id = null where reserved_order_id = p_order_id;
  update public.orders set status = 'cancelled', payment_status = 'session_expired' where id = p_order_id;
  update public.carts set status = 'ACTIVE', checkout_session_id = null, checkout_url = null,
    checkout_session_expires_at = null, updated_at = now() where id = order_row.cart_id and status = 'CHECKOUT_STARTED';
  return true;
end;
$$;

revoke execute on function public.checkout_discount_amount(text,text,numeric,uuid),
  public.quote_checkout_discount(uuid,text,text,numeric),
  public.prepare_checkout_order_with_discount(uuid,text,numeric,text,jsonb,jsonb,timestamptz,text),
  public.complete_checkout_session(uuid,timestamptz,text,timestamptz,text),
  public.record_checkout_payment(uuid,text,numeric,text,boolean,boolean,text,text,text),
  public.release_expired_checkout_discount(uuid,text) from public, anon, authenticated;
grant execute on function public.checkout_discount_amount(text,text,numeric,uuid),
  public.quote_checkout_discount(uuid,text,text,numeric),
  public.prepare_checkout_order_with_discount(uuid,text,numeric,text,jsonb,jsonb,timestamptz,text),
  public.complete_checkout_session(uuid,timestamptz,text,timestamptz,text),
  public.record_checkout_payment(uuid,text,numeric,text,boolean,boolean,text,text,text),
  public.release_expired_checkout_discount(uuid,text) to service_role;
