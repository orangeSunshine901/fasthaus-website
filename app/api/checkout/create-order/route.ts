import { NextResponse } from "next/server";
import { CreateOrderSchema } from "@/lib/schemas/checkout";
import { validateCartForCheckout } from "@/lib/cart/service";
import { cartErrorResponse, isSameOrigin } from "@/lib/cart/http";
import { readCartId } from "@/lib/cart/cookie";
import { createServiceClient } from "@/lib/supabase/server";
import { allowRequest } from "@/lib/cart/rate-limit";
import { OrderConfirmation } from "@/lib/email/OrderConfirmation";
import { ProductionOrderNotification } from "@/lib/email/ProductionOrderNotification";
import { getResend } from "@/lib/email/resend";

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Cross-origin request rejected." } },
      { status: 403 }
    );
  if (!allowRequest(request, "checkout", 10))
    return NextResponse.json(
      { error: { code: "INVALID_REQUEST", message: "Too many checkout requests." } },
      { status: 429 }
    );
  try {
    const parsed = CreateOrderSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        {
          error: {
            code: "INVALID_REQUEST",
            message: parsed.error.issues[0]?.message ?? "Invalid request.",
          },
        },
        { status: 400 }
      );

    const supabase = await createServiceClient();
    const cookieCartId = await readCartId();
    if (cookieCartId) {
      const { data: started } = await supabase
        .from("carts")
        .select("checkout_url")
        .eq("id", cookieCartId)
        .eq("status", "CHECKOUT_STARTED")
        .maybeSingle();
      if (started?.checkout_url) return NextResponse.json({ paymentUrl: started.checkout_url });
    }

    const cart = await validateCartForCheckout();
    const { contact, shippingAddress } = parsed.data;
    const subtotal = cart.subtotal / 100;
    const discount = parsed.data.discountCode?.toUpperCase() === "WELCOME10" ? subtotal * 0.1 : 0;
    const total = subtotal - discount;
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        cart_id: cart.id,
        guest_email: contact.email,
        status: "pending",
        subtotal,
        shipping_total: 0,
        total,
        shipping_address: { ...shippingAddress, phone: contact.phone },
      })
      .select("id")
      .single();
    if (orderError || !order) throw orderError ?? new Error("Order creation failed");

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

    if (process.env.CHECKOUT_TEST_MODE === "true") {
      const paymentUrl = new URL(`/order/${order.id}`, request.url).toString();
      const testSessionId = `test-geidea-session-${order.id}`;
      const testOrderId = `test-geidea-order-${order.id}`;

      await supabase
        .from("orders")
        .update({ status: "confirmed", geidea_order_id: testOrderId })
        .eq("id", order.id);
      await supabase
        .from("carts")
        .update({
          status: "CONVERTED",
          checkout_session_id: testSessionId,
          checkout_url: paymentUrl,
          converted_order_id: order.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", cart.id)
        .eq("status", "ACTIVE");

      const shortOrderId = order.id.slice(0, 8).toUpperCase();
      const emailItems = cart.items.flatMap((item) => [
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
      const emails = [
        {
          from: "Fasthaus <orders@fasthaus.studio>",
          to: contact.email,
          subject: `Your order #${shortOrderId} is confirmed`,
          react: OrderConfirmation({
            orderId: shortOrderId,
            customerName: shippingAddress.firstName,
            items: emailItems,
            shippingAddress,
            total,
          }),
        },
        {
          from: "Fasthaus <orders@fasthaus.studio>",
          to: process.env.PRODUCTION_ORDER_EMAIL ?? "hello@fasthaus.studio",
          subject: `New paid order #${shortOrderId}`,
          react: ProductionOrderNotification({
            orderId: shortOrderId,
            customerEmail: contact.email,
            customerPhone: contact.phone,
            items: emailItems,
            shippingAddress,
            total,
          }),
        },
      ];
      await Promise.all(emails.map((email) => getResend().emails.send(email)));

      return NextResponse.json({ orderId: order.id, paymentUrl });
    }

    const geideaRes = await fetch(
      "https://api.merchant.geidea.net/payment-intent/api/v2/direct/session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${process.env.GEIDEA_MERCHANT_ID}:${process.env.GEIDEA_API_PASSWORD}`).toString("base64")}`,
        },
        body: JSON.stringify({
          amount: total,
          currency: "AED",
          merchantReferenceId: order.id,
          callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/geidea-callback`,
          returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order/${order.id}`,
          customerEmail: contact.email,
        }),
      }
    );
    if (!geideaRes.ok) {
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      throw new Error(`Geidea returned ${geideaRes.status}`);
    }
    const geideaData = await geideaRes.json();
    const sessionId = geideaData.session?.id;
    const paymentUrl = geideaData.session?.paymentUrl;
    if (!paymentUrl) {
      await supabase.from("orders").update({ status: "failed" }).eq("id", order.id);
      throw new Error("Geidea did not return a payment URL");
    }

    if (sessionId)
      await supabase.from("orders").update({ geidea_order_id: sessionId }).eq("id", order.id);
    await supabase
      .from("carts")
      .update({
        status: "CHECKOUT_STARTED",
        checkout_session_id: sessionId,
        checkout_url: paymentUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cart.id)
      .eq("status", "ACTIVE");
    return NextResponse.json({ orderId: order.id, paymentUrl });
  } catch (error) {
    return cartErrorResponse(error);
  }
}
