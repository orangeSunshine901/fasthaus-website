"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import DirhamPrice from "@/components/ui/DirhamPrice";

type Props = {
  name: string;
  description: string;
  price: number;
  uiTheme: "light" | "dark";
  /** True once the hero image has loaded and revealed; the text staggers in after it. */
  revealed: boolean;
  /** Resolves false when the item could not be added, so the CTA can be retried. */
  onBuyNow: () => Promise<boolean>;
};

const EASE_OUT: [number, number, number, number] = [0.2, 0.8, 0.2, 1];

// Shortcut for shoppers who have already decided: the selected colour at a quantity
// of 1, straight to checkout. The full buy box below the hero stays the main path.
export default function HeroQuickBuy({
  name,
  description,
  price,
  uiTheme,
  revealed,
  onBuyNow,
}: Props) {
  const reducedMotion = useReducedMotion();
  const [opening, setOpening] = useState(false);

  const rise = (delay: number) => ({
    initial: reducedMotion ? false : ({ opacity: 0, y: 18 } as const),
    animate: revealed || reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 },
    transition: {
      y: { duration: 0.7, ease: EASE_OUT, delay },
      opacity: { duration: 0.5, ease: "easeOut" as const, delay },
    },
  });

  async function handleClick() {
    if (opening) return;
    setOpening(true);
    // On success the router is already leaving for checkout; keep the label until then.
    if (!(await onBuyNow())) setOpening(false);
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-12 z-30 mx-auto hidden max-w-[1240px] px-6 md:block lg:px-8">
      <div className="pointer-events-auto flex w-fit flex-col gap-3.5">
        <motion.h1
          {...rise(0.15)}
          className="text-[44px] font-bold leading-none tracking-[-0.03em]"
          style={{ color: "var(--hero-ui-color)" }}
        >
          {name}
        </motion.h1>
        <motion.p
          {...rise(0.3)}
          className="max-w-[280px] text-[16px] leading-[1.55]"
          style={{ color: "var(--hero-ui-muted)" }}
        >
          {description}
        </motion.p>
        <motion.div {...rise(0.45)} className="flex items-center gap-[18px]">
          <DirhamPrice
            amount={price}
            size="lg"
            variant={uiTheme === "light" ? "white" : "black"}
            className="text-[var(--hero-ui-color)]"
          />
          <span className="h-5 w-px" style={{ backgroundColor: "var(--hero-ui-subtle)" }} />
          <button
            type="button"
            onClick={handleClick}
            aria-busy={opening}
            style={{ fontWeight: "700" }}
            className="group relative flex items-center gap-2 py-2.5 text-[17px] text-[var(--hero-ui-color)] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current transition-colors duration-200 hover:text-[var(--color-accent-amber)] focus-visible:text-[var(--color-accent-amber)] aria-busy:text-[var(--color-accent-amber)]"
          >
            <span>{opening ? "Opening checkout…" : "Buy now"}</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
              className="transition-transform duration-[260ms] ease-[cubic-bezier(0.3,1.6,0.5,1)] group-hover:translate-x-[5px] group-focus-visible:translate-x-[5px] group-aria-busy:translate-x-[5px]"
            >
              <path
                d="M3 8h9M8.5 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              aria-hidden="true"
              className="absolute bottom-1 left-0 h-0.5 w-full origin-left scale-x-[0.3] bg-[var(--color-accent-amber)] transition-transform duration-[360ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 group-aria-busy:scale-x-100"
            />
          </button>
        </motion.div>
      </div>
    </div>
  );
}
