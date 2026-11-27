import { createHash } from "node:crypto";
import { isIP } from "node:net";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ADD_ONS, PRODUCTS } from "../data/products.ts";
import { absoluteUrl } from "../seo/site.ts";
import {
  metaCommerceData,
  metaCookie,
  recentMetaPurchase,
  type MetaAttribution,
} from "./meta-shared.ts";

type MetaConfig = { pixelId: string; token: string; version: string; testCode?: string };
type AttributionRow = {
  consent: boolean;
  fbp: string | null;
  fbc: string | null;
  client_ip_address: string | null;
  client_user_agent: string | null;
};
type PaidOrder = {
  id: string;
  status: string;
  payment_method: string | null;
  payment_confirmed_at: string | null;
  total: number | string;
  shipping_total: number | string | null;
};
type OrderItem = {
  catalog_variant_id: string | null;
  quantity: number;
  unit_price: number | string;
};
type DeliveryResult = {
  status: "sent" | "skipped" | "failed";
  code?: string;
  events_received?: number;
};

export function metaServerConfig(): MetaConfig | null {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  const version = process.env.META_GRAPH_API_VERSION ?? "v25.0";
  const testCode = process.env.META_TEST_EVENT_CODE;
  if (!pixelId || !/^\d+$/.test(pixelId) || !token || !/^v\d+\.0$/.test(version)) return null;
  if (
    (process.env.CHECKOUT_TEST_MODE === "true" ||
      (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production")) &&
    !testCode
  )
    return null;
  return { pixelId, token, version, testCode };
}

const clearedAttribution = {
  fbp: null,
  fbc: null,
  client_ip_address: null,
  client_user_agent: null,
};
export function metaPurchaseEventId(orderId: string): string {
  return createHash("sha256").update(`fasthaus:purchase:${orderId}`).digest("hex");
}

export function buildMetaPurchase(
  order: PaidOrder,
  items: OrderItem[],
  attribution: AttributionRow,
  allowTest = false,
  now = Date.now()
) {
  if (
    !attribution.consent ||
    order.status !== "confirmed" ||
    (order.payment_method === "test" && !allowTest) ||
    !recentMetaPurchase(order.payment_confirmed_at, now)
  )
    return null;
  const value = Math.round((Number(order.total) - Number(order.shipping_total ?? 0)) * 100) / 100;
  if (!Number.isFinite(value) || value <= 0 || items.length === 0) return null;

  const variants = PRODUCTS.flatMap((product) => product.variants);
  const contents = items.map((item) => {
    const id = item.catalog_variant_id;
    const sku = id?.startsWith("addon:")
      ? ADD_ONS.find((addOn) => addOn.id === id.slice(6))?.sku
      : variants.find((variant) => variant.id === id)?.sku;
    return {
      item_id: sku ?? id ?? "",
      price: Number(item.unit_price),
      quantity: Number(item.quantity),
    };
  });
  if (
    contents.some(
      (item) =>
        !item.item_id ||
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
    )
  )
    return null;

  const fbp = metaCookie(attribution.fbp, "fbp");
  const fbc = metaCookie(attribution.fbc, "fbc");
  const ip = attribution.client_ip_address && isIP(attribution.client_ip_address)
    ? attribution.client_ip_address
    : null;
  if (!attribution.client_user_agent || (!fbp && !fbc && !ip)) return null;

  return {
    event_name: "Purchase",
    event_time: Math.floor(Date.parse(order.payment_confirmed_at!) / 1000),
    event_id: metaPurchaseEventId(order.id),
    action_source: "website",
    event_source_url: absoluteUrl("/checkout"),
    user_data: {
      ...(fbp ? { fbp } : {}),
      ...(fbc ? { fbc } : {}),
      ...(ip ? { client_ip_address: ip } : {}),
      client_user_agent: attribution.client_user_agent,
    },
    custom_data: metaCommerceData(contents, value),
  };
}

export async function saveMetaCheckoutAttribution(
  supabase: SupabaseClient,
  orderId: string,
  cartId: string,
  meta: MetaAttribution | undefined,
  request: Request
): Promise<void> {
  if (!metaServerConfig()) return;
  try {
    const ip = (
      request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for")
    )
      ?.split(",")[0]
      ?.trim();
    const row = {
      order_id: orderId,
      cart_id: cartId,
      consent: meta?.consent === true,
      consent_updated_at: new Date().toISOString(),
      ...clearedAttribution,
      ...(meta?.consent === true
        ? {
            fbp: metaCookie(meta.fbp, "fbp") ?? null,
            fbc: metaCookie(meta.fbc, "fbc") ?? null,
            client_ip_address: ip && isIP(ip) ? ip : null,
            client_user_agent: request.headers.get("user-agent")?.slice(0, 1024) ?? null,
          }
        : {}),
    };
    const { error: insertError } = await supabase
      .from("meta_purchase_events")
      .upsert(row, { onConflict: "order_id", ignoreDuplicates: true });
    if (insertError) throw insertError;
    const { error } = await supabase
      .from("meta_purchase_events")
      .update(row)
      .eq("order_id", orderId)
      .eq("cart_id", cartId)
      .is("sent_at", null)
      .is("claimed_at", null);
    if (error) throw error;
  } catch {
    console.warn("Meta checkout attribution could not be saved; checkout continues.");
  }
}

export async function revokeMetaCheckoutConsent(supabase: SupabaseClient, cartId: string) {
  if (!metaServerConfig()) return;
  const { error } = await supabase
    .from("meta_purchase_events")
    .update({ consent: false, consent_updated_at: new Date().toISOString(), ...clearedAttribution })
    .eq("cart_id", cartId)
    .is("sent_at", null);
  if (error) throw error;
}

export async function deliverMetaPurchase(
  supabase: SupabaseClient,
  orderId: string,
  config = metaServerConfig(),
  send = fetch
): Promise<DeliveryResult> {
  if (!config) return { status: "skipped", code: "unconfigured" };
  const claimedAt = new Date().toISOString();
  let claimed = false;
  try {
    const staleBefore = new Date(Date.now() - 5 * 60_000).toISOString();
    const { data: attribution, error: claimError } = await supabase
      .from("meta_purchase_events")
      .update({ claimed_at: claimedAt, last_error: null })
      .eq("order_id", orderId)
      .eq("consent", true)
      .is("sent_at", null)
      .or(`claimed_at.is.null,claimed_at.lt.${staleBefore}`)
      .select("consent,fbp,fbc,client_ip_address,client_user_agent")
      .maybeSingle();
    if (claimError) throw claimError;
    if (!attribution) return { status: "skipped", code: "no_pending_event" };
    claimed = true;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id,status,payment_method,payment_confirmed_at,total,shipping_total")
      .eq("id", orderId)
      .maybeSingle();
    if (orderError) throw orderError;
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("catalog_variant_id,quantity,unit_price")
      .eq("order_id", orderId);
    if (itemsError) throw itemsError;
    const event = order
      ? buildMetaPurchase(order, items ?? [], attribution, Boolean(config.testCode))
      : null;
    if (!event) return { status: "skipped", code: "ineligible_order" };

    const { data: current, error: consentError } = await supabase
      .from("meta_purchase_events")
      .select("consent")
      .eq("order_id", orderId)
      .maybeSingle();
    if (consentError) throw consentError;
    if (!current?.consent) return { status: "skipped", code: "consent_withdrawn" };

    const response = await send(
      `https://graph.facebook.com/${config.version}/${config.pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${config.token}` },
        body: JSON.stringify({
          data: [event],
          ...(config.testCode ? { test_event_code: config.testCode } : {}),
        }),
        signal: AbortSignal.timeout(5000),
      }
    );
    const result = (await response.json()) as {
      events_received?: number;
      error?: { code?: number; error_subcode?: number };
    };
    if (!response.ok || result.events_received !== 1) {
      const code = `meta_${response.status}_${result.error?.code ?? 0}_${result.error?.error_subcode ?? 0}`;
      await supabase
        .from("meta_purchase_events")
        .update({ last_error: code })
        .eq("order_id", orderId)
        .eq("claimed_at", claimedAt);
      return { status: "failed", code };
    }
    const { error: sentError } = await supabase
      .from("meta_purchase_events")
      .update({ sent_at: new Date().toISOString(), last_error: null, ...clearedAttribution })
      .eq("order_id", orderId)
      .eq("claimed_at", claimedAt);
    if (sentError) throw sentError;
    console.info("Meta Purchase accepted", { events_received: result.events_received });
    return { status: "sent", events_received: result.events_received };
  } catch {
    if (claimed) {
      try {
        await supabase
          .from("meta_purchase_events")
          .update({ last_error: "delivery_unavailable" })
          .eq("order_id", orderId)
          .eq("claimed_at", claimedAt);
      } catch {
        /* Payment confirmation is independent of tracking. */
      }
    }
    return { status: "failed", code: "delivery_unavailable" };
  } finally {
    // shortcut: payment callbacks can retry delivery; add a worker if unattended retries are needed.
    if (claimed) {
      try {
        await supabase
          .from("meta_purchase_events")
          .update({ claimed_at: null })
          .eq("order_id", orderId)
          .eq("claimed_at", claimedAt);
      } catch {
        /* The five-minute lease also recovers interrupted attempts. */
      }
    }
  }
}
