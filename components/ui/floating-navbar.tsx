"use client";
import Link from "next/link";
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "motion/react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { requestNavigationScrollReset } from "@/lib/navigation-scroll";

export const FloatingNav = ({
  navItems,
  leftSlot,
  rightSlot,
  className,
  allowVisibleAtTop = false,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
    megaMenu?: React.ReactNode;
  }[];
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
  allowVisibleAtTop?: boolean;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      const direction = current - scrollYProgress.getPrevious()!;

      if (scrollYProgress.get() < 0.15) {
        if (!allowVisibleAtTop) {
          setVisible(false);
        }
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
          "fixed inset-x-0 top-10 z-[5000] mx-auto flex max-w-fit items-center justify-center md:max-xl:top-0 md:max-xl:w-full md:max-xl:max-w-none",
          className
        )}
      >
        <div className="relative flex items-center justify-center md:max-xl:w-full">
          {/* Glass background layer — clipped separately so the blur doesn't leak past the rounded corners on hover-triggered repaints */}
          <div
            aria-hidden="true"
            className="glass-surface pointer-events-none absolute inset-0 overflow-hidden xl:rounded-[24px]"
          />
          <div className="relative flex items-center justify-center gap-3 px-8 py-2 text-[#FFFDF5] md:max-xl:w-full md:max-xl:justify-between">
          {leftSlot && <div className="flex items-center pr-1">{leftSlot}</div>}

          <div className="flex items-center gap-1">
            {navItems.map((navItem, idx: number) =>
              navItem.megaMenu ? (
                <NavigationMenu
                  key={`link-${idx}`}
                  className="static h-full flex-none text-current [&>div]:!static"
                  viewport={false}
                >
                  <NavigationMenuList className="h-full gap-0 mt-[1px]">
                    <NavigationMenuItem className="static flex h-full items-center">
                        <Link
                          href={navItem.link}
                          onNavigate={() => requestNavigationScrollReset(navItem.link)}
                          className="relative flex min-h-11 items-center gap-1 rounded-full pl-4 pr-1 py-2 text-sm font-semibold underline-offset-4 outline-none transition-colors hover:text-[var(--color-accent-amber)] hover:underline focus-visible:underline focus:text-[var(--color-accent-amber)]"
                        >
                          <span className="block sm:hidden">{navItem.icon}</span>
                          <span className="hidden sm:block">{navItem.name}</span>
                        </Link>
                      <NavigationMenuTrigger
                        showChevron={false}
                        unstyled
                        aria-label="Browse lamp collection"
                        className="grid h-11 w-11 place-items-center rounded-full text-current outline-none hover:text-[var(--color-accent-amber)] focus-visible:ring-2 focus-visible:ring-current data-[state=open]:text-[var(--color-accent-amber)]"
                      >
                          <ChevronDown
                            className="size-4 transition duration-300 group-data-[state=open]:rotate-180"
                            aria-hidden="true"
                          />
                      </NavigationMenuTrigger>
                      <NavigationMenuContent data-lenis-prevent className="collection-menu-content left-1/2 top-[calc(100%+16px)] max-h-[calc(100dvh-180px)] !w-[min(860px,calc(100vw-48px))] -translate-x-1/2 !overflow-y-auto overscroll-contain rounded-[var(--radius-md)] border bg-white p-3 text-[var(--color-text-primary)] shadow-xl md:max-xl:!mt-0 md:max-xl:max-h-[calc(100dvh-108px)] md:max-xl:!w-screen md:max-xl:!rounded-none">
                        {navItem.megaMenu}
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              ) : (
                <Link
                  key={`link-${idx}`}
                  href={navItem.link}
                  onNavigate={() => requestNavigationScrollReset(navItem.link)}
                  className={cn(
                    "relative flex min-h-11 items-center gap-1 rounded-full px-4 py-2 text-sm font-semibold underline-offset-4 transition-colors hover:text-[var(--color-accent-amber)] hover:underline"
                  )}
                >
                  <span className="block sm:hidden">{navItem.icon}</span>
                  <span className="hidden sm:block">{navItem.name}</span>
                </Link>
              )
            )}
          </div>

          {rightSlot && (
            <>
              <div className="h-5 w-px bg-white/15" />
              <div className="flex items-center">{rightSlot}</div>
            </>
          )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
