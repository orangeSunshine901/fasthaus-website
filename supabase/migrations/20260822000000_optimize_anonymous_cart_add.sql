create or replace function public.add_anonymous_cart_item(
  p_cart_id uuid,
  p_product_id text,
  p_variant_id text,
  p_quantity integer,
  p_add_ons jsonb,
  p_max_quantity integer
) returns table (item_id uuid, quantity integer, updated_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item_id uuid;
  v_quantity integer;
  v_updated_at timestamptz;
begin
  update public.carts
  set updated_at = now(), expires_at = now() + interval '30 days'
  where id = p_cart_id and status = 'ACTIVE'
  returning public.carts.updated_at into v_updated_at;

  if v_updated_at is null then
    raise exception 'CART_NOT_ACTIVE';
  end if;

  insert into public.cart_items (cart_id, product_id, variant_id, quantity, add_ons)
  values (p_cart_id, p_product_id, p_variant_id, p_quantity, p_add_ons)
  on conflict (cart_id, variant_id) do update
    set quantity = public.cart_items.quantity + excluded.quantity,
        add_ons = excluded.add_ons,
        updated_at = now()
    where public.cart_items.quantity + excluded.quantity <= p_max_quantity
  returning public.cart_items.id, public.cart_items.quantity
  into v_item_id, v_quantity;

  if v_item_id is null then
    raise exception 'CART_QUANTITY_EXCEEDED';
  end if;

  return query select v_item_id, v_quantity, v_updated_at;
end;
$$;

revoke execute on function public.add_anonymous_cart_item(uuid, text, text, integer, jsonb, integer)
from public, anon, authenticated;
grant execute on function public.add_anonymous_cart_item(uuid, text, text, integer, jsonb, integer)
to service_role;
