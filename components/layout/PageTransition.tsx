"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resetNavigationScrollIfRequested } from "@/lib/navigation-scroll";

gsap.registerPlugin(ScrollTrigger);

const PAGE_TRANSITION = {
  duration: 0.28,
  ease: [0.22, 1, 0.36, 1],
} as const;

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();

  const refreshScrollTriggers = () => {
    window.requestAnimationFrame(() => {
      ScrollTrigger.refresh();
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
