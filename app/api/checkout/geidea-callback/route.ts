import { NextResponse } from "next/server";
import { recordCheckoutPayment } from "@/lib/checkout/discount-server";
import {
  getGeideaEventOrderId,
  verifyGeideaCallback,
  type VerifiedGeideaCallback,
} from "@/lib/payment/geidea-callback";
import { fetchVerifiedGeideaOrder, getGeideaConfig } from "@/lib/payment/geidea";
import { formatGeideaDiagnostic } from "@/lib/payment/geidea-diagnostics";
import { createServiceClient } from "@/lib/supabase/server";

function sameMoney(left: number, right: number): boolean {
  return Math.round(left * 100) === Math.round(right * 100);
}

export async function POST(request: Request) {
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (process.env.GEIDEA_LOG_CALLBACKS === "true") {
    console.info("[Geidea callback received]\n" + formatGeideaDiagnostic(rawBody));
  }

  let callback: VerifiedGeideaCallback;
  const eventOrderId = getGeideaEventOrderId(rawBody);
  if (eventOrderId) {
    try {
      callback = await fetchVerifiedGeideaOrder(eventOrderId);
    } catch (error) {
      console.error(
        "Could not verify Geidea event order",
        error instanceof Error ? error.message : error
      );
      return NextResponse.json({ error: "Payment verification unavailable." }, { status: 502 });
    }
  } else {
    try {
      const config = getGeideaConfig();
      callback = verifyGeideaCallback(rawBody, {
        merchantPublicKey: config.merchantPublicKey,
        apiPassword: config.apiPassword,
      });
    } catch (error) {
      console.warn("Rejected Geidea callback", error instanceof Error ? error.message : error);
      return NextResponse.json({ error: "Invalid callback." }, { status: 401 });
    }
  }

  const supabase = await createServiceClient();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id,status,guest_email,total,shipping_address,cart_id,payment_confirmed_at,geidea_order_id"
    )
    .eq("id", callback.merchantReferenceId)
    .maybeSingle();
  if (orderError) {
    console.error("Could not load callback order", orderError);
    return NextResponse.json({ error: "Order lookup failed." }, { status: 500 });
  }
  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  if (
    callback.currency !== "AED" ||
    !sameMoney(callback.amount, Number(order.total)) ||
    !sameMoney(callback.totalAmount, Number(order.total))
  ) {
    console.warn("Rejected Geidea callback with mismatched order values", {
      merchantReferenceId: callback.merchantReferenceId,
      currency: callback.currency,
    });
    return NextResponse.json({ error: "Order values do not match." }, { status: 400 });
  }

  try {
    const recorded = await recordCheckoutPayment(supabase, callback);
    if (!recorded || !callback.isPaid) return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not record verified Geidea payment", error);
    return NextResponse.json({ error: "Payment confirmation failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
