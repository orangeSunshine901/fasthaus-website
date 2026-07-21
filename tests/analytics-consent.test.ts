import assert from "node:assert/strict";
import test from "node:test";
import { toAnalyticsConsentState } from "../lib/consent/silktide.ts";

test("maps Silktide analytics choices to the three-state consent model", () => {
  assert.equal(toAnalyticsConsentState(true), "granted");
  assert.equal(toAnalyticsConsentState(false), "denied");
  assert.equal(toAnalyticsConsentState(null), "unknown");
});
