import type { Product } from "../data/products.ts";
import type { Category } from "../data/categories.ts";
import { ORGANIZATION, SITE_NAME, SITE_URL, absoluteUrl } from "./site.ts";

type JsonLd = Record<string, unknown>;

export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Serializes JSON-LD for a <script type="application/ld+json"> tag. Escapes "<" so content
 * such as "</script>" inside product copy can never close the tag early (per the Next.js guide).
 */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl(ORGANIZATION.logo),
    email: ORGANIZATION.email,
    telephone: ORGANIZATION.telephone,
    address: { "@type": "PostalAddress", ...ORGANIZATION.address },
    sameAs: ORGANIZATION.sameAs,
  };
}

/** No SearchAction: the site has no public search results page. */
export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en-AE",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function productPath(product: Pick<Product, "slug">): string {
  return `/product/${product.slug}`;
}

/**
 * Product + one Offer per colour variant, sourced from the same data the page renders.
 * Deliberately omits aggregateRating/review: ratings are not shown on the page yet.
 */
export function productJsonLd(product: Product, category?: Category): JsonLd {
  const url = absoluteUrl(productPath(product));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.designStory || product.description,
    url,
    image: product.variants.map((variant) => absoluteUrl(variant.featuredImages.lightOn)),
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: SITE_NAME },
    ...(category ? { category: category.singular } : {}),
    material: product.materials.join(", "),
    color: product.variants.map((variant) => variant.color).join(", "),
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      sku: variant.sku,
      name: `${product.name} — ${variant.color}`,
      url: `${url}?variant=${encodeURIComponent(variant.id)}`,
      price: variant.price.toFixed(2),
      priceCurrency: "AED",
      availability:
        variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORGANIZATION_ID },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "AE",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
      },
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };
}
