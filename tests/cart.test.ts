import assert from "node:assert/strict";
import { effectiveUnitPrice } from "../lib/cart/pricing.ts";
import test from "node:test";
import { cookiePolicy, isEditableCartStatus, lineTotal, toMinorUnits } from "../lib/cart/rules.ts";
import { useCartStore } from "../lib/store/cart.ts";
import { discountRateFor } from "../lib/checkout/discount.ts";

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

test("updates quantity immediately and batches rapid changes", async () => {
  const originalFetch = globalThis.fetch;
  const requests: Array<{ body: { quantity: number }; finish: (response: Response) => void }> = [];
  globalThis.fetch = ((_url: Parameters<typeof fetch>[0], init?: RequestInit) => new Promise<Response>((resolve) => {
    requests.push({ body: JSON.parse(String(init?.body)), finish: resolve });
  })) as typeof fetch;
  useCartStore.setState({
    cartId: "cart-id", addOns: [], loaded: true, pending: [], error: null, drawerOpen: true,
    items: [{
      id: "test-variant", itemId: "item-id", productId: "test-product", productSlug: "test-product",
      productName: "Test product", variantColor: "Orange", price: 299, quantity: 1, image: "/test.png",
      available: true, maxQuantity: 10, addOns: [],
    }],
  });

  try {
    const syncing = useCartStore.getState().updateQuantity("test-variant", 2);
    assert.equal(useCartStore.getState().itemCount(), 2);
    assert.equal(requests.length, 1);
    await useCartStore.getState().updateQuantity("test-variant", 3);
    assert.equal(useCartStore.getState().itemCount(), 3);
    assert.equal(requests.length, 1);

    requests[0].finish(new Response(JSON.stringify({
      cartId: "cart-id", itemId: "item-id", variantId: "test-variant", quantity: 2,
      updatedAt: "2026-08-22T00:00:00.000Z",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(requests.length, 2);
    assert.equal(requests[1].body.quantity, 3);
    requests[1].finish(new Response(JSON.stringify({
      cartId: "cart-id", itemId: "item-id", variantId: "test-variant", quantity: 3,
      updatedAt: "2026-08-22T00:00:01.000Z",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    await syncing;
    assert.equal(useCartStore.getState().itemCount(), 3);
    assert.deepEqual(useCartStore.getState().pending, []);

    const failing = useCartStore.getState().updateQuantity("test-variant", 4);
    assert.equal(useCartStore.getState().itemCount(), 4);
    requests[2].finish(new Response(JSON.stringify({ error: { message: "Out of stock." } }), {
      status: 409, headers: { "Content-Type": "application/json" },
    }));
    await failing;
    assert.equal(useCartStore.getState().itemCount(), 3);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("removes locally before persistence and rolls back a failed removal", async () => {
  const originalFetch = globalThis.fetch;
  let finishRequest: (response: Response) => void = () => undefined;
  globalThis.fetch = (() => new Promise<Response>((resolve) => { finishRequest = resolve; })) as typeof fetch;
  const item = {
    id: "test-variant", itemId: "item-id", productId: "test-product", productSlug: "test-product",
    productName: "Test product", variantColor: "Orange", price: 299, quantity: 1, image: "/test.png",
    available: true, maxQuantity: 10, addOns: [],
  };
  useCartStore.setState({ cartId: "cart-id", items: [item], addOns: [], loaded: true, pending: [], error: null, drawerOpen: true });

  try {
    const removing = useCartStore.getState().removeItem(item.id);
    assert.equal(useCartStore.getState().itemCount(), 0);
    assert.deepEqual(useCartStore.getState().pending, [item.id]);
    finishRequest(new Response(JSON.stringify({ error: { message: "Removal failed." } }), {
      status: 500, headers: { "Content-Type": "application/json" },
    }));
    await removing;
    assert.equal(useCartStore.getState().itemCount(), 1);
    assert.equal(useCartStore.getState().error, "Removal failed.");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("clears locally before persistence and rolls back a failed clear", async () => {
  const originalFetch = globalThis.fetch;
  let finishRequest: (response: Response) => void = () => undefined;
  globalThis.fetch = (() => new Promise<Response>((resolve) => { finishRequest = resolve; })) as typeof fetch;
  const item = {
    id: "test-variant", itemId: "item-id", productId: "test-product", productSlug: "test-product",
    productName: "Test product", variantColor: "Orange", price: 299, quantity: 1, image: "/test.png",
    available: true, maxQuantity: 10, addOns: [],
  };
  useCartStore.setState({ cartId: "cart-id", items: [item], addOns: [], loaded: true, pending: [], error: null, drawerOpen: true });

  try {
    const clearing = useCartStore.getState().clearCart();
    assert.equal(useCartStore.getState().itemCount(), 0);
    assert.equal(useCartStore.getState().cartId, null);
    finishRequest(new Response(JSON.stringify({ error: { message: "Clear failed." } }), {
      status: 500, headers: { "Content-Type": "application/json" },
    }));
    await clearing;
    assert.equal(useCartStore.getState().itemCount(), 1);
    assert.equal(useCartStore.getState().cartId, "cart-id");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("hydrates immediately from a session snapshot and reconciles with the server", async () => {
  const originalFetch = globalThis.fetch;
  const originalWindow = globalThis.window;
  let finishRequest: (response: Response) => void = () => undefined;
  const cachedItem = {
    id: "cached-variant", itemId: "cached-item", productId: "cached-product", productSlug: "cached-product",
    productName: "Cached product", variantColor: "Orange", price: 299, quantity: 2, image: "/cached.png",
    available: true, maxQuantity: 10, addOns: [],
  };
  const sessionStorage = {
    getItem: (key: string) => key === "fasthaus_cart_snapshot_v1" ? JSON.stringify({ version: 1, items: [cachedItem] }) : null,
    setItem: () => undefined,
    removeItem: () => undefined,
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: { sessionStorage } });
  globalThis.fetch = (() => new Promise<Response>((resolve) => { finishRequest = resolve; })) as typeof fetch;
  useCartStore.setState({ cartId: null, items: [], addOns: [], loaded: false, pending: [], error: null, drawerOpen: false });

  try {
    const hydrating = useCartStore.getState().hydrate();
    assert.equal(useCartStore.getState().itemCount(), 2);
    assert.equal(useCartStore.getState().loaded, true);
    finishRequest(new Response(JSON.stringify({
      id: null, currency: "AED", items: [], itemCount: 0, subtotal: 0, warnings: [],
      updatedAt: "2026-08-22T00:00:00.000Z",
    }), { status: 200, headers: { "Content-Type": "application/json" } }));
    await hydrating;
    assert.equal(useCartStore.getState().itemCount(), 0);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalWindow === undefined) Reflect.deleteProperty(globalThis, "window");
    else Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  }
});

test("uses the same normalized discount rule on client and server", () => {
  assert.equal(discountRateFor(" welcome10 "), 0.1);
  assert.equal(discountRateFor("not-a-code"), 0);
  assert.equal(discountRateFor(), 0);
});
