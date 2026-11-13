import assert from "node:assert/strict";
import test from "node:test";
import {
  discountAmountFor,
  discountRateFor,
  normalizeDiscountCode,
} from "../lib/checkout/discount.ts";
import { ContactSchema } from "../lib/schemas/checkout.ts";

test("MAXINE100 deducts AED 100 once from the merchandise subtotal", () => {
  assert.equal(normalizeDiscountCode(" maxine100 "), "MAXINE100");
  assert.equal(discountAmountFor(" maxine100 ", 987), 100);
  assert.equal(discountAmountFor("MAXINE100", 1974), 100);
});

test("FASTE10 keeps the existing ten percent offer and rounds to fils", () => {
  assert.equal(discountRateFor(" faste10 "), 0.1);
  assert.equal(discountAmountFor(" faste10 ", 987), 98.7);
  assert.equal(discountAmountFor("FASTE10", 100.05), 10.01);
  assert.equal(discountAmountFor("invalid", 100), 0);
  assert.equal(discountAmountFor("FASTE10,MAXINE100", 100), 0);
});

test("a fixed discount cannot exceed the subtotal or create a negative total", () => {
  for (const subtotal of [0, 0.01, 50, 99.99, 100]) {
    assert.equal(discountAmountFor("MAXINE100", subtotal), subtotal);
    assert.equal(subtotal - discountAmountFor("MAXINE100", subtotal), 0);
  }
});

test("server contact validation normalizes email casing and surrounding spaces", () => {
  assert.equal(ContactSchema.shape.email.parse("  CUSTOMER@Example.com  "), "customer@example.com");
});
