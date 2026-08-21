import assert from "node:assert/strict";
import { effectiveUnitPrice } from "../lib/cart/pricing.ts";
import test from "node:test";
import { cookiePolicy, isEditableCartStatus, lineTotal, toMinorUnits } from "../lib/cart/rules.ts";
import { useCartStore } from "../lib/store/cart.ts";

test("uses integer minor units for money", () => {
  assert.equal(toMinorUnits(299), 29_900);
  assert.equal(lineTotal(29_900, 2), 59_800);
});

test("overrides unit prices for a reversible live-payment pilot", () => {
  assert.equal(effectiveUnitPrice(29_900, ""), 29_900);
  assert.equal(effectiveUnitPrice(29_900, "1"), 100);
  assert.throws(() => effectiveUnitPrice(29_900, "free"));
});

test("uses a secure host-only production cookie", () => {
  const production = cookiePolicy(true);
  assert.equal(production.name, "__Host-fasthaus_cart");
  assert.deepEqual(production.options, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 2_592_000,
  });
  assert.equal("domain" in production.options, false);
});

test("uses an HTTP-compatible localhost cookie", () => {
  const development = cookiePolicy(false);
  assert.equal(development.name, "fasthaus_cart");
  assert.equal(development.options.secure, false);
});

test("allows cart edits while checkout is prepared, but not after conversion", () => {
  assert.equal(isEditableCartStatus("ACTIVE"), true);
  assert.equal(isEditableCartStatus("CHECKOUT_STARTED"), true);
  assert.equal(isEditableCartStatus("CONVERTED"), false);
});

test("adds locally before persistence and rolls back a failed repeat add", async () => {
  const originalFetch = globalThis.fetch;
  let finishRequest: (response: Response) => void = () => undefined;
  globalThis.fetch = (() => new Promise<Response>((resolve) => { finishRequest = resolve; })) as typeof fetch;
  useCartStore.setState({ cartId: null, items: [], addOns: [], loaded: true, pending: [], error: null, drawerOpen: false });
  const item = {
    id: "test-variant", productId: "test-product", productSlug: "test-product",
    productName: "Test product", variantColor: "Orange", price: 299, quantity: 1, image: "/test.png",
  };

  try {
    const saving = useCartStore.getState().addItem(item);
    assert.equal(useCartStore.getState().itemCount(), 1);
    assert.deepEqual(useCartStore.getState().pending, [item.id]);

    finishRequest(new Response(JSON.stringify({
      cartId: "cart-id", itemId: "item-id", variantId: item.id, quantity: 1,
      updatedAt: "2026-08-22T00:00:00.000Z",
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    assert.equal(await saving, true);
    assert.equal(useCartStore.getState().items[0]?.itemId, "item-id");

    globalThis.fetch = (async () => new Response(JSON.stringify({ error: { message: "Out of stock." } }), {
      status: 409, headers: { "Content-Type": "application/json" },
    })) as typeof fetch;
    const failing = useCartStore.getState().addItem({ ...item, quantity: 2 });
    assert.equal(useCartStore.getState().itemCount(), 3);
    assert.equal(await failing, false);
    assert.equal(useCartStore.getState().itemCount(), 1);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
