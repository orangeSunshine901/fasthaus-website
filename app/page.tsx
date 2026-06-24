import Image from "next/image";
import Link from "next/link";
import ShopLayout from "@/components/layout/ShopLayout";
import FeaturedProductCard from "@/components/product/FeaturedProductCard";
import { getFeaturedProducts } from "@/lib/data/products";
import NewsletterForm from "@/components/ui/NewsletterForm";

const featuredSummaries: Record<string, string> = {
  "luna-desk-lamp": "A ribbed diffuser with a soft ambient glow for desks and reading corners.",
  "arc-table-lamp":
    "A sweeping silhouette that brings focused light and a sculptural presence to side tables.",
  "porta-table-lamp":
    "A compact rechargeable lamp that moves easily from desk to dining table to bedside.",
  "ribbed-table-lamp":
    "A tactile ceramic form that throws warm light and subtle shadow through its ribbed surface.",
};

const purposeSteps = [
  {
    title: "Form",
    description:
      "Simple shapes with a quiet charm. Made to sit beautifully in a space without trying too hard.",
    icon: "/lamp-icon.svg",
  },
  {
    title: "Made to order",
    description: "We make what is needed, avoid excess, and create each piece with more care.",
    icon: "/3d-printer-icon.svg",
  },
  {
    title: "Glow",
    description:
      "Soft light for better moods, calmer corners and spaces that feel a little more alive.",
    icon: "/bulb-glow-icon.svg",
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
      <section className="relative h-[540px] w-full overflow-hidden md:h-[740px]">
        <Image
          src="/hero-img-1.jpg"
          alt="Modern Lamps"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-neutral-950/35 to-transparent" />

        <div className="absolute left-5 top-[220px] z-10 flex w-[calc(100%-40px)] max-w-100 flex-col items-start gap-3.5 overflow-hidden md:hidden">
          <h1 className="type-display-xl self-stretch text-white">
            Modern Lamps, Made to Glow Differently
          </h1>
          <p className="type-body-md self-stretch text-white/90">
            Sculptural 3D-printed lamps designed to bring warmth, form, and character into everyday
            spaces.
          </p>
          <Link href="/shop" className="btn btn-primary w-full self-stretch">
            Shop Collection
          </Link>
          <Link
            href="/about"
            className="btn btn-light w-full self-stretch border-white bg-white hover:bg-white/90"
          >
            Our Story
          </Link>
        </div>

        <div className="container-page absolute left-1/2 top-[420px] z-10 hidden -translate-x-1/2 flex-col items-start gap-6 md:flex">
          <h1 className="type-display-xl max-w-lg text-white">
            Modern Lamps,
            <br />
            Made to Glow Differently
          </h1>
          <p className="type-body-md max-w-md text-white/80">
            Sculptural 3D-printed lamps designed to bring warmth, form, and character into everyday
            spaces.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="btn btn-primary">
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
      <section
        id="featured-products"
        className="scroll-target w-full"
        style={{ backgroundColor: "#060606" }}
      >
        <div className="container-page section-pad flex flex-col gap-12">
          <div className="flex max-w-[548px] flex-col gap-4">
            <p className="eyebrow" style={{ color: "var(--color-accent-amber)" }}>
              OUR PRODUCTS
            </p>
            <h2 className="type-display-lg text-white">Lamps with Character</h2>
            <p className="type-body-md" style={{ color: "#E5E5E5" }}>
              A small collection of sculptural lights designed for desks, shelves, bedside corners,
              and quiet evening spaces.
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
      <section
        id="designed-in-layers"
        className="scroll-target w-full bg-[var(--color-bg)] px-6 pb-10 pt-16 md:px-8 md:py-24"
      >
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-10 xl:min-h-[fit-content] xl:gap-[32px]">
          <div className="flex w-full flex-col items-start gap-4 md:max-w-[704px]">
            <p className="eyebrow" style={{ color: "var(--color-accent-amber)" }}>
              OUR PROCESS
            </p>
            <h2 className="type-display-lg font-bold leading-[120px] text-[var(--color-text-primary)] md:text-6xl md:leading-[68px] w-[400px]">
              Designed with Purpose Made with Care
            </h2>
            {/* <div className="h-[3px] w-16 bg-[var(--color-accent-amber)]" /> */}
          </div>

          <div className="flex w-full flex-col items-start gap-4">
            <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
              {purposeSteps.map((step) => (
                <article
                  key={step.title}
                  className="flex w-full flex-col items-start gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 md:h-60 md:gap-5 md:p-8"
                >
                  <div className="hidden h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[12px] bg-[var(--color-surface)] md:flex">
                    <Image
                      src={step.icon}
                      alt=""
                      width={24}
                      height={24}
                      aria-hidden="true"
                      className="h-6 w-6"
                    />
                  </div>
                  <Image
                    src={step.icon}
                    alt=""
                    width={44}
                    height={44}
                    aria-hidden="true"
                    className="h-11 w-11 md:hidden"
                  />
                  <div className="flex w-full flex-col items-start gap-3">
                    <div className="flex w-full flex-col items-start gap-2 md:gap-3">
                      <h3 className="w-full type-display-md font-bold leading-7 text-[var(--color-text-primary)]">
                        {step.title}
                      </h3>
                      <div className="h-0.5 w-10 bg-[var(--color-accent-amber)]" />
                    </div>
                    <p className="w-full text-base font-normal leading-6 text-[var(--color-text-secondary)]">
                      {step.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="flex w-full items-center gap-4 rounded-2xl bg-[#EEF7E8] p-5 md:h-20 md:gap-8 md:p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[var(--color-border)] bg-[var(--color-bg)]">
                <Image src="/leaf-icon.svg" alt="" width={20} height={20} aria-hidden="true" />
              </div>
              <div className="flex flex-1 flex-col items-start gap-1 md:flex-row md:items-center md:gap-8">
                <h3 className="text-display-md font-semibold text-[var(--color-text-primary)] md:shrink-0">
                  Eco-friendly Material
                </h3>
                <div className="h-20 w-[1px] shrink-0 bg-[var(--color-border)] md:h-10" />
                <p className="text-sm font-normal leading-5 text-[var(--color-text-secondary)] md:text-base md:leading-6">
                  Our filaments are biodegradable, odorless, and kinder to the spaces we live in.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section
        id="who-we-are"
        className="scroll-target w-full"
        style={{ backgroundColor: "#E5E5E5" }}
      >
        <div className="container-page section-pad">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-14">
            <div className="max-w-[580px]">
              <h2 className="type-display-lg" style={{ color: "#1A1A1A" }}>
                Who We Are
              </h2>
              <p className="type-body-md mt-4" style={{ color: "#575757" }}>
                Fueled by a love for design and storytelling, we create 3D-printed spatial objects
                that bring form, function, and character into personal spaces.
              </p>
              <p className="type-body-md mt-4" style={{ color: "#575757" }}>
                Each piece is shaped with intention, built with considered materials, and made to
                make your room feel a little more like you.
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
        id="newsletter"
        className="scroll-target relative w-full overflow-hidden px-5 py-12 md:px-8 md:py-16"
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
              <Image
                src="/newsletter-icon.svg"
                alt=""
                width={40}
                height={40}
                className="h-12 w-12"
              />
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
