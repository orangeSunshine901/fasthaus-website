import Image from "next/image";
import Link from "next/link";
import ShopLayout from "@/components/layout/ShopLayout";
import ProductCard from "@/components/product/ProductCard";
import { getFeaturedProducts, getNewArrivals } from "@/lib/data/products";
import NewsletterForm from "@/components/ui/NewsletterForm";

const categories = [
  { label: "Desk Lamps", href: "/shop/desk-lamps", image: "/collection-image-1.png" },
  { label: "Table Lamps", href: "/shop/table-lamps", image: "/collection-image-2.png" },
  { label: "Floor Lamps", href: "/shop/floor-lamps", image: "/collection-image-3.png" },
  { label: "New Arrivals", href: "/shop", image: "/collection-image-4.png" },
];

export default function HomePage() {
  const featured = getFeaturedProducts();
  const newArrivals = getNewArrivals();

  return (
    <ShopLayout>
      {/* Hero */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: 520 }}>
        <Image
          src="/hero-img.png"
          alt="Modern Lamps"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-24 flex flex-col items-start gap-6">
          <h1 className="text-4xl md:text-5xl font-semibold text-white leading-tight max-w-lg">
            Modern Lamps,<br />Made to Glow Differently
          </h1>
          <p className="text-base text-white/80 max-w-md">
            Designed and produced every lamp in-house — combining digital fabrication with hands-on finishing.
          </p>
          <Link
            href="/shop"
            className="inline-block px-6 py-3 rounded-full text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--color-accent-amber)" }}
          >
            Shop Collection
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-[1280px] mx-auto px-6 py-16">
        <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
          Lamps with Character
        </h2>
        <p className="text-base mb-10" style={{ color: "var(--color-text-secondary)" }}>
          Meticulously designed for considered everyday living.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Category Strip */}
      <section className="max-w-[1280px] mx-auto px-6 pb-16">
        <h2 className="text-2xl font-semibold mb-8" style={{ color: "var(--color-text-primary)" }}>
          From Digital Form to Warm Light
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.label} href={cat.href} className="group block">
              <div
                className="relative rounded-xl overflow-hidden"
                style={{ aspectRatio: "1/1", backgroundColor: "var(--color-surface-muted)" }}
              >
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="mt-2 text-sm font-medium text-center" style={{ color: "var(--color-text-primary)" }}>
                {cat.label}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial band */}
      <section className="relative w-full overflow-hidden" style={{ minHeight: 360 }}>
        <Image src="/collections-hero-img-1.png" alt="Designed in Layers" fill className="object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 max-w-[1280px] mx-auto px-6 py-20">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">Designed in Layers</h2>
          <p className="text-white/80 max-w-md">
            Every Fasthaus lamp begins as a 3D model and ends as a hand-finished object. The gap between those two points is where the character lives.
          </p>
        </div>
      </section>

      {/* Who We Are */}
      <section className="max-w-[1280px] mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>Who We Are</h2>
          <p className="text-base mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Fasthaus is a design-led lighting studio based in Dubai. We believe good lighting should bring warmth and character to everyday spaces — so we design and produce every lamp in-house.
          </p>
          <Link
            href="/about"
            className="inline-block px-6 py-3 rounded-full text-sm font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: "var(--color-accent-amber)" }}
          >
            Visit about us
          </Link>
        </div>
        <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <Image src="/who-we-are-img.png" alt="Who We Are" fill className="object-cover" />
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-[1280px] mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>New Arrivals</h2>
          <Link href="/shop" className="text-sm font-medium" style={{ color: "var(--color-accent-amber)" }}>
            See all →
          </Link>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
          {newArrivals.map((product) => (
            <div key={product.id} className="min-w-[220px] snap-start">
              <ProductCard product={product} showRating />
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16" style={{ backgroundColor: "var(--color-surface-muted)" }}>
        <div className="max-w-[480px] mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold mb-2" style={{ color: "var(--color-text-primary)" }}>
            Subscribe to our Newsletter
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--color-text-secondary)" }}>
            New arrivals, studio stories, and the occasional lighting tip.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </ShopLayout>
  );
}
