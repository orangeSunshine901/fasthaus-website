"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";

export default function ClearPurchasedCart({ cartId }: { cartId: string }) {
  const clearPurchasedCart = useCartStore((state) => state.clearPurchasedCart);

  useEffect(() => {
    void clearPurchasedCart(cartId);
  }, [cartId, clearPurchasedCart]);

  return null;
}
