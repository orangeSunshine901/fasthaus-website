import test from "node:test";
import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import { PRODUCTS } from "../lib/data/products.ts";
import {
  buildMetaPurchase,
  deliverMetaPurchase,
  metaPurchaseEventId,
  metaServerConfig,
} from "../lib/analytics/meta-server.ts";
import {
  metaCommerceData,
  metaCookie,
  recentMetaPurchase,
} from "../lib/analytics/meta-shared.ts";
import {
  metaCheckoutAttribution,
  revokeMetaConsent,
  trackMetaPageView,
} from "../lib/analytics/meta-client.ts";

const orderId = "780a68d8-1561-4f42-bc65-bd6730910573";
const variant = PRODUCTS[0].variants[0];
const order = () => ({
  id: orderId,
  status: "confirmed",
  payment_status: "Paid",
  payment_method: "card",
  payment_confirmed_at: new Date(Date.now() - 1000).toISOString(),
  guest_email: "  Buyer@Example.com ",
  shipping_address: { phone: "+971 50 123 4567" },
  total: "314.10",
  shipping_total: "15.00",
});
const items = [{ catalog_variant_id: variant.id, quantity: 1, unit_price: "332.33" }];
const attribution = {
  consent: true,
  fbp: "fb.1.1794480000000.123456789",
  fbc: "fb.1.1794480000000.test_click_id",
  client_ip_address: "192.0.2.1",
  client_user_agent: "Test browser",
};
const config = { pixelId: "123456789012345", token: "test-only-token", version: "v25.0" };

test("Meta purchase uses paid merchandise AED, SKUs and an opaque event ID", () => {
  const paid = order();
  const event = buildMetaPurchase(paid, items, attribution)!;
  assert.ok(event);
  assert.equal(event.event_id, metaPurchaseEventId(orderId));
  assert.match(event.event_id, /^[a-f0-9]{64}$/);
  assert.equal(event.event_time, Math.floor(Date.parse(paid.payment_confirmed_at) / 1000));
  assert.equal(event.custom_data.currency, "AED");
  assert.equal(event.custom_data.value, 299.1);
  assert.deepEqual(event.custom_data.content_ids, [variant.sku]);
  assert.equal(new URL(event.event_source_url).pathname, "/checkout");
  assert.equal("em" in event.user_data, false);
  assert.equal("ph" in event.user_data, false);
  assert.equal(event.user_data.fbp, attribution.fbp);
  assert.equal(JSON.stringify(event).includes("Buyer@Example.com"), false);
  assert.equal(JSON.stringify(event).includes("971 50 123"), false);
  assert.equal(JSON.stringify(event).includes(orderId), false);
  assert.deepEqual(
    metaCommerceData([{ item_id: variant.sku, price: 332.33, quantity: 1 }], 299.1),
    event.custom_data
  );
});

test("Meta suppresses denied, pending, failed, test, old and invalid-value purchases", () => {
  assert.equal(buildMetaPurchase(order(), items, { ...attribution, consent: false }), null);
  assert.equal(buildMetaPurchase({ ...order(), status: "pending" }, items, attribution), null);
  assert.equal(
    buildMetaPurchase({ ...order(), status: "failed", payment_confirmed_at: null }, items, attribution),
    null
  );
  assert.equal(
    buildMetaPurchase({ ...order(), payment_confirmed_at: null }, items, attribution),
    null
  );
  assert.equal(buildMetaPurchase({ ...order(), payment_method: "test" }, items, attribution), null);
  assert.ok(buildMetaPurchase({ ...order(), payment_method: "test" }, items, attribution, true));
  assert.equal(buildMetaPurchase({ ...order(), total: "NaN" }, items, attribution), null);
  assert.equal(buildMetaPurchase({ ...order(), shipping_total: "400" }, items, attribution), null);
  assert.equal(buildMetaPurchase(order(), items, { ...attribution, client_user_agent: null }), null);
  assert.equal(buildMetaPurchase(order(), [{ ...items[0], quantity: 0 }], attribution), null);
  assert.equal(recentMetaPurchase(new Date(Date.now() - 25 * 3600_000).toISOString()), false);
  assert.equal(recentMetaPurchase(new Date(Date.now() + 3600_000).toISOString()), false);
  assert.equal(metaCookie("anything; injected=true", "fbp"), undefined);
});

// Models an atomic conditional UPDATE, so overlapping deliveries cannot both claim a row.
function deliveryStore(initial: Record<string, unknown> = {}, paid = order(), beforeRead?: (table: string, row: Record<string, unknown>) => void) {
  const row: Record<string, unknown> = {
    ...attribution,
    order_id: orderId,
    sent_at: null,
    claimed_at: null,
    ...initial,
  };
  const database = {
    from(table: string) {
      beforeRead?.(table, row);
      let changes: Record<string, unknown> | undefined;
      const filters: Array<(candidate: Record<string, unknown>) => boolean> = [];
      const query = {
        update(value: Record<string, unknown>) {
          changes = value;
          return query;
        },
        select() {
          return query;
        },
        eq(key: string, value: unknown) {
          filters.push((candidate) => candidate[key] === value);
          return query;
        },
        is(key: string, value: unknown) {
          return query.eq(key, value);
        },
        or(value: string) {
          const stale = value.split("claimed_at.lt.")[1];
          filters.push(
            (candidate) => candidate.claimed_at === null || String(candidate.claimed_at) < stale
          );
          return query;
        },
        maybeSingle() {
          return Promise.resolve(run());
        },
        then(resolve: (result: unknown) => unknown, reject: (reason: unknown) => unknown) {
          return Promise.resolve(run()).then(resolve, reject);
        },
      };
      function run() {
        if (table === "orders") return { data: paid, error: null };
        if (table === "order_items") return { data: items, error: null };
        if (!filters.every((filter) => filter(row))) return { data: null, error: null };
        if (changes) Object.assign(row, changes);
        return { data: { ...row }, error: null };
      }
      return query;
    },
  };
  return { client: database as unknown as SupabaseClient, row };
}

test("concurrent callbacks and a later page refresh send only one server Purchase", async () => {
  const store = deliveryStore();
  let sent = 0;
  const send: typeof fetch = async (url, options) => {
    sent += 1;
    assert.equal(String(url), "https://graph.facebook.com/v25.0/123456789012345/events");
    assert.equal(
      (options?.headers as Record<string, string>).Authorization,
      "Bearer test-only-token"
    );
    const body = JSON.parse(String(options?.body));
    assert.equal(body.data[0].event_id, metaPurchaseEventId(orderId));
    assert.equal(body.test_event_code, undefined);
    return Response.json({ events_received: 1 });
  };
  const results = await Promise.all([
    deliverMetaPurchase(store.client, orderId, config, send),
    deliverMetaPurchase(store.client, orderId, config, send),
  ]);
  assert.equal(results.filter((result) => result.status === "sent").length, 1);
  assert.equal((await deliverMetaPurchase(store.client, orderId, config, send)).status, "skipped");
  assert.equal(sent, 1);
  assert.ok(store.row.sent_at);
  assert.equal(store.row.client_ip_address, null);
  assert.equal(store.row.fbp, null);
});

test("failed Meta delivery remains retryable and does not fail payment confirmation", async () => {
  const store = deliveryStore();
  const failed: typeof fetch = async () => {
    throw new Error("offline");
  };
  assert.equal((await deliverMetaPurchase(store.client, orderId, config, failed)).status, "failed");
  assert.equal(store.row.sent_at, null);
  assert.equal(store.row.claimed_at, null);
  const retry: typeof fetch = async (_, options) => {
    assert.equal(JSON.parse(String(options?.body)).data[0].event_id, metaPurchaseEventId(orderId));
    return Response.json({ events_received: 1 });
  };
  assert.equal((await deliverMetaPurchase(store.client, orderId, config, retry)).status, "sent");
});

test("consent withdrawn after a delivery claim prevents transmission", async () => {
  const store = deliveryStore({}, order(), (table, row) => {
    if (table === "order_items") row.consent = false;
  });
  let sent = false;
  const send: typeof fetch = async () => { sent = true; return Response.json({ events_received: 1 }); };
  assert.equal((await deliverMetaPurchase(store.client, orderId, config, send)).code, "consent_withdrawn");
  assert.equal(sent, false);
  assert.equal(store.row.sent_at, null);
});

test("Meta rejection stores a safe error code and leaves the order retryable", async () => {
  const store = deliveryStore();
  const send: typeof fetch = async () => Response.json({ error: { code: 190, message: "Never retain a provider message containing a token or customer data." } }, { status: 400 });
  const result = await deliverMetaPurchase(store.client, orderId, config, send);
  assert.equal(result.status, "failed");
  assert.equal(store.row.last_error, "meta_400_190_0");
  assert.equal(store.row.sent_at, null);
  assert.equal(store.row.claimed_at, null);
});

test("an unavailable database cannot throw into payment confirmation", async () => {
  const client = { from() { throw new Error("database unavailable"); } } as unknown as SupabaseClient;
  assert.deepEqual(await deliverMetaPurchase(client, orderId, config), { status: "failed", code: "delivery_unavailable" });
});

test("denied consent and unpaid orders send nothing; a test code is explicit", async () => {
  let sent = 0;
  const send: typeof fetch = async (_, options) => {
    sent += 1;
    assert.equal(JSON.parse(String(options?.body)).test_event_code, "TEST_ONLY");
    return Response.json({ events_received: 1 });
  };
  assert.equal(
    (await deliverMetaPurchase(deliveryStore({ consent: false }).client, orderId, config, send))
      .status,
    "skipped"
  );
  assert.equal(
    (
      await deliverMetaPurchase(
        deliveryStore({}, { ...order(), status: "pending" }).client,
        orderId,
        config,
        send
      )
    ).status,
    "skipped"
  );
  assert.equal(sent, 0);
  assert.equal(
    (
      await deliverMetaPurchase(
        deliveryStore().client,
        orderId,
        { ...config, testCode: "TEST_ONLY" },
        send
      )
    ).status,
    "sent"
  );
});

test("preview and checkout test mode require an explicit server test code", () => {
  const keys = [
    "NEXT_PUBLIC_META_PIXEL_ID",
    "META_CAPI_ACCESS_TOKEN",
    "META_GRAPH_API_VERSION",
    "META_TEST_EVENT_CODE",
    "CHECKOUT_TEST_MODE",
    "VERCEL_ENV",
  ];
  const previous = keys.map((key) => process.env[key]);
  try {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = config.pixelId;
    process.env.META_CAPI_ACCESS_TOKEN = config.token;
    process.env.META_GRAPH_API_VERSION = config.version;
    delete process.env.META_TEST_EVENT_CODE;
    process.env.VERCEL_ENV = "preview";
    assert.equal(metaServerConfig(), null);
    process.env.META_TEST_EVENT_CODE = "TEST_ONLY";
    assert.ok(metaServerConfig());
    delete process.env.META_TEST_EVENT_CODE;
    process.env.VERCEL_ENV = "production";
    process.env.CHECKOUT_TEST_MODE = "true";
    assert.equal(metaServerConfig(), null);
  } finally {
    keys.forEach((key, index) => {
      if (previous[index] === undefined) delete process.env[key];
      else process.env[key] = previous[index];
    });
  }
});

test("browser Pixel stays off before marketing consent and stops after withdrawal", () => {
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const oldPixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const jar = new Map<string, string>();
  const scripts: { onload?: () => void }[] = [];
  const pixelCalls: unknown[][] = [];
  let choice: boolean | null = null;
  const browser = {
    location: new URL("https://www.fasthaus.ae/collection?fbclid=test_click"),
    silktideConsentManager: {
      getInstance: () => ({
        getConsentChoice: (id: string) => (id === "analytics" ? true : choice),
      }),
    },
    fbq: undefined as Window["fbq"],
  };
  const documentMock = {
    get cookie() {
      return [...jar].map(([key, value]) => `${key}=${value}`).join("; ");
    },
    set cookie(value: string) {
      const pair = value.split(";")[0];
      const separator = pair.indexOf("=");
      const name = pair.slice(0, separator);
      if (value.includes("Max-Age=0")) jar.delete(name);
      else jar.set(name, pair.slice(separator + 1));
    },
    getElementById: () => scripts[0],
    createElement: () => ({}),
    head: { appendChild: (script: { onload?: () => void }) => scripts.push(script) },
  };
  try {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = config.pixelId;
    Object.defineProperty(globalThis, "window", { value: browser, configurable: true });
    Object.defineProperty(globalThis, "document", { value: documentMock, configurable: true });
    assert.equal(trackMetaPageView(), false);
    assert.equal(scripts.length, 0);
    assert.equal(jar.size, 0);
    choice = false;
    assert.deepEqual(metaCheckoutAttribution(), { consent: false });
    assert.equal(trackMetaPageView(), false);
    choice = true;
    browser.location = new URL(`https://www.fasthaus.ae/order/${orderId}`);
    assert.equal(trackMetaPageView(), false);
    assert.equal(scripts.length, 0);
    browser.location = new URL("https://www.fasthaus.ae/collection?fbclid=test_click");
    assert.equal(trackMetaPageView(), false);
    assert.equal(scripts.length, 1);
    assert.match(metaCheckoutAttribution().fbc!, /^fb\.1\.\d+\.test_click$/);
    browser.location = new URL(`https://www.fasthaus.ae/order/${orderId}`);
    browser.fbq!.callMethod = (...args) => { pixelCalls.push(args); };
    scripts[0].onload!();
    assert.deepEqual(pixelCalls, []);
    browser.location = new URL("https://www.fasthaus.ae/collection");
    assert.equal(trackMetaPageView(), true);
    assert.equal(trackMetaPageView(), true);
    assert.deepEqual(
      pixelCalls.filter((entry) => entry[0] === "trackSingle"),
      [["trackSingle", config.pixelId, "PageView"]]
    );
    choice = false;
    revokeMetaConsent();
    assert.equal(trackMetaPageView(), false);
    assert.equal(jar.size, 0);
    assert.deepEqual(pixelCalls.at(-1), ["consent", "revoke"]);
  } finally {
    if (oldWindow) Object.defineProperty(globalThis, "window", oldWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (oldDocument) Object.defineProperty(globalThis, "document", oldDocument);
    else Reflect.deleteProperty(globalThis, "document");
    if (oldPixel === undefined) delete process.env.NEXT_PUBLIC_META_PIXEL_ID;
    else process.env.NEXT_PUBLIC_META_PIXEL_ID = oldPixel;
  }
});
