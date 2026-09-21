import ShopLayout from "@/components/layout/ShopLayout";
import ProductCard from "@/components/product/ProductCard";
import { PRODUCTS } from "@/lib/data/products";
import CollectionHero, { type CollectionHeroSlide } from "@/components/collection/CollectionHero";
import CollectionViewed from "@/components/analytics/CollectionViewed";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { pageMetadata } from "@/lib/seo/metadata";

export const metadata = pageMetadata({
  title: "Shop the Lamp Collection",
  description:
    "Browse the full Fasthaus collection of sculptural lamps, each made to order in the UAE from plant-based material and available in several colours.",
  path: "/collection",
});

const COLLECTION_HERO_SLIDES = [
  {
    id: "nasaq-blue",
    lampName: "NASAQ",
    colorName: "COBALT BLUE",
    href: "/product/nasaq-lamp?variant=3-cobalt-blue",
    image: "/stack-lamp/stack-lamp-blue-off-shadow.png",
    colors: ["#101522", "#155EEF", "#C8DBFF", "#F7F9FF"],
  },
  {
    id: "pearl-red",
    lampName: "HAMRAH",
    colorName: "CHERRY RED",
    href: "/product/hamrah-lamp?variant=4-cherry-red",
    image: "/pearl-lamp/pearl-lamp-red-off-shadow.png",
    colors: ["#171013", "#7c1d21", "#FFD1CC", "#FFF7F4"],
  },
  {
    id: "mushroom-orange",
    lampName: "KASANE",
    colorName: "TANGERINE",
    href: "/product/kasane-lamp?variant=2-tangerine",
    image: "/mushroom-lamp/mushroom-orange-off.png",
    colors: ["#141114", "#FF4B1F", "#FFDBD2", "#F8F6F3"],
  },
  {
    id: "flute-matcha",
    lampName: "NUJAJ",
    colorName: "MATCHA",
    href: "/product/nujaj-desk-lamp?variant=1-matcha",
    image: "/flute-lamp/flute-matcha-off-shadow.png",
    colors: ["#101711", "#cfd5ad", "#e2efb8", "#F7F7ED"],
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
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Collection", path: "/collection" },
          ]}
        />

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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </ShopLayout>
  );
}
