import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopLayout from "@/components/layout/ShopLayout";
import LegalLayout from "@/components/legal/LegalLayout";
import { POLICIES, getPolicy } from "@/lib/legal/content";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fasthaus.studio";

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

  const url = `${SITE_URL}/legal/${policy.slug}`;
  return {
    title: `${policy.title} — Fasthaus`,
    description: policy.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${policy.title} — Fasthaus`,
      description: policy.metaDescription,
      url,
      siteName: "Fasthaus",
      type: "website",
    },
  };
}

export default async function LegalPolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: policy.title,
    description: policy.metaDescription,
    url: `${SITE_URL}/legal/${policy.slug}`,
    dateModified: policy.updated,
    isPartOf: { "@type": "WebSite", name: "Fasthaus", url: SITE_URL },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Legal", item: `${SITE_URL}/legal` },
        {
          "@type": "ListItem",
          position: 3,
          name: policy.title,
          item: `${SITE_URL}/legal/${policy.slug}`,
        },
      ],
    },
  };

  return (
    <ShopLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LegalLayout slug={policy.slug} />
    </ShopLayout>
  );
}
