import { NextResponse } from "next/server";
import { CreateOrderSchema, type CreateOrderInput } from "@/lib/schemas/checkout";
import { validateCartForCheckout } from "@/lib/cart/service";
import { cartErrorResponse, isSameOrigin } from "@/lib/cart/http";
import { readCartId } from "@/lib/cart/cookie";
import { CartError, type CartDto } from "@/lib/cart/types";
import { createServiceClient } from "@/lib/supabase/server";
import { allowRequest } from "@/lib/cart/rate-limit";
import { createGeideaCheckoutSession } from "@/lib/payment/geidea";
import { sendPaidOrderEmails } from "@/lib/payment/order-emails";
import { discountRateFor } from "@/lib/checkout/discount";

type ServiceClient = Awaited<ReturnType<typeof createServiceClient>>;
const CHECKOUT_PAYMENT_MODE = "standard" as const;

type PreparedOrder = {
  order_id: string;
  order_total: number;
  create_session: boolean;
  checkout_session_id: string | null;
  checkout_session_expires_at: string | null;
  checkout_url: string | null;
};

function siteBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_BASE_URL;
  if (!value) throw new Error("NEXT_PUBLIC_BASE_URL is not configured.");
  const url = new URL(value);
  if (process.env.CHECKOUT_TEST_MODE !== "true" && url.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_BASE_URL must use HTTPS for Geidea callbacks.");
  }
  return url.toString().replace(/\/$/, "");
}

function emailItems(cart: CartDto) {
  return cart.items.flatMap((item) => [
    {
      name: item.name,
      variantColor: item.variantName,
      quantity: item.quantity,
      unitPrice: item.unitPrice / 100,
    },
    ...item.addOns.map((addOn) => ({
      name: addOn.name,
      variantColor: `Add-on for ${item.name}`,
      quantity: addOn.quantity,
      unitPrice: addOn.unitPrice / 100,
    })),
  ]);
}

async function prepareOrder(supabase: ServiceClient, cart: CartDto, input: CreateOrderInput) {
  const subtotal = cart.subtotal / 100;
  const discount = subtotal * discountRateFor(input.discountCode);
  const total = Number((subtotal - discount).toFixed(2));
  const shippingAddress = { ...input.shippingAddress, phone: input.contact.phone };
  const orderItems = cart.items.flatMap((item) => [
    {
      catalog_variant_id: item.variantId,
      product_name: item.name,
      variant_name: item.variantName,
      quantity: item.quantity,
      unit_price: item.unitPrice / 100,
    },
    ...item.addOns.map((addOn) => ({
      catalog_variant_id: `addon:${addOn.id}`,
      product_name: addOn.name,
      variant_name: `Add-on for ${item.name}`,
      quantity: addOn.quantity,
      unit_price: addOn.unitPrice / 100,
    })),
  ]);
  const claimExpiresAt = new Date(Date.now() + 30_000).toISOString();
  const { data, error } = await supabase
    .rpc("prepare_checkout_order", {
      p_cart_id: cart.id!,
      p_guest_email: input.contact.email,
      p_subtotal: subtotal,
      p_total: total,
      p_shipping_address: shippingAddress,
      p_items: orderItems,
      p_claim_expires_at: claimExpiresAt,
      p_session_mode: CHECKOUT_PAYMENT_MODE,
    })
    .single();
  if (error || !data) throw error ?? new Error("Order preparation failed.");
  return { ...(data as PreparedOrder), claimExpiresAt };
}

async function waitForCheckoutSession(supabase: ServiceClient, cartId: string) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const { data, error } = await supabase
      .from("carts")
      .select(
        "status,checkout_session_id,checkout_url,checkout_session_expires_at,checkout_session_mode"
      )
      .eq("id", cartId)
      .single();
    if (error) throw error;
    if (
      data.checkout_session_mode === CHECKOUT_PAYMENT_MODE &&
      data.checkout_session_id &&
      data.checkout_url &&
      data.checkout_session_expires_at &&
      Date.parse(data.checkout_session_expires_at) > Date.now() + 30_000
    ) {
      return {
        sessionId: data.checkout_session_id,
        expiresAt: data.checkout_session_expires_at,
        cardRedirectUrl: data.checkout_url,
      };
    }
    if (data.status === "ACTIVE") break;
  }
  throw new CartError(
    "CHECKOUT_FAILED",
    "Secure payment could not be started. Please try again.",
    502
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Cross-origin request rejected." } },
      { status: 403 }
    );
  }
  if (!allowRequest(request, "checkout", 10)) {
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Too many checkout requests." } },
      { status: 429 }
    );
  }

  try {
    const parsed = CreateOrderSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: parsed.error.issues[0]?.message ?? "Invalid request.",
          },
        },
        { status: 400 }
      );
    }

    const cart = await validateCartForCheckout();
    const supabase = await createServiceClient();
    const cookieCartId = await readCartId();
    if (!cookieCartId || cookieCartId !== cart.id) {
      throw new CartError("CART_CONFLICT", "The checkout cart could not be verified.", 409);
    }

    const order = await prepareOrder(supabase, cart, parsed.data);
    if (order.checkout_session_id && order.checkout_url && order.checkout_session_expires_at) {
      return NextResponse.json({
        orderId: order.order_id,
        sessionId: order.checkout_session_id,
        expiresAt: order.checkout_session_expires_at,
        cardRedirectUrl: order.checkout_url,
      });
    }
    if (!order.create_session) {
      const session = await waitForCheckoutSession(supabase, cart.id!);
      return NextResponse.json({ orderId: order.order_id, ...session });
    }

    const baseUrl = siteBaseUrl();

    if (process.env.CHECKOUT_TEST_MODE === "true") {
      const sessionId = `test-geidea-session-${order.order_id}`;
      const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
      const cardRedirectUrl = `${baseUrl}/order/${order.order_id}`;
      const { data: confirmedOrder, error: confirmationError } = await supabase
        .from("orders")
        .update({
          status: "confirmed",
          geidea_session_id: sessionId,
          geidea_session_expires_at: expiresAt,
          geidea_session_mode: CHECKOUT_PAYMENT_MODE,
          geidea_order_id: `test-geidea-order-${order.order_id}`,
          payment_status: "Paid",
          payment_method: "test",
          payment_confirmed_at: new Date().toISOString(),
        })
        .eq("id", order.order_id)
        .eq("geidea_session_expires_at", order.claimExpiresAt)
        .select("id")
        .maybeSingle();
      if (confirmationError) throw confirmationError;
      if (!confirmedOrder) {
        const current = await waitForCheckoutSession(supabase, cart.id!);
        return NextResponse.json({ orderId: order.order_id, ...current });
      }
      const { data: convertedCart, error: conversionError } = await supabase
        .from("carts")
        .update({
          status: "CONVERTED",
          checkout_session_id: sessionId,
          checkout_session_expires_at: expiresAt,
          checkout_session_mode: CHECKOUT_PAYMENT_MODE,
          checkout_url: cardRedirectUrl,
          converted_order_id: order.order_id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cart.id)
        .eq("checkout_session_expires_at", order.claimExpiresAt)
        .is("checkout_session_id", null)
        .select("id")
        .maybeSingle();
      if (conversionError) throw conversionError;
      if (!convertedCart) throw new Error("Checkout claim was lost during test confirmation.");
      await sendPaidOrderEmails({
        orderId: order.order_id,
        customerEmail: parsed.data.contact.email,
        customerPhone: parsed.data.contact.phone,
        items: emailItems(cart),
        shippingAddress: parsed.data.shippingAddress,
        total: Number(order.order_total),
      });
      return NextResponse.json({ orderId: order.order_id, sessionId, expiresAt, cardRedirectUrl });
    }

    let session;
    try {
      session = await createGeideaCheckoutSession({
        paymentMode: CHECKOUT_PAYMENT_MODE,
        amount: Number(order.order_total),
        merchantReferenceId: order.order_id,
        callbackUrl: `${baseUrl}/api/checkout/geidea-callback`,
        customer: {
          email: parsed.data.contact.email,
          phoneNumber: parsed.data.contact.phone,
          firstName: parsed.data.shippingAddress.firstName,
          lastName: parsed.data.shippingAddress.lastName,
        },
      });
    } catch (error) {
      await supabase
        .from("orders")
        .update({ payment_status: "session_failed", geidea_session_expires_at: null })
        .eq("id", order.order_id)
        .eq("geidea_session_expires_at", order.claimExpiresAt);
      await supabase
        .from("carts")
        .update({
          status: "ACTIVE",
          checkout_session_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cart.id)
        .eq("checkout_session_expires_at", order.claimExpiresAt)
        .is("checkout_session_id", null);
      console.error("Geidea session creation failed", error);
      throw new CartError(
        "CHECKOUT_FAILED",
        "Secure payment could not be started. Please try again.",
        502
      );
    }

    const { data: updatedOrder, error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        geidea_session_id: session.sessionId,
        geidea_session_expires_at: session.expiresAt,
        geidea_session_mode: CHECKOUT_PAYMENT_MODE,
        payment_status: "Initiated",
      })
      .eq("id", order.order_id)
      .eq("status", "pending")
      .eq("geidea_session_expires_at", order.claimExpiresAt)
      .select("id")
      .maybeSingle();
    if (orderUpdateError) throw orderUpdateError;
    if (!updatedOrder) {
      const current = await waitForCheckoutSession(supabase, cart.id!);
      return NextResponse.json({ orderId: order.order_id, ...current });
    }

    const { data: updatedCart, error: cartUpdateError } = await supabase
      .from("carts")
      .update({
        status: "CHECKOUT_STARTED",
        checkout_session_id: session.sessionId,
        checkout_session_expires_at: session.expiresAt,
        checkout_session_mode: CHECKOUT_PAYMENT_MODE,
        checkout_url: session.cardRedirectUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cart.id)
      .eq("checkout_session_expires_at", order.claimExpiresAt)
      .is("checkout_session_id", null)
      .select("id")
      .maybeSingle();
    if (cartUpdateError) throw cartUpdateError;
    if (!updatedCart) {
      const current = await waitForCheckoutSession(supabase, cart.id!);
      return NextResponse.json({ orderId: order.order_id, ...current });
    }

    return NextResponse.json({ orderId: order.order_id, ...session });
  } catch (error) {
    return cartErrorResponse(error);
  }
}
