create table public.checkout_white_friday_schedule (
  id boolean primary key default true check (id),
  starts_at timestamptz not null check (isfinite(starts_at)),
  switches_at timestamptz check (isfinite(switches_at) and starts_at < switches_at),
  ends_at timestamptz check (isfinite(ends_at) and coalesce(switches_at, starts_at) < ends_at)
);
alter table public.checkout_white_friday_schedule enable row level security;
revoke all on public.checkout_white_friday_schedule from public, anon, authenticated, service_role;
grant select on public.checkout_white_friday_schedule to service_role;

create function public.read_white_friday_schedule()
returns table (starts_at timestamptz, switches_at timestamptz, ends_at timestamptz, server_time timestamptz)
language sql security invoker set search_path = '' as $$
  select schedule.starts_at, schedule.switches_at, schedule.ends_at, clock_timestamp()
  from public.checkout_white_friday_schedule schedule where schedule.id;
$$;
revoke execute on function public.read_white_friday_schedule() from public, anon, authenticated;
grant execute on function public.read_white_friday_schedule() to service_role;

create or replace function public.checkout_discount_amount(p_code text, p_email text, p_subtotal numeric, p_order_id uuid)
returns numeric language plpgsql security invoker set search_path = '' as $$
declare
  offer public.checkout_customer_discount%rowtype;
  campaign public.checkout_white_friday_schedule%rowtype;
  code text := upper(btrim(coalesce(p_code, '')));
  active_code text;
  campaign_now timestamptz;
begin
  if p_subtotal is null or p_subtotal < 0 then raise exception 'Invalid subtotal.'; end if;
  case code
    when '' then return 0;
    when 'FASTE10' then return round(p_subtotal * 0.1, 2);
    when 'WHITEFRIDAY20', 'WHITEFRIDAY25' then
      select * into campaign from public.checkout_white_friday_schedule where id;
      campaign_now := clock_timestamp();
      if campaign.starts_at is null or campaign_now < campaign.starts_at or campaign_now >= campaign.ends_at then
        raise exception 'DISCOUNT_EXPIRED: The White Friday offer is currently unavailable.';
      end if;
      active_code := case when campaign_now >= campaign.switches_at then 'WHITEFRIDAY25' else 'WHITEFRIDAY20' end;
      if code <> active_code then
        raise exception 'DISCOUNT_INVALID: Use % for the current White Friday offer.', active_code;
      end if;
      return round(p_subtotal * case active_code when 'WHITEFRIDAY20' then 0.20 else 0.25 end, 2);
    when 'MAXINE100' then
      select * into strict offer from public.checkout_customer_discount where checkout_customer_discount.code = 'MAXINE100';
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
