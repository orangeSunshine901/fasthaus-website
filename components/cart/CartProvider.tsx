"use client";

import { useEffect, type ReactNode } from "react";
import { useCartStore } from "@/lib/store/cart";
import CartDrawer from "@/components/cart/CartDrawer";

export default function CartProvider({ children }: { children: ReactNode }) {
  const hydrate = useCartStore((state) => state.hydrate);
  useEffect(() => { void hydrate(); }, [hydrate]);
  return (
    <>
      {children}
      <CartDrawer />
    </>
  );
}
