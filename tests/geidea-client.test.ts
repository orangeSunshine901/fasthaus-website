import assert from "node:assert/strict";
import test from "node:test";
import {
  createGeideaExpressCheckout,
  getPaymentConfirmationDeadline,
  PAYMENT_CONFIRMATION_WINDOW_MS,
  startGeideaCheckout,
} from "../lib/payment/geidea-client.ts";

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

test("starts Geidea's modal checkout and handles its cancel callback", () => {
  const calls: string[] = [];
  class Checkout {
    readonly onSuccess: () => void;
    readonly onError: () => void;
    readonly onCancel: () => void;

    constructor(onSuccess: () => void, onError: () => void, onCancel: () => void) {
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
  startGeideaCheckout("session-123", {
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
      startGeideaCheckout("session-123", {
        onSuccess() {},
        onError() {},
        onCancel() {},
      }),
    /Secure payment could not be loaded/
  );
  delete (globalThis as { window?: unknown }).window;
});

test("creates Geidea Express Checkout with the returned session and callbacks", async () => {
  const calls: unknown[] = [];
  const instance = { mount: (selector: string) => calls.push(["mount", selector]) };
  class ExpressCheckout {
    async create(config: unknown) {
      calls.push(["create", config]);
      return instance;
    }
  }

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { GeideaExpressCheckout: ExpressCheckout },
  });
  const callbacks = {
    onSuccess() {},
    onError() {},
    onCancel() {},
  };
  const checkout = await createGeideaExpressCheckout("session-123", callbacks);
  checkout.mount("#express-checkout");

  assert.deepEqual(calls, [
    ["create", { sessionId: "session-123", ...callbacks }],
    ["mount", "#express-checkout"],
  ]);
  delete (globalThis as { window?: unknown }).window;
});

test("fails clearly when Geidea Express Checkout is unavailable", () => {
  Object.defineProperty(globalThis, "window", { configurable: true, value: {} });
  assert.throws(
    () =>
      createGeideaExpressCheckout("session-123", {
        onSuccess() {},
        onError() {},
        onCancel() {},
      }),
    /Express wallets could not be loaded/
  );
  delete (globalThis as { window?: unknown }).window;
});
