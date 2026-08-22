export const WELCOME_DISCOUNT_CODE = "WELCOME10";

export function discountRateFor(code?: string): number {
  return code?.trim().toUpperCase() === WELCOME_DISCOUNT_CODE ? 0.1 : 0;
}
