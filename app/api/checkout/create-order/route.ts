import { NextResponse } from "next/server";
import { CreateOrderSchema } from "@/lib/schemas/checkout";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = CreateOrderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { contact, shippingAddress, items, addOnIds } = parsed.data;
  const supabase = await createServiceClient();

  // Fetch variant prices from DB to prevent client-side price tampering
  const variantIds = items.map((i) => i.variantId);
  const { data: variants, error: variantsError } = await supabase
    .from("product_variants")
    .select("id, price, stock_quantity")
    .in("id", variantIds);

  if (variantsError || !variants) {
    return NextResponse.json({ error: "Failed to validate cart items" }, { status: 500 });
  }

  const variantMap = new Map(variants.map((v) => [v.id, v]));

  // Validate stock and calculate server-side totals
  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      return NextResponse.json({ error: `Product variant not found` }, { status: 400 });
    }
    if (variant.stock_quantity < item.quantity) {
      return NextResponse.json({ error: `Not enough stock for a selected item` }, { status: 400 });
    }
  }

  const subtotal = items.reduce((sum, item) => {
    const variant = variantMap.get(item.variantId)!;
    return sum + variant.price * item.quantity;
  }, 0);

  const shippingTotal = 0; // Always free

  const total = subtotal + shippingTotal;

  const shippingAddressJson = {
    firstName: shippingAddress.firstName,
    lastName: shippingAddress.lastName,
    line1: shippingAddress.line1,
    line2: shippingAddress.line2 ?? null,
    emirate: shippingAddress.emirate,
    postalCode: shippingAddress.postalCode ?? null,
    phone: contact.phone,
  };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      guest_email: contact.email,
      status: "pending",
      subtotal,
      shipping_total: shippingTotal,
      total,
      shipping_address: shippingAddressJson,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("Order insert error:", orderError);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }

  const orderItems = items.map((item) => ({
    order_id: order.id,
    variant_id: item.variantId,
    quantity: item.quantity,
    unit_price: variantMap.get(item.variantId)!.price,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

  if (itemsError) {
    console.error("Order items insert error:", itemsError);
    return NextResponse.json({ error: "Failed to save order items" }, { status: 500 });
  }

  // Initiate Geidea payment session
  const geideaRes = await fetch(
    "https://api.merchant.geidea.net/payment-intent/api/v2/direct/session",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${process.env.GEIDEA_MERCHANT_ID}:${process.env.GEIDEA_API_PASSWORD}`
        ).toString("base64")}`,
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
    const geideaErr = await geideaRes.text();
    console.error("Geidea session error:", geideaErr);
    return NextResponse.json({ error: "Payment session failed" }, { status: 502 });
  }

  const geideaData = await geideaRes.json();

  // Store Geidea's sessionId on the order
  await supabase
    .from("orders")
    .update({ geidea_order_id: geideaData.session?.id })
    .eq("id", order.id);

  return NextResponse.json({
    orderId: order.id,
    geideaSessionId: geideaData.session?.id,
    paymentUrl: geideaData.session?.paymentUrl,
  });
}
