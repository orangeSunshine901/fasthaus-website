import test from "node:test";
import assert from "node:assert/strict";
import {
  formatGeideaAmount,
  formatGeideaTimestamp,
  generateGeideaCallbackSignature,
  generateGeideaSessionSignature,
  timingSafeSignatureEqual,
} from "../lib/payment/geidea-signature.ts";
import { verifyGeideaCallback } from "../lib/payment/geidea-callback.ts";

const merchantPublicKey = "merchant-key";
const apiPassword = "api-password";
const merchantReferenceId = "11111111-1111-4111-8111-111111111111";
const geideaOrderId = "22222222-2222-4222-8222-222222222222";

test("formats Geidea money and timestamps deterministically", () => {
  assert.equal(formatGeideaAmount(99), "99.00");
  assert.equal(
    formatGeideaTimestamp(new Date("2026-08-07T10:30:00Z")),
    "2026/08/07 10:30:00"
  );
  assert.throws(() => formatGeideaAmount(Number.NaN));
});

test("generates the documented Create Session signature", () => {
  const signature = generateGeideaSessionSignature({
    merchantPublicKey,
    apiPassword,
    amount: 99,
    currency: "AED",
    merchantReferenceId,
    timestamp: "2026/08/07 10:30:00",
  });
  assert.equal(signature, "OQz/R5IE5jJ2eBc4j4NNLqLqmNS6dzoHHGy++mf9PGI=");
});

function validCallback() {
  const timestamp = "2026-08-07T10:31:00Z";
  const signature = generateGeideaCallbackSignature({
    merchantPublicKey,
    apiPassword,
    amount: 99,
    currency: "AED",
    orderId: geideaOrderId,
    status: "Success",
    merchantReferenceId,
    timestamp,
  });
  return {
    signature,
    order: {
      orderId: geideaOrderId,
      amount: 99,
      totalAmount: 99,
      currency: "AED",
      status: "Success",
      detailedStatus: "Paid",
      merchantPublicKey,
      merchantReferenceId,
      updatedDate: timestamp,
      paymentMethod: { type: "Card", wallet: "google-pay" },
      transactions: [
        {
          type: "Pay",
          status: "Success",
          codes: {
            responseCode: "000",
            responseMessage: "Success",
            detailedResponseCode: "000",
            detailedResponseMessage: "The operation was successful",
          },
        },
      ],
    },
  };
}

test("verifies a paid nested Geidea callback", () => {
  const callback = verifyGeideaCallback(validCallback(), { merchantPublicKey, apiPassword });
  assert.equal(callback.isPaid, true);
  assert.equal(callback.paymentMethod, "google-pay");
  assert.equal(callback.merchantReferenceId, merchantReferenceId);
});

test("rejects tampered and malformed callback signatures without throwing timing errors", () => {
  const tampered = validCallback();
  tampered.order.amount = 100;
  assert.throws(() => verifyGeideaCallback(tampered, { merchantPublicKey, apiPassword }));
  assert.equal(timingSafeSignatureEqual("bad", "also-bad"), false);
});

test("does not treat incomplete success codes as a paid order", () => {
  const callback = validCallback();
  callback.order.transactions[0].codes.detailedResponseCode = "001";
  callback.signature = generateGeideaCallbackSignature({
    merchantPublicKey,
    apiPassword,
    amount: 99,
    currency: "AED",
    orderId: geideaOrderId,
    status: "Success",
    merchantReferenceId,
    timestamp: callback.order.updatedDate,
  });
  assert.equal(
    verifyGeideaCallback(callback, { merchantPublicKey, apiPassword }).isPaid,
    false
  );
});
