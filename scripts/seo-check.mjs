#!/usr/bin/env node
/**
 * Crawls a running Fasthaus build and verifies the SEO rules from
 * docs/fasthaus-seo-implementation-plan.md against the server-rendered HTML.
 *
 *   npm run build && npm start            # in one terminal
 *   npm run seo:check                     # defaults to http://localhost:3000
 *   npm run seo:check -- https://www.fasthaus.ae
 *
 * URLs in the sitemap/canonicals always use the production origin; when checking another base
 * URL they are mapped onto it. Exits non-zero when any check fails.
 */

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const PRODUCTION_ORIGIN = "https://www.fasthaus.ae";
const PRIVATE_ROUTES = { "/cart": "noindex, follow", "/checkout": "noindex, nofollow" };
const REDIRECTS = {
  "/shipping-returns": [308, "/legal/shipping"],
  "/warranty": [308, "/legal/warranty"],
  "/legal": [307, "/legal/terms"],
};
const MUST_404 =["/product/not-a-real-lamp", "/collection/not-a-real-category", "/legal/not-a-policy"];

const failures = [];
const warnings = [];
const fail = (message) => failures.push(message);
const toLocal = (url) => url.replace(PRODUCTION_ORIGIN, base);

async function get(path, init) {
  const url = path.startsWith("http") ? toLocal(path) : `${base}${path}`;
  return fetch(url, { redirect: "manual", ...init });
}

const pick = (html, regex) => html.match(regex)?.[1];
const metaContent = (html, attr, name) =>
  pick(html, new RegExp(`<meta[^>]+${attr}="${name}"[^>]+content="([^"]*)"`, "i"));
const decode = (text = "") =>
  text.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");

// 1. robots.txt
const robots = await get("/robots.txt");
const robotsText = await robots.text();
if (robots.status !== 200) fail(`/robots.txt returned ${robots.status}`);
if (!robotsText.includes(`Sitemap: ${PRODUCTION_ORIGIN}/sitemap.xml`))
  warnings.push("/robots.txt has no production Sitemap line (expected on preview deployments only)");

// 2. sitemap.xml
const sitemap = await get("/sitemap.xml");
const sitemapXml = await sitemap.text();
if (sitemap.status !== 200) fail(`/sitemap.xml returned ${sitemap.status}`);
const sitemapUrls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (new Set(sitemapUrls).size !== sitemapUrls.length) fail("sitemap contains duplicate URLs");

// 3. every sitemap URL
const titles = new Map();
const descriptions = new Map();
const internalLinks = new Set();

for (const url of sitemapUrls) {
  const res = await get(url);
  const where = new URL(url).pathname;
  if (res.status !== 200) {
    fail(`${where}: sitemap URL returned ${res.status}`);
    continue;
  }
  const html = await res.text();

  const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
  if (h1Count !== 1) fail(`${where}: ${h1Count} <h1> elements in server HTML (expected 1)`);

  const canonical = pick(html, /<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
  if (canonical !== url) fail(`${where}: canonical is ${canonical ?? "missing"}, expected ${url}`);

  const robotsMeta = metaContent(html, "name", "robots");
  if (robotsMeta?.includes("noindex")) fail(`${where}: indexable page emits robots "${robotsMeta}"`);

  const title = decode(pick(html, /<title>([^<]*)<\/title>/i));
  const description = decode(metaContent(html, "name", "description"));
  if (!title) fail(`${where}: missing <title>`);
  if (!description) fail(`${where}: missing meta description`);
  if (titles.has(title)) fail(`${where}: duplicate title with ${titles.get(title)} — "${title}"`);
  if (descriptions.has(description)) fail(`${where}: duplicate description with ${descriptions.get(description)}`);
  titles.set(title, where);
  descriptions.set(description, where);

  const ogUrl = metaContent(html, "property", "og:url");
  if (ogUrl !== url) fail(`${where}: og:url is ${ogUrl ?? "missing"}, expected ${url}`);
  const ogImage = metaContent(html, "property", "og:image");
  if (!ogImage?.startsWith("https://")) fail(`${where}: og:image missing or not absolute HTTPS`);
  else if ((await get(ogImage, { method: "HEAD" })).status !== 200) fail(`${where}: og:image ${ogImage} not reachable`);

  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(json);
    } catch {
      fail(`${where}: invalid JSON-LD`);
    }
  }

  for (const [, href] of html.matchAll(/<a[^>]+href="(\/[^"#]*)"/g)) internalLinks.add(href.split("?")[0]);
}

// 4. private routes carry the agreed robots policy
for (const [path, expected] of Object.entries(PRIVATE_ROUTES)) {
  const html = await (await get(path)).text();
  const robotsMeta = metaContent(html, "name", "robots");
  if (robotsMeta !== expected) fail(`${path}: robots is "${robotsMeta}", expected "${expected}"`);
  if (sitemapUrls.some((url) => new URL(url).pathname === path)) fail(`${path} must not be in the sitemap`);
}

// 5. invalid dynamic URLs are real 404s
for (const path of MUST_404) {
  const res = await get(path);
  if (res.status !== 404) fail(`${path}: returned ${res.status}, expected 404`);
}

// 6. retired URLs are real one-hop HTTP redirects (not 200 + meta refresh)
for (const [path, [status, destination]] of Object.entries(REDIRECTS)) {
  const res = await get(path);
  const location = res.headers.get("location")?.replace(base, "");
  if (res.status !== status || location !== destination)
    fail(`${path}: returned ${res.status} → ${location ?? "none"}, expected ${status} → ${destination}`);
}

// 7. internal links resolve directly (no 4xx/5xx, no redirect hops)
for (const href of internalLinks) {
  const res = await get(href);
  if (res.status >= 400) fail(`internal link ${href} returned ${res.status}`);
  else if (res.status >= 300) warnings.push(`internal link ${href} redirects (${res.status}) to ${res.headers.get("location")}`);
}

console.log(`Checked ${sitemapUrls.length} sitemap URLs and ${internalLinks.size} internal links on ${base}`);
for (const warning of warnings) console.log(`  warn  ${warning}`);
for (const failure of failures) console.log(`  FAIL  ${failure}`);
console.log(failures.length ? `\n${failures.length} check(s) failed.` : "\nAll SEO checks passed.");
process.exit(failures.length ? 1 : 0);
