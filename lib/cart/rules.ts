export const CART_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const MAX_CART_QUANTITY = 10;
export const toMinorUnits = (amount: number) => Math.round(amount * 100);
export const lineTotal = (unitPrice: number, quantity: number) => unitPrice * quantity;
export const isEditableCartStatus = (status: string) => status === "ACTIVE" || status === "CHECKOUT_STARTED";

export function cookiePolicy(production: boolean) {
  return {
    name: production ? "__Host-fasthaus_cart" : "fasthaus_cart",
    options: { httpOnly: true, secure: production, sameSite: "lax" as const, path: "/", maxAge: CART_MAX_AGE_SECONDS },
  };
}
