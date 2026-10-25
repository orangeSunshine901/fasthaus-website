import assert from "node:assert/strict";
import test from "node:test";
import { GIFT_OFFER_DELAY_MS, shouldShowGiftOffer } from "../lib/gift-offer.ts";

const engaged = {
  activeMs: GIFT_OFFER_DELAY_MS,
  viewedLamp: true,
  hasLampInCart: false,
  pathname: "/product/nasaq-lamp",
  dismissed: false,
  blocked: false,
};

test("requires both time browsing and lamp purchase intent", () => {
  assert.equal(shouldShowGiftOffer({ ...engaged, activeMs: GIFT_OFFER_DELAY_MS - 1 }), false);
  assert.equal(shouldShowGiftOffer({ ...engaged, viewedLamp: false }), false);
  assert.equal(shouldShowGiftOffer(engaged), true);
  assert.equal(shouldShowGiftOffer({ ...engaged, viewedLamp: false, hasLampInCart: true }), true);
});

test("only shows on shopping routes and respects dismissal and overlays", () => {
  for (const pathname of ["/", "/collection", "/collection/table-lamps", "/cart"]) {
    assert.equal(shouldShowGiftOffer({ ...engaged, pathname }), true, pathname);
  }
  for (const pathname of ["/checkout", "/checkout/complete", "/order/123", "/admin", "/contact", "/about", "/legal/privacy", "/products"]) {
    assert.equal(shouldShowGiftOffer({ ...engaged, pathname }), false, pathname);
  }
  assert.equal(shouldShowGiftOffer({ ...engaged, dismissed: true }), false);
  assert.equal(shouldShowGiftOffer({ ...engaged, blocked: true }), false);
});
