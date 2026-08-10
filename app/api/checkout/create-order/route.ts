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

type ServiceClient = Awaited<ReturnType<typeof createServiceClient>>;

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

async function findOrCreateOrder(supabase: ServiceClient, cart: CartDto, input: CreateOrderInput) {
  const { data: existing } = await supabase
    .from("orders")
    .select("id,total")
    .eq("cart_id", cart.id!)
    .eq("status", "pending")
    .maybeSingle();

  const subtotal = cart.subtotal / 100;
  const discount = input.discountCode?.toUpperCase() === "WELCOME10" ? subtotal * 0.1 : 0;
  const total = Number((subtotal - discount).toFixed(2));
  const shippingAddress = { ...input.shippingAddress, phone: input.contact.phone };

  if (existing) {
    const canReuseSession = Math.round(Number(existing.total) * 100) === Math.round(total * 100);
    const { error } = await supabase
      .from("orders")
      .update({
        guest_email: input.contact.email,
        subtotal,
        total,
        shipping_address: shippingAddress,
      })
      .eq("id", existing.id)
      .eq("status", "pending");
    if (error) throw error;
    return { id: existing.id, total, canReuseSession };
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      cart_id: cart.id,
      guest_email: input.contact.email,
      status: "pending",
      subtotal,
      shipping_total: 0,
      total,
      shipping_address: shippingAddress,
      payment_status: "not_started",
    })
    .select("id")
    .single();
  if (orderError || !order) throw orderError ?? new Error("Order creation failed.");

  const orderItems = cart.items.flatMap((item) => [
    {
      order_id: order.id,
      variant_id: null,
      catalog_variant_id: item.variantId,
      product_name: item.name,
      variant_name: item.variantName,
      quantity: item.quantity,
      unit_price: item.unitPrice / 100,
    },
    ...item.addOns.map((addOn) => ({
      order_id: order.id,
      variant_id: null,
      catalog_variant_id: `addon:${addOn.id}`,
      product_name: addOn.name,
      variant_name: `Add-on for ${item.name}`,
      quantity: addOn.quantity,
      unit_price: addOn.unitPrice / 100,
    })),
  ]);
  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
  if (itemsError) throw itemsError;
  return { id: order.id, total, canReuseSession: false };
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

    const order = await findOrCreateOrder(supabase, cart, parsed.data);
    const { data: started } = await supabase
      .from("carts")
      .select("checkout_session_id,checkout_url,checkout_session_expires_at")
      .eq("id", cart.id)
      .eq("status", "CHECKOUT_STARTED")
      .maybeSingle();
    const expiry = started?.checkout_session_expires_at;
    if (
      order.canReuseSession &&
      started?.checkout_session_id &&
      started.checkout_url &&
      expiry &&
      Date.parse(expiry) > Date.now() + 30_000
    ) {
      return NextResponse.json({
        orderId: order.id,
        sessionId: started.checkout_session_id,
        expiresAt: expiry,
        cardRedirectUrl: started.checkout_url,
      });
    }

    const baseUrl = siteBaseUrl();

    if (process.env.CHECKOUT_TEST_MODE === "true") {
      const sessionId = `test-geidea-session-${order.id}`;
      const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
      const cardRedirectUrl = `${baseUrl}/order/${order.id}`;
      await supabase
        .from("orders")
        .update({
          status: "confirmed",
          geidea_session_id: sessionId,
          geidea_session_expires_at: expiresAt,
          geidea_order_id: `test-geidea-order-${order.id}`,
          payment_status: "Paid",
          payment_method: "test",
          payment_confirmed_at: new Date().toISOString(),
        })
        .eq("id", order.id);
      await supabase
        .from("carts")
        .update({
          status: "CONVERTED",
          checkout_session_id: sessionId,
          checkout_session_expires_at: expiresAt,
          checkout_url: cardRedirectUrl,
          converted_order_id: order.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cart.id);
      await sendPaidOrderEmails({
        orderId: order.id,
        customerEmail: parsed.data.contact.email,
        customerPhone: parsed.data.contact.phone,
        items: emailItems(cart),
        shippingAddress: parsed.data.shippingAddress,
        total: order.total,
      });
      return NextResponse.json({ orderId: order.id, sessionId, expiresAt, cardRedirectUrl });
    }

    let session;
    try {
      session = await createGeideaCheckoutSession({
        amount: order.total,
        merchantReferenceId: order.id,
        callbackUrl: `${baseUrl}/api/checkout/geidea-callback`,
        returnUrl: `${baseUrl}/order/${order.id}`,
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
        .update({ payment_status: "session_failed" })
        .eq("id", order.id)
        .eq("status", "pending");
      console.error("Geidea session creation failed", error);
      throw new CartError(
        "CHECKOUT_FAILED",
        "Secure payment could not be started. Please try again.",
        502
      );
    }

    const { error: orderUpdateError } = await supabase
      .from("orders")
      .update({
        geidea_session_id: session.sessionId,
        geidea_session_expires_at: session.expiresAt,
        payment_status: "Initiated",
      })
      .eq("id", order.id)
      .eq("status", "pending");
    if (orderUpdateError) throw orderUpdateError;

    const { error: cartUpdateError } = await supabase
      .from("carts")
      .update({
        status: "CHECKOUT_STARTED",
        checkout_session_id: session.sessionId,
        checkout_session_expires_at: session.expiresAt,
        checkout_url: session.cardRedirectUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cart.id)
      .in("status", ["ACTIVE", "CHECKOUT_STARTED"]);
    if (cartUpdateError) throw cartUpdateError;

    return NextResponse.json({ orderId: order.id, ...session });
  } catch (error) {
    return cartErrorResponse(error);
  }
}
