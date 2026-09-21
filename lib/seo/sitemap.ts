import { PRODUCTS } from "../data/products.ts";
import { getIndexableCategories } from "../data/categories.ts";
import { POLICIES } from "../legal/content.ts";
import { productPath } from "./json-ld.ts";
import { absoluteUrl } from "./site.ts";

export type SitemapEntry = { url: string; lastModified?: Date };

/**
 * Indexable static routes. Deliberately excluded: /cart, /checkout, /order/* (noindex),
 * /api/*, and the redirect-only routes /legal, /shipping-returns and /warranty.
 */
export const STATIC_INDEXABLE_PATHS = ["/", "/collection", "/about", "/faq", "/contact"] as const;

/** Parses human dates such as "July 17, 2026" as UTC so the sitemap date does not shift a day. */
export function parseContentDate(value: string): Date | undefined {
  const time = Date.parse(`${value} 00:00 UTC`);
  return Number.isNaN(time) ? undefined : new Date(time);
}

/**
 * Every canonical, indexable URL, derived from the same data sources as the pages.
 * `lastModified` is only set where a real maintained date exists (legal "updated" dates);
 * no build-time timestamps are invented for other pages.
 */
export function getSitemapEntries(): SitemapEntry[] {
  return [
    ...STATIC_INDEXABLE_PATHS.map((path) => ({ url: absoluteUrl(path) })),
    ...getIndexableCategories().map((category) => ({
      url: absoluteUrl(`/collection/${category.slug}`),
    })),
    ...PRODUCTS.map((product) => ({ url: absoluteUrl(productPath(product)) })),
    ...POLICIES.map((policy) => {
      const lastModified = parseContentDate(policy.updated);
      return { url: absoluteUrl(`/legal/${policy.slug}`), ...(lastModified && { lastModified }) };
    }),
  ];
}
