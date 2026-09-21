import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE, SITE_LOCALE, SITE_NAME, absoluteUrl } from "./site.ts";

type SocialImage = { url: string; width: number; height: number; alt: string };

type PageMetadataInput = {
  /** Page title without the brand; the root layout template appends " | Fasthaus". */
  title: string;
  description: string;
  /** Clean path for the canonical URL, e.g. "/product/nasaq-lamp" (never include query strings). */
  path: string;
  image?: SocialImage;
  /** Use when the title must not receive the " | Fasthaus" suffix (e.g. the homepage). */
  absoluteTitle?: boolean;
  /** Keeps the page out of search results. Links are still followed unless `nofollow` is set. */
  noindex?: boolean;
  nofollow?: boolean;
};

/**
 * Builds the full metadata set for one indexable page: title, description, self-canonical,
 * Open Graph and Twitter card. Open Graph and Twitter objects replace (not merge with) the
 * parent layout's, so every page must pass through here to keep them complete.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  absoluteTitle = false,
  noindex = false,
  nofollow = false,
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: "website",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [{ url: image.url, alt: image.alt }],
    },
    ...(noindex || nofollow ? { robots: { index: !noindex, follow: !nofollow } } : {}),
  };
}

/** Metadata for cart/checkout/order style pages: a plain title and an explicit robots policy. */
export function privatePageMetadata(title: string, { follow }: { follow: boolean }): Metadata {
  return { title, robots: { index: false, follow } };
}

/** Trims copy to a search-snippet-friendly length on a word boundary. */
export function clampDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:—–-]+$/, "")}…`;
}
