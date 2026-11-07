import assert from "node:assert/strict";
import test from "node:test";
import { calculateDdwQuote, type DdwOffer } from "../lib/admin/ddw-pricing.ts";

const offer: DdwOffer = {
  discountPercent: 10,
  twoLampDiscountFils: 3000,
  threePlusLampDiscountFils: 6000,
};
const nasaq = { unitPriceFils: 29900, quantity: 1 };
const kasane = { unitPriceFils: 39900, quantity: 1 };

test("applies the 10% DDW discount to a single lamp", () => {
  assert.deepEqual(calculateDdwQuote([nasaq], offer), {
    quantity: 1,
    subtotalFils: 29900,
    eventDiscountFils: 2990,
    bundleDiscountFils: 0,
    totalFils: 26910,
  });
});

test("counts mixed or repeated lamps and applies one bundle discount per quote", () => {
  const pair = calculateDdwQuote([nasaq, kasane], offer);
  assert.equal(pair.bundleDiscountFils, 3000);
  assert.equal(pair.totalFils, 59820);
  const trio = calculateDdwQuote([{ ...nasaq, quantity: 2 }, kasane], offer);
  assert.equal(trio.bundleDiscountFils, 6000);
  assert.equal(trio.totalFils, 83730);
  assert.equal(calculateDdwQuote([{ ...nasaq, quantity: 4 }], offer).bundleDiscountFils, 6000);
});

test("rounds the event discount to a fil and caps discounts at the subtotal", () => {
  assert.equal(calculateDdwQuote([], offer).totalFils, 0);
  const smallQuote = calculateDdwQuote([{ unitPriceFils: 19, quantity: 2 }], offer);
  assert.equal(smallQuote.eventDiscountFils, 4);
  assert.equal(smallQuote.bundleDiscountFils, 34);
  assert.equal(smallQuote.totalFils, 0);
});
