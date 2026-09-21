# Fasthaus SEO Implementation Plan

## Purpose

This document is an execution-ready plan for improving technical SEO, on-page SEO, performance, and mobile usability across the Fasthaus Next.js storefront.

Google Search Console ownership verification is intentionally excluded. The user will handle it separately. Search Console may still be used after deployment to observe indexing and performance, but no verification work is part of this plan.

## Implementation Status

**Last updated:** 2026-09-21 · **Branch:** `main` (uncommitted working tree) · **Canonical origin:** `https://www.fasthaus.ae`

Status key: **Done** = implemented and verified against a local production build (`next build && next start`) · **Partial** = code done, needs production or manual verification · **Open** = not started or requires access outside the repo.

| Phase | Status | Summary |
| --- | --- | --- |
| 0. Baseline and route inventory | Partial | Route matrix approved (see Phase 0). Pre-change findings recorded below. No Lighthouse/field CWV baseline captured. |
| 1. Crawl control, canonicals, robots, sitemap | Done | `app/robots.ts`, `app/sitemap.ts`, self-canonicals, noindex policy, real 404s, real 3xx redirects. Host/HTTPS redirects already correct on Vercel. |
| 2. Titles, descriptions, social metadata | Done | Unique title/description/canonical/OG/Twitter on every indexable route; default 1200×630 OG image; product OG from product data. |
| 3. H1s, headings, alt text, slugs, internal links | Done (with follow-ups) | One H1 on every page, heading-level fixes, alt text improvements, redirect links removed. |
| 4. Structured data | Done | Organization, WebSite, Product/Offer, BreadcrumbList, FAQPage, legal WebPage. Not yet run through Google's Rich Results Test. |
| 5. Images and Core Web Vitals | Open | Not measured. Findings and follow-ups listed in Phase 5. |
| 6. Mobile responsiveness | Partial | Changed templates screenshot-checked at 390/800/1440 px. No real-device purchase journey run. |
| 7. Regression tooling and release | Partial | `npm test` SEO suite + `npm run seo:check` crawler added and passing locally. Production deploy and post-deploy crawl pending. |

### Pre-change baseline findings (2026-09-21)

Recorded from the source tree and the live site before implementation:

- Only 2 of 14 page routes set their own metadata (root layout and `/legal/[slug]`); every other page shared one site-wide title and description. No canonicals outside legal pages.
- No `robots.txt` or `sitemap.xml`.
- Two different origins in use: `/legal/[slug]` hard-coded `https://fasthaus.studio` while the live site and `.env` use `https://www.fasthaus.ae`.
- Live host behaviour: `https://fasthaus.ae` → 308 → `https://www.fasthaus.ae`; `http://www.fasthaus.ae` → 308 → `https://www.fasthaus.ae`; `http://fasthaus.ae` takes two hops (→ `https://fasthaus.ae` → `https://www.fasthaus.ae`).
- **Every page rendered at least two H1s**: the Silktide consent manager injected a hidden `<h1>Customize your cookie preferences</h1>` site-wide. The homepage had three (plus separate mobile and desktop hero H1s); the About reduced-motion fallback added another.
- `/shipping-returns`, `/warranty` and `/legal` answered **200 with a meta refresh** instead of an HTTP redirect (redirects called from statically prerendered pages). Confirmed on production.
- Unknown product slugs returned a 200 soft-404 (the product route streams because it reads `?variant=`); unknown category slugs rendered a 200 "All Products" page.
- Category pages were orphaned (nothing linked to `/collection/{category}`), and two of the three (`desk-lamps`, `floor-lamps`) have no products.
- Product pages had no metadata, no canonical (so every `?variant=` URL was a duplicate), and no structured data.
- `public/` is 721 MB, with 85 PNG/JPEG files over 1.5 MB (several lifestyle PNGs are ~21 MB).

## Objectives

- Make every public, valuable page crawlable, indexable, canonical, and represented in the sitemap.
- Keep cart, checkout, order, API, duplicate, and other non-search pages out of search results.
- Give every indexable route unique, useful search and social metadata.
- Improve page semantics, image accessibility, internal discovery, mobile usability, and Core Web Vitals.
- Add valid structured data only where page content supports it.
- Establish automated and manual checks that can be repeated after future releases.

## Scope

The work covers:

- Indexability and `noindex` rules
- Unique meta titles
- Unique meta descriptions
- Image alternative text
- Core Web Vitals
- `sitemap.xml`
- Open Graph and `og:image` metadata
- Broken links
- Heading hierarchy
- Clean URL slugs
- Internal linking
- Canonical tags
- HTTPS enforcement
- Image compression and optimization
- Schema markup
- Exactly one meaningful H1 per page
- `robots.txt`
- Mobile responsiveness

Out of scope:

- Google Search Console ownership verification
- Paid-search setup
- Keyword-driven editorial or blog production beyond the page copy changes needed to make metadata and headings accurate
- Backlink campaigns
- Redesigning the Fasthaus visual identity

## Current Codebase Starting Point

These were the observations before implementation, kept for history. See **Implementation Status** above for the current state.

- Framework: Next.js App Router, currently declared as Next.js 16 in `package.json`.
- Primary routes currently include `/`, `/about`, `/collection`, `/collection/[category]`, `/product/[slug]`, `/faq`, `/contact`, `/legal`, `/legal/[slug]`, `/shipping-returns`, `/warranty`, `/cart`, `/checkout`, and `/order/[id]`.
- Root metadata currently provides one site-wide title and description in `app/layout.tsx`; route-specific coverage needs a complete audit.
- `app/legal/[slug]/page.tsx` already provides an example of dynamic metadata, canonical URLs, Open Graph data, and JSON-LD.
- Product pages are statically generated from `lib/data/products.ts`, but the current `app/product/[slug]/page.tsx` does not expose route-specific metadata in the inspected version.
- `next.config.ts` already requests AVIF and WebP output through the Next.js image pipeline.
- A quick source scan did not find App Router `app/robots.ts` or `app/sitemap.ts`; confirm before adding them.
- The homepage and About experience include responsive heading variants that may create more than one H1 in the rendered document. The full route audit must confirm the final DOM at mobile and desktop widths.

## Priority Definitions

| Priority | Meaning                                                                        | Release expectation                                                 |
| -------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| P0       | Crawl, indexing, duplication, security, or release-blocking issue              | Complete before the SEO release ships                               |
| P1       | High-impact relevance, discovery, structured data, performance, or mobile work | Complete in the same release unless a measured dependency blocks it |
| P2       | Enhancement or follow-up optimization                                          | May follow after the baseline release, with an owner and ticket     |

## Recommended Execution Order

1. Establish a production baseline and route inventory.
2. Decide which routes should be indexed and define the canonical URL policy.
3. Implement HTTPS and host normalization before generating canonical or sitemap URLs.
4. Add route-level robots directives, `robots.txt`, and `sitemap.xml`.
5. Implement unique titles, descriptions, canonicals, and Open Graph metadata.
6. Correct H1 and heading structure, alternative text, URL slugs, and internal links.
7. Add validated structured data.
8. Optimize images and the elements affecting Core Web Vitals.
9. Test responsive behavior and the complete mobile purchase journey.
10. Crawl the release candidate, fix broken links, run automated checks, deploy, and monitor.

Do not start with schema or metadata copy before the route/indexability map and canonical policy are approved. Otherwise, work may be applied to pages that should not be indexed or to URLs that will later redirect.

---

## Phase 0: Baseline, Route Inventory, and Measurement

**Priority:** P0  
**Dependencies:** Access to the current Fasthaus repository and a production or production-like deployment  
**Outcome:** A documented baseline against which the implementation can be verified

### Implementation steps

1. Record the current branch, deployment URL, production hostname, and redirect behavior.
2. Inventory all App Router pages, dynamic route sources, API routes, query-string variants, and externally linked assets.
3. Build a route matrix containing:
   - Route pattern and example URL
   - Page purpose
   - Indexable: yes/no
   - Follow links: yes/no
   - Canonical target
   - Sitemap inclusion: yes/no
   - Metadata source
   - H1 text
   - Structured-data type
   - Primary internal-link sources
4. Crawl the deployed site with a crawler that can render JavaScript. Export status codes, indexability, titles, descriptions, H1s, canonicals, images, alt attributes, internal links, and redirect chains.
5. Record Lighthouse or equivalent lab results for the homepage, collection page, one category page, one product page, About, FAQ, Contact, cart, and checkout at mobile and desktop profiles.
6. Record real-user Core Web Vitals if available. Keep field data separate from lab data.
7. Save screenshots or test notes for key mobile widths and devices.
8. Add a short audit report to the implementation pull request so every change can be traced to a baseline finding.

### Initial route-intent proposal

Confirm this table against business and legal requirements before implementation.

| Route                                    |                                   Proposed indexability |      Sitemap | Canonical approach                                                                         |
| ---------------------------------------- | ------------------------------------------------------: | -----------: | ------------------------------------------------------------------------------------------ |
| `/`                                      |                                           Index, follow |          Yes | Self-canonical                                                                             |
| `/about`                                 |                                           Index, follow |          Yes | Self-canonical                                                                             |
| `/collection`                            |                                           Index, follow |          Yes | Self-canonical                                                                             |
| `/collection/[category]`                 |   Index, follow when the category is valid and valuable |          Yes | Self-canonical                                                                             |
| `/product/[slug]`                        |                Index, follow when the product is public |          Yes | Canonical to the clean product URL without the `variant` query parameter                   |
| `/faq`                                   |                                           Index, follow |          Yes | Self-canonical                                                                             |
| `/contact`                               |                                           Index, follow |          Yes | Self-canonical                                                                             |
| `/shipping-returns`                      |                                           Index, follow |          Yes | Self-canonical                                                                             |
| `/warranty`                              |                                           Index, follow |          Yes | Self-canonical                                                                             |
| `/legal` and valid `/legal/[slug]` pages | Confirm with the business; normally indexable if useful | If indexable | Self-canonical                                                                             |
| `/cart`                                  |                                         Noindex, follow |           No | Usually self-canonical; confirm against final policy                                       |
| `/checkout`                              |                                       Noindex, nofollow |           No | Usually self-canonical; confirm against final policy                                       |
| `/order/[id]`                            |                                       Noindex, nofollow |           No | Never expose order identifiers in a sitemap or canonical pointing to a public content page |
| `/api/*`                                 |                            Not a document-search target |           No | None                                                                                       |
| Invalid dynamic slugs and missing pages  |                                         Return true 404 |           No | None                                                                                       |

### Approved route matrix (implemented 2026-09-21)

Decisions confirmed with the business: canonical host is `https://www.fasthaus.ae`; legal pages are indexable; empty categories stay out of the sitemap; star ratings are not live, so no rating markup.

| Route | Robots | Sitemap | Canonical | H1 | Structured data | Metadata source |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | index, follow | Yes | Self | Hero headline | Organization, WebSite | `app/page.tsx` |
| `/about` | index, follow | Yes | Self | Story hero line | – | `app/about/page.tsx` |
| `/collection` | index, follow | Yes | Self | "Collection" | BreadcrumbList | `app/collection/page.tsx` |
| `/collection/[category]` (stocked) | index, follow | Yes | Self | Category name | BreadcrumbList | `lib/data/categories.ts` |
| `/collection/[category]` (no products) | **noindex, follow** | No | Self | Category name | BreadcrumbList | `lib/data/categories.ts` |
| `/collection/[unknown]` | – | No | – | – | – | **404** (`dynamicParams = false`) |
| `/product/[slug]` | index, follow | Yes | Clean `/product/{slug}` (drops `?variant=`) | Product name | Product + Offers, BreadcrumbList | `lib/seo/product.ts` |
| `/product/[unknown]` | – | No | – | – | – | **404** (rewritten in `proxy.ts`) |
| `/faq` | index, follow | Yes | Self | "You Ask. We Answer." | FAQPage | `app/faq/layout.tsx` |
| `/contact` | index, follow | Yes | Self | "Get in Touch" | – | `app/contact/layout.tsx` |
| `/legal/[slug]` (6 policies) | index, follow | Yes (with `lastmod`) | Self | Policy title | WebPage, BreadcrumbList | `lib/legal/content.ts` |
| `/legal` | – | No | – | – | – | **307** → `/legal/terms` (`next.config.ts`) |
| `/shipping-returns` | – | No | – | – | – | **308** → `/legal/shipping` |
| `/warranty` | – | No | – | – | – | **308** → `/legal/warranty` |
| `/cart` | **noindex, follow** | No | None | Cart state heading | – | `app/cart/layout.tsx` |
| `/checkout` | **noindex, nofollow** | No | None | "Checkout" heading | – | `app/checkout/layout.tsx` |
| `/order/[id]` | **noindex, nofollow** | No | None | Confirmation heading | – | `app/order/[id]/page.tsx` (static title, no order data) |
| `/api/*` | Disallowed in robots.txt | No | – | – | – | – |
| Any Vercel preview/development deployment | **noindex, nofollow** site-wide; robots.txt omits the sitemap | – | – | – | – | `lib/seo/site.ts` (`VERCEL_ENV`) |

### Validation and acceptance criteria

- Every reachable page template is present in the route matrix.
- Indexability, canonical behavior, and sitemap inclusion are explicitly decided for every route pattern.
- Baseline crawl and performance evidence is saved before implementation.
- Pages requiring authentication, checkout context, order data, or non-public state are identified.
- No implementation relies solely on visual inspection or a single Lighthouse run.

---

## Phase 1: Crawl Control, Indexability, Canonicals, HTTPS, Robots, and Sitemap

**Priority:** P0  
**Dependencies:** Phase 0 route matrix; confirmed production origin and preferred hostname  
**Outcome:** Search engines receive one consistent, secure, crawlable URL for every indexable page

### 1.1 HTTPS and preferred-host enforcement

#### Implementation steps

1. Confirm the canonical production origin, expected to be the secure Fasthaus domain. Store it in one server-safe configuration value, for example `NEXT_PUBLIC_SITE_URL`, and validate it at build time.
2. Configure the hosting/CDN layer to redirect all HTTP requests to HTTPS with permanent redirects.
3. Choose one hostname form, such as apex or `www`, and permanently redirect the other to it.
4. Ensure redirects preserve the path and legitimate query parameters.
5. Remove hard-coded non-canonical origins from metadata, JSON-LD, feeds, and internal links.
6. Confirm all first-party images, scripts, styles, fonts, forms, and API requests use HTTPS and do not cause mixed-content warnings.
7. Keep redirects to one hop wherever possible.

#### Acceptance criteria

- Every tested `http://` URL reaches the matching canonical `https://` URL in one permanent redirect.
- The non-preferred host reaches the preferred host in one permanent redirect.
- No redirect loop, mixed content, or inconsistent canonical origin is present.
- Canonical tags, Open Graph URLs, structured data, and sitemap entries use the same HTTPS hostname.

### 1.2 Indexability and `noindex`

#### Implementation steps

1. Apply route-level robots metadata through the Next.js Metadata API.
2. Set public content pages to `index, follow` unless the route matrix says otherwise.
3. Set cart and transactional pages to the approved `noindex` policy.
4. Set order-confirmation routes to `noindex, nofollow` and confirm they do not leak customer or order data into HTML metadata.
5. Return a genuine 404 response for invalid product, category, and legal slugs. Do not render a soft-404 page with status 200.
6. Do not use `robots.txt` disallow rules as a substitute for `noindex`. A crawler must be able to access a page to see its `noindex` directive.
7. Ensure staging, preview, and test deployments are not indexable. Prefer platform-level access control; otherwise apply an environment-controlled site-wide `noindex` header or metadata policy.
8. Audit response headers for accidental `X-Robots-Tag: noindex` on public pages.

#### Acceptance criteria

- Each public route emits the robots directive defined in the route matrix.
- Cart, checkout, order, preview, and other non-search pages cannot be indexed.
- No indexable URL is blocked from crawling by mistake.
- Invalid dynamic URLs return HTTP 404 and are absent from the sitemap.
- Production has no global `noindex` directive.

### 1.3 Canonical tags and duplicate controls

#### Implementation steps

1. Set `metadataBase` once at the root using the confirmed production origin.
2. Add a self-referencing canonical to each indexable page through `alternates.canonical`.
3. Generate dynamic canonicals for valid product, category, and legal slugs.
4. Canonicalize product variant URLs such as `?variant=...` to the clean product URL unless a variant has genuinely distinct, index-worthy content.
5. Define handling for tracking parameters such as `utm_*`, `gclid`, and `fbclid`; pages should normally canonicalize to the clean URL.
6. Normalize trailing-slash, case, and duplicate-path behavior through redirects rather than relying on canonicals alone.
7. Do not canonicalize missing, redirected, `noindex`, or unrelated pages to a generic page.

#### Acceptance criteria

- Every indexable 200-status page has exactly one absolute canonical URL.
- The canonical URL is HTTPS, uses the preferred host, returns 200, and is itself indexable.
- Product variant and marketing-parameter URLs resolve or canonicalize according to the approved policy.
- No canonical points through a redirect or to a 404 page.

### 1.4 `robots.txt`

#### Implementation steps

1. Add `app/robots.ts` using the Next.js metadata route convention.
2. Allow crawling of public assets and indexable pages.
3. Disallow crawl paths only when there is a specific crawl-efficiency or security reason. Never rely on robots rules to protect sensitive information.
4. Include the absolute sitemap URL.
5. Use environment-aware output so preview deployments do not advertise the production sitemap.

#### Acceptance criteria

- `/robots.txt` returns HTTP 200 and valid plain text.
- It references the canonical HTTPS sitemap URL.
- It does not block CSS, JavaScript, images, or any route intended for indexing.
- Its rules agree with page-level robots directives.

### 1.5 `sitemap.xml`

#### Implementation steps

1. Add `app/sitemap.ts` using the Next.js metadata route convention.
2. Generate entries from the actual route and content sources, including public products and valid categories.
3. Include only canonical, indexable, 200-status URLs.
4. Exclude cart, checkout, order, API, missing, redirected, preview, and `noindex` URLs.
5. Use meaningful `lastModified` values only when reliable source timestamps exist. Do not generate fake change dates on every build.
6. Avoid speculative `priority` and `changeFrequency` values unless there is a maintained business rule for them.
7. Add a test that compares generated product/category sitemap entries with their active data sources.

#### Acceptance criteria

- `/sitemap.xml` returns HTTP 200, valid XML, and only canonical HTTPS URLs.
- Every sitemap URL returns 200 and is indexable.
- All active public products and categories appear once.
- Non-public and transactional routes do not appear.
- There are no duplicate sitemap URLs.

### Implementation notes (2026-09-21)

- **Origin config:** `lib/seo/site.ts` exports `SITE_URL` (from `NEXT_PUBLIC_SITE_URL`, default `https://www.fasthaus.ae`, must be HTTPS), `absoluteUrl()`, and `IS_INDEXABLE_DEPLOYMENT`. Documented in `.env.local.example`. The old `fasthaus.studio` web origin is gone (the `hello@fasthaus.studio` email address is unchanged).
- **HTTPS/host:** already enforced by Vercel with 308s; no code change needed. `http://fasthaus.ae` still takes two hops (http→https on the apex, then apex→www); Vercel always upgrades to HTTPS first, so treat this as accepted unless the domain setup changes.
- **Robots metadata:** root `metadataBase` in `app/layout.tsx`; per-route policies via `pageMetadata({ noindex })` and `privatePageMetadata()` in `lib/seo/metadata.ts`. Previews get a site-wide `noindex, nofollow`.
- **Real 404s:** `dynamicParams = false` on category, legal and product routes. The product route streams (it reads `?variant=` on the server), so `notFound()` alone only produced a 200 + `noindex` soft-404; `proxy.ts` now rewrites unknown `/product/{slug}` paths to an unmatched route so Next.js serves `app/not-found.tsx` with a real 404.
- **Real redirects:** `/shipping-returns`, `/warranty` and `/legal` moved from page-level `redirect()` (200 + meta refresh) to `redirects()` in `next.config.ts` (308/308/307). The three redirect-only page files were deleted.
- **Canonicals:** every indexable page emits one absolute self-canonical; products always canonicalise to `/product/{slug}` without `?variant=`.
- **robots.txt:** `app/robots.ts` allows everything except `/api/`. Cart/checkout/order are deliberately *not* disallowed, so crawlers can read their `noindex`.
- **sitemap.xml:** `app/sitemap.ts` → `lib/seo/sitemap.ts#getSitemapEntries()`, built from `STATIC_INDEXABLE_PATHS`, stocked categories, `PRODUCTS` and `POLICIES`. `lastModified` only for legal pages (parsed as UTC from each policy's `updated` field); no build-time dates or `priority`/`changeFrequency` values.
- **Verified:** `npm run seo:check` against a local production build: 16 sitemap URLs return 200 with matching canonical and `og:url`, redirects return 308/307 with the right `Location`, and three invalid slugs return 404.

---

## Phase 2: Titles, Descriptions, Open Graph, and Social Metadata

**Priority:** P0 for missing/duplicate metadata; P1 for copy refinement  
**Dependencies:** Approved route and canonical policy; product/category source fields  
**Outcome:** Every indexable page communicates a distinct purpose in search and social previews

### Implementation steps

1. Define shared metadata utilities rather than duplicating URL and fallback logic across routes.
2. Set `metadataBase` and a title template at the root, while allowing the homepage to use a deliberate absolute title.
3. Add route-specific `metadata` or `generateMetadata` to every indexable page.
4. Generate product metadata from trusted product data:
   - Product name and relevant product type in the title
   - Accurate, benefit-led description derived from visible content
   - Clean canonical product URL
   - Product-specific social image and alt text
   - `openGraph.type` appropriate to the implementation
5. Generate category metadata from category names and visible collection copy.
6. Add unique metadata for About, FAQ, Contact, Shipping & Returns, Warranty, and any indexable legal pages.
7. Keep titles concise and descriptive. Use the brand once and avoid repeated keyword lists.
8. Keep descriptions specific to the page and aligned with visible content. Treat common character-count ranges as editorial guidance, not hard ranking rules.
9. Create a default Fasthaus social image and product/page-specific overrides where valuable.
10. Use absolute Open Graph image URLs through `metadataBase` or explicit absolute values.
11. Include Open Graph title, description, URL, site name, images, locale, and type as appropriate.
12. Add matching Twitter/X card metadata using `summary_large_image` where a large social image exists.
13. Provide meaningful alt text for social images.
14. Keep `noindex` utility and transaction pages from inheriting promotional social metadata where it could expose or misrepresent private states.

### Suggested metadata patterns

Use these as patterns, not final approved copy:

| Page type | Title pattern | Description focus |
| --- | --- | --- |
| Home | `Modern Lighting and Objects \| Fasthaus` | Brand proposition and primary product offering |
| Collection | `Lighting Collection \| Fasthaus` | Browse the available Fasthaus collection |
| Category | `{Category Name} \| Fasthaus` | What is distinctive about this category |
| Product | `{Product Name} \| Fasthaus` | Design, material/use benefit, and purchase relevance |
| About | `About Fasthaus \| Design Studio in the UAE` | Brand and design approach, using only substantiated claims |
| FAQ | `Frequently Asked Questions \| Fasthaus` | Ordering, delivery, product, and care questions actually answered on the page |
| Contact | `Contact Fasthaus` | How customers can contact the studio |

### Acceptance criteria

- Every indexable URL has one unique, non-empty title and description.
- No title or description is misleading, stuffed with keywords, or detached from visible page content.
- Each indexable page has a canonical Open Graph URL matching its HTML canonical.
- Social images return 200, use HTTPS, have correct dimensions/aspect ratio, and render in at least two social-debug preview tools or equivalent validators.
- Product shares use the correct product name, description, URL, image, and image alt text.
- A site crawl reports no unintended duplicate titles or descriptions.

### Implementation notes (2026-09-21)

- **Shared builder:** `pageMetadata()` in `lib/seo/metadata.ts` returns the title, description, canonical, a complete Open Graph object (title, description, url, siteName, `en_AE` locale, type, image with dimensions and alt) and a `summary_large_image` Twitter card. Next.js *replaces* rather than merges `openGraph` from parent layouts, so every page must go through this helper.
- **Root defaults:** `app/layout.tsx` sets `metadataBase`, the `%s | Fasthaus` title template, the default description and a default OG image.
- **Default social image:** `public/og/fasthaus-default.jpg` (1200×630, 129 KB, NASAQ lifestyle shot). Using the raw lifestyle PNGs would have meant ~21 MB images for social crawlers.
- **Client-component pages:** `/faq`, `/contact`, `/cart` and `/checkout` are `"use client"`, so their metadata lives in a sibling `layout.tsx`.
- **Product metadata** is generated in `lib/seo/product.ts` from product data only:
  - Title: `{name} {category singular}` → "NASAQ Table Lamp | Fasthaus".
  - Description: product `description` + "Made to order in the UAE from {first material}. Available in {colours} for/from AED {min price}." (≤180 characters).
  - Social image: the default variant's 1000×1000 `featuredImages.lightOn` render.
- **Titles in production:**

| Route | Title |
| --- | --- |
| `/` | Fasthaus \| Sculptural Lamps Made to Order in the UAE |
| `/about` | About Fasthaus \| Lighting Design Studio in the UAE |
| `/collection` | Shop the Lamp Collection \| Fasthaus |
| `/collection/table-lamps` | Table Lamps \| Fasthaus |
| `/product/nasaq-lamp` | NASAQ Table Lamp \| Fasthaus (same pattern for every product) |
| `/faq` | Frequently Asked Questions \| Fasthaus |
| `/contact` | Contact Us \| Fasthaus |
| `/legal/{slug}` | {Policy title} \| Fasthaus |

- **Verified:** the crawler found no duplicate titles or descriptions across the 16 sitemap URLs, and every `og:image` is absolute HTTPS and returns 200. *Not yet done:* checking previews in social debug tools (Facebook Sharing Debugger, LinkedIn Post Inspector, etc.) after deploy.

---

## Phase 3: Semantic Content, H1s, Alt Text, Slugs, and Internal Linking

**Priority:** P1, with broken document structure on core landing pages treated as P0  
**Dependencies:** Stable route templates and approved page naming  
**Outcome:** Pages are understandable to users, assistive technology, and crawlers without relying on visual layout

### 3.1 Exactly one meaningful H1 per page

#### Implementation steps

1. Inspect the rendered DOM of every page template at desktop and mobile widths.
2. Give each indexable page one H1 that describes the primary page topic.
3. Render the semantic H1 once. If the visual position or style changes responsively, reposition or restyle the same heading rather than rendering separate mobile and desktop H1 elements.
4. Change secondary visual headings to H2 or lower levels based on document structure.
5. Ensure conditional UI states do not accidentally render two H1 elements at once.
6. Review the homepage, About experience, cart states, product purchase component, checkout states, and order confirmation first because the source scan found multiple or state-dependent H1 declarations in these areas.

#### Acceptance criteria

- Every rendered page has exactly one visible, meaningful H1.
- The H1 is present in server-rendered HTML for indexable pages.
- Responsive variants do not create duplicate H1s in the DOM.
- The H1 accurately describes the page and is not only a logo, decorative phrase, or generic label.

### 3.2 Heading hierarchy

#### Implementation steps

1. Map each page outline from H1 through H2/H3 sections.
2. Replace headings used only for styling with non-heading elements and the appropriate typography class.
3. Avoid skipping heading levels unless the document structure genuinely warrants it.
4. Give major sections descriptive headings, including related products, product details, shipping, care, FAQ groups, and About sections.
5. Preserve accessible labels for accordions and disclosure controls.

#### Acceptance criteria

- Heading order forms a coherent outline when CSS is disabled.
- No page starts with an H2 before its H1.
- Headings identify sections rather than acting as generic styling hooks.
- Automated accessibility checks report no heading-order violations, with manual review confirming meaning.

### 3.3 Image alternative text

#### Implementation steps

1. Inventory every `Image`, `<img>`, background image, SVG, video poster, and product-media data field.
2. Classify each image as informative, functional, product, text-bearing, or decorative.
3. Write concise alt text for informative images based on the information the image contributes in context.
4. Give product images stable, descriptive alt text using product name, view, color/finish, or relevant context. Do not repeat the same text for every gallery angle.
5. Use empty alt text (`alt=""`) for genuinely decorative images so assistive technology can ignore them.
6. Give linked or button images alt text that describes the action or destination when no accessible text already exists.
7. Do not stuff keywords or prepend phrases such as “image of.”
8. Ensure critical information in CSS background images is also available as text or semantic content.
9. Treat social-image alt text separately from in-page image alt text.

#### Acceptance criteria

- Every rendered `<img>` has an `alt` attribute.
- Informative and product images have distinct, contextual text.
- Decorative images use empty alt text rather than redundant descriptions.
- Automated accessibility checks and manual screen-reader spot checks pass on core templates.

### 3.4 Clean URL slugs

#### Implementation steps

1. Audit all current paths and data-driven slugs.
2. Use lowercase, readable, hyphen-separated slugs without dates, internal IDs, file extensions, or unnecessary category nesting.
3. Keep established high-value URLs unless there is a clear benefit to changing them.
4. If a slug changes, create an explicit one-to-one permanent redirect from every old URL to the best new equivalent.
5. Update internal links, sitemap entries, canonicals, structured data, analytics references, merchant/feed URLs, and campaign destinations at the same time.
6. Preserve product IDs and analytics identifiers independently from human-readable URLs.
7. Add uniqueness validation to content/product data so two records cannot generate the same slug.

#### Acceptance criteria

- All public slugs are readable, lowercase, stable, and unique.
- Every retired URL redirects in one hop to a relevant live URL.
- No internal link points to a redirected URL.
- No indexed content is lost because of a slug migration.

### 3.5 Internal linking

#### Implementation steps

1. Ensure every indexable page is reachable through normal HTML links from the homepage or another crawlable hub.
2. Use descriptive anchor text that states the destination or product/category name.
3. Link product cards and related-product modules to canonical product URLs.
4. Connect the homepage to primary collections and priority products.
5. Connect category pages to all valid products in that category.
6. Add contextual links among product, FAQ, shipping, warranty, and contact content where genuinely helpful.
7. Add breadcrumbs to product and category templates if they improve navigation; align their visible structure with breadcrumb schema.
8. Avoid important navigation that works only through click handlers without valid `href` values.
9. Audit orphan pages and excessive repeated footer links.

#### Acceptance criteria

- Every indexable URL has at least one crawlable internal link.
- No indexable page is orphaned.
- Internal links use canonical destinations and do not rely on redirects.
- Anchor text is descriptive and not dominated by vague labels such as “click here.”
- Core product and collection pages are reachable within a small, intentional number of clicks from the homepage.

### Implementation notes (2026-09-21)

- **Consent manager H1 (site-wide):** `public/silktide-consent-manager.js` now renders its modal title as `<h2>`; the matching selector in `public/silktide-consent-manager.css` was updated. Checked that it renders the same (24px, weight 700). **If the Silktide script is ever re-downloaded from the vendor, reapply this change.**
- **Homepage:** the separate mobile and desktop hero blocks (two H1s) were merged into one responsive block in `app/page.tsx`. Measured at 390/800/1440 px: same position, widths and button layout as before. The "Our Story" button keeps its two styles through breakpoint wrappers, because `.btn` is unlayered CSS and would override Tailwind's `hidden` utility.
- **About:** the reduced-motion fallback's first panel is now a `<p>` (kept `font-bold`, since the global heading rule made it bold).
- **Heading order:** the product page's "Product details" moved from H3 to H2 (it followed the H1 directly). Every heading shares the same global weight rule, so it looks the same.
- **Verified:** after hydration, exactly one H1 on `/`, `/about`, `/collection`, `/collection/table-lamps`, `/product/nasaq-lamp`, `/faq`, `/contact`, `/legal/terms` and `/cart`. `seo:check` also asserts one H1 in the server HTML of every sitemap URL.
- **Alt text:**
  - Product gallery: "NASAQ lamp in Cobalt Blue, view 2 of 3" (was "NASAQ — image 2 of 3").
  - Dimension drawing: "Outline drawing of the NASAQ lamp showing its dimensions" (was "NASAQ illustration").
  - The rest of the inventory (cards, drawer, navbar, footer, homepage) already had contextual or empty alt text and was left as is.
- **FAQ:** answers are always rendered and toggled with the `hidden` attribute, so they're in the HTML for crawlers and FAQPage markup. The accordion buttons now expose `aria-expanded` and `aria-controls`.
- **Slugs:** all product and category slugs are already lowercase and hyphenated; no slug changes. Uniqueness and format are now enforced in `tests/seo.test.ts`.
- **Internal links:**
  - Product-page links now point straight to `/legal/shipping` and `/legal/warranty` instead of the redirecting URLs.
  - Product breadcrumbs deliberately leave out the category (business decision, 2026-09-21): the visible trail and its BreadcrumbList data are both Home / Collection / {Product}. As a result, nothing on the site links to category pages (`/collection/table-lamps`); they're reachable only through the sitemap. See Open Follow-ups.
  - Collection and category pages use the shared `components/seo/Breadcrumbs.tsx` (same visual style as before, plus `aria-current` and BreadcrumbList JSON-LD).
- **Follow-up (copy decision):** the About H1 is the poetic line "Before anything becomes a shape…", which doesn't describe the page. The title and description carry "About Fasthaus", but consider a more descriptive H1 or an eyebrow line.

---

## Phase 4: Structured Data / Schema Markup

**Priority:** P1  
**Dependencies:** Final page content, canonical URLs, product data, and visible navigation  
**Outcome:** Search engines receive accurate machine-readable descriptions that match visible Fasthaus content

### Implementation steps

1. Create typed server-side helpers that serialize JSON-LD safely.
2. Add site-level `Organization` or the most accurate business type with only verified fields:
   - Name
   - Canonical URL
   - Logo URL
   - Contact information when public
   - Verified social profiles
3. Add `WebSite` markup on the homepage. Add `SearchAction` only if the site has a functioning public site-search experience.
4. Add `Product` markup to public product pages using the same source as the visible page:
   - Name
   - Description
   - Image URLs
   - SKU when present
   - Brand
   - Offers with AED currency, price, availability, and canonical URL
   - Variant data only when correctly modeled and maintained
5. Do not add aggregate rating or review markup unless genuine reviews and the same rating are visible on the page.
6. Add `BreadcrumbList` only when matching breadcrumbs exist or the hierarchy is otherwise represented accurately.
7. Add `FAQPage` only when the FAQ content is visible and the current search-engine eligibility rules support the intended use. Do not expect a rich result merely because markup validates.
8. Reuse and review the existing JSON-LD approach in legal routes rather than creating unrelated serialization patterns.
9. Ensure schema URLs, prices, availability, names, and images agree with visible content, Open Graph metadata, and canonical URLs.
10. Prevent unsafe string injection when embedding JSON-LD in HTML.

### Validation and acceptance criteria

- Structured data passes schema syntax validation and the relevant rich-result tests without errors.
- Markup is present in server-rendered HTML.
- All marked-up claims are visible, accurate, and sourced from maintained application data.
- Product currency is AED and availability/price match the page at render time.
- No fake reviews, unsupported awards, or unverified business facts are added.
- One canonical entity is used consistently for Fasthaus rather than creating conflicting organization records.

### Implementation notes (2026-09-21)

- **Helpers:** `lib/seo/json-ld.ts` (builders + `serializeJsonLd()`, which escapes `<`) and `components/seo/JsonLd.tsx` (server-rendered native `<script type="application/ld+json">`).
- **Organization** (`@id` `https://www.fasthaus.ae/#organization`, on the homepage): name, URL, logo, email, telephone, Sharjah/AE address and Instagram, all taken from the public `/contact` page (values in `ORGANIZATION` in `lib/seo/site.ts`).
- **WebSite** (homepage): no `SearchAction`, since the site has no public search page.
- **Product** (every product page):
  - Fields: name, description (the visible `designStory`), URL, one image per colour, brand "Fasthaus", category, material and colours.
  - One `Offer` per variant: SKU, `?variant=` URL, price in AED, availability from `stock` (the same field the cart enforces), new condition, seller, and a 14-day `MerchantReturnPolicy` with the customer paying return shipping (from the refund policy and FAQ).
  - **No `aggregateRating`/`review`:** ratings are not live (a test enforces this).
- **BreadcrumbList:** product, category, collection and legal pages. Legal breadcrumb data is Home › Policy, because the visible "Legal" crumb isn't a link and `/legal` only redirects.
- **FAQPage** (`app/faq/layout.tsx`) is built from the same `lib/data/faq.ts` array the page renders. Google now shows FAQ rich results only for a small set of authoritative sites, so don't expect a rich result; the markup is accurate and harmless.
- **Legal WebPage:** `dateModified` from the policy's `updated` field; `isPartOf` references the WebSite `@id`.
- **Open:** run the homepage, a product page and `/faq` through the [Rich Results Test](https://search.google.com/test/rich-results) and the [Schema Markup Validator](https://validator.schema.org/) after deploy. Consider adding `shippingDetails` once shipping rates are defined in code (the PDP says "Delivery included" and the banner says "Free shipping").

---

## Phase 5: Image Optimization and Core Web Vitals

**Priority:** P1; regressions on primary landing/product pages are release-blocking  
**Dependencies:** Phase 0 performance baseline; final responsive layouts and image inventory  
**Outcome:** Fast, stable rendering without reducing the intended Fasthaus visual quality

### 5.1 Image compression and delivery

#### Implementation steps

1. Generate an image inventory with path, dimensions, encoded size, format, usage count, route, viewport role, and whether it can become the LCP image.
2. Keep source masters outside the production delivery path and generate appropriately compressed derivatives.
3. Continue using `next/image` for raster content where compatible.
4. Supply accurate `sizes` for responsive images so mobile devices do not download desktop-sized files.
5. Define intrinsic width/height or a stable aspect-ratio container for every image to prevent layout shift.
6. Preserve AVIF/WebP delivery, with a suitable fallback handled by the image pipeline.
7. Use quality settings per asset based on visual testing; do not apply one aggressive compression level to every product and lifestyle image.
8. Prioritize only the actual above-the-fold LCP image. Lazy-load below-the-fold imagery.
9. Avoid loading hidden desktop and mobile versions of the same large asset when only one is displayed.
10. Compress PNG/JPEG assets that do not require their current format; preserve SVG for suitable icons and logos.
11. Keep product color and surface detail visually accurate after compression.
12. Optimize poster images and videos together so media areas do not show a blank or black frame while loading.

#### Acceptance criteria

- No image is delivered substantially larger than its rendered requirement without a documented reason.
- Responsive image candidates and `sizes` match the actual layout.
- Above-the-fold media remains visually correct on Retina mobile and desktop displays.
- Images reserve layout space and do not cause material CLS.
- Decorative and content images retain the correct alt behavior after refactoring.

### 5.2 Core Web Vitals

Target the current “good” thresholds used by the measurement tooling at implementation time. At the time this plan was written, the standard 75th-percentile goals are:

- LCP: no more than 2.5 seconds
- INP: no more than 200 milliseconds
- CLS: no more than 0.1

#### LCP implementation steps

1. Identify the LCP element per route and viewport rather than assuming it is always the hero.
2. Ensure the LCP image or poster is discoverable in initial HTML, correctly prioritized, and not delayed by client-only logic.
3. Reduce render-blocking work, unnecessary client bundles, and main-thread animation initialization before the primary content is visible.
4. Review local font preload behavior, weights, and fallbacks.
5. Do not autoplay or preload more video data than required for the first meaningful frame.

#### INP implementation steps

1. Profile navigation, filters, galleries, drawers, variant selection, add-to-cart, and checkout interactions.
2. Break up long tasks, defer non-essential analytics or animation work, and avoid repeated synchronous layout measurement.
3. Keep feedback immediate for taps and clicks even when an async operation follows.
4. Test on a representative mid-range mobile device, not only a fast development machine.

#### CLS implementation steps

1. Reserve space for images, videos, consent UI, banners, product galleries, and async payment widgets.
2. Use stable font metrics and avoid content insertion above already-rendered content.
3. Ensure responsive media swaps do not change layout after hydration.
4. Test empty, loading, error, and populated commerce states.

#### Acceptance criteria

- Lab runs show no material regression from baseline on any audited template.
- Core public templates meet the agreed mobile performance budget or have a documented, measured exception.
- Field data is monitored after release when sufficient traffic becomes available.
- Performance checks are repeated with cold and warm caches.
- Media-loaded events are not treated as proof that a usable frame was visibly painted; physical-device visual checks are completed for critical media.

### Findings and follow-ups (2026-09-21; not yet implemented)

- **Not measured:** no Lighthouse or field Core Web Vitals baseline has been captured, and no performance change in this pass has been measured.
- **Large source assets:** 85 PNG/JPEG files in `public/` exceed 1.5 MB (lifestyle shots around 21 MB, `video-poster-test.png` 2 MB). `next/image` resizes them for on-page delivery, but they slow down image optimisation on the first request, bloat deployments, and would be served raw anywhere they're referenced outside `next/image` (for example as OG images, which is why the dedicated OG JPEG was created). Recommended: keep masters outside `public/` and commit 2560px-max JPEG/WebP derivatives.
- **Likely double download on mobile product pages (unverified):** `ProductGallery` renders both the mobile image and the desktop `<Image loading="eager">`, which is only hidden by `display:none` on mobile. Browsers still fetch eager images that are `display:none`. Confirm in the DevTools network panel, then lazy-load or conditionally render the desktop image.
- **Homepage LCP:** the hero is an autoplay video with a poster from `/video-poster-test.png` (3840×1918, 2 MB, requested at 960 px through `getImageProps`). Measure LCP on mobile before changing anything.

---

## Phase 6: Mobile Responsiveness and Usability

**Priority:** P1  
**Dependencies:** Final semantic and performance changes  
**Outcome:** Indexable content and the purchase journey work cleanly across real mobile devices and common viewport sizes

### Implementation steps

1. Test at representative widths, including 320, 360, 375, 390, 414, 768, 922, 1024, and a wide desktop viewport. Preserve the project's intentional 922px behavior where applicable.
2. Verify no horizontal overflow, clipped content, overlapping controls, unreadable text, or off-screen dialog content.
3. Confirm tap targets, spacing, form labels, validation messages, keyboard behavior, focus visibility, and sticky controls.
4. Confirm the navigation, collection browsing, product gallery, zoom/pan behavior, variant selection, cart, checkout, payment handoff, order confirmation, footer, consent manager, and legal pages.
5. Verify orientation changes and browser chrome/safe-area behavior on iOS.
6. Test content with increased text size and at 200% zoom where practical.
7. Verify primary content is not hidden behind motion, hover-only, or desktop-only interactions.
8. Test slow-network behavior using at least:
   - Moderate constrained profile: 1.5 Mbps down, 500 Kbps up, 150 ms latency
   - Severe constrained profile: 400 Kbps down, 150 Kbps up, 400 ms latency
9. Run cold-cache and warm-cache passes.
10. Complete the purchase journey on real iPhone Safari and Android Chrome before release.

### Validation and acceptance criteria

- No horizontal scrolling exists at the agreed test widths unless intentionally contained in a component.
- Navigation and all purchase controls remain usable by touch and keyboard.
- The main content, H1, product information, price, and primary CTA appear without relying on hover.
- Mobile media presents a usable poster or first frame during slow loading.
- Forms retain values and display actionable validation errors.
- The real-device purchase journey completes successfully on iPhone Safari and Android Chrome.

### Implementation notes (2026-09-21)

- The changed templates (homepage hero, product breadcrumb, FAQ, consent modal) were screenshot-checked in Chrome at 390, 800 and 1440 px against a local production build. The homepage hero geometry was measured to match the previous markup.
- **Open:** the full breakpoint sweep in this phase, the slow-network runs, and the real-device purchase journey on iPhone Safari and Android Chrome.

---

## Phase 7: Broken Links, Regression Testing, and Release

**Priority:** P0 for broken purchase/navigation links and indexability regressions; P1 for non-critical editorial links  
**Dependencies:** All earlier phases merged into a release candidate  
**Outcome:** A deployable SEO release with evidence that its routes, links, metadata, and templates behave as intended

### Implementation steps

1. Run a full internal crawl of the release candidate with JavaScript rendering enabled.
2. Check all internal links, image URLs, canonical URLs, Open Graph images, structured-data URLs, sitemap URLs, redirects, and form destinations.
3. Fix source links rather than leaving avoidable redirects in navigation.
4. Confirm every intentionally removed page has the correct 301/308 redirect or a genuine 404/410 response.
5. Run framework lint, type checks, tests, and a production build.
6. Add automated tests for:
   - Metadata and canonical generation for static and dynamic routes
   - Index/noindex policies for representative routes
   - Sitemap inclusion/exclusion
   - Valid and invalid product/category slugs
   - Exactly one H1 in rendered page templates
   - Broken internal links in generated output where feasible
   - JSON-LD serialization and required product fields
7. Run an accessibility scan and manually review page structure.
8. Re-run mobile and desktop performance tests using the same baseline conditions.
9. Validate social previews for the homepage and representative product/content pages.
10. Deploy during a monitored window with an immediate rollback path.
11. After deployment, re-crawl production and compare it with the release candidate.
12. Monitor server errors, redirects, 404s, real-user Web Vitals, and organic landing-page behavior. Search Console verification itself remains the user's responsibility.

### Validation and acceptance criteria

- No internal 4xx/5xx links remain.
- No redirect chains or loops remain in internal navigation.
- Every sitemap and canonical URL returns 200 and matches the indexability policy.
- No public route accidentally becomes `noindex` or blocked.
- Automated checks, production build, accessibility checks, schema validation, responsive QA, and real-device purchase tests pass.
- Production behavior matches the release candidate after deployment.

### Implementation notes (2026-09-21)

- **Unit tests** (`tests/seo.test.ts`, part of `npm test`). They check that:
  - The origin is the canonical host.
  - Product and category slugs are clean and unique.
  - Every product has a known category, a description, a design story, materials, SKUs, prices and existing `lightOn` images.
  - Product titles and descriptions are unique and at most 180 characters.
  - The sitemap is complete, with no duplicates, no private, redirecting or query-string URLs, and categories included only when stocked.
  - `pageMetadata` output is correct.
  - Product JSON-LD matches the data (AED, price, SKU, availability, no ratings) and FAQ JSON-LD covers every question.
  - JSON-LD escaping and description clamping work.
- **Crawler** (`scripts/seo-check.mjs`, run with `npm run seo:check [-- <base-url>]`). Against a running build it checks:
  - robots.txt and the sitemap.
  - For every sitemap URL: 200 status, exactly one H1 in the server HTML, canonical and `og:url` equal to the sitemap URL, no `noindex`, unique title and description, reachable absolute `og:image`, and valid JSON-LD.
  - Cart and checkout robots policies.
  - Real 404s for invalid slugs, and 308/307 redirects with the correct `Location`.
  - All internal links resolve without 4xx or redirect hops.
- **Results (2026-09-21, local production build):**
  - `npm test`: 47/47 pass.
  - `npm run seo:check -- http://localhost:3200`: all checks pass (16 sitemap URLs, 16 internal links).
  - `tsc --noEmit`: clean. `next build`: succeeds.
  - ESLint: 0 errors (4 pre-existing unused-variable warnings in untouched code).
- **Open:** deploy, run `npm run seo:check -- https://www.fasthaus.ae`, validate structured data and social previews, and submit `https://www.fasthaus.ae/sitemap.xml` in Search Console (verification itself is out of scope).

---

## Implementation Work Packages

Use separate, reviewable changes rather than one oversized change. Re-inspect the current source and working tree before starting each package, and preserve unrelated edits.

### Work Package A: Audit and URL policy

**Priority:** P0  
**Deliverables:** Route matrix, baseline crawl, metadata inventory, heading/image/link reports, performance baseline  
**Depends on:** Production URL access  
**Done when:** Phase 0 acceptance criteria pass

### Work Package B: Technical crawl foundation

**Priority:** P0  
**Deliverables:** Preferred-origin configuration, HTTPS/host redirects, route robots metadata, `app/robots.ts`, `app/sitemap.ts`, canonical utilities and route canonicals  
**Depends on:** Work Package A  
**Done when:** Phase 1 acceptance criteria and automated route tests pass

### Work Package C: Search and social metadata

**Priority:** P0/P1  
**Deliverables:** Root metadata template, static route metadata, dynamic product/category/legal metadata, default and route-specific social images  
**Depends on:** Work Package B and approved page copy/data  
**Done when:** Phase 2 acceptance criteria pass

### Work Package D: Page semantics and discovery

**Priority:** P1  
**Deliverables:** Single-H1 fixes, heading hierarchy, complete alt-text treatment, canonical internal links, slug/redirect updates, orphan-page fixes  
**Depends on:** Work Packages A-C; approved slug changes  
**Done when:** Phase 3 acceptance criteria pass

### Work Package E: Structured data

**Priority:** P1  
**Deliverables:** Shared JSON-LD helpers, Organization/WebSite markup, Product/Offer markup, breadcrumbs and FAQ schema where eligible  
**Depends on:** Stable metadata, URLs, visible content, and product fields  
**Done when:** Phase 4 acceptance criteria pass

### Work Package F: Performance, media, and mobile

**Priority:** P1  
**Deliverables:** Image inventory and optimized derivatives, responsive image fixes, LCP/INP/CLS remediation, slow-network and real-device QA record  
**Depends on:** Baseline and stable page templates  
**Done when:** Phases 5 and 6 acceptance criteria pass

### Work Package G: Release validation

**Priority:** P0  
**Deliverables:** Release-candidate crawl, broken-link fixes, build/test results, schema/social/accessibility reports, production post-deploy crawl  
**Depends on:** Work Packages B-F  
**Done when:** Phase 7 acceptance criteria pass

## Adding a New Product: SEO Checklist

Adding a product is the main ongoing SEO task. Most of the work is automatic: add an entry to `PRODUCTS` in `lib/data/products.ts`, and the product gets a static page, a sitemap entry, a canonical URL, a title, a description, an OG image, Product/Offer JSON-LD, breadcrumbs, and a place in the "You may also like" and collection grids. What still needs a human:

1. **Slug:** lowercase and hyphenated, readable, unique, e.g. `aurora-floor-lamp`. Never change a live slug without adding a 308 in `next.config.ts` `redirects()`.
2. **Category:** use an existing `slug` from `lib/data/categories.ts`, or add a new category there with `name`, `singular` and a true `description`. The first product in an empty category automatically makes that category indexable and adds it to the sitemap.
3. **`description`:** one distinctive sentence. It starts the meta description, so it must not repeat another product's.
4. **`designStory`:** shown on the page and used as the Product schema description. Check the product name is current (see the HAMRAH note below).
5. **`materials[0]`:** used in the meta description ("from plant-based PLA").
6. **Each variant** needs a unique `sku`, a real `price` (AED), an accurate `stock` (drives schema availability), a colour name, and a 1000×1000 `featuredImages.lightOn` PNG under 1 MB (used as the social image and schema image).
7. **Image files:** export at no more than 2560 px on the long edge. Don't commit 20 MB masters to `public/`.
8. **Alt text** is generated from name and colour, so give colours human names ("Cobalt Blue", not "BLU-02").
9. **No fake data:** don't populate ratings or reviews expecting them to reach search results. `aggregateRating` stays off until real reviews appear on the page.
10. **Verify:** run `npm test` (catches missing fields, duplicate slugs, titles or descriptions, and missing images), then `npm run build && npm start` and `npm run seo:check`.

For **new static pages**, export `metadata = pageMetadata({ title, description, path })` from the page (or from a sibling `layout.tsx` if the page is a client component), render exactly one H1, and add the path to `STATIC_INDEXABLE_PATHS` in `lib/seo/sitemap.ts`.

## Open Follow-ups

| Priority | Item | Owner/where |
| --- | --- | --- |
| P0 | Deploy, then run `npm run seo:check -- https://www.fasthaus.ae` on production | Release |
| P1 | Rich Results Test and Schema Markup Validator on `/`, one product page and `/faq`; social debug-tool previews | Release |
| P1 | Submit `/sitemap.xml` in Search Console once verified (verification itself is out of scope) | Owner |
| P1 | Lighthouse (mobile and desktop) baseline for `/`, `/collection`, one product, `/about`; start collecting field Web Vitals | Phase 5 |
| P1 | Confirm and fix the mobile product-gallery double image download | `components/product/pdp/ProductGallery.tsx` |
| P1 | Move large master images out of `public/`; commit optimised derivatives | `public/` |
| P1 | Real-device purchase journey on iPhone Safari and Android Chrome | Phase 6 |
| P2 | Copy fix: HAMRAH `designStory` starts "PEARL is…" (old name, visible on the page and in Product schema) | `lib/data/products.ts` |
| P2 | Data check: NASAQ spec says "Ø 22 cm × H 28 cm", but `dimensions` is `heightCm: 24, widthCm: 14` | `lib/data/products.ts` |
| P2 | Typo in the consent modal copy: "Fasthsaus" | Silktide config in `components/consent/SilktideConsentManager.tsx` |
| P2 | Stale homepage `featuredSummaries` keys (`luna-desk-lamp`, `arc-table-lamp`, …) don't match current product slugs | `app/page.tsx` |
| P2 | More descriptive About H1 (copy decision) | `components/about/AboutScrollStory.tsx` |
| P2 | Add `shippingDetails` to Offers once shipping rates are defined in code | `lib/seo/json-ld.ts` |
| P2 | The 404 page's H1 is just "404"; consider "Page not found" | `app/not-found.tsx` |
| P2 | Category pages have no internal links, since categories are hidden from product breadcrumbs. Either link them from the navbar or collection page once there are several categories, or drop stocked categories from the sitemap if they stay hidden | `lib/seo/sitemap.ts`, navigation |

## Files Added or Changed for SEO (2026-09-21)

- **New:**
  - `lib/seo/site.ts`, `lib/seo/metadata.ts`, `lib/seo/product.ts`, `lib/seo/json-ld.ts`, `lib/seo/sitemap.ts`
  - `lib/data/categories.ts`, `lib/data/faq.ts`
  - `components/seo/JsonLd.tsx`, `components/seo/Breadcrumbs.tsx`
  - `app/robots.ts`, `app/sitemap.ts`
  - `app/faq/layout.tsx`, `app/contact/layout.tsx`, `app/cart/layout.tsx`, `app/checkout/layout.tsx`
  - `public/og/fasthaus-default.jpg`, `tests/seo.test.ts`, `scripts/seo-check.mjs`
- **Changed:**
  - `app/layout.tsx`, `app/page.tsx`, `app/about/page.tsx`, `app/collection/page.tsx`, `app/collection/[category]/page.tsx`
  - `app/product/[slug]/page.tsx`, `app/product/[slug]/PDPClient.tsx`, `app/legal/[slug]/page.tsx`, `app/faq/page.tsx`, `app/order/[id]/page.tsx`
  - `components/about/AboutScrollStory.tsx`, `components/product/pdp/ProductGallery.tsx`, `components/product/pdp/PurchaseRow.tsx`, `components/product/pdp/ProductTabs.tsx`
  - `public/silktide-consent-manager.js`, `public/silktide-consent-manager.css`
  - `next.config.ts`, `proxy.ts`, `package.json` (`seo:check` script), `.env.local.example`
- **Deleted:** `app/shipping-returns/page.tsx`, `app/warranty/page.tsx`, `app/legal/page.tsx` (replaced by config redirects).

## Definition of Done

The SEO implementation is complete only when all of the following are true:

- The route matrix is current and approved.
- Every indexable page returns 200, is crawlable, has one canonical HTTPS URL, and appears in the sitemap where appropriate.
- Every non-indexable page has the correct robots directive and is absent from the sitemap.
- Every indexable page has a unique title, description, canonical, and appropriate social metadata.
- Every rendered page has exactly one meaningful H1 and a coherent heading outline.
- Every image has intentional alternative-text behavior.
- All public slugs are clean and any changed URLs have one-hop permanent redirects.
- Every indexable page is reachable through crawlable internal links.
- Structured data is accurate, visible-content-aligned, server-rendered, and valid.
- Images are appropriately sized and compressed without compromising important product detail.
- Core Web Vitals have been measured before and after the change, with no unexplained regression.
- Mobile layout and the purchase journey have passed real-device testing.
- The release-candidate and production crawls contain no unintended broken links, indexability conflicts, canonical conflicts, or sitemap errors.
- Google Search Console verification remains excluded and assigned to the user.

## Final Handoff Checklist

When handing this plan to Codex for implementation, provide:

- The current Fasthaus repository or worktree
- The target branch and deployment environment
- The confirmed canonical production origin and preferred hostname
- The approved route/indexability matrix
- Any approved metadata copy and social-image assets
- Permission boundaries for redirect, hosting, and CDN changes
- A requirement to report separately what was implemented, statically validated, runtime-verified, visually verified, and left as follow-up

Codex should inspect current files and callers before editing, preserve unrelated changes, use the existing Next.js App Router conventions, and avoid claiming browser, production, or Core Web Vitals validation unless those checks were actually performed.
