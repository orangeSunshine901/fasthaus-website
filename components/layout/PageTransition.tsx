"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { resetNavigationScrollIfRequested } from "@/lib/navigation-scroll";

const PAGE_TRANSITION = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
} as const;

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  const refreshScrollTriggers = () => {
    // Only the home/about stories use scroll-triggered scenes. Product and
    // collection visits should not download the story animation engine.
    if (pathname !== "/" && pathname !== "/about") return;
    window.requestAnimationFrame(() => {
      void Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
        ([{ default: gsap }, { ScrollTrigger }]) => {
          gsap.registerPlugin(ScrollTrigger);
          ScrollTrigger.refresh();
        }
      );
    });
  };

  useLayoutEffect(() => {
    if (reducedMotion) resetNavigationScrollIfRequested(pathname);
  }, [pathname, reducedMotion]);

  if (reducedMotion) {
    return <div className="flex min-h-screen flex-col">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={PAGE_TRANSITION}
        onAnimationStart={() => resetNavigationScrollIfRequested(pathname)}
        onAnimationComplete={refreshScrollTriggers}
        className="flex min-h-screen flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
