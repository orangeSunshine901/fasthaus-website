export const RETURN_VISIT_GAP_MS = 30 * 60_000;
export const REACTIVATION_IDLE_MS = 5 * 60_000;

export function qualifiesForReturningOffer(lastActiveAt: number, now: number, minimumGapMs: number) {
  return Number.isFinite(lastActiveAt) && lastActiveAt > 0 && now - lastActiveAt >= minimumGapMs;
}
