"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExpandableGallery } from "@/components/ui/gallery-animation";
import { Progress } from "@/components/ui/progress";

gsap.registerPlugin(ScrollTrigger);

const heroText =
  "Before anything becomes a shape, a material, or a glow, it starts with a feeling. A sense of how the space should feel like";
const storyFrameRate = 30;
const storySequenceFrames = 47;
const storyVideo = "/about/story-panel-1-scrub.mp4";
const storySequenceDuration = storySequenceFrames / storyFrameRate;

const storyPanels = [
  {
    text: heroText,
  },
  {
    text: "Desks, shelves, bedsides, and quiet corners are part of everyday life. They deserve objects that feel useful, warm, and not just decorative.",
  },
  {
    text: "We at fasthaus create spatial objects with intention, soft glow, and a little story.",
  },
];
const storyDuration = storySequenceDuration * storyPanels.length;

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
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const storySection = root.querySelector<HTMLElement>("[data-story-section]");
        const storyPin = root.querySelector<HTMLElement>("[data-story-pin]");
        const video = root.querySelector<HTMLVideoElement>("[data-story-video]");
        const heroCopy = root.querySelector<HTMLElement>("[data-hero-copy]");
        const copyPanels = gsap.utils.toArray<HTMLElement>("[data-story-copy]", root);

        if (!storySection || !storyPin || !video || !heroCopy) {
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

        gsap.set(copyPanels, { autoAlpha: 0, y: 22 });

        const scrubVideo = (progress: number) => {
          if (video.readyState < 1 || !Number.isFinite(video.duration)) {
            return;
          }

          const frame = Math.min(
            storyPanels.length * storySequenceFrames - 1,
            Math.round(storyDuration * progress * storyFrameRate)
          );
          const nextTime = frame / storyFrameRate;

          if (Math.abs(video.currentTime - nextTime) > 0.001) {
            video.currentTime = nextTime;
          }
        };

        const storyTimeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: storySection,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * 2.64)}`,
            scrub: true,
            pin: storyPin,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              scrubVideo(self.progress);
              updateStoryProgress(self.progress, self.progress < 1);
            },
            onEnter: () => updateStoryProgress(0, true),
            onEnterBack: (self) => updateStoryProgress(self.progress, true),
            onLeave: () => updateStoryProgress(1, false),
            onLeaveBack: () => updateStoryProgress(0, true),
          },
        });

        storyTimeline.to({}, { duration: storyDuration });

        copyPanels.forEach((copy, index) => {
          const previousCopy = index === 0 ? heroCopy : copyPanels[index - 1];
          const changeAt = storySequenceDuration * (index + 1);

          storyTimeline
            .set(previousCopy, { autoAlpha: 0, y: -20 }, changeAt)
            .set(copy, { autoAlpha: 1, y: 0 }, changeAt);
        });

        const syncVideo = () => scrubVideo(storyTimeline.scrollTrigger?.progress ?? 0);
        video.addEventListener("loadedmetadata", syncVideo);

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

        return () => {
          video.removeEventListener("loadedmetadata", syncVideo);
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
    <div ref={rootRef} className="bg-[#000104] text-[#F8F6F3]">
      <div
        className={`fixed inset-x-0 top-0 z-50 h-1.5 transition-opacity duration-300 ${
          storyProgress.isVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-label="About story scroll progress"
      >
        <Progress
          value={storyProgress.value}
          orientation="horizontal"
          className="h-full w-full rounded-none bg-white/25 [&_[data-slot=progress-indicator]]:rounded-none"
        />
      </div>
      <section data-story-section className="relative overflow-hidden bg-[#000104]">
        <div
          data-story-pin
          className="relative h-[calc(100svh-104px)] min-h-[560px] overflow-hidden motion-reduce:hidden md:h-[calc(100vh-104px)] md:min-h-[620px]"
        >
          <video
            data-story-video
            src={storyVideo}
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 z-10 bg-black/40" aria-hidden="true" />

          <div className="absolute left-1/2 top-1/2 z-20 w-[min(88vw,780px)] -translate-x-1/2 -translate-y-1/2 text-center">
            <h1
              data-hero-copy
              className="text-[34px] font-normal leading-[1.18] tracking-normal text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] md:text-[40px] md:leading-[1.25] lg:text-[44px]"
            >
              {heroText}
            </h1>
            {storyPanels.slice(1).map((panel) => (
              <h2
                key={panel.text}
                data-story-copy
                className="absolute inset-0 text-[30px] font-normal leading-[1.2] tracking-normal text-white opacity-0 drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)] md:text-[40px] md:leading-[1.25] lg:text-[44px]"
              >
                {panel.text}
              </h2>
            ))}
          </div>
        </div>

        <div className="hidden motion-reduce:grid">
          {storyPanels.map((panel, index) => (
            <article
              key={panel.text}
              className="relative flex min-h-[70svh] items-center justify-center overflow-hidden px-5 py-16 text-center"
            >
              <video
                src={storyVideo}
                muted
                playsInline
                preload="metadata"
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
              {index === 0 ? (
                <h1 className="relative text-[34px] font-normal leading-[1.18] tracking-normal text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
                  {panel.text}
                </h1>
              ) : (
                <p className="relative text-[28px] font-normal leading-[1.2] text-[#F8F6F3] drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]">
                  {panel.text}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section
        data-philosophy-section
        className="container-page overflow-hidden pt-14 pb-8 md:pt-16 md:pb-8"
      >
        <h2 data-philosophy-reveal className="type-display-lg mb-8 text-white">
          Design Philosophy
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-2 md:gap-6">
          {philosophy.map((item) => (
            <article
              key={item.label}
              data-philosophy-reveal
              className="rounded-[8px] border border-white/15 bg-[#000104] p-5"
            >
              <span className="mb-3 block text-[24px] text-[var(--color-accent-amber)]">
                {item.icon}
              </span>
              <h3 className="type-title-md mb-1 text-white">{item.label}</h3>
              <p className="type-body-sm text-[#F8F6F3]">{item.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section data-studio-section className="overflow-hidden bg-[#000104] pb-12">
        <div className="container-page pt-12 pb-14 md:pt-12 md:pb-16">
          <div className="flex flex-col gap-8 md:gap-10">
            <div data-studio-reveal className="max-w-[640px]">
              <h2 className="type-display-lg text-white">Inside the Studio</h2>
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
