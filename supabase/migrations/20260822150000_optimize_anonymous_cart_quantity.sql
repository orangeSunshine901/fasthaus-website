create or replace function public.update_anonymous_cart_item_quantity(
  p_cart_id uuid,
  p_item_id uuid,
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
  if p_quantity < 1 or p_quantity > p_max_quantity then
    raise exception 'CART_QUANTITY_EXCEEDED';
  end if;

  update public.carts
  set updated_at = now(), expires_at = now() + interval '30 days'
  where id = p_cart_id and status = 'ACTIVE'
  returning public.carts.updated_at into v_updated_at;

  if v_updated_at is null then
    raise exception 'CART_NOT_ACTIVE';
  end if;

  update public.cart_items
  set quantity = p_quantity, add_ons = p_add_ons, updated_at = now()
  where id = p_item_id and cart_id = p_cart_id and variant_id = p_variant_id
  returning public.cart_items.id, public.cart_items.quantity
  into v_item_id, v_quantity;

  if v_item_id is null then
    raise exception 'CART_ITEM_NOT_FOUND';
  end if;

  return query select v_item_id, v_quantity, v_updated_at;
end;
$$;

revoke execute on function public.update_anonymous_cart_item_quantity(uuid, uuid, text, integer, jsonb, integer)
from public, anon, authenticated;
grant execute on function public.update_anonymous_cart_item_quantity(uuid, uuid, text, integer, jsonb, integer)
to service_role;
