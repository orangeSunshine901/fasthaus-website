import assert from "node:assert/strict";
import test from "node:test";
import { startGeideaCardCheckout } from "../lib/payment/geidea-client.ts";

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
