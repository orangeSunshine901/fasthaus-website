import Image from "next/image";
import Link from "next/link";
import ShopLayout from "@/components/layout/ShopLayout";
import FeaturedProductsCarousel from "@/components/product/FeaturedProductsCarousel";
import { getFeaturedProducts } from "@/lib/data/products";
import NewsletterForm from "@/components/ui/NewsletterForm";
import LocomotiveScrollProvider from "@/components/scroll/LocomotiveScrollProvider";

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
    <LocomotiveScrollProvider>
      <ShopLayout>
        {/* Hero */}
        <section className="relative h-[640px] w-full overflow-hidden md:h-[740px]">
          <video
            className="absolute inset-0 h-full w-full object-cover object-center"
            autoPlay
            muted
            loop
            playsInline
            poster="/video-poster-test.png"
            preload="metadata"
            aria-hidden="true"
          >
            <source src="/home-hero.webm" type="video/webm" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-neutral-950/35 to-transparent" />

          <div
            data-scroll
            className="scroll-reveal-up absolute inset-x-5 bottom-2 z-10 flex max-w-100 flex-col items-start gap-3.5 md:hidden"
          >
            <h1 className="type-display-xl self-stretch text-white">
              The light that makes the whole room feel right.
            </h1>
            {/* <h1 className="type-display-xl self-stretch text-white">
              Soft glow, sharp form, better room energy.
            </h1> */}
            <p className="type-body-md self-stretch text-white/90">
              Stop settling for mass-produced décor. No more wasteful materials. Each lamp is made
              to order from plant-based material for a beautiful home with a lighter impact.
            </p>
            {/* <p className="type-body-md self-stretch text-white/90">
              We make spatial objects for spaces that need more feeling, less filler, and a little
              story in the corner.
            </p> */}
            <Link href="/collection" className="btn btn-primary w-full self-stretch">
              Shop Collection
            </Link>
            <Link
              href="/about"
              className="btn btn-light w-full self-stretch border-white bg-white hover:bg-white/90"
            >
              Our Story
            </Link>
          </div>

          <div className="container-page absolute left-1/2 top-[420px] z-10 hidden -translate-x-1/2 md:block">
            <div data-scroll className="scroll-reveal-up flex flex-col items-start gap-6">
              <h1 className="type-display-xl max-w-lg text-white">
                The light that makes the whole room feel right.
              </h1>
              {/* <h1 className="type-display-xl max-w-lg text-white">
                Soft glow, sharp form, better room energy.
              </h1> */}
              <p className="type-body-md max-w-md text-white/80">
                Stop settling for mass-produced décor. No more wasteful materials. Each lamp is made
                to order from plant-based material for a beautiful home with a lighter impact.
              </p>
              {/* <p className="type-body-md max-w-md text-white/80">
                We make spatial objects for spaces that need more feeling, less filler, and a little
                story in the corner.
              </p> */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/collection" className="btn btn-primary">
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
          </div>
        </section>

        {/* Featured Products */}
        <section
          id="featured-products"
          className="scroll-target w-full pt-4"
          style={{ backgroundColor: "#000104" }}
        >
          <div className="container-page section-pad flex flex-col gap-12">
            <div data-scroll className="scroll-reveal-up flex max-w-[548px] flex-col gap-4">
              <p className="eyebrow" style={{ color: "var(--color-accent-amber)" }}>
                OUR PRODUCTS
              </p>
              <h2 className="type-display-lg text-white">Lamps with Character</h2>
              <p className="type-body-md" style={{ color: "#E5E5E5" }}>
                A small collection of sculptural lights designed for desks, shelves, bedside
                corners, and quiet evening spaces.
              </p>
            </div>

            <FeaturedProductsCarousel products={featured} summaries={featuredSummaries} />
          </div>
        </section>

        {/* Our Process */}
        <section
          id="designed-in-layers"
          className="scroll-target w-full bg-[var(--color-bg)] px-6 pb-10 pt-16 md:px-8 md:py-24"
        >
          <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-10 xl:min-h-[fit-content] xl:gap-[32px]">
            <div
              data-scroll
              className="scroll-reveal-up flex w-full flex-col items-start gap-4 md:max-w-[704px]"
            >
              <p className="eyebrow" style={{ color: "var(--color-accent-amber)" }}>
                OUR PROCESS
              </p>
              <h2 className="type-display-lg max-w-[400px] font-bold text-[var(--color-text-primary)] md:text-6xl md:leading-[68px]">
                Designed with Purpose Made with Care
              </h2>
              {/* <div className="h-[3px] w-16 bg-[var(--color-accent-amber)]" /> */}
            </div>

            <div className="flex w-full flex-col items-start gap-4">
              <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 md:gap-8">
                {purposeSteps.map((step, index) => (
                  <article
                    key={step.title}
                    data-scroll
                    className={`scroll-reveal-up scroll-stagger-${index + 1} flex w-full flex-col items-start gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-6 md:h-60 md:gap-5 md:p-8`}
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

              <div
                data-scroll
                className="scroll-reveal-soft scroll-stagger-3 flex w-full items-center gap-4 rounded-2xl bg-[#EEF7E8] p-5 md:h-20 md:gap-8 md:p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[20px] border border-[var(--color-border)] bg-[var(--color-bg)]">
                  <Image src="/leaf-icon.svg" alt="" width={20} height={20} aria-hidden="true" />
                </div>
                <div className="flex flex-1 flex-col items-start gap-1 md:flex-row md:items-center md:gap-8">
                  <h3 className="text-display-md font-semibold text-[var(--color-text-primary)] md:shrink-0">
                    Eco-friendly Material
                  </h3>
                  <div className="hidden w-[1px] shrink-0 bg-[var(--color-border)] md:block md:h-10" />
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
          <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start gap-8 overflow-hidden px-5 py-12 md:px-8 md:py-16 lg:flex-row lg:items-center lg:gap-14 lg:px-20">
            <div
              data-scroll
              className="scroll-reveal-up flex w-full flex-1 flex-col items-start overflow-hidden"
            >
              <div className="flex w-full max-w-[704px] flex-col items-start overflow-hidden md:gap-6">
                <div>
                  <p className="eyebrow" style={{ color: "var(--color-accent-amber)" }}>
                    ABOUT US
                  </p>
                  <h2 className="flex flex-wrap items-end gap-x-3 gap-y-2 text-3xl font-semibold leading-[1.15] text-zinc-900 md:gap-x-4 md:text-4xl">
                    <span>What is</span>
                    <Image
                      src="/fasthaus-logo-final.svg"
                      alt="fasthaus"
                      width={208}
                      height={42}
                      className="h-auto w-[168px] md:w-[208px]"
                      style={{ height: "59px", position: "relative", top: "2px" }}
                    />
                  </h2>{" "}
                </div>
                <div className="flex w-full flex-col gap-4">
                  <p className="max-w-[540px] text-base font-light leading-5 text-zinc-600">
                    Fueled by a love for design and storytelling, we create spatial objects that
                    bring form, function, and character into personal spaces.
                  </p>
                  <p className="max-w-[540px] text-base font-light leading-5 text-zinc-600">
                    Each piece is shaped with intention, built with considered materials, and made
                    to make your room feel a little more like you.
                  </p>
                </div>
                <Link
                  href="/about"
                  className="btn btn-secondary text-white shadow-[0px_1px_2px_0px_rgba(0,0,0,0.04)] transition-colors hover:bg-neutral-700 mt-4"
                >
                  Learn more about us
                </Link>
              </div>
            </div>
            <div
              data-scroll
              data-scroll-speed="0.035"
              data-scroll-enable-touch-speed
              className="relative aspect-[520/400] w-full overflow-hidden rounded-[20px] lg:h-96 lg:w-[520px] lg:shrink-0"
            >
              <Image
                src="/home/fasthaus-baseplate.png"
                alt="Fasthaus spatial lamp in a warm interior"
                fill
                sizes="(min-width: 1024px) 520px, calc(100vw - 40px)"
                className="object-cover"
              />
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
                <div
                  data-scroll
                  data-scroll-speed={
                    image.src.endsWith("1.png") || image.src.endsWith("4.png") ? "0.025" : "-0.02"
                  }
                  className="scroll-parallax-layer relative h-full w-full"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="148px"
                    className="object-cover"
                  />
                </div>
              </div>
            ))}

            <div
              data-scroll
              className="scroll-reveal-up relative z-10 mx-auto flex max-w-[720px] flex-col items-center text-center"
            >
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
    </LocomotiveScrollProvider>
  );
}
