import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { AFTER_HOURS_DELAY_MS, isAfterHoursInvitationRoute } from "../lib/after-hours.ts";

test("game invitation allows browsing and protects purchase and private routes", () => {
  assert.equal(AFTER_HOURS_DELAY_MS, 120_000);
  for (const path of ["/", "/collection", "/collection/lamps", "/product/nasaq-lamp", "/about", "/faq"]) {
    assert.equal(isAfterHoursInvitationRoute(path), true, path);
  }
  for (const path of ["/cart", "/checkout", "/order/123", "/admin", "/contact", "/after-hours", "/game-test", "/api/cart"]) {
    assert.equal(isAfterHoursInvitationRoute(path), false, path);
  }
});

test("public game has a canonical URL and no inactive discount promise", () => {
  const html = readFileSync(new URL("../public/game-test/index.html", import.meta.url), "utf8");
  const copy = readFileSync(new URL("../public/game-test/i18n.mjs", import.meta.url), "utf8");
  assert.match(html, /rel="canonical" href="https:\/\/www.fasthaus.ae\/after-hours"/);
  assert.doesNotMatch(html + copy, /AFTERHOURS10|Unlock 10%|YOUR DEMO REWARD|noindex/);
});
