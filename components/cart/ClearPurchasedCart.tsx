"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";

export default function ClearPurchasedCart() {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    void clearCart();
  }, [clearCart]);

  return null;
}
