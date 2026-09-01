"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Minus, Plus, X } from "lucide-react";
import DirhamPrice from "@/components/ui/DirhamPrice";
import { useCartStore } from "@/lib/store/cart";
import { PRODUCTS } from "@/lib/data/products";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";

const CART_DRAWER_SLIDES = PRODUCTS.flatMap((product) =>
  product.variants.map((variant) => ({ product, variant }))
).filter(({ variant }) => variant.cartDrawerImage);

export default function CartDrawer() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const {
    items,
    drawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    pending,
    error,
    subtotal,
    itemCount,
    total,
  } = useCartStore();
  const count = itemCount();
  const isEmpty = items.length === 0;
  const activeSlide = CART_DRAWER_SLIDES[activeSlideIndex % CART_DRAWER_SLIDES.length];

  useEffect(() => {
    if (!drawerOpen || !isEmpty || reducedMotion || CART_DRAWER_SLIDES.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveSlideIndex((index) => (index + 1) % CART_DRAWER_SLIDES.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [drawerOpen, isEmpty, reducedMotion]);

  const showPreviousSlide = () =>
    setActiveSlideIndex(
      (index) => (index - 1 + CART_DRAWER_SLIDES.length) % CART_DRAWER_SLIDES.length
    );
  const showNextSlide = () =>
    setActiveSlideIndex((index) => (index + 1) % CART_DRAWER_SLIDES.length);

  // One row per add-on: checked if some cart item already has it, otherwise an
  // upsell targeting the first item whose product offers it.
  // const addOnRows = useMemo(
  //   () =>
  //     ADD_ONS.flatMap((addOn) => {
  //       const attachedTo = items.find((item) => (item.addOns ?? []).some((a) => a.id === addOn.id));
  //       const target =
  //         attachedTo ??
  //         items.find((item) =>
  //           PRODUCTS.find((p) => p.id === item.productId)?.addOns?.some((a) => a.id === addOn.id)
  //         );
  //       return target ? [{ addOn, item: target, attached: Boolean(attachedTo) }] : [];
  //     }),
  //   [items]
  // );

  // Lock body scroll and close on Escape while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    capture(analyticsEvents.cartViewed, {
      item_count: count,
      cart_value: total(),
      currency: "AED",
    });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawerOpen, closeDrawer]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Scrim */}
          <motion.div
            key="cart-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[6000] cursor-pointer"
            style={{ backgroundColor: "rgba(20,16,12,0.45)", backdropFilter: "blur(2px)" }}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            key="cart-drawer"
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-y-0 right-0 z-[6001] flex w-full max-w-[440px] flex-col bg-white"
            style={{ boxShadow: "-24px 0 60px rgba(20,16,12,0.35)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Cart"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between border-b px-6 py-5"
              style={{ borderColor: "#EEE9E3" }}
            >
              <div className="flex items-baseline gap-2.5">
                <span
                  className="text-[20px] font-extrabold tracking-[-0.015em]"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Your cart
                </span>
                {!isEmpty && (
                  <span className="text-[14px] font-semibold" style={{ color: "#8A8075" }}>
                    {count} {count === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
              <button
                onClick={closeDrawer}
                aria-label="Close cart"
                className="grid h-10 w-10 place-items-center rounded-full border bg-white transition-colors"
                style={{ borderColor: "#EEE9E3" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#D9D2C9")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#EEE9E3")}
              >
                <X size={16} strokeWidth={1.8} style={{ color: "var(--color-text-primary)" }} />
              </button>
            </div>

            {error && (
              <p
                role="alert"
                className="border-b px-6 py-3 text-[13px] font-medium"
                style={{ borderColor: "#EEE9E3", color: "var(--color-error)" }}
              >
                {error}
              </p>
            )}

            {isEmpty ? (
              <>
                {/* Empty state */}
                <div className="relative flex-1 overflow-hidden">
                  <AnimatePresence initial={false} mode="popLayout">
                    <motion.div
                      key={activeSlide.variant.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.65 }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={activeSlide.variant.cartDrawerImage}
                        alt={`${activeSlide.product.name} in ${activeSlide.variant.color}`}
                        fill
                        sizes="440px"
                        className="object-cover"
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(20,16,12,0.35) 0%, rgba(20,16,12,0) 30%, rgba(20,16,12,0) 55%, rgba(20,16,12,0.55) 100%)",
                    }}
                  />
                  <div className="absolute left-6 right-6 top-7 flex flex-col gap-1.5">
                    <span className="text-[24px] font-extrabold tracking-[-0.02em] text-white">
                      Your cart is empty
                    </span>
                    <span className="text-[14.5px] font-semibold text-white/85">
                      Nothing here yet, let&apos;s fix that.
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold uppercase tracking-[0.08em] text-white/75">
                        Start with a favorite
                      </span>
                      {CART_DRAWER_SLIDES.length > 1 && (
                        <div className="flex items-center gap-1.5" aria-label="Cart recommendations">
                          <button
                            type="button"
                            onClick={showPreviousSlide}
                            aria-label="Previous recommendation"
                            className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#1D1A17] transition-colors hover:bg-white"
                          >
                            <ArrowLeft size={14} strokeWidth={2} />
                          </button>
                          <button
                            type="button"
                            onClick={showNextSlide}
                            aria-label="Next recommendation"
                            className="grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#1D1A17] transition-colors hover:bg-white"
                          >
                            <ArrowRight size={14} strokeWidth={2} />
                          </button>
                        </div>
                      )}
                    </div>
                    <motion.div
                      key={activeSlide.variant.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.3 }}
                      className="flex items-center gap-3.5 rounded-[14px] p-3"
                      style={{ backgroundColor: "rgba(255,255,255,0.96)" }}
                    >
                      <Image
                        src={activeSlide.variant.collectionImage}
                        alt={`${activeSlide.product.name} in ${activeSlide.variant.color}`}
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-[10px] object-cover"
                      />
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span
                          className="text-[15px] font-bold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {activeSlide.product.name}
                        </span>
                        <span className="text-[12px] font-medium text-[#8A8075]">
                          {activeSlide.variant.color}
                        </span>
                        <DirhamPrice
                          amount={activeSlide.variant.price}
                          size="sm"
                          className="font-semibold"
                        />
                      </div>
                      <Link
                        href={`/product/${activeSlide.product.slug}?variant=${encodeURIComponent(activeSlide.variant.id)}`}
                        onClick={closeDrawer}
                        aria-label={`View ${activeSlide.product.name} in ${activeSlide.variant.color}`}
                        className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full transition-[filter] hover:brightness-95"
                        style={{ backgroundColor: "var(--color-accent-amber)" }}
                      >
                        <ArrowRight size={16} strokeWidth={2} className="text-white" />
                      </Link>
                    </motion.div>
                  </div>
                </div>
                <div className="border-t px-6 py-5" style={{ borderColor: "#EEE9E3" }}>
                  <Link
                    href="/collection"
                    onClick={closeDrawer}
                    className="grid h-[52px] place-items-center rounded-[12px] text-[16px] font-bold text-white transition-colors"
                    style={{ backgroundColor: "#1D1A17" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2E2A25")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1D1A17")}
                  >
                    Shop the collection
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Free shipping bar */}
                <div
                  className="flex flex-col gap-2 border-b px-6 py-4"
                  style={{ backgroundColor: "#FAF7F3", borderColor: "#EEE9E3" }}
                >
                  <span className="text-[13.5px] font-semibold" style={{ color: "#3A332B" }}>
                    🎉&nbsp; Congrats! You&apos;ve unlocked{" "}
                    <strong className="font-extrabold">free shipping</strong>
                  </span>
                  <div
                    className="h-1.5 overflow-hidden rounded-[3px]"
                    style={{ backgroundColor: "#EEE9E3" }}
                  >
                    <div
                      className="h-full w-full rounded-[3px]"
                      style={{ backgroundColor: "#1F8A5B" }}
                    />
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-1" data-lenis-prevent>
                  {items.map((item) => {
                    const busy = pending.includes(item.id);
                    const syncingQuantity = pending.includes(`quantity:${item.id}`);
                    const quantityLocked = busy || item.itemId.startsWith("optimistic:");
                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[76px_1fr] gap-4 border-b py-[18px]"
                        style={{ borderColor: "#F2EDE7" }}
                      >
                        <Link href={`/product/${item.productSlug}`} onClick={closeDrawer}>
                          <Image
                            src={item.image}
                            alt={item.productName}
                            width={76}
                            height={76}
                            className="h-[76px] w-[76px] rounded-[12px] object-cover"
                          />
                        </Link>
                        <div className="flex flex-col gap-2">
                          <div className="flex justify-between gap-2.5">
                            <div className="flex flex-col gap-0.5">
                              <span
                                className="text-[15.5px] font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                              >
                                {item.productName}
                              </span>
                              <span
                                className="text-[13px] font-medium"
                                style={{ color: "#8A8075" }}
                              >
                                {item.variantColor}
                              </span>
                            </div>
                            <DirhamPrice
                              amount={item.price * item.quantity}
                              size="sm"
                              className="flex-shrink-0 font-extrabold"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div
                              className="flex items-center overflow-hidden rounded-[9px] border"
                              style={{ borderColor: "#EEE9E3" }}
                            >
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={quantityLocked || item.quantity <= 1}
                                className="grid h-[30px] w-[30px] place-items-center bg-white transition-colors hover:bg-[#FAF7F3] disabled:opacity-40"
                                style={{ color: "#6E655B" }}
                                aria-label={`Decrease ${item.productName} quantity`}
                              >
                                <Minus size={13} />
                              </button>
                              <span
                                className="w-7 text-center text-[14px] font-bold"
                                style={{ color: "var(--color-text-primary)" }}
                              >
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={
                                  quantityLocked ||
                                  (item.maxQuantity !== null && item.quantity >= item.maxQuantity)
                                }
                                className="grid h-[30px] w-[30px] place-items-center bg-white transition-colors hover:bg-[#FAF7F3] disabled:opacity-40"
                                style={{ color: "#6E655B" }}
                                aria-label={`Increase ${item.productName} quantity`}
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              disabled={busy || syncingQuantity}
                              className="text-[13px] font-semibold underline transition-colors hover:text-[var(--color-accent-amber)] disabled:opacity-40"
                              style={{ color: "#8A8075" }}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add-on upsells */}
                  {/* {addOnRows.map(({ addOn, item, attached }) => (
                    <label
                      key={addOn.id}
                      className="my-4 flex cursor-pointer items-center gap-3.5 rounded-[14px] p-4"
                      style={{ backgroundColor: "#FAF7F3" }}
                    >
                      <input
                        type="checkbox"
                        checked={attached}
                        disabled={pending.includes(item.id)}
                        onChange={() =>
                          attached ? removeAddOn(item.id, addOn.id) : addAddOn(item.id, addOn.id)
                        }
                        className="h-[18px] w-[18px] flex-shrink-0 cursor-pointer accent-[var(--color-accent-amber)]"
                      />
                      <Image
                        src={addOn.image}
                        alt={addOn.name}
                        width={48}
                        height={48}
                        className="h-12 w-12 flex-shrink-0 rounded-[10px] object-cover"
                      />
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span
                          className="text-[14px] font-bold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          Add the {addOn.name.toLowerCase()}
                        </span>
                        <span className="text-[12.5px] font-medium" style={{ color: "#6E655B" }}>
                          Made for your {item.productName}
                        </span>
                      </div>
                      <DirhamPrice
                        amount={addOn.price}
                        size="sm"
                        className="flex-shrink-0 font-extrabold"
                      />
                    </label>
                  ))} */}
                </div>

                {/* Footer */}
                <div
                  className="flex flex-col gap-3.5 border-t bg-white px-6 py-5"
                  style={{ borderColor: "#EEE9E3" }}
                >
                  <div className="flex items-baseline justify-between">
                    <span className="text-[15px] font-semibold" style={{ color: "#6E655B" }}>
                      Subtotal
                    </span>
                    <DirhamPrice amount={subtotal()} size="lg" className="font-extrabold" />
                  </div>
                  <div className="text-[12.5px] font-medium" style={{ color: "#8A8075" }}>
                    Free shipping ·{" "}
                    <Link href="/legal/refunds" onClick={closeDrawer} className="hover:underline">
                      14-day eligible returns
                    </Link>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => {
                      capture(analyticsEvents.checkoutStarted, {
                        item_count: count,
                        cart_value: total(),
                        currency: "AED",
                      });
                      closeDrawer();
                    }}
                    className="flex h-[52px] items-center justify-center gap-1.5 rounded-[12px] text-[16px] font-bold text-white transition-[filter] hover:brightness-95"
                    style={{ backgroundColor: "var(--color-accent-amber)" }}
                  >
                    <span>Checkout —</span>
                    <DirhamPrice
                      amount={subtotal()}
                      size="sm"
                      variant="white"
                      className="font-bold text-[16px]"
                    />
                  </Link>
                  <Link
                    href="/collection"
                    onClick={closeDrawer}
                    className="text-center text-[14px] font-bold hover:underline"
                    style={{ color: "var(--color-accent-amber)" }}
                  >
                    Continue shopping
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
