"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { BadgePercent, Gift, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMediaProducts } from "@/components/product/ProductMediaProvider";
import { isGiftOfferRoute, shouldShowGiftOffer } from "@/lib/gift-offer";
import { isPageScrollLocked, PAGE_SCROLL_LOCK_EVENT } from "@/lib/page-scroll-lock";
import { CHECKOUT_DISCOUNTS_ENABLED, GIFT_WITH_ORDER_ENABLED } from "@/lib/promotions";
import { CHECKOUT_DISCOUNT_CODE } from "@/lib/checkout/discount";
import { useCartStore } from "@/lib/store/cart";
import useReturningDiscount from "./useReturningDiscount";

const CONFETTI_COLORS = ["var(--color-accent-amber)", "var(--color-highlight)", "#C4884B"];
const QUALIFIED_KEY = "fasthaus_gift_offer_qualified";

export default function GiftOfferBanner() {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const discountOffer = useReturningDiscount(CHECKOUT_DISCOUNTS_ENABLED);
  const OfferIcon = discountOffer ? BadgePercent : Gift;
  const products = useMediaProducts();
  const hasLampInCart = useCartStore((state) => state.items.some((item) =>
    products.some((product) => product.id === item.productId)
  ));
  const drawerOpen = useCartStore((state) => state.drawerOpen);
  const [visible, setVisible] = useState(false);
  const activeMs = useRef(0);
  const viewedLamp = useRef(false);
  const dismissed = useRef(false);
  const discountDismissed = useRef(false);
  const qualified = useRef(false);
  const isProductPage = products.some((product) => pathname === `/product/${product.slug}`);

  useEffect(() => {
    if (!GIFT_WITH_ORDER_ENABLED && !discountOffer) return;
    viewedLamp.current ||= isProductPage;
    try {
      qualified.current ||= sessionStorage.getItem(QUALIFIED_KEY) === "1";
    } catch {
      // The offer still works for this page load when storage is unavailable.
    }

    let lastTick = performance.now();
    const update = () => {
      const now = performance.now();
      const consentOpen = ["#stcm-banner", "#stcm-modal"].some((selector) =>
        Boolean(document.querySelector(selector)?.getClientRects().length)
      );
      const blocked = document.visibilityState !== "visible"
        || drawerOpen || isPageScrollLocked() || consentOpen;
      if (!blocked && isGiftOfferRoute(pathname)) activeMs.current += now - lastTick;
      lastTick = now;
      const nextVisible = shouldShowGiftOffer({
        activeMs: activeMs.current,
        viewedLamp: viewedLamp.current,
        hasLampInCart,
        pathname,
        dismissed: discountOffer ? discountDismissed.current : dismissed.current,
        blocked,
        qualified: qualified.current || discountOffer,
      });
      if (nextVisible && !qualified.current) {
        qualified.current = true;
        try {
          sessionStorage.setItem(QUALIFIED_KEY, "1");
        } catch {
          // Keep the offer available in memory when storage is unavailable.
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
    window.addEventListener(PAGE_SCROLL_LOCK_EVENT, update);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(interval);
      window.cancelAnimationFrame(frame);
      window.removeEventListener(PAGE_SCROLL_LOCK_EVENT, update);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [pathname, isProductPage, hasLampInCart, drawerOpen, discountOffer]);

  function dismiss() {
    if (discountOffer) discountDismissed.current = true;
    else dismissed.current = true;
    setVisible(false);
  }

  if ((!GIFT_WITH_ORDER_ENABLED && !discountOffer) || drawerOpen || !isGiftOfferRoute(pathname)) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          aria-label={discountOffer ? "Returning visitor offer" : "Complimentary gift offer"}
          aria-live="polite"
          className="fixed right-[max(12px,env(safe-area-inset-right))] top-[calc(112px+env(safe-area-inset-top))] z-40 isolate flex w-[calc(100%_-_24px)] max-w-[400px] items-start gap-2 rounded-[14px] p-3 text-[var(--color-text-primary)] md:right-6 md:top-[164px] md:w-[400px] md:gap-3 md:p-4"
          style={{ transformOrigin: "top right" }}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 12, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            ...(reducedMotion ? {} : { x: 8, y: -4, scale: 0.99 }),
            transition: { duration: reducedMotion ? 0.1 : 0.16 },
          }}
          transition={{ duration: reducedMotion ? 0.12 : 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            aria-hidden="true"
            className="glass-backdrop pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-[inherit] border border-white/60 bg-white/75"
          />
          {!reducedMotion && (
            <span aria-hidden="true" className="pointer-events-none absolute inset-0">
              {[-24, -12, 0, 12, 24, 36, 48, 60, 72, 84].map((x, index) => (
                <motion.span
                  key={x}
                  className="absolute left-5 top-3 h-1.5 w-1 rounded-[1px] md:left-7 md:top-4"
                  style={{ backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length] }}
                  initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
                  animate={{
                    opacity: [0, 0.7, 0],
                    x: [0, x * 0.6, x],
                    y: [0, -48 - (index % 3) * 10, 24],
                    rotate: [0, (index % 2 === 0 ? 1 : -1) * 160],
                  }}
                  transition={{ duration: 1.1, delay: index * 0.015, ease: "easeOut" }}
                />
              ))}
            </span>
          )}
          <OfferIcon size={22} strokeWidth={1.5} aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 md:size-[22px]" />
          <div className="min-w-0 flex-1 pr-8 md:pr-0">
            <p className="text-base font-bold leading-snug">
              <span className="font-semibold md:hidden">
                {discountOffer ? "Welcome back — 10% off" : "A gift with your lamp"}
              </span>
              <span className="hidden md:inline">
                {discountOffer ? "Welcome back — enjoy 10% off" : "A gift with your lamp"}
              </span>
            </p>
            <p className="mt-0.5 text-sm leading-relaxed text-[var(--color-text-primary)]/80 md:mt-1">
              <span className="md:hidden">
                {discountOffer ? (
                  <>Use <strong className="select-all">{CHECKOUT_DISCOUNT_CODE}</strong> at checkout.</>
                ) : "Included with your order. No code or signup."}
              </span>
              <span className="hidden md:inline">
                {discountOffer ? (
                  <>Use <strong className="select-all">{CHECKOUT_DISCOUNT_CODE}</strong> at checkout for 10% off your order.</>
                ) : "A complimentary gift is included with your lamp order. No code or signup needed."}
              </span>
            </p>
          </div>
          <motion.button
            type="button"
            onClick={dismiss}
            aria-label={discountOffer ? "Dismiss discount offer" : "Dismiss gift offer"}
            whileHover={reducedMotion ? undefined : { scale: 1.06 }}
            whileTap={reducedMotion ? undefined : { scale: 0.94 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-0 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text-primary)] md:static md:-mr-2 md:-mt-2"
          >
            <X size={18} aria-hidden="true" />
          </motion.button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
