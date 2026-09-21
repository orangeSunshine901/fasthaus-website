/**
 * Single source of truth for the public origin and site-wide SEO defaults.
 *
 * Production serves https://www.fasthaus.ae (http:// and the apex domain 308 to it on Vercel),
 * so canonicals, Open Graph URLs, JSON-LD and the sitemap must all use that exact origin.
 * Kept free of Next.js runtime imports so it can be unit-tested with `node --test`.
 */

const PRODUCTION_ORIGIN = "https://www.fasthaus.ae";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || PRODUCTION_ORIGIN;
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error(`NEXT_PUBLIC_SITE_URL must use HTTPS (received ${raw}).`);
  }
  return url.origin;
}

export const SITE_URL = resolveSiteUrl();
export const SITE_NAME = "Fasthaus";
export const SITE_LOCALE = "en_AE";

export const DEFAULT_TITLE = "Fasthaus | Sculptural Lamps Made to Order in the UAE";
export const DEFAULT_DESCRIPTION =
  "Sculptural table and desk lamps designed in-house and made to order in Sharjah from plant-based material. Delivered across all seven UAE emirates.";

/** 1200×630 brand image used whenever a page has no more specific social image. */
export const DEFAULT_OG_IMAGE = {
  url: "/og/fasthaus-default.jpg",
  width: 1200,
  height: 630,
  alt: "NASAQ lamp glowing warmly on a plinth in a softly lit room",
};

/** Public business facts, all visible on /contact. Only add fields that are verified. */
export const ORGANIZATION = {
  email: "hello@fasthaus.studio",
  telephone: "+971527391317",
  logo: "/fasthaus-logo-final.svg",
  sameAs: ["https://www.instagram.com/fasthaus.studio/"],
  address: { addressLocality: "Sharjah", addressRegion: "Sharjah", addressCountry: "AE" },
};

/**
 * Only the production deployment may be indexed. Vercel preview/development deployments
 * (and any non-Vercel build that sets VERCEL_ENV) emit a site-wide noindex instead.
 */
export const IS_INDEXABLE_DEPLOYMENT =
  !process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production";

export function absoluteUrl(path = "/"): string {
  return new URL(path, SITE_URL).toString().replace(/\/$/, "") || SITE_URL;
}
