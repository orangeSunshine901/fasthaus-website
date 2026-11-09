import assert from "node:assert/strict";
import test from "node:test";
import { DISCOUNT_OFFER_COOLDOWN_MS, DISCOUNT_OFFER_DELAY_MS, DISCOUNT_QUIET_MS, hasDiscountOfferEngagement, isDiscountOfferOnCooldown, qualifiesForReturningOffer, REACTIVATION_IDLE_MS, RETURN_VISIT_GAP_MS } from "../lib/returning-offer.ts";

const now = Date.UTC(2026, 9, 26, 12);

test("waits for browsing, three interactions and a pause before showing a discount", () => {
  assert.equal(hasDiscountOfferEngagement(0, 0, 0), false);
  assert.equal(hasDiscountOfferEngagement(DISCOUNT_OFFER_DELAY_MS - 1, 3, DISCOUNT_QUIET_MS), false);
  assert.equal(hasDiscountOfferEngagement(DISCOUNT_OFFER_DELAY_MS, 2, DISCOUNT_QUIET_MS), false);
  assert.equal(hasDiscountOfferEngagement(DISCOUNT_OFFER_DELAY_MS, 3, DISCOUNT_QUIET_MS - 1), false);
  assert.equal(hasDiscountOfferEngagement(DISCOUNT_OFFER_DELAY_MS, 3, DISCOUNT_QUIET_MS), true);
  assert.equal(hasDiscountOfferEngagement(DISCOUNT_OFFER_DELAY_MS, 3, REACTIVATION_IDLE_MS), false);
});

test("limits the discount reminder to once every seven days", () => {
  assert.equal(DISCOUNT_OFFER_COOLDOWN_MS, 7 * 24 * 60 * 60_000);
  assert.equal(isDiscountOfferOnCooldown(now, now), true);
  assert.equal(isDiscountOfferOnCooldown(now - DISCOUNT_OFFER_COOLDOWN_MS + 1, now), true);
  assert.equal(isDiscountOfferOnCooldown(now - DISCOUNT_OFFER_COOLDOWN_MS, now), false);
  assert.equal(isDiscountOfferOnCooldown(now - DISCOUNT_OFFER_COOLDOWN_MS - 1, now), false);
  assert.equal(isDiscountOfferOnCooldown(now + 1, now), true);
  for (const invalid of [0, NaN, Infinity, -1]) {
    assert.equal(isDiscountOfferOnCooldown(invalid, now), false);
  }
});

test("distinguishes a return visit from a refresh or a new visitor", () => {
  assert.equal(qualifiesForReturningOffer(now - RETURN_VISIT_GAP_MS, now, RETURN_VISIT_GAP_MS), true);
  assert.equal(qualifiesForReturningOffer(now - RETURN_VISIT_GAP_MS + 1, now, RETURN_VISIT_GAP_MS), false);
  assert.equal(qualifiesForReturningOffer(now - 1000, now, RETURN_VISIT_GAP_MS), false);
  for (const invalid of [0, NaN, Infinity, -1, now + 1]) {
    assert.equal(qualifiesForReturningOffer(invalid, now, RETURN_VISIT_GAP_MS), false);
  }
});

test("reactivation requires at least five minutes without activity", () => {
  assert.equal(qualifiesForReturningOffer(now - REACTIVATION_IDLE_MS, now, REACTIVATION_IDLE_MS), true);
  assert.equal(qualifiesForReturningOffer(now - REACTIVATION_IDLE_MS + 1, now, REACTIVATION_IDLE_MS), false);
});
