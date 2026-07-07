import { notFound } from "next/navigation";
import { PRODUCTS, getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import ShopLayout from "@/components/layout/ShopLayout";
import RelatedProductCard from "@/components/product/pdp/RelatedProductCard";
import PDPClient from "./PDPClient";
import Link from "next/link";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(slug, product.category);

  return (
    <ShopLayout>
      <div className="bg-white pb-16 md:mt-28 md:pb-24">
        <div className="mx-auto max-w-[1240px] px-5 md:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2.5 pb-4 pt-4 text-[13.5px] md:pb-6 md:pt-7">
            <Link
              href="/"
              className="font-medium transition-colors hover:text-[var(--color-accent-amber)]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Home
            </Link>
            <span style={{ color: "var(--color-text-disabled)" }}>/</span>
            <Link
              href="/collection"
              className="font-medium transition-colors hover:text-[var(--color-accent-amber)]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Collection
            </Link>
            <span style={{ color: "var(--color-text-disabled)" }}>/</span>
            <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {product.name}
            </span>
          </nav>

          <PDPClient product={product} />

          {/* You may also like */}
          {related.length > 0 && (
            <section className="mt-14 md:mt-[72px]">
              <h2
                className="mb-5 text-[24px] font-extrabold tracking-[-0.02em] md:mb-6 md:text-[28px]"
                style={{ color: "var(--color-text-primary)" }}
              >
                You may also like
              </h2>
              <div className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
                {related.map((p) => (
                  <RelatedProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </ShopLayout>
  );
}
