import { ADD_ONS, PRODUCTS } from "@/lib/data/products";
import { MAX_CART_QUANTITY, toMinorUnits } from "./rules";

export { MAX_CART_QUANTITY, toMinorUnits };

export function findVariant(variantId: string) {
  for (const product of PRODUCTS) {
    const variant = product.variants.find((item) => item.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}

export function findAddOn(addOnId: string) {
  return ADD_ONS.find((item) => item.id === addOnId) ?? null;
}
