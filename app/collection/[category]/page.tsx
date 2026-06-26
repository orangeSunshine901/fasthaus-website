import ShopLayout from "@/components/layout/ShopLayout";
import ProductCard from "@/components/product/ProductCard";
import { PRODUCTS } from "@/lib/data/products";
import Link from "next/link";

const categoryLabels: Record<string, string> = {
  "desk-lamps": "Desk Lamps",
  "table-lamps": "Table Lamps",
  "floor-lamps": "Floor Lamps",
};

export function generateStaticParams() {
  return [{ category: "desk-lamps" }, { category: "table-lamps" }, { category: "floor-lamps" }];
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const label = categoryLabels[category] ?? "All Products";
  const products = PRODUCTS.filter((p) => p.category === category);

  return (
    <ShopLayout>
      <div className="container-page py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>
          <Link href="/" className="hover:underline">
            Home
          </Link>
          {" / "}
          <Link href="/collection" className="hover:underline">
            Collection
          </Link>
          {" / "}
          <span style={{ color: "var(--color-text-primary)" }}>{label}</span>
        </nav>

        {/* Page header + sort dropdown */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between mb-8">
          <div>
            <h1 className="type-display-xl" style={{ color: "var(--color-text-primary)" }}>
              {label}
            </h1>
            <p className="type-body-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
              {products.length} products
            </p>
          </div>
          <select
            className="input-field min-h-10 self-start px-3 sm:self-auto"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <option>Sort: Featured</option>
            <option>Sort: Newest</option>
            <option>Sort: Price Low–High</option>
          </select>
        </div>

        {/* Product grid / empty state */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} showRating />
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
