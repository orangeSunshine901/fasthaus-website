"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartAddOn = {
  id: string;
  name: string;
  price: number;
  image: string;
};

export type CartItem = {
  id: string; // variantId
  productId: string;
  productSlug: string;
  productName: string;
  variantColor: string;
  price: number;
  quantity: number;
  image: string;
};

type CartState = {
  items: CartItem[];
  addOns: CartAddOn[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  toggleAddOn: (addOn: CartAddOn) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
  total: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addOns: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) =>
              i.id === item.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }));
        } else {
          set((state) => ({ items: [...state.items, item] }));
        }
      },

      removeItem: (variantId) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== variantId),
        }));
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) =>
            i.id === variantId ? { ...i, quantity } : i
          ),
        }));
      },

      toggleAddOn: (addOn) => {
        const exists = get().addOns.find((a) => a.id === addOn.id);
        if (exists) {
          set((state) => ({
            addOns: state.addOns.filter((a) => a.id !== addOn.id),
          }));
        } else {
          set((state) => ({ addOns: [...state.addOns, addOn] }));
        }
      },

      clearCart: () => set({ items: [], addOns: [] }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () => {
        const itemsTotal = get().items.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0
        );
        const addOnsTotal = get().addOns.reduce((sum, a) => sum + a.price, 0);
        return itemsTotal + addOnsTotal;
      },

      total: () => get().subtotal(),
    }),
    {
      name: "fasthaus-cart",
    }
  )
);
