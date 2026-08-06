import { z } from "zod";

const UAE_PHONE_REGEX = /^(?:\+971|00971|0)?(?:5[024568]\d{7}|[234679]\d{7})$/;

/**
 * The checkout field collects the national number while showing `+971` beside
 * it. Store a consistent, complete number regardless of the input grouping.
 */
function normalizeUaePhone(value: string): string {
  const compact = value.trim().replace(/[\s()-]/g, "");

  if (compact.startsWith("+971") || compact.startsWith("00971")) return compact;
  if (compact.startsWith("0")) return `+971${compact.slice(1)}`;
  return `+971${compact}`;
}

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
    .transform(normalizeUaePhone)
    .pipe(z.string().regex(UAE_PHONE_REGEX, "Please enter a valid UAE phone number (+971…)")),
});

export const CheckoutStep1Schema = ContactSchema.merge(ShippingAddressSchema);

export const CreateOrderSchema = z.object({
  contact: ContactSchema,
  shippingAddress: ShippingAddressSchema,
  discountCode: z.string().trim().max(32).optional(),
}).strict();

export type ShippingAddress = z.infer<typeof ShippingAddressSchema>;
export type ContactInfo = z.infer<typeof ContactSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;
