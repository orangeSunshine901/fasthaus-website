import type { MetadataRoute } from "next";
import { IS_INDEXABLE_DEPLOYMENT, absoluteUrl } from "@/lib/seo/site";

/**
 * Cart, checkout and order pages are *not* disallowed here on purpose: crawlers must be able to
 * fetch them to see their noindex directive. Only the JSON API is kept out of the crawl.
 * Preview deployments stay crawlable (so the site-wide noindex is seen) but never advertise
 * the production sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  const rules = { userAgent: "*", allow: "/", disallow: "/api/" };
  if (!IS_INDEXABLE_DEPLOYMENT) return { rules };
  return { rules, sitemap: absoluteUrl("/sitemap.xml") };
}
