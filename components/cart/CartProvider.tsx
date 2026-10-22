"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cartEcommerceItems, pushEcommerceEventWhenConsentReady } from "@/lib/analytics/ecommerce";
import { useCartStore } from "@/lib/store/cart";
import CartDrawer from "@/components/cart/CartDrawer";

export default function CartProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const beganCheckout = useRef(false);
  const checkoutCartReady = useCartStore((state) =>
    state.loaded && state.pending.length === 0 && state.items.length > 0
  );
  const hydrate = useCartStore((state) => state.hydrate);
  useEffect(() => { void hydrate(); }, [hydrate]);
  // Keep this outside PageTransition: its route animation remounts page effects.
  useEffect(() => {
    if (pathname !== "/checkout") {
      beganCheckout.current = false;
      return;
    }
    if (!checkoutCartReady || beganCheckout.current) return;
    return pushEcommerceEventWhenConsentReady("begin_checkout", () => {
      beganCheckout.current = true;
      return cartEcommerceItems(useCartStore.getState().items);
    });
  }, [pathname, checkoutCartReady]);

  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
}
