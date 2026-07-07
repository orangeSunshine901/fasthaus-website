"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartAddOn = {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
};

export type CartLineAddOn = CartAddOn & {
  quantity: number;
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
  addOns?: CartLineAddOn[];
};

type CartState = {
  items: CartItem[];
  // Legacy global add-ons from older persisted carts. New add-ons are stored on CartItem.addOns.
  addOns: CartAddOn[];
  addItem: (item: CartItem, addOns?: CartAddOn[]) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  updateAddOnQuantity: (variantId: string, addOnId: string, quantity: number) => void;
  removeAddOn: (variantId: string, addOnId: string) => void;
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

      addItem: (item, addOns = []) => {
        const incomingAddOns = addOns.map((addOn) => ({
          ...addOn,
          quantity: addOn.quantity ?? item.quantity,
        }));
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((i) => {
              if (i.id !== item.id) return i;

              const addOnMap = new Map((i.addOns ?? []).map((ao) => [ao.id, ao]));
              incomingAddOns.forEach((addOn) => {
                const current = addOnMap.get(addOn.id);
                addOnMap.set(addOn.id, {
                  ...addOn,
                  quantity: (current?.quantity ?? 0) + addOn.quantity,
                });
              });

              return {
                ...i,
                quantity: i.quantity + item.quantity,
                addOns: Array.from(addOnMap.values()),
              };
            }),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...item, addOns: incomingAddOns }],
          }));
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
            i.id === variantId
              ? {
                  ...i,
                  quantity,
                  addOns: (i.addOns ?? []).map((ao) =>
                    ao.quantity > quantity ? { ...ao, quantity } : ao
                  ),
                }
              : i
          ),
        }));
      },

      updateAddOnQuantity: (variantId, addOnId, quantity) => {
        if (quantity < 1) return;
        set((state) => ({
          items: state.items.map((i) =>
            i.id === variantId
              ? {
                  ...i,
                  addOns: (i.addOns ?? []).map((ao) =>
                    ao.id === addOnId
                      ? { ...ao, quantity: Math.min(quantity, i.quantity) }
                      : ao
                  ),
                }
              : i
          ),
        }));
      },

      removeAddOn: (variantId, addOnId) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === variantId
              ? { ...i, addOns: (i.addOns ?? []).filter((ao) => ao.id !== addOnId) }
              : i
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
          (sum, i) =>
            sum +
            i.price * i.quantity +
            (i.addOns ?? []).reduce((addOnSum, ao) => addOnSum + ao.price * ao.quantity, 0),
          0
        );
        const addOnsTotal = get().addOns.reduce(
          (sum, a) => sum + a.price * (a.quantity ?? 1),
          0
        );
        return itemsTotal + addOnsTotal;
      },

      total: () => get().subtotal(),
    }),
    {
      name: "fasthaus-cart",
    }
  )
);
