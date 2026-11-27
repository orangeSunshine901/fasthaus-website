import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/cart/http";
import { readCartId } from "@/lib/cart/cookie";
import { allowRequest } from "@/lib/cart/rate-limit";
import { createServiceClient } from "@/lib/supabase/server";
import { revokeMetaCheckoutConsent } from "@/lib/analytics/meta-server";

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  if (!allowRequest(request, "meta-consent", 20))
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const cartId = await readCartId();
  if (!cartId) return NextResponse.json({ ok: true });
  try {
    await revokeMetaCheckoutConsent(await createServiceClient(), cartId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Consent update unavailable." }, { status: 503 });
  }
}
