import assert from "node:assert/strict";
import test from "node:test";
import { stat } from "node:fs/promises";
import sharp from "sharp";
import { MOBILE_GALLERY_IMAGES } from "../lib/data/mobile-gallery-images.ts";
import { getMobileGallerySource } from "../lib/data/mobile-gallery.ts";
import { GALLERY_PORTRAITS } from "../lib/data/gallery-portraits.ts";

test("mobile images preserve the reviewed crops and leave new CMS media alone", () => {
  for (const [source, portrait] of Object.entries(GALLERY_PORTRAITS)) {
    assert.equal(getMobileGallerySource(source), MOBILE_GALLERY_IMAGES[portrait]);
  }
  const uploaded = "https://example.com/storage/new-custom-photo.webp";
  assert.equal(getMobileGallerySource(uploaded), uploaded);
  assert.equal(getMobileGallerySource("/new-photo.png"), "/new-photo.png");
});

test("every generated mobile photo exists, keeps its aspect ratio, and meets the size budget", async () => {
  for (const [original, mobile] of Object.entries(MOBILE_GALLERY_IMAGES)) {
    const source = new URL(`../public${original}`, import.meta.url);
    const destination = new URL(`../public${mobile}`, import.meta.url);
    const [before, after, file] = await Promise.all([
      sharp(source.pathname).metadata(),
      sharp(destination.pathname).metadata(),
      stat(destination),
    ]);
    assert.equal(after.format, "webp", mobile);
    assert.ok(after.width! <= 1080, mobile);
    assert.ok(Math.abs(before.width! / before.height! - after.width! / after.height!) < 0.002, mobile);
    assert.ok(file.size <= 300 * 1024, `${mobile} exceeds the mobile photo budget`);
  }
});
