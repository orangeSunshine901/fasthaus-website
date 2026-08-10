import crypto from "node:crypto";

export function formatGeideaAmount(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Geidea amount must be a positive finite number.");
  }
  return amount.toFixed(2);
}

export function formatGeideaTimestamp(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

function sign(data: string, apiPassword: string): string {
  return crypto.createHmac("sha256", apiPassword).update(data, "utf8").digest("base64");
}

export function generateGeideaSessionSignature(input: {
  merchantPublicKey: string;
  amount: number;
  currency: string;
  merchantReferenceId: string;
  timestamp: string;
  apiPassword: string;
}): string {
  const data = [
    input.merchantPublicKey,
    formatGeideaAmount(input.amount),
    input.currency,
    input.merchantReferenceId,
    input.timestamp,
  ].join("");
  return sign(data, input.apiPassword);
}

export function generateGeideaCallbackSignature(input: {
  merchantPublicKey: string;
  amount: number;
  currency: string;
  orderId: string;
  status: string;
  merchantReferenceId: string;
  timestamp: string;
  apiPassword: string;
}): string {
  const data = [
    input.merchantPublicKey,
    formatGeideaAmount(input.amount),
    input.currency,
    input.orderId,
    input.status,
    input.merchantReferenceId,
    input.timestamp,
  ].join("");
  return sign(data, input.apiPassword);
}

export function timingSafeSignatureEqual(actual: string, expected: string): boolean {
  try {
    const actualBytes = Buffer.from(actual, "base64");
    const expectedBytes = Buffer.from(expected, "base64");
    return (
      actualBytes.length > 0 &&
      actualBytes.length === expectedBytes.length &&
      crypto.timingSafeEqual(actualBytes, expectedBytes)
    );
  } catch {
    return false;
  }
}
