import assert from "node:assert/strict";
import test from "node:test";
import {
  PRODUCTS,
  getVariantGalleryImages,
  getVariantMainImage,
  type ProductVariant,
} from "../lib/data/products.ts";

test("every product provides material labels and a description", () => {
  for (const product of PRODUCTS) {
    assert.ok(product.materials.length > 0, `${product.name} is missing materials`);
    assert.ok(
      product.materialsDescription.length > 0,
      `${product.name} is missing a materials description`
    );
  }
});

const baseVariant: ProductVariant = {
  id: "test",
  color: "Test",
  colorHex: "#000000",
  sku: "TEST",
  price: 100,
  stock: 1,
  featuredImages: {
    lightOff: "/gallery-one.png",
    lightOn: "/gallery-two.png",
  },
  collectionImage: "/gallery-one.png",
  images: [
    { src: "/gallery-one.png", uiTheme: "dark" },
    { src: "/gallery-two.png", uiTheme: "light" },
  ],
};

test("uses the first gallery image when no main image is configured", () => {
  assert.equal(getVariantMainImage(baseVariant), "/gallery-one.png");
  assert.deepEqual(getVariantGalleryImages(baseVariant), [
    { src: "/gallery-one.png", uiTheme: "dark" },
    { src: "/gallery-two.png", uiTheme: "light" },
  ]);
});

test("puts a configured main image first without duplicating it", () => {
  const variant = {
    ...baseVariant,
    mainImage: "/gallery-two.png",
  };

  assert.equal(getVariantMainImage(variant), "/gallery-two.png");
  assert.deepEqual(getVariantGalleryImages(variant), [
    { src: "/gallery-two.png", uiTheme: "light" },
    { src: "/gallery-one.png", uiTheme: "dark" },
  ]);
});

test("every carousel image has an explicit UI theme", () => {
  for (const product of PRODUCTS) {
    for (const variant of product.variants) {
      for (const image of variant.images) {
        assert.ok(image.src, `${variant.id} has an image without a source`);
        assert.ok(
          image.uiTheme === "light" || image.uiTheme === "dark",
          `${variant.id} has an image without a UI theme`
        );
      }
    }
  }
});

test("product off and on gallery images provide their mobile versions", () => {
  for (const product of PRODUCTS) {
    for (const variant of product.variants) {
      for (const image of variant.images.slice(0, 2)) {
        assert.ok(image.mobileSrc, `${image.src} is missing its mobile source`);
      }
    }
  }
});
