import { notFound } from "next/navigation";
import { PRODUCTS, getProductBySlug, getRelatedProducts } from "@/lib/data/products";
import ShopLayout from "@/components/layout/ShopLayout";
import ProductCard from "@/components/product/ProductCard";
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
      <div className="max-w-[1280px] mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
          <Link href="/" className="hover:underline">Home</Link>
          {" / "}
          <Link href="/shop" className="hover:underline">Shop</Link>
          {" / "}
          <span style={{ color: "var(--color-text-primary)" }}>{product.name}</span>
        </nav>

        <PDPClient product={product} />

        {/* You May Also Like */}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-[24px] font-semibold mb-8" style={{ color: "var(--color-text-primary)" }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} showRating />
              ))}
            </div>
          </section>
        )}
      </div>
    </ShopLayout>
  );
}
