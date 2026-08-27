"use client";

import { useEffect } from "react";
import { useReturningHome } from "@/components/navigation/HomeNavigationProvider";

const SCROLL_LOCK_MS = 950;
const TOP_DEAD_SCROLL_PX = 120;
const SCROLL_LOCK_EVENT = "home-reveal-scroll-lock";
const SCROLL_KEYS = new Set(["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "]);
const DOWN_KEYS = new Set(["ArrowDown", "PageDown", "End", " "]);
const UP_KEYS = new Set(["ArrowUp", "PageUp", "Home"]);

export default function HomeFirstScrollReveal() {
  const returningHome = useReturningHome();

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-home-reveal]");
    if (!root) return;

    let transitionTimer = 0;
    let transitioning = false;
    let touchStartY = 0;
    let topOverscroll = 0;
    let ignoreRouteScroll = returningHome;
    let hasLeftTop = !returningHome && window.scrollY > 0;

    const finishTransition = () => {
      transitioning = false;
      root.removeAttribute("data-lenis-prevent-wheel");
      root.removeAttribute("data-lenis-prevent-touch");
      window.dispatchEvent(new CustomEvent(SCROLL_LOCK_EVENT, { detail: false }));
      document.documentElement.classList.remove("home-reveal-scroll-locked");
    };

    const transitionTo = (state: "pending" | "revealed") => {
      if (transitioning || root.dataset.homeReveal === state) return;

      transitioning = true;
      root.dataset.homeReveal = state;
      root.setAttribute("data-lenis-prevent-wheel", "");
      root.setAttribute("data-lenis-prevent-touch", "");
      document.documentElement.classList.add("home-reveal-scroll-locked");
      window.dispatchEvent(new CustomEvent(SCROLL_LOCK_EVENT, { detail: true }));
      window.scrollTo(0, 0);
      transitionTimer = window.setTimeout(
        finishTransition,
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : SCROLL_LOCK_MS
      );
    };

    const handleWheel = (event: WheelEvent) => {
      ignoreRouteScroll = false;
      const deltaY =
        event.deltaY *
        (event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? window.innerHeight
            : 1);

      if (transitioning) {
        event.preventDefault();
      } else if (window.scrollY <= 0 && root.dataset.homeReveal === "pending" && deltaY > 0) {
        event.preventDefault();
        transitionTo("revealed");
      } else if (
        window.scrollY <= 0 &&
        root.dataset.homeReveal === "revealed" &&
        hasLeftTop &&
        deltaY < 0
      ) {
        event.preventDefault();
        topOverscroll += Math.abs(deltaY);
        if (topOverscroll >= TOP_DEAD_SCROLL_PX) {
          topOverscroll = 0;
          hasLeftTop = false;
          transitionTo("pending");
        }
      } else if (deltaY > 0) {
        topOverscroll = 0;
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
      topOverscroll = 0;
    };

    const handleTouchMove = (event: TouchEvent) => {
      ignoreRouteScroll = false;
      const scrollingDown = (event.touches[0]?.clientY ?? touchStartY) < touchStartY;
      if (transitioning) {
        event.preventDefault();
      } else if (window.scrollY <= 0 && root.dataset.homeReveal === "pending" && scrollingDown) {
        event.preventDefault();
        transitionTo("revealed");
      } else if (
        window.scrollY <= 0 &&
        root.dataset.homeReveal === "revealed" &&
        hasLeftTop &&
        !scrollingDown
      ) {
        event.preventDefault();
        topOverscroll = Math.abs((event.touches[0]?.clientY ?? touchStartY) - touchStartY);
        if (topOverscroll >= TOP_DEAD_SCROLL_PX) {
          topOverscroll = 0;
          hasLeftTop = false;
          transitionTo("pending");
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const isEditing =
        event.target instanceof Element &&
        event.target.closest(
          "input, textarea, select, button, a, [contenteditable], [role='button']"
        );
      if (
        !SCROLL_KEYS.has(event.key) ||
        isEditing ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;

      ignoreRouteScroll = false;
      const scrollingDown = DOWN_KEYS.has(event.key) && !(event.key === " " && event.shiftKey);
      const scrollingUp = UP_KEYS.has(event.key) || (event.key === " " && event.shiftKey);

      if (transitioning) {
        event.preventDefault();
      } else if (window.scrollY <= 0 && root.dataset.homeReveal === "pending" && scrollingDown) {
        event.preventDefault();
        transitionTo("revealed");
      } else if (
        window.scrollY <= 0 &&
        root.dataset.homeReveal === "revealed" &&
        hasLeftTop &&
        scrollingUp
      ) {
        event.preventDefault();
        topOverscroll += event.key === "ArrowUp" ? 40 : TOP_DEAD_SCROLL_PX;
        if (topOverscroll >= TOP_DEAD_SCROLL_PX) {
          topOverscroll = 0;
          hasLeftTop = false;
          transitionTo("pending");
        }
      }
    };

    const handleScroll = () => {
      if (ignoreRouteScroll) {
        return;
      } else if (transitioning) {
        if (window.scrollY !== 0) window.scrollTo(0, 0);
      } else if (window.scrollY > 0) {
        hasLeftTop = true;
        topOverscroll = 0;
      }
    };

    if (window.scrollY > 0 || returningHome) {
      root.dataset.homeReveal = "revealed";
    }
    window.addEventListener("wheel", handleWheel, { passive: false, capture: true });
    window.addEventListener("touchstart", handleTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false, capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.clearTimeout(transitionTimer);
      finishTransition();
      window.removeEventListener("wheel", handleWheel, true);
      window.removeEventListener("touchstart", handleTouchStart, true);
      window.removeEventListener("touchmove", handleTouchMove, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [returningHome]);

  return null;
}
