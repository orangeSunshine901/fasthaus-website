import assert from "node:assert/strict";
import test from "node:test";
import { qualifiesForReturningOffer, REACTIVATION_IDLE_MS, RETURN_VISIT_GAP_MS } from "../lib/returning-offer.ts";

const now = Date.UTC(2026, 9, 26, 12);

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
