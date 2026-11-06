// Run against localhost:3000: node scripts/check-design-week-popup.mjs
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const screenshots = "artifacts/design-week-popup";
await mkdir(screenshots, { recursive: true });
const popupName = "Dubai Design Week Marketplace";
const closeName = "Close Dubai Design Week pop-up";

async function visit(viewport, time = "2026-11-06T12:00:00+04:00") {
  const page = await browser.newPage({ viewport });
  await page.route("https://**/*", (route) => route.abort());
  await page.clock.install({ time: new Date(time) });
  await page.goto("http://localhost:3000", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Accept all cookies", exact: true }).waitFor();
  return page;
}

async function accept(page) {
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Accept all cookies", exact: true }).click();
  await page.waitForFunction(() => !document.querySelector("#stcm-banner"));
}

async function show(page) {
  await page.clock.runFor(3000);
  await page.getByRole("dialog", { name: popupName }).waitFor();
  await page.locator('img[src="/pop-up-banner/Fasthaus-DDW-Booth-58-Popup.webp"]').evaluate(
    (image) => image.decode()
  );
}

try {
  for (const [name, viewport, dismissal] of [
    ["desktop", { width: 1440, height: 900 }, "escape"],
    ["mobile", { width: 390, height: 667 }, "close"],
    ["landscape", { width: 667, height: 375 }, "outside"],
    ["small-mobile", { width: 320, height: 568 }, "directions"],
  ]) {
    const page = await visit(viewport);
    const dialog = page.getByRole("dialog", { name: popupName });
    await page.clock.runFor(3500);
    assert.equal(await dialog.count(), 0, "Wait for the cookie prompt to clear");
    await accept(page);
    await page.keyboard.press("ArrowDown");
    await page.clock.runFor(1000);
    const focusTarget = page.getByRole("link", { name: "Fasthaus home", exact: true }).first();
    await focusTarget.focus();
    await page.clock.runFor(1800);
    assert.equal(await dialog.count(), 0, "Do not display before two seconds");
    await show(page);
    assert.match(await dialog.innerText(), /Booth 58 at Dubai Design District/);
    assert.match(await dialog.innerText(), /7–8 November · 10 am–10 pm/);
    const directions = dialog.getByRole("link", { name: "Get directions" });
    const url = new URL(await directions.getAttribute("href"));
    assert.equal(url.hostname, "www.google.com");
    assert.equal(url.pathname, "/maps/dir/");
    assert.equal(url.searchParams.get("destination"), "Dubai Design District, Dubai");
    assert.equal(await directions.getAttribute("rel"), "noopener noreferrer");
    const bounds = await dialog.boundingBox();
    const poster = await dialog.locator("img").boundingBox();
    const close = await dialog.getByRole("button", { name: closeName }).boundingBox();
    const link = await directions.boundingBox();
    for (const rect of [bounds, poster, close, link]) {
      assert.ok(rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= viewport.width + 1 && rect.y + rect.height <= viewport.height + 1,
        `${name}: artwork and controls fit the viewport`);
    }
    assert.ok(Math.abs(poster.width - poster.height) < 1, "Preserve the square artwork");
    assert.ok(close.width >= 44 && close.height >= 44, "Large close target");
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains("page-scroll-locked")), true);
    const scrollY = await page.evaluate(() => window.scrollY);
    await page.keyboard.press("ArrowDown");
    assert.equal(await page.evaluate(() => window.scrollY), scrollY, "Dialog keys must not scroll the background");
    await page.keyboard.press("Tab");
    assert.ok(await dialog.evaluate((el) => el.contains(document.activeElement)), "Focus stays inside the modal");
    await page.screenshot({ path: `${screenshots}/${name}.png`, animations: "disabled", fullPage: true });
    await page.screenshot({ path: `${screenshots}/${name}-viewport.png`, animations: "disabled" });
    if (dismissal === "escape") await page.keyboard.press("Escape");
    else if (dismissal === "outside") await page.mouse.click(2, 2);
    else if (dismissal === "directions") {
      const request = page.context().waitForEvent("request", (req) => req.url().startsWith(url.href));
      await directions.click();
      assert.equal((await request).url(), url.href, "Directions opens the configured map");
    }
    else await dialog.getByRole("button", { name: closeName }).click();
    await dialog.waitFor({ state: "detached" });
    await page.clock.runFor(50);
    assert.equal(await focusTarget.evaluate((el) => el === document.activeElement), true, "Restore previous focus");
    assert.equal(await page.evaluate(() => document.documentElement.classList.contains("page-scroll-locked")), false);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.clock.runFor(5000);
    assert.equal(await dialog.count(), 0, "Refresh must not repeat the pop-up in the same tab");
    await page.close();
    console.log(`${name}: timing, layout, directions, keyboard, dismissal and refresh passed`);
  }

  for (const blocker of ["cart", "mobile-menu"]) {
    const page = await visit({ width: 390, height: 844 });
    await accept(page);
    await page.keyboard.press("ArrowDown");
    await page.clock.runFor(1000);
    await page.getByRole("button", { name: blocker === "cart" ? "Open cart" : "Open menu", exact: true }).click();
    await page.clock.runFor(5000);
    assert.equal(await page.getByRole("dialog", { name: popupName }).count(), 0, `Wait for ${blocker}`);
    await page.keyboard.press("Escape");
    await show(page);
    await page.close();
    console.log(`${blocker}: waits until dismissed`);
  }

  const expired = await visit({ width: 390, height: 844 }, "2026-11-08T22:00:00+04:00");
  await accept(expired);
  await expired.clock.runFor(5000);
  assert.equal(await expired.getByRole("dialog", { name: popupName }).count(), 0, "Do not show after expiry");
  await expired.close();

  const closing = await visit({ width: 390, height: 844 }, "2026-11-08T21:59:54+04:00");
  await accept(closing);
  await show(closing);
  await closing.clock.runFor(6500);
  assert.equal(await closing.getByRole("dialog", { name: popupName }).count(), 0, "Close an open pop-up at expiry");
  await closing.close();
  console.log("Expiry: exact cutoff and automatic close passed");
} finally {
  await browser.close();
}
