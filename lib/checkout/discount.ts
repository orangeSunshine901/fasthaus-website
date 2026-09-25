export const CHECKOUT_DISCOUNT_CODE = "FASTE10";

export function discountRateFor(code?: string): number {
  return code?.trim().toUpperCase() === CHECKOUT_DISCOUNT_CODE ? 0.1 : 0;
}
