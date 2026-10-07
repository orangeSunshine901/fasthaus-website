// Relative .ts imports keep this loadable by the Node test runner via lib/store/cart.ts.
import { ADD_ONS, PRODUCTS } from "../data/products.ts";
import type { CartItem } from "../store/cart.ts";

// GA4 ecommerce funnel pushes for GTM. Mirrors the purchase push in PurchaseCompleted.tsx:
// item_id is the catalog SKU (the Merchant Center product ID) and add-ons use their own SKU.

export type EcommerceEvent = "view_item" | "add_to_cart" | "begin_checkout";

export type EcommerceItem = {
  item_id: string;
  item_name: string;
  item_variant: string;
  price: number;
  quantity: number;
};

// Same wait as the purchase push: Silktide re-applies stored consent after hydration and
// announces it with this event; pushing before it would reach GTM with consent still denied.
const CONSENT_EVENT = "stcm_consent_update";
const CONSENT_WAIT_MS = 3_000;
const CONSENT_POLL_MS = 100;

const toCents = (amount: number) => Math.round(amount * 100);

const variantSku = (variantId: string) =>
  PRODUCTS.flatMap((product) => product.variants).find((variant) => variant.id === variantId)?.sku;
const addOnSku = (addOnId: string) => ADD_ONS.find((addOn) => addOn.id === addOnId)?.sku;

export function productItem(input: {
  variantId: string;
  productName: string;
  variantName: string;
  price: number;
  quantity: number;
}): EcommerceItem {
  return {
    item_id: variantSku(input.variantId) ?? input.variantId,
    item_name: input.productName,
    item_variant: input.variantName,
    price: toCents(input.price) / 100,
    quantity: input.quantity,
  };
}

export function addOnItem(input: {
  addOnId: string;
  name: string;
  productName: string;
  price: number;
  quantity: number;
}): EcommerceItem {
  return {
    item_id: addOnSku(input.addOnId) ?? `addon:${input.addOnId}`,
    item_name: input.name,
    item_variant: `Add-on for ${input.productName}`,
    price: toCents(input.price) / 100,
    quantity: input.quantity,
  };
}

export function cartEcommerceItems(items: CartItem[]): EcommerceItem[] {
  return items.flatMap((item) => [
    productItem({
      variantId: item.id,
      productName: item.productName,
      variantName: item.variantColor,
      price: item.price,
      quantity: item.quantity,
    }),
    ...(item.addOns ?? []).map((addOn) =>
      addOnItem({
        addOnId: addOn.id,
        name: addOn.name,
        productName: item.productName,
        price: addOn.price,
        quantity: addOn.quantity,
      })
    ),
  ]);
}

export function pushEcommerceEvent(event: EcommerceEvent, items: EcommerceItem[]): void {
  if (typeof window === "undefined" || items.length === 0) return;
  const valueCents = items.reduce((sum, item) => sum + toCents(item.price) * item.quantity, 0);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ ecommerce: null });
  window.dataLayer.push({
    event,
    ecommerce: {
      currency: "AED",
      value: valueCents / 100,
      items,
    },
  });
}

function hasConsentBeenApplied(): boolean {
  return (window.dataLayer ?? []).some(
    (entry) =>
      typeof entry === "object" &&
      entry !== null &&
      (entry as { event?: unknown }).event === CONSENT_EVENT
  );
}

/**
 * For events fired on page load: waits for Silktide's consent event (3s fallback), then pushes.
 * `items` may be a getter, read at push time. Returns a cancel function for useEffect cleanup.
 */
export function pushEcommerceEventWhenConsentReady(
  event: EcommerceEvent,
  items: EcommerceItem[] | (() => EcommerceItem[])
): () => void {
  const push = () => pushEcommerceEvent(event, typeof items === "function" ? items() : items);

  if (hasConsentBeenApplied()) {
    push();
    return () => undefined;
  }

  const startedAt = Date.now();
  const interval = window.setInterval(() => {
    if (hasConsentBeenApplied() || Date.now() - startedAt >= CONSENT_WAIT_MS) {
      window.clearInterval(interval);
      push();
    }
  }, CONSENT_POLL_MS);
  return () => window.clearInterval(interval);
}
