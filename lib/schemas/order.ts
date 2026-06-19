import { z } from "zod";

export const OrderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
  "failed",
]);

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  orderId: z.string().uuid(),
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().positive(),
});

export const OrderSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid().nullable(),
  guestEmail: z.string().email().nullable(),
  status: OrderStatusSchema,
  subtotal: z.number().nonnegative(),
  shippingTotal: z.number().nonnegative(),
  total: z.number().positive(),
  shippingAddress: z.record(z.string(), z.unknown()),
  geideaOrderId: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type OrderStatus = z.infer<typeof OrderStatusSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
