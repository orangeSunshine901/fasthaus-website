import { notFound } from "next/navigation";
import { PRODUCTS, getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import ShopLayout from "@/components/layout/ShopLayout";
import RelatedProductCard from "@/components/product/pdp/RelatedProductCard";
import PDPClient from "./PDPClient";
import Link from "next/link";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string | string[] }>;
}) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const variantParam = (await searchParams).variant;
  const requestedVariantId = Array.isArray(variantParam) ? variantParam[0] : variantParam;
  const initialVariant =
    product.variants.find((variant) => variant.id === requestedVariantId) ?? product.variants[0];

  const related = getRelatedProducts(slug, product.category);

  return (
    <ShopLayout>
      <div className="relative bg-white pb-16 md:pb-24">
        <div className="absolute inset-x-0 top-14 z-30 bg-transparent md:top-28">
          <nav className="mx-auto flex max-w-[1240px] items-center gap-2.5 px-5 py-4 text-[13.5px] md:px-6 lg:px-8">
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
        </div>

        <div className="mx-auto max-w-[1240px] px-5 md:px-6 lg:px-8">
          <PDPClient
            key={initialVariant.id}
            product={product}
            initialVariantId={initialVariant.id}
          />

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
