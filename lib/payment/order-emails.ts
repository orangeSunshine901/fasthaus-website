import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { OrderConfirmation } from "@/lib/email/OrderConfirmation";
import { ProductionOrderNotification } from "@/lib/email/ProductionOrderNotification";
import { getResend } from "@/lib/email/resend";

type EmailItem = {
  name: string;
  variantColor: string;
  quantity: number;
  unitPrice: number;
};

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

export async function sendPaidOrderEmails(input: {
  orderId: string;
  customerEmail: string;
  customerPhone?: string;
  items: EmailItem[];
  shippingAddress: ShippingAddress;
  total: number;
}) {
  const shortOrderId = input.orderId.slice(0, 8).toUpperCase();
  const resend = getResend();
  const results = await Promise.all([
    resend.emails.send(
      {
        from: "Fasthaus <orders@fasthaus.studio>",
        to: input.customerEmail,
        subject: `Your order #${shortOrderId} is confirmed`,
        react: OrderConfirmation({
          orderId: shortOrderId,
          customerName: input.shippingAddress.firstName,
          items: input.items,
          shippingAddress: input.shippingAddress,
          total: input.total,
        }),
      },
      { idempotencyKey: `order-confirmation-${input.orderId}` }
    ),
    resend.emails.send(
      {
        from: "Fasthaus <orders@fasthaus.studio>",
        to: process.env.PRODUCTION_ORDER_EMAIL ?? "hello@fasthaus.studio",
        subject: `New paid order #${shortOrderId}`,
        react: ProductionOrderNotification({
          orderId: shortOrderId,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          items: input.items,
          shippingAddress: input.shippingAddress,
          total: input.total,
        }),
      },
      { idempotencyKey: `production-order-${input.orderId}` }
    ),
  ]);

  const failure = results.find((result) => result.error);
  if (failure?.error) throw new Error(`Order email delivery failed: ${failure.error.message}`);
}

// Shared by normal callbacks and reconciliation of a paid, expired session.
export async function sendConfirmedOrderEmails(orderId: string) {
  const supabase = await createServiceClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id,guest_email,total,shipping_address,payment_confirmed_at")
    .eq("id", orderId)
    .single();
  if (error) throw error;
  if (!order.payment_confirmed_at) throw new Error("Order payment has not been confirmed.");
  const EMAIL_CLAIM_LEASE_MS = 5 * 60_000;
  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("quantity,unit_price,product_name,variant_name")
    .eq("order_id", order.id);
  if (itemsError) {
    console.error("Could not load paid order items", itemsError);
    throw new Error("Order items lookup failed.");
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
    throw new Error("Order notification failed.");
  }
  if (!emailClaim) return;

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
    throw new Error("Order notification failed.");
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
    throw new Error("Order notification failed.");
  }
}
