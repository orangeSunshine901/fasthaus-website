export type CartWarning = { code: string; itemId?: string; message: string };

export type CartDto = {
  id: string | null;
  currency: "AED";
  items: Array<{
    itemId: string;
    productId: string;
    variantId: string;
    slug: string;
    name: string;
    variantName: string;
    imageUrl: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    available: boolean;
    maxQuantity: number | null;
    addOns: Array<{ id: string; name: string; imageUrl: string | null; unitPrice: number; quantity: number }>;
  }>;
  itemCount: number;
  subtotal: number;
  warnings: CartWarning[];
  updatedAt: string;
};

export const emptyCart = (): CartDto => ({
  id: null,
  currency: "AED",
  items: [],
  itemCount: 0,
  subtotal: 0,
  warnings: [],
  updatedAt: new Date(0).toISOString(),
});

export type ApiErrorCode =
  | "INVALID_REQUEST" | "VARIANT_NOT_FOUND" | "ITEM_NOT_FOUND" | "OUT_OF_STOCK"
  | "CART_EMPTY" | "CART_CONFLICT" | "CHECKOUT_FAILED";

export class CartError extends Error {
  constructor(public code: ApiErrorCode, message: string, public status = 400) {
    super(message);
  }
}
