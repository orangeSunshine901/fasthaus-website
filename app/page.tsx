import Image from "next/image";
import Link from "next/link";
import ShopLayout from "@/components/layout/ShopLayout";
import FeaturedProductCard from "@/components/product/FeaturedProductCard";
import { getFeaturedProducts } from "@/lib/data/products";
import NewsletterForm from "@/components/ui/NewsletterForm";

const featuredSummaries: Record<string, string> = {
  "luna-desk-lamp": "A ribbed diffuser with a soft ambient glow for desks and reading corners.",
  "arc-table-lamp": "A sweeping silhouette that brings focused light and a sculptural presence to side tables.",
  "porta-table-lamp": "A compact rechargeable lamp that moves easily from desk to dining table to bedside.",
  "ribbed-table-lamp": "A tactile ceramic form that throws warm light and subtle shadow through its ribbed surface.",
};

const processSteps = [
  {
    number: "1",
    title: "Design",
    description:
      "We shape each lamp digitally, focusing on proportion, mood, and how the light will sit in a room.",
  },
  {
    number: "2",
    title: "Prototype",
    description:
      "Forms are tested, adjusted, and refined until the lamp feels right in scale, texture, and glow.",
  },
  {
    number: "3",
    title: "Print",
    description:
      "Each piece is produced using carefully selected materials and print settings for a clean, layered finish.",
  },
  {
    number: "4",
    title: "Finish & Assemble",
    description:
      "The final lamp is cleaned, checked, assembled, and prepared for everyday use.",
  },
];

const editorialPillars = [
  {
    title: "Form",
    description: "Designed to feel sculptural, simple, and warm.",
  },
  {
    title: "Material",
    description: "Selected for clean detail, lightness, and durability.",
  },
  {
    title: "Glow",
    description: "Diffused to create atmosphere rather than harsh brightness.",
  },
];

const newsletterImages = [
  {
    src: "/collection-image-1.png",
    alt: "Fasthaus collection detail",
    className: "-left-4 top-16 hidden rotate-[-14deg] md:block lg:left-10",
  },
  {
    src: "/collection-image-2.png",
    alt: "Fasthaus collection lamp",
    className: "left-8 bottom-12 hidden rotate-[10deg] md:block lg:left-24",
  },
  {
    src: "/collection-image-3.png",
    alt: "Fasthaus lighting texture",
    className: "-right-4 top-14 hidden rotate-[12deg] md:block lg:right-10",
  },
  {
    src: "/collection-image-4.png",
    alt: "Fasthaus product styling",
    className: "right-10 bottom-10 hidden rotate-[-10deg] md:block lg:right-24",
  },
];

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <ShopLayout>
      {/* Hero */}
      <section className="relative h-[540px] w-full overflow-hidden md:min-h-[460px] md:h-auto">
        <Image
          src="/hero-img.png"
          alt="Modern Lamps"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/75 to-neutral-900/20" />

        <div className="absolute left-5 top-[220px] z-10 flex w-[calc(100%-40px)] max-w-100 flex-col items-start gap-3.5 overflow-hidden md:hidden">
          <h1 className="type-display-xl self-stretch text-white">
            Modern Lamps, Made to Glow Differently
          </h1>
          <p className="type-body-md self-stretch text-white/90">
            Sculptural 3D-printed lamps designed to bring warmth, form, and character into everyday spaces.
          </p>
          <Link
            href="/shop"
            className="btn btn-primary w-full self-stretch"
          >
            Shop Collection
          </Link>
          <Link
            href="/about"
            className="btn btn-light w-full self-stretch border-white bg-white hover:bg-white/90"
          >
            Our Story
          </Link>
        </div>

        <div className="container-page relative z-10 hidden flex-col items-start gap-6 py-14 md:flex md:min-h-[460px] md:justify-center">
          <h1 className="type-display-xl max-w-lg text-white">
            Modern Lamps,
            <br />
            Made to Glow Differently
          </h1>
          <p className="type-body-md max-w-md text-white/80">
            Sculptural 3D-printed lamps designed to bring warmth, form, and character into everyday spaces.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/shop"
              className="btn btn-primary"
            >
              Shop Collection
            </Link>
            <Link
              href="/about"
              className="btn border-white/60 bg-transparent text-white hover:bg-white/10"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full" style={{ backgroundColor: "#060606" }}>
        <div className="container-page section-pad flex flex-col gap-12">
          <div className="flex max-w-[548px] flex-col gap-2">
            <p
              className="eyebrow"
              style={{ color: "var(--color-accent-amber)" }}
            >
              OUR PRODUCTS
            </p>
            <h2 className="type-display-lg text-white">
              Lamps with Character
            </h2>
            <p className="type-body-md" style={{ color: "#E5E5E5" }}>
              A small collection of sculptural lights designed for desks, shelves, bedside corners, and quiet evening spaces.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((product) => (
              <FeaturedProductCard
                key={product.id}
                product={product}
                summary={featuredSummaries[product.slug] ?? product.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Our Process */}
      <section className="w-full" style={{ backgroundColor: "#E5E5E5" }}>
        <div className="container-page section-pad">
          <div className="flex max-w-[640px] flex-col gap-[10px]">
          <h2 className="type-display-lg" style={{ color: "#1A1A1A" }}>
              From Digital Form to Warm Light
            </h2>
            <p className="type-body-md" style={{ color: "#575757" }}>
              Every FastHaus lamp begins as a digital design, then moves through prototyping, material testing, 3D printing, finishing, and assembly.
            </p>
          </div>
          <div className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {processSteps.map((step) => (
              <article
                key={step.number}
                className="card-surface flex h-full flex-col gap-3 p-6"
                style={{ borderColor: "#D6D6D6", backgroundColor: "#FFFFFF" }}
              >
                <span
                  className="btn-pill inline-flex w-fit items-center text-white"
                  style={{ backgroundColor: "#FF4B1F" }}
                >
                  {step.number}
                </span>
                <h3 className="type-title-md" style={{ color: "#1A1A1A" }}>
                  {step.title}
                </h3>
                <p className="type-caption-sm" style={{ color: "#575757" }}>
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial */}
      <section className="container-page section-pad">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,560px)_minmax(0,1fr)] lg:gap-14">
          <div className="media-rounded-lg relative" style={{ aspectRatio: "560 / 440" }}>
            <Image src="/collections-hero-img-1.png" alt="Designed in Layers" fill className="object-cover" />
          </div>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h2 className="type-display-lg" style={{ color: "#1A1A1A" }}>
                Designed in Layers
              </h2>
              <p className="type-body-md max-w-[620px]" style={{ color: "#575757" }}>
                We create lighting objects with purpose, shaped to bring form, function, and mood into a space.
              </p>
              <p className="type-body-md max-w-[620px]" style={{ color: "#575757" }}>
                Our filaments give each piece its clean finish, light structure, and layered detail. The result is a lamp that feels soft from a distance and considered up close.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {editorialPillars.map((pillar) => (
                <article
                  key={pillar.title}
                  className="card-surface flex h-full flex-col gap-3 p-5"
                  style={{ borderColor: "#E5E5E5", backgroundColor: "#FFFFFF" }}
                >
                  <h3 className="type-title-md" style={{ color: "#1A1A1A" }}>
                    {pillar.title}
                  </h3>
                  <p className="type-caption-sm" style={{ color: "#575757" }}>
                    {pillar.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="w-full" style={{ backgroundColor: "#E5E5E5" }}>
        <div className="container-page section-pad">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-14">
            <div className="max-w-[580px]">
              <h2 className="type-display-lg" style={{ color: "#1A1A1A" }}>
                Who We Are
              </h2>
              <p className="type-body-md mt-4" style={{ color: "#575757" }}>
                Fueled by a love for design and storytelling, we create 3D-printed spatial objects that bring form, function, and character into personal spaces.
              </p>
              <p className="type-body-md mt-4" style={{ color: "#575757" }}>
                Each piece is shaped with intention, built with considered materials, and made to make your room feel a little more like you.
              </p>
              <Link
                href="/about"
                className="btn btn-outline mt-8 hover:bg-black hover:text-white"
                style={{ borderColor: "#1A1A1A", color: "#1A1A1A" }}
              >
                Learn more about FastHaus
              </Link>
            </div>
            <div className="media-rounded-lg relative" style={{ aspectRatio: "520 / 400" }}>
              <Image src="/who-we-are-img.png" alt="Who We Are" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section
        className="relative w-full overflow-hidden px-5 py-12 md:px-8 md:py-16"
        style={{ backgroundColor: "var(--color-accent-amber)" }}
      >
        <div className="relative mx-auto max-w-[1280px]">
          {newsletterImages.map((image) => (
            <div
              key={image.src}
              className={`absolute h-[128px] w-[128px] overflow-hidden rounded-[32px] border border-black/10 shadow-[0_24px_50px_rgba(0,0,0,0.18)] lg:h-[148px] lg:w-[148px] ${image.className}`}
            >
              <Image src={image.src} alt={image.alt} fill className="object-cover" />
            </div>
          ))}

          <div className="relative z-10 mx-auto flex max-w-[720px] flex-col items-center text-center">
            <div className="mb-6 inline-flex h-[60px] w-[60px] items-center justify-center rounded-full bg-transparent">
              <Image src="/newsletter-icon.svg" alt="" width={40} height={40} className="h-12 w-12" />
            </div>
            <h2
              className="type-display-xl w-full max-w-[405px] text-center"
              style={{ color: "var(--color-text-primary)" }}
            >
              Subscribe to our Newsletter
            </h2>
            <p
              className="type-body-md mt-4 max-w-[520px]"
              style={{ color: "var(--color-text-primary)" }}
            >
              New arrivals, studio stories, and the occasional lighting tip.
            </p>
            <div className="mt-10 w-full">
              <NewsletterForm variant="featured" />
            </div>
          </div>
        </div>
      </section>
    </ShopLayout>
  );
}
