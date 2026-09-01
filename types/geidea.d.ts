type GeideaCheckoutCallbackData = {
  responseCode?: string;
  responseMessage?: string;
  detailedResponseCode?: string;
  detailedResponseMessage?: string;
  orderId?: string;
  reference?: string;
};

interface Window {
  GeideaCheckout?: new (
    onSuccess: (data: GeideaCheckoutCallbackData) => void,
    onError: (data: GeideaCheckoutCallbackData) => void,
    onCancel: (data?: GeideaCheckoutCallbackData) => void
  ) => {
    startPayment(sessionId: string): void;
  };
}
