import ShopLayout from "@/components/layout/ShopLayout";
import ProductCard from "@/components/product/ProductCard";
import { PRODUCTS } from "@/lib/data/products";
import Link from "next/link";
import CollectionHero, { type CollectionHeroSlide } from "@/components/collection/CollectionHero";
import CollectionViewed from "@/components/analytics/CollectionViewed";

const COLLECTION_HERO_SLIDES = [
  {
    id: "stack-blue",
    lampName: "NASAQ",
    colorName: "BLUE",
    image: "/stack-lamp/stack-lamp-blue-off.png",
    colors: ["#101522", "#155EEF", "#C8DBFF", "#F7F9FF"],
  },
  {
    id: "pearl-red",
    lampName: "HAMRAH",
    colorName: "RED",
    image: "/pearl-lamp/pearl-lamp-red-off.png",
    colors: ["#171013", "#D62335", "#FFD1CC", "#FFF7F4"],
  },
  {
    id: "mushroom-orange",
    lampName: "KASANE",
    colorName: "ORANGE",
    image: "/mushroom-lamp/mushroom-orange-off.png",
    colors: ["#141114", "#FF4B1F", "#FFDBD2", "#F8F6F3"],
  },
  {
    id: "flute-matcha",
    lampName: "NUJĀJ",
    colorName: "MATCHA",
    image: "/flute-lamp/flute-matcha-off.png",
    colors: ["#101711", "#75984D", "#DCE8B9", "#F7F7ED"],
  },
] as const satisfies readonly CollectionHeroSlide[];

export default function CollectionsPage() {
  return (
    <ShopLayout>
      <CollectionViewed collection="all" productCount={PRODUCTS.length} />
      {/* Hero */}
      <CollectionHero slides={COLLECTION_HERO_SLIDES} />

      {/* Collection Grid */}
      <div className="container-page py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="text-sm mb-2" style={{ color: "var(--color-text-secondary)" }}>
          <Link href="/" className="hover:underline">
            Home
          </Link>
          {" / "}
          <span style={{ color: "var(--color-text-primary)" }}>Collection</span>
        </nav>

        {/* Page header */}
        <div className="mb-8">
          <div>
            <h1 className="type-display-xl" style={{ color: "var(--color-text-primary)" }}>
              Collection
            </h1>
            <p className="type-body-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
              Browse our full collection of considered everyday lighting — built to last and made to
              love.
            </p>
          </div>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </ShopLayout>
  );
}
