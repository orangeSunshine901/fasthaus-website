export type GeideaCheckoutMode = "express" | "standard";

export function getGeideaWalletOptions(mode: GeideaCheckoutMode) {
  if (mode === "express") {
    return {
      expressCheckouts: [
        { wallet: "apple-pay", label: "Apple Pay" },
        { wallet: "google-pay", label: "Google Pay" },
      ],
    };
  }

  return { hideWallets: ["apple-pay", "samsung-pay"] };
}
