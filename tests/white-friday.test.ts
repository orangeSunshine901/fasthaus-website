import assert from "node:assert/strict";
import test from "node:test";
import { isWhiteFridayCode, whiteFridayOfferAt } from "../lib/white-friday.ts";

test("White Friday uses one exclusive code at each Dubai-time boundary", () => {
  const start = Date.parse("2026-11-27T09:00:00+04:00");
  const switchAt = start + 180_000;
  const end = start + 1_800_000;
  const schedule: [number, number, number] = [start, switchAt, end];
  assert.equal(whiteFridayOfferAt(start, null), null);
  assert.equal(whiteFridayOfferAt(start - 1, schedule), null);
  assert.deepEqual(whiteFridayOfferAt(start, schedule), { code: "WHITEFRIDAY20", percent: 20 });
  assert.equal(whiteFridayOfferAt(switchAt - 1, schedule)?.code, "WHITEFRIDAY20");
  assert.deepEqual(whiteFridayOfferAt(switchAt, schedule), { code: "WHITEFRIDAY25", percent: 25 });
  assert.equal(whiteFridayOfferAt(end - 1, schedule)?.code, "WHITEFRIDAY25");
  assert.equal(whiteFridayOfferAt(end, schedule), null);
  assert.equal(whiteFridayOfferAt(end, [start, null, null])?.code, "WHITEFRIDAY20");
  assert.equal(whiteFridayOfferAt(end, [start, switchAt, null])?.code, "WHITEFRIDAY25");
  assert.equal(whiteFridayOfferAt(end, [start, null, end]), null);
  assert.equal(isWhiteFridayCode("WHITEFRIDAY20,WHITEFRIDAY25"), false);
});
