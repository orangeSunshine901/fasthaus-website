import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { PRODUCTS } from "../lib/data/products.ts";
import {
  applyProductMedia,
  knownProductSources,
  resolutionError,
  variantMedia,
  variantMediaSchema,
} from "../lib/cms/media.ts";
import { prepareImage } from "../lib/cms/images.ts";

test("media overrides reach the correct colour without changing commerce data or defaults", () => {
  const product = PRODUCTS[0];
  const variant = product.variants[0];
  const media = {
    ...variantMedia(variant),
    collection: "https://example.com/new.webp",
    images: [{ src: "https://example.com/gallery.webp", uiTheme: "light" as const }],
  };
  const result = applyProductMedia(PRODUCTS, [{ variant_id: variant.id, media, version: 1 }]);
  assert.equal(result[0].variants[0].collectionImage, media.collection);
  assert.equal(result[0].variants[0].images[0].src, media.images[0].src);
  assert.equal(result[0].variants[0].price, variant.price);
  assert.equal(result[0].variants[0].sku, variant.sku);
  assert.equal(result[0].variants[0].stock, variant.stock);
  assert.equal(result[0].variants[1], product.variants[1]);
  assert.notEqual(variant.collectionImage, media.collection);
});

test("publishing requires a nonempty unique gallery and cannot submit price or stock changes", () => {
  const media = variantMedia(PRODUCTS[0].variants[0]);
  assert.equal(variantMediaSchema.safeParse(media).success, true);
  assert.equal(variantMediaSchema.safeParse({ ...media, images: [] }).success, false);
  assert.equal(
    variantMediaSchema.safeParse({ ...media, images: [media.images[0], media.images[0]] }).success,
    false
  );
  assert.equal(variantMediaSchema.safeParse({ ...media, price: 1 }).success, false);
  assert.equal(variantMediaSchema.safeParse({ ...media, featuredOff: "" }).success, false);
  assert.ok(knownProductSources().has(media.hero));
});

test("resolution gates accept landscape and portrait, reject small or very narrow images", () => {
  assert.equal(resolutionError(1200, 800), null);
  assert.equal(resolutionError(800, 1200), null);
  assert.ok(resolutionError(1199, 800));
  assert.ok(resolutionError(3000, 799));
});

test("uploads are fully decoded, resized without upscaling, oriented and stripped of EXIF", async () => {
  const source = await sharp({
    create: { width: 3200, height: 1600, channels: 3, background: "#ff4b1f" },
  })
    .withMetadata({ orientation: 6 })
    .jpeg()
    .toBuffer();
  const image = await prepareImage(source);
  const metadata = await sharp(image.data).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 2400);
  assert.equal(metadata.exif, undefined);
  const smaller = await sharp({
    create: { width: 1200, height: 800, channels: 4, background: "transparent" },
  })
    .png()
    .toBuffer();
  const accepted = await prepareImage(smaller);
  assert.equal(accepted.width, 1200);
  assert.equal(accepted.height, 800);
  assert.ok(accepted.warning);
  assert.equal((await sharp(accepted.data).metadata()).hasAlpha, true);
});

test("uploads reject corrupt, truncated, undersized, huge, animated and vector files", async () => {
  await assert.rejects(prepareImage(Buffer.from("not an image")), /could not be decoded/);
  await assert.rejects(prepareImage(Buffer.alloc(4 * 1024 * 1024 + 1)), /smaller than 4 MB/);
  const small = await sharp({
    create: { width: 200, height: 200, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  await assert.rejects(prepareImage(small), /at least/);
  const valid = await sharp({
    create: { width: 1200, height: 800, channels: 3, background: "red" },
  })
    .jpeg()
    .toBuffer();
  await assert.rejects(prepareImage(valid.subarray(0, valid.length - 250)), /could not be decoded/);
  await assert.rejects(
    prepareImage(
      Buffer.from('<svg width="1600" height="1200" xmlns="http://www.w3.org/2000/svg"></svg>')
    ),
    /Choose a JPEG/
  );
  const frame = (background: string) =>
    sharp({ create: { width: 1200, height: 800, channels: 4, background } })
      .raw()
      .toBuffer();
  const animated = await sharp(Buffer.concat(await Promise.all([frame("red"), frame("blue")])), {
    raw: { width: 1200, height: 1600, channels: 4, pageHeight: 800 },
  })
    .webp({ loop: 0, delay: [100, 100] })
    .toBuffer();
  await assert.rejects(prepareImage(animated), /Animated images/);
});
