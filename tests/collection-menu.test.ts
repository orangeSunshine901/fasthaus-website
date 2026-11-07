import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { PRODUCTS } from "../lib/data/products.ts";
import { getCollectionMenuItems } from "../lib/data/collection-menu.ts";

test("menus show the requested photo variants with Hamrah last without changing the catalog", () => {
  const originalOrder = PRODUCTS.map((product) => product.id);
  const items = getCollectionMenuItems(PRODUCTS);
  assert.deepEqual(items.map(({ product }) => product.name), ["NASAQ", "NUJĀJ", "KASANE", "HAMRAH"]);
  assert.deepEqual(items.map(({ variant }) => variant.id), ["3-white", "1-matcha", "2-tangerine", "4-cherry-red"]);
  assert.match(items[0].image, /nasaq-marshmallow-white-full-desktop/);
  assert.match(items[1].image, /nujaj-matcha-full-desktop/);
  assert.match(items[2].image, /kasane-tangerine-photoshopped-desktop/);
  for (const { image, variant, product } of items) {
    assert.ok(existsSync(`public${image}`), image);
    assert.ok(product.variants.includes(variant));
  }
  assert.deepEqual(PRODUCTS.map((product) => product.id), originalOrder);
  assert.deepEqual(getCollectionMenuItems([]), []);
});
