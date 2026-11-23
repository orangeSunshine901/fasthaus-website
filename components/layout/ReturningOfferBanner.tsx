"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BadgePercent, X } from "lucide-react";
import { DISCOUNT_INTERACTION_GAP_MS, DISCOUNT_OFFER_VISIBLE_MS, isReturningOfferRoute, hasDiscountOfferEngagement, isDiscountOfferOnCooldown, REACTIVATION_IDLE_MS } from "@/lib/returning-offer";
import { isPageScrollLocked, PAGE_SCROLL_LOCK_EVENT } from "@/lib/page-scroll-lock";
import { CHECKOUT_DISCOUNTS_ENABLED } from "@/lib/promotions";
import { CHECKOUT_DISCOUNT_CODE } from "@/lib/checkout/discount";
import { useCartStore } from "@/lib/store/cart";
import useReturningDiscount from "./useReturningDiscount";

const DISCOUNT_LAST_SHOWN_KEY = "fasthaus_returning_discount_last_shown";

export default function ReturningOfferBanner() {
  const pathname = usePathname();
  const eligible = useReturningDiscount(CHECKOUT_DISCOUNTS_ENABLED);
  const drawerOpen = useCartStore((state) => state.drawerOpen);
  const [visible, setVisible] = useState(false);
  const offerRef = useRef<HTMLElement>(null);
  const activeMs = useRef(0);
  const visibleMs = useRef(0);
  const dismissed = useRef(false);
  const shown = useRef(false);
  const interactions = useRef(0);
  const lastInteraction = useRef(0);
  const lastCountedInteraction = useRef(-Infinity);

  useEffect(() => {
    if (!eligible) return;
    let lastTick = performance.now();
    const isBlocked = () => document.visibilityState !== "visible" || drawerOpen || isPageScrollLocked()
      || ["#stcm-banner", "#stcm-modal"].some((selector) =>
        Boolean(document.querySelector(selector)?.getClientRects().length)
      );
    const recordInteraction = (event: Event) => {
      if (shown.current || dismissed.current
        || !isReturningOfferRoute(pathname) || isBlocked()) return;
      if (event instanceof KeyboardEvent && (event.repeat || event.target instanceof Element
        && event.target.closest("input, textarea, select, [contenteditable]"))) return;
      const now = performance.now();
      if (lastInteraction.current && now - lastInteraction.current >= REACTIVATION_IDLE_MS) {
        interactions.current = 0;
        activeMs.current = 0;
      }
      lastInteraction.current = now;
      if (now - lastCountedInteraction.current >= DISCOUNT_INTERACTION_GAP_MS) {
        interactions.current += 1;
        lastCountedInteraction.current = now;
      }
    };
    const update = () => {
      const now = performance.now();
      const blocked = isBlocked();
      if (!shown.current) {
        try {
          dismissed.current ||= isDiscountOfferOnCooldown(
            Number(localStorage.getItem(DISCOUNT_LAST_SHOWN_KEY)), Date.now()
          );
        } catch {
          // Dismissal still lasts for this page load when storage is unavailable.
        }
      }
      const elapsed = now - lastTick;
      if (!blocked && isReturningOfferRoute(pathname)) {
        activeMs.current += elapsed;
        const offer = offerRef.current;
        const interacting = offer && (offer.contains(document.activeElement)
          || window.matchMedia("(hover: hover)").matches && offer.matches(":hover"));
        if (offer && !interacting) visibleMs.current += elapsed;
        if (visibleMs.current >= DISCOUNT_OFFER_VISIBLE_MS) dismissed.current = true;
      }
      lastTick = now;
      const engaged = shown.current || hasDiscountOfferEngagement(
        activeMs.current, interactions.current, now - lastInteraction.current
      );
      const nextVisible = engaged && isReturningOfferRoute(pathname) && !dismissed.current && !blocked;
      if (nextVisible && !shown.current) {
        shown.current = true;
        try {
          localStorage.setItem(DISCOUNT_LAST_SHOWN_KEY, String(Date.now()));
        } catch {
          // Keep the current offer usable when storage is unavailable.
        }
      }
      setVisible(nextVisible);
    };
    const onVisibilityChange = () => {
      lastTick = performance.now();
      update();
    };
    const frame = window.requestAnimationFrame(update);
    const interval = window.setInterval(update, 1000);
    const interactionEvents = ["click", "keydown", "wheel", "touchstart"];
    interactionEvents.forEach((event) => window.addEventListener(event, recordInteraction, { passive: true }));
    window.addEventListener(PAGE_SCROLL_LOCK_EVENT, update);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      window.cancelAnimationFrame(frame);
      interactionEvents.forEach((event) => window.removeEventListener(event, recordInteraction));
      window.removeEventListener(PAGE_SCROLL_LOCK_EVENT, update);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname, drawerOpen, eligible]);

  function dismiss() {
    dismissed.current = true;
    setVisible(false);
  }

  if (!visible || drawerOpen || !isReturningOfferRoute(pathname)) return null;

  return (
    <aside
      ref={offerRef}
      aria-label="Returning visitor offer"
      aria-live="polite"
      onKeyDown={(event) => { if (event.key === "Escape") dismiss(); }}
      className="fixed right-[max(12px,env(safe-area-inset-right))] top-[calc(112px+env(safe-area-inset-top))] z-40 flex w-[calc(100%_-_24px)] max-w-[360px] items-start gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-[var(--color-text-primary)] md:right-6 md:top-[164px]"
    >
      <BadgePercent size={20} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1 pr-6">
        <h2 className="text-base font-semibold leading-snug">Welcome back — 10% off</h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          Use <strong className="select-all font-semibold text-[var(--color-text-primary)]">{CHECKOUT_DISCOUNT_CODE}</strong> at checkout.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss discount offer"
        className="absolute right-1 top-1 flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)]"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </aside>
  );
}
