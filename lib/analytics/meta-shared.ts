export type MetaItem = { item_id: string; price: number; quantity: number };
export type MetaAttribution = { consent: boolean; fbp?: string; fbc?: string };

export function metaCommerceData(items: MetaItem[], value: number) {
  return {
    currency: "AED",
    value,
    content_type: "product",
    content_ids: items.map((item) => item.item_id),
    contents: items.map((item) => ({
      id: item.item_id,
      quantity: item.quantity,
      item_price: item.price,
    })),
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export function metaCookie(value: unknown, kind: "fbp" | "fbc"): string | undefined {
  if (typeof value !== "string" || value.length > 1024) return undefined;
  const pattern =
    kind === "fbp" ? /^fb\.\d+\.\d{10,13}\.\d+$/ : /^fb\.\d+\.\d{10,13}\.[A-Za-z0-9_-]+$/;
  return pattern.test(value) ? value : undefined;
}

export function recentMetaPurchase(paidAt: string | null, now = Date.now()): boolean {
  const time = paidAt ? Date.parse(paidAt) : NaN;
  // Keep callback retries within Meta's event deduplication window.
  return Number.isFinite(time) && time <= now && now - time < 24 * 60 * 60_000;
}
