import { NextResponse } from "next/server";
import { readCartId } from "@/lib/cart/cookie";
import { fetchVerifiedGeideaOrderByMerchantReference } from "@/lib/payment/geidea";
import { createServiceClient } from "@/lib/supabase/server";

const ORDER_ID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const orderId = requestUrl.searchParams.get("orderId");
  const checkoutUrl = new URL("/checkout?payment=cancelled", requestUrl);
  if (!orderId || !ORDER_ID.test(orderId)) return NextResponse.redirect(checkoutUrl, 303);

  const cartId = await readCartId();
  if (!cartId) return NextResponse.redirect(checkoutUrl, 303);

  const supabase = await createServiceClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id,status")
    .eq("id", orderId)
    .eq("cart_id", cartId)
    .maybeSingle();
  if (!order) return NextResponse.redirect(checkoutUrl, 303);

  if (order.status === "confirmed") {
    return NextResponse.redirect(new URL(`/order/${orderId}`, requestUrl), 303);
  }

  try {
    const geideaOrder = await fetchVerifiedGeideaOrderByMerchantReference(orderId);
    if (geideaOrder?.isPaid) {
      return NextResponse.redirect(new URL(`/order/${orderId}`, requestUrl), 303);
    }
  } catch (error) {
    console.error(
      "Could not verify the returning Geidea payment",
      error instanceof Error ? error.message : error
    );
  }

  return NextResponse.redirect(checkoutUrl, 303);
}
