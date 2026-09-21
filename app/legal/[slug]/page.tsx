import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopLayout from "@/components/layout/ShopLayout";
import LegalLayout from "@/components/legal/LegalLayout";
import JsonLd from "@/components/seo/JsonLd";
import { POLICIES, getPolicy } from "@/lib/legal/content";
import { pageMetadata } from "@/lib/seo/metadata";
import { WEBSITE_ID, breadcrumbJsonLd } from "@/lib/seo/json-ld";
import { absoluteUrl } from "@/lib/seo/site";
import { parseContentDate } from "@/lib/seo/sitemap";

export const dynamicParams = false;

export function generateStaticParams() {
  return POLICIES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return {};

  return pageMetadata({
    title: policy.title,
    description: policy.metaDescription,
    path: `/legal/${policy.slug}`,
  });
}

export default async function LegalPolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  const path = `/legal/${policy.slug}`;
  // "/legal" itself only redirects, so the trail skips straight from Home to the policy.
  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: policy.title, path },
  ];
  const dateModified = parseContentDate(policy.updated);

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: policy.title,
    description: policy.metaDescription,
    url: absoluteUrl(path),
    ...(dateModified && { dateModified: dateModified.toISOString().slice(0, 10) }),
    isPartOf: { "@id": WEBSITE_ID },
  };

  return (
    <ShopLayout>
      <JsonLd data={[webPage, breadcrumbJsonLd(breadcrumbs)]} />
      <LegalLayout slug={policy.slug} />
    </ShopLayout>
  );
}
