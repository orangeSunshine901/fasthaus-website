import assert from "node:assert/strict";
import test from "node:test";
import {
  cancelGeideaCheckout,
  getPaymentConfirmationDeadline,
  PAYMENT_CONFIRMATION_WINDOW_MS,
  startGeideaCardCheckout,
} from "../lib/payment/geidea-client.ts";

test("sends the current order and session when checkout is cancelled", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async (input, init) => {
    assert.equal(input, "/api/checkout/cancel");
    assert.equal(init?.method, "POST");
    assert.deepEqual(JSON.parse(String(init?.body)), {
      orderId: "11111111-1111-4111-8111-111111111111",
      sessionId: "session-123",
    });
    return Response.json({ ok: true, confirmed: false });
  }) as typeof fetch;

  try {
    assert.deepEqual(
      await cancelGeideaCheckout(
        "11111111-1111-4111-8111-111111111111",
        "session-123"
      ),
      { ok: true, confirmed: false }
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("caps payment confirmation polling at the session expiry or two minutes", () => {
  const startedAt = Date.parse("2026-09-02T00:00:00Z");
  assert.equal(
    getPaymentConfirmationDeadline("2026-09-02T00:01:00Z", startedAt),
    Date.parse("2026-09-02T00:01:00Z")
  );
  assert.equal(
    getPaymentConfirmationDeadline("2026-09-02T00:15:00Z", startedAt),
    startedAt + PAYMENT_CONFIRMATION_WINDOW_MS
  );
});

test("starts card checkout and handles Geidea's cancel callback", () => {
  const calls: string[] = [];
  class Checkout {
    readonly onSuccess: () => void;
    readonly onError: () => void;
    readonly onCancel: () => void;

    constructor(
      onSuccess: () => void,
      onError: () => void,
      onCancel: () => void
    ) {
      this.onSuccess = onSuccess;
      this.onError = onError;
      this.onCancel = onCancel;
    }

    startPayment(sessionId: string) {
      calls.push(sessionId);
      this.onCancel();
    }
  }

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { GeideaCheckout: Checkout },
  });
  startGeideaCardCheckout("session-123", {
    onSuccess: () => calls.push("success"),
    onError: () => calls.push("error"),
    onCancel: () => calls.push("cancel"),
  });

  assert.deepEqual(calls, ["session-123", "cancel"]);
  delete (globalThis as { window?: unknown }).window;
});

test("fails clearly when the Geidea SDK is unavailable", () => {
  Object.defineProperty(globalThis, "window", { configurable: true, value: {} });
  assert.throws(
    () =>
      startGeideaCardCheckout("session-123", {
        onSuccess() {},
        onError() {},
        onCancel() {},
      }),
    /Secure payment could not be loaded/
  );
  delete (globalThis as { window?: unknown }).window;
});
