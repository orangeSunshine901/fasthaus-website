import { z } from "zod";

const UAE_PHONE_REGEX = /^(?:\+971|00971|0)?(?:5[024568]\d{7}|[234679]\d{7})$/;

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;

export const ShippingAddressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  line1: z.string().min(1, "Address is required"),
  line2: z.string().optional(),
  emirate: z.enum(EMIRATES, { error: "Please select an emirate" }),
  postalCode: z.string().optional(),
});

export const ContactSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(UAE_PHONE_REGEX, "Please enter a valid UAE phone number (+971…)"),
});

export const CheckoutStep1Schema = ContactSchema.merge(ShippingAddressSchema);

export const CartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1),
  unitPrice: z.number().positive(),
});

export const CreateOrderSchema = z.object({
  contact: ContactSchema,
  shippingAddress: ShippingAddressSchema,
  items: z.array(CartItemSchema).min(1, "Cart is empty"),
  addOnIds: z.array(z.string()).optional().default([]),
});

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type ContactInfo = z.infer<typeof ContactSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
export type CartItemInput = z.infer<typeof CartItemSchema>;
