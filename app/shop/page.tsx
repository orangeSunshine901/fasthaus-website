import ShopLayout from "@/components/layout/ShopLayout";
import ProductCard from "@/components/product/ProductCard";
import { PRODUCTS } from "@/lib/data/products";
import Image from "next/image";
import Link from "next/link";

export default function CollectionsPage() {
  return (
    <ShopLayout>
      {/* Hero */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: 320 }}>
        <Image src="/collections-hero-img-2.png" alt="Collection" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-16">
          <div
            className="inline-flex items-center gap-3 px-4 py-2 rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
          >
            <span className="text-white text-sm font-medium">Lamp 2</span>
            <Link
              href="/product/luna-desk-lamp"
              className="px-4 py-1.5 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: "var(--color-accent-amber)" }}
            >
              Shop now
            </Link>
          </div>
        </div>
      </section>

      {/* Collection Grid */}
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>
          <Link href="/" className="hover:underline">Home</Link>
          {" / "}
          <span style={{ color: "var(--color-text-primary)" }}>Shop</span>
        </nav>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Collection
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Browse our full collection of considered everyday lighting — built to last and made to love.
            </p>
          </div>
          <select
            className="h-10 px-3 pr-8 rounded-lg border text-sm outline-none"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
          >
            <option>Sort: Best Sellers</option>
            <option>Sort: Newest</option>
            <option>Sort: Price Low–High</option>
            <option>Sort: Price High–Low</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} showRating />
          ))}
        </div>
      </div>
    </ShopLayout>
  );
}
