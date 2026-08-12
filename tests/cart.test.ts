import assert from "node:assert/strict";
import { effectiveUnitPrice } from "../lib/cart/pricing.ts";
import test from "node:test";
import { cookiePolicy, isEditableCartStatus, lineTotal, toMinorUnits } from "../lib/cart/rules.ts";

test("uses integer minor units for money", () => {
  assert.equal(toMinorUnits(299), 29_900);
  assert.equal(lineTotal(29_900, 2), 59_800);
});

test("overrides unit prices for a reversible live-payment pilot", () => {
  assert.equal(effectiveUnitPrice(29_900, ""), 29_900);
  assert.equal(effectiveUnitPrice(29_900, "1"), 100);
  assert.throws(() => effectiveUnitPrice(29_900, "free"));
});

test("uses a secure host-only production cookie", () => {
  const production = cookiePolicy(true);
  assert.equal(production.name, "__Host-fasthaus_cart");
  assert.deepEqual(production.options, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 2_592_000,
  });
  assert.equal("domain" in production.options, false);
});

test("uses an HTTP-compatible localhost cookie", () => {
  const development = cookiePolicy(false);
  assert.equal(development.name, "fasthaus_cart");
  assert.equal(development.options.secure, false);
});

test("allows cart edits while checkout is prepared, but not after conversion", () => {
  assert.equal(isEditableCartStatus("ACTIVE"), true);
  assert.equal(isEditableCartStatus("CHECKOUT_STARTED"), true);
  assert.equal(isEditableCartStatus("CONVERTED"), false);
});
