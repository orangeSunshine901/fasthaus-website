"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type LocomotiveScrollInstance = {
  destroy: () => void;
  lenisInstance: {
    on: (event: "scroll", callback: () => void) => void;
  } | null;
};

type LocomotiveScrollConstructor = new (options?: {
  lenisOptions?: {
    smoothWheel?: boolean;
    syncTouch?: boolean;
    lerp?: number;
    duration?: number;
    anchors?: boolean | { offset?: number; duration?: number };
    prevent?: (node: HTMLElement) => boolean;
  };
  triggerRootMargin?: string;
  rafRootMargin?: string;
  scrollCallback?: () => void;
  initCustomTicker?: (render: () => void) => void;
  destroyCustomTicker?: (render: () => void) => void;
}) => LocomotiveScrollInstance;

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function shouldPreventSmoothScroll(node: HTMLElement) {
  return Boolean(
    node.closest(
      "input, textarea, select, option, [data-lenis-prevent], [data-lenis-prevent-wheel], [data-lenis-prevent-touch]"
    )
  );
}

export default function LocomotiveScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    gsap.ticker.lagSmoothing(0);

    if (reducedMotion.matches) {
      document.documentElement.classList.add("scroll-animations-reduced");
      return () => {
        document.documentElement.classList.remove("scroll-animations-reduced");
      };
    }

    let scroll: LocomotiveScrollInstance | null = null;
    let cancelled = false;
    let readyFrame = 0;

    async function initScroll() {
      const { default: LocomotiveScroll } = (await import("locomotive-scroll")) as {
        default: LocomotiveScrollConstructor;
      };

      if (cancelled) {
        return;
      }

      scroll = new LocomotiveScroll({
        triggerRootMargin: "-12% 0% -12% 0%",
        rafRootMargin: "20% 0% 20% 0%",
        scrollCallback: () => ScrollTrigger.update(),
        initCustomTicker: (render) => {
          gsap.ticker.add(render);
        },
        destroyCustomTicker: (render) => {
          gsap.ticker.remove(render);
        },
        lenisOptions: {
          smoothWheel: true,
          syncTouch: true,
          lerp: 0.085,
          duration: 1.05,
          anchors: {
            offset: -88,
            duration: 1,
          },
          prevent: shouldPreventSmoothScroll,
        },
      });

      readyFrame = window.requestAnimationFrame(() => {
        document.documentElement.classList.add("scroll-animations-ready");
        ScrollTrigger.refresh();
      });
    }

    void initScroll();

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(readyFrame);
      document.documentElement.classList.remove("scroll-animations-ready");
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      scroll?.destroy();
    };
  }, []);

  return <>{children}</>;
}
