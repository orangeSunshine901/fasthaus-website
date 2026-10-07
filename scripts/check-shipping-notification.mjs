// Run against a local dev server: node scripts/check-shipping-notification.mjs
import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
try {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.route("https://**/*", (route) => route.abort());
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    let signups = 0;
    let purchases = 0;
    await page.route("**/api/cart", (route) => route.fulfill({ json: {
      id: "test-cart", currency: "AED", itemCount: 1, subtotal: 45000, warnings: [], updatedAt: new Date().toISOString(),
      items: [{ itemId: "test-item", productId: "test-product", variantId: "test-variant", slug: "nasaq", name: "NASAQ", variantName: "White", imageUrl: "/newsletter-icon.svg", unitPrice: 45000, quantity: 1, lineTotal: 45000, available: true, maxQuantity: null, addOns: [] }],
    } }));
    await page.route("**/api/checkout/create-order", (route) => {
      purchases++;
      return route.fulfill({ status: 500, json: { error: "Checkout must not start" } });
    });
    await page.route("**/api/contact", (route) => {
      const body = route.request().postDataJSON();
      assert.equal(body.email, "ava@example.com");
      assert.equal(body.subject, "International shipping notification");
      assert.match(body.message, /Saudi Arabia/);
      signups++;
      return route.fulfill(signups === 1
        ? { status: 500, json: { error: "Could not save your request. Please try again." } }
        : { json: { ok: true } });
    });
    await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
    const consent = page.getByRole("button", { name: /Accept all/i });
    await consent.click();
    await page.getByRole("textbox", { name: /^Email/ }).fill("ava@example.com");
    const trigger = page.getByRole("button", { name: "Notify me", exact: true });
    await trigger.click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    assert.equal(await dialog.getByLabel("Email address").inputValue(), "ava@example.com");
    assert.equal(await dialog.getByRole("link", { name: "Privacy Policy" }).getAttribute("href"), "/legal/privacy");
    await dialog.getByRole("button", { name: "Notify me", exact: true }).click();
    assert.equal(signups, 0, "Country is required");
    await dialog.getByLabel("Country or region").fill("   ");
    await dialog.getByRole("button", { name: "Notify me", exact: true }).click();
    await dialog.getByRole("alert").filter({ hasText: "Enter your country or region." }).waitFor();
    assert.equal(signups, 0, "Whitespace is not a country");
    await dialog.getByLabel("Country or region").fill("Saudi Arabia");
    await page.screenshot({ path: `/tmp/shipping-notification-${width}.png` });
    await dialog.getByRole("button", { name: "Notify me", exact: true }).click();
    await dialog.getByRole("alert").filter({ hasText: "Could not save your request." }).waitFor();
    await dialog.getByRole("button", { name: "Notify me", exact: true }).click();
    await dialog.getByRole("status").waitFor();
    assert.equal(signups, 2);
    assert.equal(purchases, 0, "Signup must not submit checkout");
    assert.deepEqual(pageErrors, [], "Checkout must not throw browser errors");
    await page.keyboard.press("Escape");
    assert.equal(await trigger.evaluate((element) => element === document.activeElement), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({ path: `/tmp/shipping-checkout-${width}.png`, fullPage: true });
    await page.close();
    console.log(`${width}px: required country, retry, success, focus return and checkout isolation passed`);
  }
} finally {
  await browser.close();
}
