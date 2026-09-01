import { NextResponse } from "next/server";
import { z } from "zod";
import { readCartId } from "@/lib/cart/cookie";
import { cartErrorResponse, isSameOrigin } from "@/lib/cart/http";
import { allowRequest } from "@/lib/cart/rate-limit";
import { CartError } from "@/lib/cart/types";
import { createServiceClient } from "@/lib/supabase/server";

const CancelCheckoutSchema = z.object({
  orderId: z.string().uuid(),
  sessionId: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Cross-origin request rejected." } },
      { status: 403 }
    );
  }
  if (!allowRequest(request, "checkout-cancel", 10)) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Too many cancellation requests." } },
      { status: 429 }
    );
  }

  try {
    const parsed = CancelCheckoutSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "INVALID_REQUEST", message: "Invalid checkout cancellation." } },
        { status: 400 }
      );
    }

    const cartId = await readCartId();
    if (!cartId) throw new CartError("CART_CONFLICT", "Checkout cart not found.", 409);

    const supabase = await createServiceClient();
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id,cart_id,status,geidea_session_id")
      .eq("id", parsed.data.orderId)
      .maybeSingle();
    if (orderError) throw orderError;
    if (!order || order.cart_id !== cartId) {
      throw new CartError("CART_CONFLICT", "Checkout order not found.", 409);
    }
    if (order.status === "confirmed") {
      return NextResponse.json({ ok: true, confirmed: true });
    }
    if (order.status !== "pending" || order.geidea_session_id !== parsed.data.sessionId) {
      throw new CartError("CART_CONFLICT", "Checkout session has changed.", 409);
    }

    const { data: cart, error: cartError } = await supabase
      .from("carts")
      .update({
        status: "ACTIVE",
        checkout_session_id: null,
        checkout_session_expires_at: null,
        checkout_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cartId)
      .eq("status", "CHECKOUT_STARTED")
      .eq("checkout_session_id", parsed.data.sessionId)
      .select("id")
      .maybeSingle();
    if (cartError) throw cartError;
    if (!cart) throw new CartError("CART_CONFLICT", "Checkout session has changed.", 409);

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({ payment_status: "Cancelled", geidea_session_expires_at: null })
      .eq("id", order.id)
      .eq("status", "pending")
      .eq("geidea_session_id", parsed.data.sessionId);
    if (orderUpdateError) throw orderUpdateError;

    return NextResponse.json({ ok: true, confirmed: false });
  } catch (error) {
    return cartErrorResponse(error);
  }
}
