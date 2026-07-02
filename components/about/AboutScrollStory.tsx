"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const heroText =
  "Design gives it form. Story gives it life. Fasthaus makes objects for spaces that feel personal.";

const storyPanels = [
  {
    image: "/who-we-are-img.png",
    alt: "Hand hovering over a warm ribbed Fasthaus lamp",
    text: heroText,
  },
  {
    image: "/our-process-img.png",
    alt: "Fasthaus lamp glowing on a studio shelf",
    text: "Objects shaped with intention, built for shelves, desks, and the quiet corners people actually use.",
  },
  {
    image: "/collections-hero-img-1.png",
    alt: "Warm Fasthaus lamp styled in an interior",
    text: "Every piece starts with a simple form, then earns its place through texture, glow, and restraint.",
  },
  {
    image: "/collections-hero-img-2.png",
    alt: "Small white Fasthaus lamp glowing on a table",
    text: "The result is lighting that feels personal without asking the room to work around it.",
  },
];

const philosophy = [
  {
    icon: "○",
    label: "Simple",
    desc: "Forms reduced to their essence, with nothing more than what the light needs.",
  },
  {
    icon: "◇",
    label: "Functional",
    desc: "Integrated into real desks, shelves and bedside tables, not just photos.",
  },
  {
    icon: "△",
    label: "Warm",
    desc: "Diffused glow that feels nurturing for comfort in the evening.",
  },
  {
    icon: "□",
    label: "Timeless",
    desc: "Quiet objects meant to stay with you, not follow trends.",
  },
];

const studioImages = [
  {
    src: "/our-process-img.png",
    alt: "Fasthaus lamp glowing in a studio setting",
  },
  {
    src: "/collections-hero-img-1.png",
    alt: "Fasthaus lamp in a warm interior",
  },
  {
    src: "/collections-hero-img-2.png",
    alt: "White Fasthaus lamp glowing on a side table",
  },
];

function SplitHeroText() {
  return (
    <>
      {heroText.split(" ").map((word, index) => (
        <span key={`${word}-${index}`} data-about-word className="inline-block text-[#d8d8d8]">
          {word}
          {index < heroText.split(" ").length - 1 ? "\u00a0" : ""}
        </span>
      ))}
    </>
  );
}

export default function AboutScrollStory() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!root) {
      return;
    }

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const storySection = root.querySelector<HTMLElement>("[data-story-section]");
        const storyPin = root.querySelector<HTMLElement>("[data-story-pin]");
        const textBlock = root.querySelector<HTMLElement>("[data-story-text-block]");
        const heroCopy = root.querySelector<HTMLElement>("[data-hero-copy]");
        const imageWrap = root.querySelector<HTMLElement>("[data-story-image-wrap]");
        const words = gsap.utils.toArray<HTMLElement>("[data-about-word]", root);
        const imagePanels = gsap.utils.toArray<HTMLElement>("[data-story-image]", root);
        const copyPanels = gsap.utils.toArray<HTMLElement>("[data-story-copy]", root);

        if (!storySection || !storyPin || !textBlock || !heroCopy || !imageWrap) {
          return;
        }

        gsap.set(words, { color: "#d8d8d8" });
        gsap.set(imageWrap, { autoAlpha: 0, x: -180 });
        gsap.set(imagePanels, { autoAlpha: 0 });
        gsap.set(imagePanels[0], { autoAlpha: 1 });
        gsap.set(copyPanels, { autoAlpha: 0, y: 22 });

        const storyTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: storySection,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * 4.4)}`,
            scrub: true,
            pin: storyPin,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        storyTimeline
          .to(words, {
            color: "#575757",
            duration: 1.4,
            stagger: {
              each: 0.045,
              ease: "none",
            },
          })
          .to(
            textBlock,
            {
              x: () => Math.min(window.innerWidth * 0.18, 270),
              duration: 1,
            },
            ">+=0.2"
          )
          .to(
            imageWrap,
            {
              autoAlpha: 1,
              x: 0,
              duration: 1,
            },
            "<"
          );

        copyPanels.forEach((copy, index) => {
          const previousCopy = copyPanels[index - 1];
          const previousImage = imagePanels[index];
          const nextImage = imagePanels[index + 1];

          if (!nextImage) {
            return;
          }

          if (index === 0) {
            storyTimeline.to(heroCopy, { autoAlpha: 0, y: -20, duration: 0.55 }, ">+=0.45");
          } else if (previousCopy) {
            storyTimeline.to(previousCopy, { autoAlpha: 0, y: -20, duration: 0.55 }, ">+=0.45");
          }

          storyTimeline
            .to(copy, { autoAlpha: 1, y: 0, duration: 0.55 }, "<")
            .to(previousImage, { autoAlpha: 0, duration: 0.55 }, "<")
            .to(nextImage, { autoAlpha: 1, duration: 0.55 }, "<");
        });

        const philosophyItems = gsap.utils.toArray<HTMLElement>("[data-philosophy-reveal]", root);
        const philosophySection = root.querySelector<HTMLElement>("[data-philosophy-section]");

        if (philosophySection) {
          let philosophyCompleted = false;
          const philosophyTween = gsap.fromTo(
            philosophyItems,
            { autoAlpha: 0.2, x: -110 },
            {
              autoAlpha: 1,
              x: 0,
              stagger: 0.12,
              ease: "none",
              scrollTrigger: {
                trigger: philosophySection,
                start: "top 82%",
                end: "top 30%",
                scrub: true,
                onLeave: () => {
                  philosophyCompleted = true;
                  philosophyTween.progress(1);
                },
                onEnterBack: () => {
                  if (philosophyCompleted) {
                    philosophyTween.progress(1);
                  }
                },
                onLeaveBack: () => {
                  if (philosophyCompleted) {
                    philosophyTween.progress(1);
                  }
                },
                onUpdate: () => {
                  if (philosophyCompleted) {
                    philosophyTween.progress(1);
                  }
                },
              },
            }
          );
        }

        const studioSection = root.querySelector<HTMLElement>("[data-studio-section]");
        const studioPin = root.querySelector<HTMLElement>("[data-studio-pin]");
        const studioItems = gsap.utils.toArray<HTMLElement>("[data-studio-reveal]", root);

        if (studioSection && studioPin) {
          let studioCompleted = false;
          const studioTween = gsap.fromTo(
            studioItems,
            { autoAlpha: 0, x: -180 },
            {
              autoAlpha: 1,
              x: 0,
              stagger: 0.2,
              ease: "none",
              scrollTrigger: {
                trigger: studioSection,
                start: "top top",
                end: () => `+=${Math.round(window.innerHeight * 1.35)}`,
                scrub: true,
                pin: studioPin,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                onLeave: () => {
                  studioCompleted = true;
                  studioTween.progress(1);
                },
                onEnterBack: () => {
                  if (studioCompleted) {
                    studioTween.progress(1);
                  }
                },
                onLeaveBack: () => {
                  if (studioCompleted) {
                    studioTween.progress(1);
                  }
                },
                onUpdate: () => {
                  if (studioCompleted) {
                    studioTween.progress(1);
                  }
                },
              },
            }
          );
        }

        const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

        return () => {
          window.cancelAnimationFrame(refreshFrame);
        };
      });
    }, root);

    return () => {
      mm.revert();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={rootRef} className="bg-white">
      <section data-story-section className="relative overflow-hidden bg-white">
        <div
          data-story-pin
          className="relative hidden h-[calc(100vh-104px)] min-h-[620px] overflow-hidden md:block"
        >
          <div className="relative mx-auto h-full w-full max-w-[1120px] px-8">
            <div
              data-story-image-wrap
              className="invisible absolute left-8 top-1/2 aspect-square w-[min(34vw,360px)] -translate-y-1/2 overflow-hidden rounded-[8px] opacity-0 h-[409px]"
            >
              {storyPanels.map((panel) => (
                <div key={panel.image} data-story-image className="absolute inset-0">
                  <Image
                    src={panel.image}
                    alt={panel.alt}
                    fill
                    priority={panel.image === "/who-we-are-img.png"}
                    sizes="(min-width: 1024px) 360px, 34vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>

            <div
              data-story-text-block
              className="absolute left-1/2 top-1/2 w-[min(58vw,680px)] -translate-x-1/2 -translate-y-1/2"
            >
              <h1
                data-hero-copy
                className="text-[40px] font-normal leading-[1.25] tracking-normal text-[#575757] lg:text-[44px]"
              >
                <SplitHeroText />
              </h1>
              {storyPanels.slice(1).map((panel) => (
                <h2
                  key={panel.text}
                  data-story-copy
                  className="absolute inset-0 text-[40px] font-normal leading-[1.25] tracking-normal text-[#575757] opacity-0 lg:text-[44px]"
                >
                  {panel.text}
                </h2>
              ))}
            </div>
          </div>
        </div>

        <div className="px-5 py-16 md:hidden">
          <h1 className="text-[34px] font-normal leading-[1.18] tracking-normal text-[#575757]">
            {heroText}
          </h1>
          <div className="mt-10 grid gap-6">
            {storyPanels.map((panel) => (
              <article key={panel.image} className="grid gap-4">
                <div className="relative aspect-square overflow-hidden rounded-[8px]">
                  <Image
                    src={panel.image}
                    alt={panel.alt}
                    fill
                    sizes="100vw"
                    className="object-cover"
                  />
                </div>
                <p className="text-xl font-normal leading-[1.25] text-[#575757]">{panel.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-philosophy-section className="container-page overflow-hidden py-14 md:py-24">
        <h2
          data-philosophy-reveal
          className="type-display-lg mb-8 text-[var(--color-text-primary)]"
        >
          Design Philosophy
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
          {philosophy.map((item) => (
            <article
              key={item.label}
              data-philosophy-reveal
              className="rounded-[8px] border border-[var(--color-border)] bg-white p-5"
            >
              <span className="mb-3 block text-[24px] text-[var(--color-accent-amber)]">
                {item.icon}
              </span>
              <h3 className="type-title-md mb-1 text-[var(--color-text-primary)]">{item.label}</h3>
              <p className="type-body-sm text-[var(--color-text-secondary)]">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section data-studio-section className="overflow-hidden bg-white">
        <div data-studio-pin className="container-page py-14 md:min-h-screen md:py-0">
          <div className="flex h-full flex-col justify-center gap-8 md:min-h-screen md:gap-10">
            <div data-studio-reveal className="max-w-[640px]">
              <h2 className="type-display-lg text-[var(--color-text-primary)]">
                Inside the Studio
              </h2>
              <p className="type-body-md mt-3 text-[var(--color-text-secondary)]">
                A closer look at the spaces, textures, and warm light that guide each Fasthaus
                object.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:flex md:gap-6">
              {studioImages.map((image) => (
                <div
                  key={image.src}
                  data-studio-reveal
                  className="media-rounded relative aspect-square overflow-hidden md:w-[min(32vw,380px)] md:flex-none"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
