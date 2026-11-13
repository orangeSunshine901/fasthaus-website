// Run against a local build/dev server: node scripts/check-checkout-discount.mjs
import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const width of [390, 1280]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    await page.route("https://**/*", (route) => route.abort());
    await page.route("**/api/cart", (route) =>
      route.fulfill({
        json: {
          id: "test-cart",
          currency: "AED",
          itemCount: 1,
          subtotal: 98700,
          warnings: [],
          updatedAt: new Date().toISOString(),
          items: [
            {
              itemId: "test-item",
              productId: "test-product",
              variantId: "test-variant",
              slug: "nasaq",
              name: "NASAQ",
              variantName: "White",
              imageUrl: "/newsletter-icon.svg",
              unitPrice: 98700,
              quantity: 1,
              lineTotal: 98700,
              available: true,
              maxQuantity: null,
              addOns: [],
            },
          ],
        },
      })
    );
    let discountChecks = 0;
    let purchases = 0;
    let rejected = null;
    await page.route("**/api/checkout/discount", (route) => {
      discountChecks++;
      const body = route.request().postDataJSON();
      if (rejected) return route.fulfill({ status: 409, json: { error: { message: rejected } } });
      const code = body.code.trim().toUpperCase();
      return route.fulfill({
        json: { code, discountAmount: code === "MAXINE100" ? 100 : 98.7, subtotal: 987 },
      });
    });
    await page.route("**/api/checkout/create-order", (route) => {
      purchases++;
      const body = route.request().postDataJSON();
      assert.equal(body.discountCode, "MAXINE100");
      assert.equal(body.expectedTotal, 887);
      return route.fulfill({
        status: 409,
        json: { error: { message: "This discount code has already been used." } },
      });
    });
    await page.goto("http://localhost:3000/checkout", { waitUntil: "networkidle" });
    const consent = page.getByRole("button", { name: /Accept all/i });
    if (await consent.isVisible()) await consent.click();
    await page.getByRole("textbox", { name: /^Email/ }).fill("customer@example.com");
    const code = page.getByRole("textbox", { name: "Discount code", exact: true });
    await code.fill(" maxine100 ");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await page.getByRole("button", { name: "Applied", exact: true }).waitFor();
    assert.equal(discountChecks, 1, "Apply must validate on the server");
    const discount = page.getByText("Discount code (MAXINE100)", { exact: true }).locator("..");
    assert.match(await discount.innerText(), /100/);
    const total = page.getByText("Total", { exact: true }).locator("..");
    assert.match(await total.innerText(), /887/);

    await page.getByRole("textbox", { name: /^Email/ }).fill("changed@example.com");
    await page.getByRole("button", { name: "Apply", exact: true }).waitFor();
    assert.equal(await page.getByText("Discount code (MAXINE100)", { exact: true }).count(), 0);
    for (const message of [
      "This code is unavailable for the checkout email.",
      "This discount code has expired.",
      "This discount code has already been used.",
    ]) {
      rejected = message;
      await page.getByRole("button", { name: "Apply", exact: true }).click();
      await page.getByRole("alert").filter({ hasText: message }).waitFor();
    }
    rejected = null;
    await code.fill("faste10");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await page.getByRole("button", { name: "Applied", exact: true }).waitFor();
    assert.match(
      await page.getByText("Discount code (FASTE10)", { exact: true }).locator("..").innerText(),
      /98.7/
    );
    assert.match(await total.innerText(), /888.3/);

    await code.fill("MAXINE100");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await page.getByRole("button", { name: "Applied", exact: true }).waitFor();
    await page.getByPlaceholder("Ava Smith").fill("Test Customer");
    await page.getByPlaceholder("50 123 4567").fill("501234567");
    await page.getByPlaceholder("Street name and Area").fill("Test Street, Dubai");
    await page.getByPlaceholder("Apt 804, Floor 8 or Villa 12").fill("Apt 1");
    await page.getByPlaceholder("Marina Heights or Cluster J").fill("Test Building");
    await page.getByRole("button", { name: /Pay by card or Google Pay/ }).click();
    await page.getByText("This discount code has already been used.", { exact: true }).waitFor();
    assert.equal(purchases, 1, "A server-side revalidation rejection must remain visible");
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true
    );
    await page.screenshot({ path: `/tmp/checkout-discount-${width}.png`, fullPage: true });
    await page.close();
    console.log(
      `${width}px: fixed/percentage totals, email invalidation, eligibility errors and payment rejection passed`
    );
  }
} finally {
  await browser.close();
}
