type Callbacks = {
  onSuccess(data: GeideaCheckoutCallbackData): void;
  onError(data: GeideaCheckoutCallbackData): void;
  onCancel(data?: GeideaCheckoutCallbackData): void;
};

export function startGeideaCardCheckout(sessionId: string, callbacks: Callbacks) {
  const Checkout = window.GeideaCheckout;
  if (!Checkout) throw new Error("Secure payment could not be loaded. Please try again.");
  new Checkout(callbacks.onSuccess, callbacks.onError, callbacks.onCancel).startPayment(sessionId);
}
