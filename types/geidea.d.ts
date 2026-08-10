type GeideaCheckoutCallbackData = {
  responseCode?: string;
  responseMessage?: string;
  detailedResponseCode?: string;
  detailedResponseMessage?: string;
  orderId?: string;
  reference?: string;
};

type GeideaExpressCheckoutInstance = {
  mount(selector: string): void;
};

interface Window {
  GeideaExpressCheckout?: new () => {
    create(config: {
      sessionId: string;
      onSuccess(data: GeideaCheckoutCallbackData): void;
      onError(data: GeideaCheckoutCallbackData): void;
      onCancel(data?: GeideaCheckoutCallbackData): void;
    }): Promise<GeideaExpressCheckoutInstance>;
  };
}
