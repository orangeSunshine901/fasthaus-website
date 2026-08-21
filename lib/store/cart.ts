"use client";

import { create } from "zustand";
import type { CartDto, CartItemMutationDto } from "../cart/types";

export type CartAddOn = { id: string; name: string; price: number; image: string; quantity?: number };
export type CartLineAddOn = CartAddOn & { quantity: number };
export type CartItem = { id: string; itemId: string; productId: string; productSlug: string; productName: string; variantColor: string; price: number; quantity: number; image: string; available: boolean; maxQuantity: number | null; addOns?: CartLineAddOn[] };

type AddInput = Omit<CartItem, "itemId" | "available" | "maxQuantity">;
type State = {
  cartId: string | null; items: CartItem[]; addOns: CartAddOn[]; loaded: boolean; pending: string[]; error: string | null;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  hydrate: () => Promise<void>;
  addItem: (item: AddInput, addOns?: CartAddOn[]) => Promise<boolean>;
  removeItem: (variantId: string) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => Promise<void>;
  updateAddOnQuantity: (variantId: string, addOnId: string, quantity: number) => Promise<void>;
  addAddOn: (variantId: string, addOnId: string) => Promise<void>;
  removeAddOn: (variantId: string, addOnId: string) => Promise<void>;
  toggleAddOn: (addOn: CartAddOn) => void;
  clearCart: () => Promise<void>;
  clearPurchasedCart: (cartId: string) => Promise<void>;
  itemCount: () => number; subtotal: () => number; total: () => number;
};

function fromDto(cart: CartDto): CartItem[] {
  return cart.items.map((item) => ({ id: item.variantId, itemId: item.itemId, productId: item.productId, productSlug: item.slug, productName: item.name, variantColor: item.variantName, price: item.unitPrice / 100, quantity: item.quantity, image: item.imageUrl ?? "", available: item.available, maxQuantity: item.maxQuantity, addOns: item.addOns.map((addOn) => ({ id: addOn.id, name: addOn.name, price: addOn.unitPrice / 100, image: addOn.imageUrl ?? "", quantity: addOn.quantity })) }));
}

async function request<T = CartDto>(url: string, init?: RequestInit) {
  const response = await fetch(url, { ...init, headers: init?.body ? { "Content-Type": "application/json" } : undefined });
  if (!response.ok) { const body = await response.json().catch(() => null); throw new Error(body?.error?.message ?? "Cart request failed."); }
  return response.status === 204 ? null : response.json() as Promise<T>;
}

export const useCartStore = create<State>((set, get) => {
  const mutate = async (key: string, action: () => Promise<CartDto | null>) => {
    set((state) => ({ pending: [...state.pending, key], error: null }));
    try { const cart = await action(); if (cart) set({ cartId: cart.id, items: fromDto(cart) }); return true; }
    catch (error) { set({ error: error instanceof Error ? error.message : "Cart request failed." }); return false; }
    finally { set((state) => ({ pending: state.pending.filter((item) => item !== key) })); }
  };
  return {
    cartId: null, items: [], addOns: [], loaded: false, pending: [], error: null,
    drawerOpen: false,
    openDrawer: () => set({ drawerOpen: true }),
    closeDrawer: () => set({ drawerOpen: false }),
    hydrate: async () => { if (get().loaded) return; const ok = await mutate("hydrate", () => request("/api/cart")); set({ loaded: true, ...(ok ? {} : { items: [] }) }); },
    addItem: async (item, addOns = []) => {
      const previous = get().items.find((row) => row.id === item.id);
      const optimistic: CartItem = {
        ...item,
        itemId: previous?.itemId ?? `optimistic:${item.id}`,
        quantity: (previous?.quantity ?? 0) + item.quantity,
        available: previous?.available ?? true,
        maxQuantity: previous?.maxQuantity ?? null,
        addOns: addOns.map((addOn) => ({ ...addOn, quantity: addOn.quantity ?? item.quantity })),
      };
      set((state) => ({
        items: previous
          ? state.items.map((row) => row.id === item.id ? optimistic : row)
          : [...state.items, optimistic],
        pending: [...state.pending, item.id],
        error: null,
      }));
      try {
        const saved = await request<CartItemMutationDto>("/api/cart/items", {
          method: "POST",
          body: JSON.stringify({ variantId: item.id, quantity: item.quantity, addOns: addOns.map((addOn) => ({ id: addOn.id, quantity: addOn.quantity ?? item.quantity })) }),
        });
        if (!saved) throw new Error("Cart request failed.");
        set((state) => ({
          cartId: saved.cartId,
          items: state.items.map((row) => row.id === item.id
            ? { ...row, itemId: saved.itemId, quantity: saved.quantity }
            : row),
        }));
        return true;
      } catch (error) {
        set((state) => ({
          items: previous
            ? state.items.map((row) => row.id === item.id ? previous : row)
            : state.items.filter((row) => row.id !== item.id),
          error: error instanceof Error ? error.message : "Cart request failed.",
        }));
        return false;
      } finally {
        set((state) => ({ pending: state.pending.filter((key) => key !== item.id) }));
      }
    },
    removeItem: async (variantId) => { const item = get().items.find((row) => row.id === variantId); if (item) await mutate(variantId, () => request(`/api/cart/items/${item.itemId}`, { method: "DELETE" })); },
    updateQuantity: async (variantId, quantity) => { const item = get().items.find((row) => row.id === variantId); if (item && quantity >= 1) await mutate(variantId, () => request(`/api/cart/items/${item.itemId}`, { method: "PATCH", body: JSON.stringify({ quantity }) })); },
    updateAddOnQuantity: async (variantId, addOnId, quantity) => {
      const item = get().items.find((row) => row.id === variantId); if (!item || quantity < 1) return;
      const addOns = (item.addOns ?? []).map((addOn) => ({ id: addOn.id, quantity: addOn.id === addOnId ? Math.min(quantity, item.quantity) : addOn.quantity }));
      await mutate(variantId, () => request(`/api/cart/items/${item.itemId}`, { method: "PATCH", body: JSON.stringify({ quantity: item.quantity, addOns }) }));
    },
    addAddOn: async (variantId, addOnId) => {
      const item = get().items.find((row) => row.id === variantId); if (!item || (item.addOns ?? []).some((addOn) => addOn.id === addOnId)) return;
      const addOns = [...(item.addOns ?? []).map((addOn) => ({ id: addOn.id, quantity: addOn.quantity })), { id: addOnId, quantity: 1 }];
      await mutate(variantId, () => request(`/api/cart/items/${item.itemId}`, { method: "PATCH", body: JSON.stringify({ quantity: item.quantity, addOns }) }));
    },
    removeAddOn: async (variantId, addOnId) => {
      const item = get().items.find((row) => row.id === variantId); if (!item) return;
      const addOns = (item.addOns ?? []).filter((addOn) => addOn.id !== addOnId).map((addOn) => ({ id: addOn.id, quantity: addOn.quantity }));
      await mutate(variantId, () => request(`/api/cart/items/${item.itemId}`, { method: "PATCH", body: JSON.stringify({ quantity: item.quantity, addOns }) }));
    },
    toggleAddOn: () => undefined,
    clearCart: async () => { if (await mutate("clear", () => request("/api/cart", { method: "DELETE" }))) set({ cartId: null, items: [], addOns: [] }); },
    clearPurchasedCart: async (cartId) => {
      if (get().cartId === cartId) set({ cartId: null, items: [], addOns: [] });
      set((state) => ({ pending: [...state.pending, "complete"], error: null }));
      try {
        const response = await fetch(`/api/cart?purchasedCartId=${encodeURIComponent(cartId)}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Purchased cart could not be cleared.");
        const { cleared } = await response.json() as { cleared: boolean };
        if (cleared && (get().cartId === null || get().cartId === cartId))
          set({ cartId: null, items: [], addOns: [] });
      } catch (error) {
        set({ error: error instanceof Error ? error.message : "Purchased cart could not be cleared." });
      } finally {
        set((state) => ({ pending: state.pending.filter((item) => item !== "complete") }));
      }
    },
    itemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity + (item.addOns ?? []).reduce((n, addOn) => n + addOn.price * addOn.quantity, 0), 0),
    total: () => get().subtotal(),
  };
});
