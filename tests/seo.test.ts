import assert from "node:assert/strict";
import test from "node:test";
import { existsSync } from "node:fs";
import { PRODUCTS } from "../lib/data/products.ts";
import { CATEGORIES, getCategory, getCategoryProducts } from "../lib/data/categories.ts";
import { FAQS } from "../lib/data/faq.ts";
import { POLICIES } from "../lib/legal/content.ts";
import { getSitemapEntries, STATIC_INDEXABLE_PATHS } from "../lib/seo/sitemap.ts";
import { productJsonLd, serializeJsonLd, faqJsonLd } from "../lib/seo/json-ld.ts";
import { clampDescription, pageMetadata } from "../lib/seo/metadata.ts";
import { productSeoDescription, productSeoTitle, productSocialImage } from "../lib/seo/product.ts";
import { DEFAULT_OG_IMAGE, SITE_URL, absoluteUrl } from "../lib/seo/site.ts";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const publicFile = (path: string) => existsSync(new URL(`../public${path}`, import.meta.url));

test("site origin is the canonical production host", () => {
  assert.equal(SITE_URL, "https://www.fasthaus.ae");
  assert.equal(absoluteUrl("/"), "https://www.fasthaus.ae");
  assert.equal(absoluteUrl("/product/nasaq-lamp"), "https://www.fasthaus.ae/product/nasaq-lamp");
});

test("product slugs are clean, lowercase and unique", () => {
  const slugs = PRODUCTS.map((product) => product.slug);
  assert.equal(new Set(slugs).size, slugs.length, "duplicate product slug");
  for (const slug of slugs) assert.match(slug, SLUG_PATTERN, `slug "${slug}" is not clean`);
});

test("every product has the fields its SEO metadata and schema depend on", () => {
  for (const product of PRODUCTS) {
    assert.ok(getCategory(product.category), `${product.name}: unknown category "${product.category}" — add it to lib/data/categories.ts`);
    assert.ok(product.description.trim(), `${product.name}: missing description`);
    assert.ok(product.designStory.trim(), `${product.name}: missing designStory`);
    assert.ok(product.materials.length > 0, `${product.name}: missing materials`);
    for (const variant of product.variants) {
      assert.ok(variant.sku.trim(), `${product.name}/${variant.color}: missing SKU`);
      assert.ok(variant.price > 0, `${product.name}/${variant.color}: invalid price`);
      assert.ok(
        publicFile(variant.featuredImages.lightOn),
        `${product.name}/${variant.color}: social/schema image ${variant.featuredImages.lightOn} is missing`
      );
    }
  }
});

test("product titles and descriptions are unique", () => {
  const titles = PRODUCTS.map(productSeoTitle);
  const descriptions = PRODUCTS.map(productSeoDescription);
  assert.equal(new Set(titles).size, titles.length, "duplicate product title");
  assert.equal(new Set(descriptions).size, descriptions.length, "duplicate product description");
  for (const description of descriptions) assert.ok(description.length <= 180, description);
});

test("category slugs are clean and unique", () => {
  const slugs = CATEGORIES.map((category) => category.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const slug of slugs) assert.match(slug, SLUG_PATTERN);
});

test("sitemap lists every indexable page exactly once and nothing private", () => {
  const urls = getSitemapEntries().map((entry) => entry.url);
  assert.equal(new Set(urls).size, urls.length, "duplicate sitemap URL");

  for (const url of urls) {
    assert.ok(url.startsWith(`${SITE_URL}/`) || url === SITE_URL, `${url} is not on the canonical origin`);
    assert.doesNotMatch(url, /\/(cart|checkout|order|api)(\/|$)/, `${url} must not be in the sitemap`);
    const path = new URL(url).pathname;
    assert.ok(!["/shipping-returns", "/warranty", "/legal"].includes(path), `${url} is a redirect`);
    assert.doesNotMatch(url, /\?/, `${url} has a query string`);
  }

  for (const path of STATIC_INDEXABLE_PATHS) assert.ok(urls.includes(absoluteUrl(path)), path);
  for (const product of PRODUCTS) assert.ok(urls.includes(absoluteUrl(`/product/${product.slug}`)), product.slug);
  for (const policy of POLICIES) assert.ok(urls.includes(absoluteUrl(`/legal/${policy.slug}`)), policy.slug);

  for (const category of CATEGORIES) {
    const listed = urls.includes(absoluteUrl(`/collection/${category.slug}`));
    const stocked = getCategoryProducts(category.slug).length > 0;
    assert.equal(listed, stocked, `${category.slug}: sitemap inclusion must match whether it has products`);
  }
});

test("page metadata emits a self-canonical and complete social tags", () => {
  const metadata = pageMetadata({ title: "FAQ", description: "Answers.", path: "/faq" });
  assert.equal(metadata.alternates?.canonical, "https://www.fasthaus.ae/faq");
  assert.equal((metadata.openGraph as { url?: string }).url, "https://www.fasthaus.ae/faq");
  assert.deepEqual((metadata.openGraph as { images?: unknown[] }).images, [DEFAULT_OG_IMAGE]);
  assert.equal(metadata.robots, undefined, "indexable pages should not set robots");

  const hidden = pageMetadata({ title: "X", description: "Y", path: "/x", noindex: true });
  assert.deepEqual(hidden.robots, { index: false, follow: true });
  assert.ok(publicFile(DEFAULT_OG_IMAGE.url), "default OG image is missing");
});

test("product JSON-LD matches the product data and uses AED", () => {
  for (const product of PRODUCTS) {
    const schema = productJsonLd(product, getCategory(product.category)) as {
      name: string;
      url: string;
      offers: { price: string; priceCurrency: string; sku: string; availability: string }[];
      aggregateRating?: unknown;
    };
    assert.equal(schema.name, product.name);
    assert.equal(schema.url, absoluteUrl(`/product/${product.slug}`));
    assert.equal(schema.aggregateRating, undefined, "ratings are not shown on the page yet");
    assert.equal(schema.offers.length, product.variants.length);
    schema.offers.forEach((offer, index) => {
      const variant = product.variants[index];
      assert.equal(offer.priceCurrency, "AED");
      assert.equal(Number(offer.price), variant.price);
      assert.equal(offer.sku, variant.sku);
      assert.match(offer.availability, variant.stock > 0 ? /InStock$/ : /OutOfStock$/);
    });
    assert.ok(publicFile(productSocialImage(product).url));
  }
});

test("FAQ JSON-LD covers every visible question", () => {
  const schema = faqJsonLd(FAQS) as { mainEntity: unknown[] };
  assert.equal(schema.mainEntity.length, FAQS.length);
});

test("JSON-LD serialization cannot break out of its script tag", () => {
  const output = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
  assert.doesNotMatch(output, /</);
  assert.deepEqual(JSON.parse(output), { name: "</script><script>alert(1)</script>" });
});

test("descriptions are clamped on a word boundary", () => {
  assert.equal(clampDescription("short"), "short");
  const long = clampDescription("word ".repeat(60), 50);
  assert.ok(long.length <= 50);
  assert.ok(long.endsWith("…"));
});
