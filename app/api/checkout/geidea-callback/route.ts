import { NextResponse } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase/server";
import { OrderConfirmation } from "@/lib/email/OrderConfirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

function verifyGeideaSignature(payload: Record<string, string>, signature: string): boolean {
  // Geidea HMAC-SHA256 over sorted key=value pairs joined by &
  const secret = process.env.GEIDEA_WEBHOOK_SECRET!;
  const signatureBase = Object.keys(payload)
    .filter((k) => k !== "signature")
    .sort()
    .map((k) => `${k}=${payload[k]}`)
    .join("&");

  const expected = crypto
    .createHmac("sha256", secret)
    .update(signatureBase)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export async function POST(request: Request) {
  const body = await request.json();

  // Verify HMAC signature
  const { signature, ...payload } = body as Record<string, string>;
  if (!signature || !verifyGeideaSignature(payload, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const { merchantReferenceId: orderId, status, geideaOrderId } = payload;

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  if (status === "Success") {
    // Idempotency: only update if still pending
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, guest_email, total, shipping_address")
      .eq("id", orderId)
      .single();

    if (!order || order.status !== "pending") {
      return NextResponse.json({ ok: true }); // Already processed
    }

    await supabase
      .from("orders")
      .update({ status: "confirmed", geidea_order_id: geideaOrderId })
      .eq("id", orderId);

    // Fetch order items for the confirmation email
    const { data: items } = await supabase
      .from("order_items")
      .select("quantity, unit_price, product_variants(products(name), color)")
      .eq("order_id", orderId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const emailItems = (items ?? []).map((i: any) => ({
      name: i.product_variants?.products?.[0]?.name ?? i.product_variants?.products?.name ?? "Product",
      variantColor: i.product_variants?.color ?? "",
      quantity: i.quantity as number,
      unitPrice: i.unit_price as number,
    }));

    const addr = order.shipping_address as {
      firstName: string;
      lastName: string;
      line1: string;
      line2?: string;
      emirate: string;
      postalCode?: string;
    };

    await resend.emails.send({
      from: "Fasthaus <orders@fasthaus.ae>",
      to: order.guest_email!,
      subject: `Your order #${orderId.slice(0, 8).toUpperCase()} is confirmed`,
      react: OrderConfirmation({
        orderId: orderId.slice(0, 8).toUpperCase(),
        customerName: addr.firstName,
        items: emailItems,
        shippingAddress: addr,
        total: order.total,
      }),
    });
  } else {
    await supabase
      .from("orders")
      .update({ status: "failed" })
      .eq("id", orderId)
      .eq("status", "pending");
  }

  return NextResponse.json({ ok: true });
}
