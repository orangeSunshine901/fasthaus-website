import "server-only";
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
