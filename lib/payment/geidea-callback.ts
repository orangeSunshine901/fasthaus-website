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
    order: z
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
      .passthrough(),
  })
  .passthrough();

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

  const transactions = order.transactions ?? [];
  const payTransaction =
    [...transactions].reverse().find((transaction) => transaction.type?.toLowerCase() === "pay") ??
    transactions.at(-1);
  const codes = payTransaction?.codes ?? parsed;
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
    reference: parsed.reference ?? order.reference ?? null,
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
