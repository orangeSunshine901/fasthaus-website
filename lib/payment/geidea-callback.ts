import { z } from "zod";
import {
  generateGeideaCallbackSignature,
  timingSafeSignatureEqual,
} from "./geidea-signature.ts";

const CodesSchema = z
  .object({
    responseCode: z.string().optional(),
    responseMessage: z.string().optional(),
    detailedResponseCode: z.string().optional(),
    detailedResponseMessage: z.string().optional(),
  })
  .passthrough();

const PaymentMethodSchema = z
  .object({
    type: z.string().nullish(),
    wallet: z.string().nullish(),
  })
  .passthrough();

const TransactionSchema = z
  .object({
    type: z.string().optional(),
    status: z.string().optional(),
    paymentMethod: PaymentMethodSchema.nullish(),
    codes: CodesSchema.nullish(),
  })
  .passthrough();

const GeideaOrderSchema = z
  .object({
    orderId: z.string().min(1),
    amount: z.coerce.number().positive(),
    totalAmount: z.coerce.number().positive().optional(),
    currency: z.string().min(1),
    status: z.string().min(1),
    detailedStatus: z.string().optional(),
    merchantPublicKey: z.string().min(1),
    merchantReferenceId: z.string().uuid(),
    reference: z.string().nullish(),
    timestamp: z.string().optional(),
    timeStamp: z.string().optional(),
    updatedDate: z.string().optional(),
    paymentMethod: PaymentMethodSchema.nullish(),
    transactions: z.array(TransactionSchema).optional(),
  })
  .passthrough();

const GeideaCallbackSchema = z
  .object({
    signature: z.string().min(1),
    timestamp: z.string().optional(),
    timeStamp: z.string().optional(),
    reference: z.string().nullish(),
    responseCode: z.string().optional(),
    responseMessage: z.string().optional(),
    detailedResponseCode: z.string().optional(),
    detailedResponseMessage: z.string().optional(),
    order: GeideaOrderSchema,
  })
  .passthrough();

const GeideaEventSchema = z
  .object({
    order: z
      .object({
        id: z.string().regex(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i),
      })
      .passthrough(),
  })
  .passthrough();

const GeideaOrderResponseSchema = CodesSchema.extend({ order: GeideaOrderSchema });
const GeideaOrdersResponseSchema = CodesSchema.extend({ orders: z.array(GeideaOrderSchema) });

export type VerifiedGeideaCallback = {
  orderId: string;
  merchantReferenceId: string;
  amount: number;
  totalAmount: number;
  currency: string;
  status: string;
  detailedStatus: string | null;
  reference: string | null;
  paymentMethod: string | null;
  responseCode: string | null;
  responseMessage: string | null;
  detailedResponseCode: string | null;
  detailedResponseMessage: string | null;
  isPaid: boolean;
};

function normalizeGeideaOrder(
  order: z.infer<typeof GeideaOrderSchema>,
  codesSource: z.infer<typeof CodesSchema>,
  reference: string | null
): VerifiedGeideaCallback {
  const transactions = order.transactions ?? [];
  const payTransaction =
    [...transactions].reverse().find((transaction) => transaction.type?.toLowerCase() === "pay") ??
    transactions.at(-1);
  const codes = payTransaction?.codes ?? codesSource;
  const paymentMethod = order.paymentMethod ?? payTransaction?.paymentMethod;
  const responseCode = codes.responseCode ?? null;
  const responseMessage = codes.responseMessage ?? null;
  const detailedResponseCode = codes.detailedResponseCode ?? null;
  const detailedResponseMessage = codes.detailedResponseMessage ?? null;

  return {
    orderId: order.orderId,
    merchantReferenceId: order.merchantReferenceId,
    amount: order.amount,
    totalAmount: order.totalAmount ?? order.amount,
    currency: order.currency,
    status: order.status,
    detailedStatus: order.detailedStatus ?? null,
    reference,
    paymentMethod: paymentMethod?.wallet ?? paymentMethod?.type ?? null,
    responseCode,
    responseMessage,
    detailedResponseCode,
    detailedResponseMessage,
    isPaid:
      order.status === "Success" &&
      order.detailedStatus === "Paid" &&
      responseCode === "000" &&
      responseMessage === "Success" &&
      detailedResponseCode === "000" &&
      detailedResponseMessage === "The operation was successful",
  };
}

export function getGeideaEventOrderId(input: unknown): string | null {
  const parsed = GeideaEventSchema.safeParse(input);
  return parsed.success ? parsed.data.order.id : null;
}

export function verifyGeideaOrderResponse(
  input: unknown,
  expected: { merchantPublicKey: string; orderId: string }
): VerifiedGeideaCallback {
  const parsed = GeideaOrderResponseSchema.parse(input);
  if (parsed.responseCode !== "000" || parsed.detailedResponseCode !== "000") {
    throw new Error("Geidea order lookup was not successful.");
  }
  if (parsed.order.orderId !== expected.orderId) {
    throw new Error("Geidea order lookup returned a different order.");
  }
  if (parsed.order.merchantPublicKey !== expected.merchantPublicKey) {
    throw new Error("Geidea order merchant public key does not match.");
  }
  return normalizeGeideaOrder(parsed.order, parsed, parsed.order.reference ?? null);
}

export function verifyGeideaOrdersResponse(
  input: unknown,
  expected: { merchantPublicKey: string; merchantReferenceId: string }
): VerifiedGeideaCallback | null {
  const parsed = GeideaOrdersResponseSchema.parse(input);
  if (parsed.responseCode !== "000" || parsed.detailedResponseCode !== "000") {
    throw new Error("Geidea order lookup was not successful.");
  }
  const orders = parsed.orders
    .filter(
      (order) =>
        order.merchantPublicKey === expected.merchantPublicKey &&
        order.merchantReferenceId === expected.merchantReferenceId
    )
    .map((order) => normalizeGeideaOrder(order, parsed, order.reference ?? null));
  return orders.find((order) => order.isPaid) ?? orders.at(-1) ?? null;
}

export function verifyGeideaCallback(
  input: unknown,
  credentials: { merchantPublicKey: string; apiPassword: string }
): VerifiedGeideaCallback {
  const parsed = GeideaCallbackSchema.parse(input);
  const { order } = parsed;
  if (order.merchantPublicKey !== credentials.merchantPublicKey) {
    throw new Error("Callback merchant public key does not match.");
  }

  const timestamp =
    parsed.timestamp ??
    parsed.timeStamp ??
    order.timestamp ??
    order.timeStamp ??
    order.updatedDate;
  if (!timestamp) throw new Error("Callback timestamp is missing.");

  const expectedSignature = generateGeideaCallbackSignature({
    merchantPublicKey: order.merchantPublicKey,
    amount: order.amount,
    currency: order.currency,
    orderId: order.orderId,
    status: order.status,
    merchantReferenceId: order.merchantReferenceId,
    timestamp,
    apiPassword: credentials.apiPassword,
  });
  if (!timingSafeSignatureEqual(parsed.signature, expectedSignature)) {
    throw new Error("Callback signature is invalid.");
  }
  return normalizeGeideaOrder(order, parsed, parsed.reference ?? order.reference ?? null);
}
