import assert from "node:assert/strict";
import test from "node:test";
import {
  getVariantGalleryImages,
  getVariantMainImage,
  type ProductVariant,
} from "../lib/data/products.ts";

const baseVariant: ProductVariant = {
  id: "test",
  color: "Test",
  colorHex: "#000000",
  sku: "TEST",
  price: 100,
  stock: 1,
  images: ["/gallery-one.png", "/gallery-two.png"],
};

test("uses the first gallery image when no main image is configured", () => {
  assert.equal(getVariantMainImage(baseVariant), "/gallery-one.png");
  assert.deepEqual(getVariantGalleryImages(baseVariant), [
    "/gallery-one.png",
    "/gallery-two.png",
  ]);
});

test("puts a configured main image first without duplicating it", () => {
  const variant = {
    ...baseVariant,
    mainImage: "/gallery-two.png",
  };

  assert.equal(getVariantMainImage(variant), "/gallery-two.png");
  assert.deepEqual(getVariantGalleryImages(variant), [
    "/gallery-two.png",
    "/gallery-one.png",
  ]);
});
