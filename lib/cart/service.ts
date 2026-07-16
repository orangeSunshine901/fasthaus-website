import { randomUUID } from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";
import { clearCartId, readCartId, setCartId } from "./cookie";
import { findAddOn, findVariant, MAX_CART_QUANTITY, toMinorUnits } from "./catalog";
import { CartError, emptyCart, type CartDto } from "./types";

type CartRow = { id: string; status: string; expires_at: string; updated_at: string };
type ItemRow = { id: string; product_id: string; variant_id: string; quantity: number; add_ons: Array<{ id: string; quantity: number }> };

async function activeCart() {
  const id = await readCartId();
  if (!id) return null;
  const supabase = await createServiceClient();
  const { data } = await supabase.from("carts").select("id,status,expires_at,updated_at").eq("id", id).maybeSingle();
  const cart = data as CartRow | null;
  if (!cart || cart.status !== "ACTIVE" || new Date(cart.expires_at) <= new Date()) {
    await clearCartId();
    return null;
  }
  return cart;
}

async function cartDto(cart: CartRow): Promise<CartDto> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase.from("cart_items").select("id,product_id,variant_id,quantity,add_ons").eq("cart_id", cart.id).order("created_at");
  if (error) throw error;
  const warnings: CartDto["warnings"] = [];
  const items = ((data ?? []) as ItemRow[]).map((row) => {
    const catalog = findVariant(row.variant_id);
    const available = !!catalog && catalog.variant.stock >= row.quantity;
    if (!catalog) warnings.push({ code: "UNAVAILABLE", itemId: row.id, message: "This product is no longer available." });
    else if (!available) warnings.push({ code: "STOCK_CHANGED", itemId: row.id, message: `Only ${catalog.variant.stock} are currently available.` });
    const unitPrice = catalog ? toMinorUnits(catalog.variant.price) : 0;
    const addOns = (row.add_ons ?? []).flatMap((saved) => {
      const addOn = findAddOn(saved.id);
      return addOn ? [{ id: addOn.id, name: addOn.name, imageUrl: addOn.image, unitPrice: toMinorUnits(addOn.price), quantity: Math.min(saved.quantity, row.quantity) }] : [];
    });
    const lineTotal = unitPrice * row.quantity + addOns.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    return { itemId: row.id, productId: row.product_id, variantId: row.variant_id, slug: catalog?.product.slug ?? "", name: catalog?.product.name ?? "Unavailable product", variantName: catalog?.variant.color ?? "", imageUrl: catalog?.variant.images[0] ?? null, unitPrice, quantity: row.quantity, lineTotal, available, maxQuantity: catalog ? Math.min(catalog.variant.stock, MAX_CART_QUANTITY) : 0, addOns };
  });
  return { id: cart.id, currency: "AED", items, itemCount: items.reduce((sum, item) => sum + item.quantity, 0), subtotal: items.reduce((sum, item) => sum + item.lineTotal, 0), warnings, updatedAt: cart.updated_at };
}

export async function getCart() {
  const cart = await activeCart();
  return cart ? cartDto(cart) : emptyCart();
}

async function getOrCreateCart() {
  const existing = await activeCart();
  if (existing) return existing;
  const id = randomUUID();
  const supabase = await createServiceClient();
  const { data, error } = await supabase.from("carts").insert({ id }).select("id,status,expires_at,updated_at").single();
  if (error) throw error;
  await setCartId(id);
  return data as CartRow;
}

export async function addCartItem(input: { variantId: string; quantity: number; addOns?: Array<{ id: string; quantity: number }> }) {
  const catalog = findVariant(input.variantId);
  if (!catalog) throw new CartError("VARIANT_NOT_FOUND", "Product variant not found.", 404);
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > MAX_CART_QUANTITY) throw new CartError("INVALID_REQUEST", `Quantity must be between 1 and ${MAX_CART_QUANTITY}.`);
  if (catalog.variant.stock < input.quantity) throw new CartError("OUT_OF_STOCK", "The requested quantity is not available.", 409);
  const addOns = (input.addOns ?? []).filter((item) => findAddOn(item.id)).map((item) => ({ id: item.id, quantity: Math.min(input.quantity, Math.max(1, item.quantity)) }));
  const cart = await getOrCreateCart();
  const supabase = await createServiceClient();
  const { data: existing } = await supabase.from("cart_items").select("quantity").eq("cart_id", cart.id).eq("variant_id", input.variantId).maybeSingle();
  const combinedQuantity = (existing?.quantity ?? 0) + input.quantity;
  if (combinedQuantity > MAX_CART_QUANTITY || combinedQuantity > catalog.variant.stock) throw new CartError("OUT_OF_STOCK", "The requested total quantity is not available.", 409);

  const now = new Date().toISOString();
  const mutation = existing
    ? supabase.from("cart_items").update({ quantity: combinedQuantity, add_ons: addOns, updated_at: now }).eq("cart_id", cart.id).eq("variant_id", input.variantId)
    : supabase.from("cart_items").insert({ cart_id: cart.id, product_id: catalog.product.id, variant_id: input.variantId, quantity: input.quantity, add_ons: addOns });
  const { error } = await mutation;
  if (error) throw new CartError("CART_CONFLICT", "The cart could not be updated. Please try again.", 409);
  const { error: expiryError } = await supabase.from("carts").update({ updated_at: now, expires_at: new Date(Date.now() + 2_592_000_000).toISOString() }).eq("id", cart.id).eq("status", "ACTIVE");
  if (expiryError) throw expiryError;
  await setCartId(cart.id);
  return getCart();
}

export async function updateCartItem(itemId: string, quantity: number, requestedAddOns?: Array<{ id: string; quantity: number }>) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_CART_QUANTITY) throw new CartError("INVALID_REQUEST", `Quantity must be between 1 and ${MAX_CART_QUANTITY}.`);
  const cart = await activeCart();
  if (!cart) throw new CartError("ITEM_NOT_FOUND", "Cart item not found.", 404);
  const supabase = await createServiceClient();
  const { data: item } = await supabase.from("cart_items").select("variant_id,add_ons").eq("id", itemId).eq("cart_id", cart.id).maybeSingle();
  if (!item) throw new CartError("ITEM_NOT_FOUND", "Cart item not found.", 404);
  const catalog = findVariant(item.variant_id);
  if (!catalog || catalog.variant.stock < quantity) throw new CartError("OUT_OF_STOCK", "The requested quantity is not available.", 409);
  const addOns = requestedAddOns?.filter((saved) => findAddOn(saved.id)).map((saved) => ({ id: saved.id, quantity: Math.min(quantity, Math.max(1, saved.quantity)) })) ?? item.add_ons;
  const { error } = await supabase.from("cart_items").update({ quantity, add_ons: addOns, updated_at: new Date().toISOString() }).eq("id", itemId).eq("cart_id", cart.id);
  if (error) throw error;
  await supabase.from("carts").update({ updated_at: new Date().toISOString(), expires_at: new Date(Date.now() + 2_592_000_000).toISOString() }).eq("id", cart.id);
  await setCartId(cart.id);
  return getCart();
}

export async function removeCartItem(itemId: string) {
  const cart = await activeCart();
  if (!cart) throw new CartError("ITEM_NOT_FOUND", "Cart item not found.", 404);
  const supabase = await createServiceClient();
  const { data } = await supabase.from("cart_items").delete().eq("id", itemId).eq("cart_id", cart.id).select("id").maybeSingle();
  if (!data) throw new CartError("ITEM_NOT_FOUND", "Cart item not found.", 404);
  await setCartId(cart.id);
  return getCart();
}

export async function clearCart() {
  const cart = await activeCart();
  if (cart) await (await createServiceClient()).from("carts").delete().eq("id", cart.id);
  await clearCartId();
}

export async function validateCartForCheckout() {
  const cart = await getCart();
  if (!cart.id || !cart.items.length) throw new CartError("CART_EMPTY", "Your cart is empty.", 409);
  if (cart.warnings.length || cart.items.some((item) => !item.available)) throw new CartError("CART_CONFLICT", "Your cart has items that need attention.", 409);
  return cart;
}
