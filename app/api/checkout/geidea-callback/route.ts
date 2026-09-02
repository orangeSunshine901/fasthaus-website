import { NextResponse } from "next/server";
import {
  getGeideaEventOrderId,
  verifyGeideaCallback,
  type VerifiedGeideaCallback,
} from "@/lib/payment/geidea-callback";
import { fetchVerifiedGeideaOrder, getGeideaConfig } from "@/lib/payment/geidea";
import { formatGeideaDiagnostic } from "@/lib/payment/geidea-diagnostics";
import { sendPaidOrderEmails } from "@/lib/payment/order-emails";
import { createServiceClient } from "@/lib/supabase/server";

type ShippingAddress = {
  firstName: string;
  lastName: string;
  streetAddress: string;
  line1: string;
  line2: string;
  landmark?: string;
  emirate: string;
  postalCode?: string;
  phone?: string;
};

const EMAIL_CLAIM_LEASE_MS = 5 * 60_000;

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

  const paymentMetadata = {
    geidea_order_id: callback.orderId,
    geidea_reference: callback.reference,
    payment_status: callback.detailedStatus ?? callback.status,
    payment_method: callback.paymentMethod,
  };

  if (
    callback.isPaid &&
    order.status === "confirmed" &&
    order.geidea_order_id &&
    order.geidea_order_id !== callback.orderId
  ) {
    console.error("Received an additional paid Geidea order for a confirmed FastHaus order", {
      merchantReferenceId: order.id,
      confirmedGeideaOrderId: order.geidea_order_id,
      additionalGeideaOrderId: callback.orderId,
    });
    return NextResponse.json({ ok: true });
  }

  if (!callback.isPaid) {
    const { error } = await supabase
      .from("orders")
      .update(paymentMetadata)
      .eq("id", order.id)
      .neq("status", "confirmed");
    if (error) {
      console.error("Could not record Geidea payment status", error);
      return NextResponse.json({ error: "Payment status update failed." }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  const confirmedAt = order.payment_confirmed_at ?? new Date().toISOString();
  const { error: confirmationError } = await supabase
    .from("orders")
    .update({
      ...paymentMetadata,
      status: "confirmed",
      payment_confirmed_at: confirmedAt,
    })
    .eq("id", order.id);
  if (confirmationError) {
    console.error("Could not confirm paid Geidea order", confirmationError);
    return NextResponse.json({ error: "Order confirmation failed." }, { status: 500 });
  }

  const { error: cartError } = await supabase
    .from("carts")
    .update({
      status: "CONVERTED",
      converted_order_id: order.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.cart_id)
    .neq("status", "EXPIRED");
  if (cartError) {
    console.error("Could not convert paid cart", cartError);
    return NextResponse.json({ error: "Cart conversion failed." }, { status: 500 });
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("quantity,unit_price,product_name,variant_name")
    .eq("order_id", order.id);
  if (itemsError) {
    console.error("Could not load paid order items", itemsError);
    return NextResponse.json({ error: "Order items lookup failed." }, { status: 500 });
  }

  const address = order.shipping_address as ShippingAddress;
  const emailClaimedAt = new Date().toISOString();
  const staleEmailClaimBefore = new Date(Date.now() - EMAIL_CLAIM_LEASE_MS).toISOString();
  const { data: emailClaim, error: emailClaimError } = await supabase
    .from("orders")
    .update({ confirmation_emails_claimed_at: emailClaimedAt })
    .eq("id", order.id)
    .is("confirmation_emails_sent_at", null)
    .or(
      `confirmation_emails_claimed_at.is.null,confirmation_emails_claimed_at.lt.${staleEmailClaimBefore}`
    )
    .select("id")
    .maybeSingle();
  if (emailClaimError) {
    console.error("Could not claim paid order email delivery", emailClaimError);
    return NextResponse.json({ error: "Order notification failed." }, { status: 500 });
  }
  if (!emailClaim) return NextResponse.json({ ok: true });

  try {
    await sendPaidOrderEmails({
      orderId: order.id,
      customerEmail: order.guest_email!,
      customerPhone: address.phone,
      items: (items ?? []).map((item) => ({
        name: item.product_name ?? "Product",
        variantColor: item.variant_name ?? "",
        quantity: Number(item.quantity),
        unitPrice: Number(item.unit_price),
      })),
      shippingAddress: address,
      total: Number(order.total),
    });
  } catch (error) {
    const { error: releaseError } = await supabase
      .from("orders")
      .update({ confirmation_emails_claimed_at: null })
      .eq("id", order.id)
      .eq("confirmation_emails_claimed_at", emailClaimedAt)
      .is("confirmation_emails_sent_at", null);
    if (releaseError) console.error("Could not release paid order email claim", releaseError);
    console.error("Could not send paid order emails", error);
    return NextResponse.json({ error: "Order notification failed." }, { status: 500 });
  }

  const { data: emailSent, error: emailSentError } = await supabase
    .from("orders")
    .update({
      confirmation_emails_claimed_at: null,
      confirmation_emails_sent_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("confirmation_emails_claimed_at", emailClaimedAt)
    .is("confirmation_emails_sent_at", null)
    .select("id")
    .maybeSingle();
  if (emailSentError || !emailSent) {
    console.error(
      "Could not record paid order email delivery",
      emailSentError ?? "The email delivery claim was lost."
    );
    return NextResponse.json({ error: "Order notification failed." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
