type Callbacks = {
  onSuccess(data: GeideaCheckoutCallbackData): void;
  onError(data: GeideaCheckoutCallbackData): void;
  onCancel(data?: GeideaCheckoutCallbackData): void;
};

export const PAYMENT_CONFIRMATION_WINDOW_MS = 2 * 60 * 1_000;

export function getPaymentConfirmationDeadline(
  sessionExpiresAt: string | null,
  startedAt = Date.now()
) {
  const fixedDeadline = startedAt + PAYMENT_CONFIRMATION_WINDOW_MS;
  const sessionDeadline = sessionExpiresAt ? Date.parse(sessionExpiresAt) : Number.NaN;
  return Number.isNaN(sessionDeadline)
    ? fixedDeadline
    : Math.min(sessionDeadline, fixedDeadline);
}

export async function cancelGeideaCheckout(orderId: string, sessionId: string) {
  const response = await fetch("/api/checkout/cancel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, sessionId }),
  });
  const body = (await response.json()) as {
    ok?: boolean;
    confirmed?: boolean;
    error?: { message?: string };
  };
  if (!response.ok || !body.ok) {
    throw new Error(body.error?.message ?? "Checkout cancellation could not be recorded.");
  }
  return body;
}

export function startGeideaCardCheckout(sessionId: string, callbacks: Callbacks) {
  const Checkout = window.GeideaCheckout;
  if (!Checkout) throw new Error("Secure payment could not be loaded. Please try again.");
  new Checkout(callbacks.onSuccess, callbacks.onError, callbacks.onCancel).startPayment(sessionId);
}
