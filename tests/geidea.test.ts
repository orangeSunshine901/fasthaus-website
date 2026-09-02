import test from "node:test";
import assert from "node:assert/strict";
import {
  formatGeideaAmount,
  formatGeideaTimestamp,
  generateGeideaCallbackSignature,
  generateGeideaSessionSignature,
  timingSafeSignatureEqual,
} from "../lib/payment/geidea-signature.ts";
import {
  getGeideaEventOrderId,
  verifyGeideaCallback,
  verifyGeideaOrderResponse,
  verifyGeideaOrdersResponse,
} from "../lib/payment/geidea-callback.ts";
import { formatGeideaDiagnostic } from "../lib/payment/geidea-diagnostics.ts";

const merchantPublicKey = "merchant-key";
const apiPassword = "api-password";
const merchantReferenceId = "11111111-1111-4111-8111-111111111111";
// Geidea order GUIDs can use non-RFC variant nibbles such as `c`.
const geideaOrderId = "e4bc51eb-72d0-4663-c565-08def3b74c5d";

test("formats Geidea money and timestamps deterministically", () => {
  assert.equal(formatGeideaAmount(99), "99.00");
  assert.equal(formatGeideaTimestamp(new Date("2026-08-07T10:30:00Z")), "2026/08/07 10:30:00");
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

test("redacts secrets and customer data from Geidea diagnostics", () => {
  const diagnostic = formatGeideaDiagnostic({
    headers: { Authorization: "Basic secret", "set-cookie": "session=secret" },
    signature: "request-specific-signature",
    customer: { email: "customer@example.com", phoneNumber: "+971500000000" },
    cardholderName: "Customer Name",
    maskedCardNumber: "411111******1111",
    authenticationToken: "3ds-secret",
    ipAddress: "192.0.2.1",
  });
  assert.doesNotMatch(
    diagnostic,
    /Basic secret|session=secret|customer@example|971500000000|Customer Name|411111|3ds-secret|192\.0\.2\.1/
  );
  assert.match(diagnostic, /request-specific-signature/);
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
  assert.equal(verifyGeideaCallback(callback, { merchantPublicKey, apiPassword }).isPaid, false);
});

test("authenticates the event callback through a fetched Geidea order", () => {
  const event = {
    result: "SUCCESS",
    order: {
      id: geideaOrderId,
      reference: merchantReferenceId,
      status: "CAPTURED",
    },
  };
  assert.equal(getGeideaEventOrderId(event), geideaOrderId);

  const response = {
    responseCode: "000",
    detailedResponseCode: "000",
    order: validCallback().order,
  };
  const order = verifyGeideaOrderResponse(response, { merchantPublicKey, orderId: geideaOrderId });
  assert.equal(order.isPaid, true);
  assert.equal(order.merchantReferenceId, merchantReferenceId);
  assert.throws(() =>
    verifyGeideaOrderResponse(response, {
      merchantPublicKey,
      orderId: "33333333-3333-4333-8333-333333333333",
    })
  );
});

test("selects a paid Geidea order when checking a merchant return", () => {
  const cancelled = validCallback().order;
  cancelled.status = "Failed";
  cancelled.detailedStatus = "OrderFailed";
  const paid = validCallback().order;
  paid.transactions = [];
  const order = verifyGeideaOrdersResponse(
    {
      responseCode: "000",
      detailedResponseCode: "000",
      orders: [cancelled, paid],
    },
    { merchantPublicKey, merchantReferenceId }
  );
  assert.equal(order?.isPaid, true);
  assert.equal(
    verifyGeideaOrdersResponse(
      { responseCode: "000", detailedResponseCode: "000", orders: [] },
      { merchantPublicKey, merchantReferenceId }
    ),
    null
  );
});
