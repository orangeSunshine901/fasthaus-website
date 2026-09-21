import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ShopLayout from "@/components/layout/ShopLayout";
import ProductCard from "@/components/product/ProductCard";
import Link from "next/link";
import CollectionViewed from "@/components/analytics/CollectionViewed";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { CATEGORIES, getCategory, getCategoryProducts } from "@/lib/data/categories";
import { pageMetadata } from "@/lib/seo/metadata";

// Unknown category slugs return a real 404 instead of an "All Products" soft-404.
export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};

  return pageMetadata({
    title: category.name,
    description: category.description,
    path: `/collection/${category.slug}`,
    // Empty categories stay reachable but out of the index (and the sitemap) until stocked.
    noindex: getCategoryProducts(category.slug).length === 0,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const products = getCategoryProducts(category.slug);

  return (
    <ShopLayout>
      <CollectionViewed collection={category.slug} productCount={products.length} />
      <div className="container-page py-8 md:py-12">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Collection", path: "/collection" },
            { name: category.name, path: `/collection/${category.slug}` },
          ]}
        />

        {/* Page header */}
        <div className="mb-8">
          <div>
            <h1 className="type-display-xl" style={{ color: "var(--color-text-primary)" }}>
              {category.name}
            </h1>
            <p className="type-body-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
              {category.description}
            </p>
            <p className="type-body-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
              {products.length} {products.length === 1 ? "product" : "products"}
            </p>
          </div>
        </div>

        {/* Product grid / empty state */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="type-display-sm mb-4" style={{ color: "var(--color-text-primary)" }}>
              No products found
            </p>
            <Link href="/collection" className="btn btn-primary">
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
