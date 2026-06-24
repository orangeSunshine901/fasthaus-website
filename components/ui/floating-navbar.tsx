"use client";
import Link from "next/link";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "@/lib/utils";

export const FloatingNav = ({
  navItems,
  leftSlot,
  rightSlot,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.05) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "fixed inset-x-0 top-10 z-[5000] mx-auto flex max-w-fit items-center justify-center",
          className
        )}
      >
        <div className="flex items-center justify-center gap-3 rounded-full border border-white/15 bg-[#212121]/70 px-7 py-2 text-[#FFFDF5] shadow-lg shadow-black/10 backdrop-blur-md">
          {leftSlot && <div className="flex items-center pr-1">{leftSlot}</div>}

          <div className="flex items-center gap-1">
            {navItems.map((navItem, idx: number) => (
              <Link
                key={`link-${idx}`}
                href={navItem.link}
                className={cn(
                  "relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/10 hover:text-[var(--color-accent-amber)]"
                )}
              >
                <span className="block sm:hidden">{navItem.icon}</span>
                <span className="hidden sm:block">{navItem.name}</span>
              </Link>
            ))}
          </div>

          {rightSlot && (
            <>
              <div className="h-5 w-px bg-white/15" />
              <div className="flex items-center">{rightSlot}</div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
