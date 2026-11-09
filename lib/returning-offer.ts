export const RETURN_VISIT_GAP_MS = 30 * 60_000;
export const REACTIVATION_IDLE_MS = 5 * 60_000;
export const DISCOUNT_OFFER_COOLDOWN_MS = 7 * 24 * 60 * 60_000;
export const DISCOUNT_OFFER_DELAY_MS = 45_000;
export const DISCOUNT_INTERACTION_GAP_MS = 2_000;
export const DISCOUNT_QUIET_MS = 3_000;

export function hasDiscountOfferEngagement(activeMs: number, interactions: number, quietMs: number) {
  return activeMs >= DISCOUNT_OFFER_DELAY_MS && interactions >= 3
    && quietMs >= DISCOUNT_QUIET_MS && quietMs < REACTIVATION_IDLE_MS;
}

export function isDiscountOfferOnCooldown(lastShownAt: number, now: number) {
  return Number.isFinite(lastShownAt) && lastShownAt > 0 && now - lastShownAt < DISCOUNT_OFFER_COOLDOWN_MS;
}

export function qualifiesForReturningOffer(lastActiveAt: number, now: number, minimumGapMs: number) {
  return Number.isFinite(lastActiveAt) && lastActiveAt > 0 && now - lastActiveAt >= minimumGapMs;
}
