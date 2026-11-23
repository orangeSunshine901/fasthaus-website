import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import {
  PRODUCTS,
  getCollectionProducts,
  getFeaturedProducts,
  getVariantGalleryImages,
  getVariantMainImage,
  type ProductVariant,
} from "../lib/data/products.ts";

test("pink weave gets a New collection card linked to its canonical Nasaq variant", () => {
  const nasaq = PRODUCTS.find((product) => product.slug === "nasaq-lamp")!;
  const variant = nasaq.variants.find((variant) => variant.id === "3-pink-weave")!;
  const cards = getCollectionProducts(PRODUCTS);
  const card = cards.find((product) => product.name === "NASAQ WEAVE")!;
  assert.equal(cards.length, PRODUCTS.length + 1);
  assert.equal(cards[0], nasaq);
  assert.equal(card.id, nasaq.id);
  assert.equal(card.slug, nasaq.slug);
  assert.equal(card.badge, "NEW");
  assert.deepEqual(card.variants, [variant]);
  assert.equal(nasaq.badge, undefined);
  assert.equal(variant.price, 322);
  assert.equal(variant.stock, 5);
  assert.equal(new Set(PRODUCTS.flatMap((p) => p.variants.map((v) => v.id))).size,
    PRODUCTS.flatMap((p) => p.variants).length);
  assert.equal(getVariantGalleryImages(variant)[0].src, variant.mainImage);
  assert.equal(variant.images.length, 6);
  for (const image of variant.images) {
    assert.notEqual(image.unoptimized, true);
    for (const src of [image.src, image.mobileSrc!]) {
      assert.ok(existsSync(new URL(`../public${src}`, import.meta.url)), src);
    }
  }
  assert.deepEqual(getCollectionProducts([]), []);
  assert.deepEqual(getCollectionProducts(PRODUCTS.filter((p) => p !== nasaq)), PRODUCTS.filter((p) => p !== nasaq));
});

test("every product provides material labels and a description", () => {
  for (const product of PRODUCTS) {
    assert.ok(product.materials.length > 0, `${product.name} is missing materials`);
    assert.ok(
      product.materialsDescription.length > 0,
      `${product.name} is missing a materials description`
    );
  }
});

test("Pink Weave placements keep each approved desktop/mobile composition together", () => {
  const variant = PRODUCTS.flatMap((product) => product.variants).find((v) => v.id === "3-pink-weave")!;
  const prefix = "/stack-lamp/nasaq-pink-weave/nasaq-pink-weave-";
  assert.equal(variant.collectionImage, `${prefix}off-1x1-1200x1200.webp`);
  assert.equal(variant.collectionMobileImage, `${prefix}off-3x4-1080x1440-761ffa6a.webp`);
  assert.deepEqual(variant.featuredImages, {
    lightOff: `${prefix}off-1x1-1200x1200.webp`,
    lightOn: `${prefix}on-1x1-1200x1200.webp`,
  });
  assert.deepEqual(getVariantGalleryImages(variant).map(({ src, mobileSrc }) => [src, mobileSrc]), [
    [`${prefix}off-native-2880x1496.webp`, `${prefix}off-3x4-1080x1440-761ffa6a.webp`],
    [`${prefix}on-native-2880x1496.webp`, `${prefix}on-3x4-1080x1440-8ecda3a5.webp`],
    ...["front-hero", "three-quarter", "rim-detail", "room-portrait"].map((scene) => [
      `${prefix}lifestyle-${scene}-16x9-2560x1440.webp`,
      `${prefix}lifestyle-${scene}-3x4-1080x1440.webp`,
    ]),
  ]);
});

test("homepage featured choices exclude Pink Weave without removing it from the catalog", () => {
  const featured = getFeaturedProducts(PRODUCTS);
  const nasaq = PRODUCTS.find((product) => product.slug === "nasaq-lamp")!;
  const card = featured.find((product) => product.slug === nasaq.slug)!;
  assert.deepEqual(card.variants, nasaq.variants.filter((variant) => variant.id !== "3-pink-weave"));
  assert.ok(nasaq.variants.some((variant) => variant.id === "3-pink-weave"));
  assert.ok(getCollectionProducts(PRODUCTS).some((product) => product.name === "NASAQ WEAVE"));
  assert.deepEqual(getFeaturedProducts([]), []);
  assert.ok(featured.every((product) => product.featured));
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
  cartDrawerImage: "",
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

test("every carousel image has a unique source and explicit UI theme", () => {
  for (const product of PRODUCTS) {
    for (const variant of product.variants) {
      assert.equal(
        new Set(variant.images.map((image) => image.src)).size,
        variant.images.length,
        `${variant.id} has duplicate carousel images`
      );
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

test("every product variant provides a mobile collection-card image", () => {
  for (const product of PRODUCTS) {
    for (const variant of product.variants) {
      assert.ok(
        variant.collectionMobileImage,
        `${variant.id} is missing its mobile collection image`
      );
    }
  }
});

test("Dropbox photo sets lead their matching colour galleries with the full product", () => {
  const sets = [
    ["2-tangerine", "/mushroom-lamp/kasane-tangerine"],
    ["1-matcha", "/flute-lamp/nujaj-matcha"],
    ["3-white", "/stack-lamp/nasaq-marshmallow-white"],
  ];
  for (const [id, prefix] of sets) {
    const variant = PRODUCTS.flatMap((product) => product.variants).find((item) => item.id === id)!;
    const gallery = getVariantGalleryImages(variant);
    assert.equal(gallery[0].src, variant.images[0].src);
    assert.equal(variant.mainImage, gallery[0].src);
    for (const [index, shot] of ["full", "shade-detail", "base-detail", "shade-macro"].entries()) {
      const image = gallery[index];
      assert.match(image.src, new RegExp(`^${prefix}-${shot}-desktop-[a-f0-9]{8}\\.webp$`));
      assert.match(image.mobileSrc!, new RegExp(`^${prefix}-${shot}-mobile-[a-f0-9]{8}\\.webp$`));
      assert.equal(image.unoptimized, true);
      assert.equal(image.uiTheme, "dark", "Reviewed bright photos need dark overlay controls");
    }
    for (const image of gallery) {
      assert.ok(existsSync(new URL(`../public${image.src}`, import.meta.url)), image.src);
    }
  }
});

test("mobile portrait crops cover landscape gallery shots, including a standalone main image", () => {
  const variant = PRODUCTS.flatMap((product) => product.variants).find(
    (variant) => variant.mainImage === "/flute-lamp/flute-clear-interaction-shot-dark.png"
  )!;
  const gallery = getVariantGalleryImages(variant);
  assert.equal(gallery[0].src, variant.mainImage);
  assert.match(gallery[0].mobileSrc!, /^\/gallery-portraits\//);
  for (const product of PRODUCTS) {
    for (const variant of product.variants) {
      for (const image of getVariantGalleryImages(variant)) {
        if (image.mobileSrc) {
          assert.ok(existsSync(new URL(`../public${image.mobileSrc}`, import.meta.url)), image.mobileSrc);
        }
        const original = variant.images.find((entry) => entry.src === image.src);
        if (original?.mobileSrc?.endsWith("-product-mobile.png")) {
          assert.equal(image.mobileSrc, original.mobileSrc);
        }
      }
    }
  }
});
