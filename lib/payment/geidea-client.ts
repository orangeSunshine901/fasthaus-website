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
  return Number.isNaN(sessionDeadline) ? fixedDeadline : Math.min(sessionDeadline, fixedDeadline);
}

export function startGeideaCheckout(sessionId: string, callbacks: Callbacks) {
  const Checkout = window.GeideaCheckout;
  if (!Checkout) throw new Error("Secure payment could not be loaded. Please try again.");
  new Checkout(callbacks.onSuccess, callbacks.onError, callbacks.onCancel).startPayment(sessionId);
}

export function createGeideaExpressCheckout(sessionId: string, callbacks: Callbacks) {
  const ExpressCheckout = window.GeideaExpressCheckout;
  if (!ExpressCheckout) {
    throw new Error("Express wallets could not be loaded. You can still pay by card.");
  }
  return new ExpressCheckout().create({ sessionId, ...callbacks });
}
