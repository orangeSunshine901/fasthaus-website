// Run against localhost:3000: node scripts/check-returning-visitor.mjs
import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      isMobile: mobile,
      hasTouch: mobile,
    });
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    await page.route("https://**/*", (route) => route.abort());
    await page.clock.install({ time: new Date("2026-11-09T12:00:00+04:00") });
    await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    const consent = page.getByRole("button", { name: "Accept all cookies", exact: true });
    await consent.waitFor();
    const root = page.locator("[data-home-reveal]");
    assert.equal(await root.getAttribute("data-home-reveal"), "pending", "Keep the first-visit reveal");
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
    await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
    await page.reload({ waitUntil: "domcontentloaded" });
    await consent.waitFor();
    await page.waitForFunction(() => document.querySelector("[data-home-reveal]")?.dataset.homeReveal === "revealed");
    await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
    assert.equal(await consent.isVisible(), true, "Reveal returning hero even with consent open");
    await consent.click();
    await consent.waitFor({ state: "hidden" });
    await page.getByRole("link", { name: "Collection", exact: true }).last().click();
    await page.waitForURL("**/collection");
    await page.getByRole("link", { name: "Fasthaus home", exact: true }).last().click();
    await page.waitForURL("http://localhost:3000/");
    await page.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
    assert.equal(await root.getAttribute("data-home-reveal"), "revealed", "Internal return reveals hero");
    await page.evaluate(() => window.scrollTo({ top: 800, behavior: "instant" }));
    await page.waitForTimeout(200);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.mouse.wheel(0, -500);
    await page.waitForTimeout(1000);
    assert.equal(await root.getAttribute("data-home-reveal"), "revealed", "Returning hero stays visible at top");
    console.log(`${mobile ? "Mobile" : "Desktop"}: homepage return checks passed`);

    await page.evaluate(() => {
      sessionStorage.setItem("fasthaus_returning_discount_qualified", "1");
      sessionStorage.setItem("fasthaus_gift_offer_qualified", "1");
      localStorage.removeItem("fasthaus_returning_discount_last_shown");
    });
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("[data-home-reveal]")?.dataset.homeReveal === "revealed");
    await page.waitForTimeout(1000);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    const offer = page.getByRole("complementary", { name: "Returning visitor offer" });
    const interact = () => mobile ? page.touchscreen.tap(180, 280) : page.mouse.click(700, 300);
    const advance = async (ms) => {
      if (ms > 10_000) await page.clock.fastForward(ms);
      else await page.clock.runFor(ms);
      await page.waitForTimeout(100);
    };
    await advance(46_000);
    assert.equal(await offer.count(), 0, "Time alone must not show the discount");
    await interact();
    await interact();
    await interact();
    await advance(4000);
    assert.equal(await offer.count(), 0, "Rapid taps count as one interaction");
    await interact();
    await advance(2500);
    assert.equal(await offer.count(), 0, "Two interactions are insufficient");
    await interact();
    await advance(2000);
    assert.equal(await offer.count(), 0, "Wait for a pause after the third interaction");
    await page.evaluate(() => document.documentElement.classList.add("page-scroll-locked"));
    await advance(2000);
    assert.equal(await offer.count(), 0, "Wait while an overlay locks the page");
    await page.evaluate(() => {
      document.documentElement.classList.remove("page-scroll-locked");
      window.dispatchEvent(new Event("fasthaus:page-scroll-lock-change"));
    });
    await advance(1000);
    assert.equal(await offer.count(), 1, "Show after engagement and a pause");
    assert.ok(await page.evaluate(() => Number(localStorage.getItem("fasthaus_returning_discount_last_shown"))), "Remember the impression");
    await page.clock.resume();
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => document.querySelector("[data-home-reveal]")?.dataset.homeReveal === "revealed");
    await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1000));
    await advance(46_000);
    for (let i = 0; i < 3; i++) {
      await interact();
      await advance(3000);
    }
    assert.equal(await offer.count(), 0, "Cooldown survives reload and renewed engagement");
    await page.clock.resume();
    const revisit = await context.newPage();
    revisit.setDefaultTimeout(10_000);
    await revisit.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
    await revisit.getByRole("heading", { level: 1 }).waitFor({ state: "visible" });
    assert.equal(await revisit.locator("[data-home-reveal]").getAttribute("data-home-reveal"), "revealed", "A fresh tab remembers the homepage visit");
    console.log(`${mobile ? "Mobile" : "Desktop"}: hero return, timing, interactions, overlays and cooldown passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
