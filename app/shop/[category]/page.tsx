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
  return [
    { category: "desk-lamps" },
    { category: "table-lamps" },
    { category: "floor-lamps" },
  ];
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const label = categoryLabels[category] ?? "All Products";
  const products = PRODUCTS.filter((p) => p.category === category);

  return (
    <ShopLayout>
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <nav className="text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>
          <Link href="/" className="hover:underline">Home</Link>
          {" / "}
          <Link href="/shop" className="hover:underline">Shop</Link>
          {" / "}
          <span style={{ color: "var(--color-text-primary)" }}>{label}</span>
        </nav>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {label}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
              {products.length} products
            </p>
          </div>
          <select
            className="h-10 px-3 rounded-lg border text-sm outline-none"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <option>Sort: Featured</option>
            <option>Sort: Newest</option>
            <option>Sort: Price Low–High</option>
          </select>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} showRating />
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <p className="text-lg font-medium mb-4" style={{ color: "var(--color-text-primary)" }}>
              No products found
            </p>
            <Link
              href="/shop"
              className="inline-block px-6 py-3 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: "var(--color-accent-amber)" }}
            >
              Browse all products
            </Link>
          </div>
        )}
      </div>
    </ShopLayout>
  );
}
