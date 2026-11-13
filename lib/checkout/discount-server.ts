import "server-only";
import { sendConfirmedOrderEmails } from "@/lib/payment/order-emails";
import { CartError } from "@/lib/cart/types";
import { createServiceClient } from "@/lib/supabase/server";
import { fetchVerifiedGeideaOrderByReference } from "@/lib/payment/geidea";
import { type VerifiedGeideaCallback } from "@/lib/payment/geidea-callback";
import { normalizeDiscountCode } from "./discount";

type ServiceClient = Awaited<ReturnType<typeof createServiceClient>>;

export function checkoutDiscountError(error: { message: string }): never {
  const match = error.message.match(/DISCOUNT_[A-Z_]+: (.+)/);
  if (match) throw new CartError("INVALID_REQUEST", match[1], 409);
  throw error;
}

export async function recordCheckoutPayment(
  supabase: ServiceClient,
  payment: VerifiedGeideaCallback
) {
  const { data, error } = await supabase.rpc("record_checkout_payment", {
    p_order_id: payment.merchantReferenceId,
    p_provider_order_id: payment.orderId,
    p_amount: payment.amount,
    p_currency: payment.currency,
    p_paid: payment.isPaid,
    p_terminal: ["Failed", "Cancelled", "Expired"].includes(payment.status),
    p_status: payment.detailedStatus ?? payment.status,
    p_reference: payment.reference,
    p_method: payment.paymentMethod,
  });
  if (error) throw error;
  if (data === true && payment.isPaid) await sendConfirmedOrderEmails(payment.merchantReferenceId);
  return data === true;
}

export async function recoverExpiredDiscount(supabase: ServiceClient, code: string) {
  if (normalizeDiscountCode(code) !== "MAXINE100") return;
  const { data: offer, error } = await supabase
    .from("checkout_customer_discount")
    .select("reserved_order_id")
    .eq("code", "MAXINE100")
    .single();
  if (error) throw error;
  if (!offer.reserved_order_id) return;
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id,total,geidea_session_id,geidea_session_expires_at")
    .eq("id", offer.reserved_order_id)
    .single();
  if (orderError) throw orderError;
  if (Date.parse(order.geidea_session_expires_at) > Date.now()) return;

  // Expiry alone cannot distinguish abandonment from a delayed successful callback.
  if (order.geidea_session_id) {
    let payment;
    try {
      payment = await fetchVerifiedGeideaOrderByReference(order.id);
    } catch {
      throw new CartError(
        "CHECKOUT_FAILED",
        "The previous payment could not be checked. Please try again shortly.",
        502
      );
    }
    if (payment) {
      if (
        payment.currency !== "AED" ||
        Math.round(payment.amount * 100) !== Math.round(Number(order.total) * 100) ||
        Math.round(payment.totalAmount * 100) !== Math.round(Number(order.total) * 100)
      ) {
        throw new Error("Previous payment values do not match.");
      }
      await recordCheckoutPayment(supabase, payment);
      if (payment.isPaid || !["Failed", "Cancelled", "Expired"].includes(payment.status)) return;
    }
  }
  const { error: releaseError } = await supabase.rpc("release_expired_checkout_discount", {
    p_order_id: order.id,
    p_session_id: order.geidea_session_id,
  });
  if (releaseError) throw releaseError;
}
