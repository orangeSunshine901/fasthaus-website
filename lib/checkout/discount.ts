export const CHECKOUT_DISCOUNT_CODE = "FASTE10";

export function discountRateFor(code?: string): number {
  return code?.trim().toUpperCase() === CHECKOUT_DISCOUNT_CODE ? 0.1 : 0;
}

export function normalizeDiscountCode(code: string): string {
  return code.trim().toUpperCase();
}

// Presentation only; eligibility and the final amount are checked in Supabase.
export function discountAmountFor(code: string, subtotal: number): number {
  const cents = Math.max(0, Math.round(subtotal * 100));
  const discount =
    normalizeDiscountCode(code) === "MAXINE100"
      ? 10_000
      : Math.round(cents * discountRateFor(code));
  return Math.min(cents, discount) / 100;
}
