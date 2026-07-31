"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExpandableGallery } from "@/components/ui/gallery-animation";
import { Progress } from "@/components/ui/progress";

gsap.registerPlugin(ScrollTrigger);

const heroText =
  "Before anything becomes a shape, a material, or a glow, it starts with a feeling. A sense of how the space should feel like";

const storyPanels = [
  {
    image: "/mushroom-lamp/mushroom-lamp-close.jpg",
    alt: "Close up shot of the ",
    text: heroText,
  },
  {
    image: "/about/lamp-desk-off.jpg",
    alt: "Warm Fasthaus lamp styled in an interior",
    text: "Desks, shelves, bedsides, and quiet corners are part of everyday life. They deserve objects that feel useful, warm, and not just decorative.",
  },
  {
    image: "/about/lamp-desk-on.jpg",
    alt: "Small white Fasthaus lamp glowing on a table",
    text: "We at fasthaus create 3D-printed lamps and spatial objects with intention, soft glow, and a little story.",
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
  "/our-process-img.png",
  "/collections-hero-img-1.png",
  "/collections-hero-img-2.png",
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
  const progressFrameRef = useRef<number | null>(null);
  const [storyProgress, setStoryProgress] = useState({ value: 0, isVisible: true });

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

        const updateStoryProgress = (progress: number, isVisible = true) => {
          if (progressFrameRef.current !== null) {
            window.cancelAnimationFrame(progressFrameRef.current);
          }

          progressFrameRef.current = window.requestAnimationFrame(() => {
            setStoryProgress({ value: Math.round(progress * 100), isVisible });
            progressFrameRef.current = null;
          });
        };

        gsap.set(words, { color: "#d8d8d8" });
        gsap.set(imageWrap, { autoAlpha: 0, x: -180 });
        gsap.set(imagePanels, { autoAlpha: 0, zIndex: 0 });
        gsap.set(imagePanels[0], { autoAlpha: 1, zIndex: 1 });
        gsap.set(copyPanels, { autoAlpha: 0, y: 22 });

        const storyTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: storySection,
            start: "top 32px",
            end: () => `+=${Math.round(window.innerHeight * 2.64)}`,
            scrub: true,
            pin: storyPin,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => updateStoryProgress(self.progress, self.progress < 1),
            onEnter: () => updateStoryProgress(0, true),
            onEnterBack: (self) => updateStoryProgress(self.progress, true),
            onLeave: () => updateStoryProgress(1, false),
            onLeaveBack: () => updateStoryProgress(0, true),
          },
        });

        storyTimeline
          .to(words, {
            color: "#575757",
            duration: 0.175,
            stagger: {
              each: 0.005625,
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

        const transitionHoldDuration = 0.35;

        copyPanels.forEach((copy, index) => {
          const previousCopy = copyPanels[index - 1];
          const previousImage = imagePanels[index];
          const nextImage = imagePanels[index + 1];

          if (!nextImage) {
            return;
          }

          if (index === 0) {
            storyTimeline.to(heroCopy, { autoAlpha: 0, y: -20, duration: 0.1375 }, ">+=0.1125");
          } else if (previousCopy) {
            storyTimeline.to(previousCopy, { autoAlpha: 0, y: -20, duration: 0.1375 }, ">+=0.1125");
          }

          storyTimeline
            .to(copy, { autoAlpha: 1, y: 0, duration: 0.1375 }, "<")
            .set(previousImage, { autoAlpha: 1, zIndex: 1 }, "<")
            .set(nextImage, { zIndex: 2 }, "<")
            .to(nextImage, { autoAlpha: 1, duration: 0.18 }, "<")
            .set(previousImage, { autoAlpha: 0, zIndex: 0 })
            .to({}, { duration: transitionHoldDuration });
        });

        const revealViewport = {
          start: "top 64%",
          toggleActions: "play none none none",
          once: true,
        };

        const studioRevealViewport = {
          ...revealViewport,
          start: "top 64%",
        };

        const philosophyItems = gsap.utils.toArray<HTMLElement>("[data-philosophy-reveal]", root);
        const philosophySection = root.querySelector<HTMLElement>("[data-philosophy-section]");

        if (philosophySection && philosophyItems.length > 0) {
          gsap.fromTo(
            philosophyItems,
            { autoAlpha: 0, x: -80 },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.85,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: {
                trigger: philosophySection,
                ...revealViewport,
              },
            }
          );
        }

        const studioSection = root.querySelector<HTMLElement>("[data-studio-section]");
        const studioItems = gsap.utils.toArray<HTMLElement>("[data-studio-reveal]", root);

        if (studioSection && studioItems.length > 0) {
          gsap.fromTo(
            studioItems,
            { autoAlpha: 0, x: -80 },
            {
              autoAlpha: 1,
              x: 0,
              duration: 0.9,
              stagger: 0.14,
              ease: "power3.out",
              scrollTrigger: {
                trigger: studioSection,
                ...studioRevealViewport,
              },
            }
          );
        }

        const refreshTimers = [
          window.setTimeout(() => ScrollTrigger.refresh(), 360),
          window.setTimeout(() => ScrollTrigger.refresh(), 700),
        ];
        const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
        const refreshOnLoad = () => ScrollTrigger.refresh();

        window.addEventListener("load", refreshOnLoad, { once: true });

        return () => {
          window.cancelAnimationFrame(refreshFrame);
          refreshTimers.forEach((timer) => window.clearTimeout(timer));
          window.removeEventListener("load", refreshOnLoad);
          if (progressFrameRef.current !== null) {
            window.cancelAnimationFrame(progressFrameRef.current);
            progressFrameRef.current = null;
          }
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
      <div
        className={`fixed right-8 top-1/2 z-30 hidden h-[220px] -translate-y-1/2 items-center transition-opacity duration-300 md:flex ${
          storyProgress.isVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label="About story scroll progress"
      >
        <Progress
          value={storyProgress.value}
          orientation="vertical"
          className="h-full w-1.5 bg-[rgba(20,17,20,0.12)]"
        />
      </div>
      <section data-story-section className="relative overflow-hidden bg-white">
        <div
          data-story-pin
          className="relative hidden h-[calc(100vh-104px)] min-h-[620px] overflow-hidden md:block"
        >
          <div className="relative mx-auto h-full w-full max-w-[1240px] pt-[60px]">
            <div
              data-story-image-wrap
              className="invisible absolute top-1/2 aspect-square w-[min(34vw,579px)] -translate-y-1/2 overflow-hidden rounded-[8px] opacity-0 h-[640px]"
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
              className="absolute right-[-110px] top-1/2 w-[min(58vw,680px)] -translate-x-1/2 -translate-y-1/2"
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

      <section
        data-philosophy-section
        className="container-page overflow-hidden pt-14 pb-8 md:pt-16 md:pb-8"
      >
        <h2
          data-philosophy-reveal
          className="type-display-lg mb-8 text-[var(--color-text-primary)]"
        >
          Design Philosophy
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 md:gap-6">
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
        <div className="container-page pt-12 pb-14 md:pt-12 md:pb-16">
          <div className="flex flex-col gap-8 md:gap-10">
            <div data-studio-reveal className="max-w-[640px]">
              <h2 className="type-display-lg text-[var(--color-text-primary)]">
                Inside the Studio
              </h2>
            </div>
            <div data-studio-reveal>
              <ExpandableGallery images={studioImages} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
