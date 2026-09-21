import type { Product } from "../data/products.ts";
import { getCategory } from "../data/categories.ts";
import { clampDescription } from "./metadata.ts";

function listToSentence(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** "Plant-based PLA" → "plant-based PLA", but leaves acronyms such as "UV-printed" intact. */
function lowerFirstWord(text: string): string {
  return /^[A-Z][a-z]/.test(text) ? text[0].toLowerCase() + text.slice(1) : text;
}

/** e.g. "NASAQ Table Lamp" — product name plus the category's product type. */
export function productSeoTitle(product: Product): string {
  const category = getCategory(product.category);
  return category ? `${product.name} ${category.singular}` : product.name;
}

/** Built only from fields rendered on the product page, so it stays accurate as data changes. */
export function productSeoDescription(product: Product): string {
  const prices = product.variants.map((variant) => variant.price);
  const minPrice = Math.min(...prices);
  const priceText = `${minPrice === Math.max(...prices) ? "for" : "from"} AED ${minPrice}`;
  const colors = listToSentence(product.variants.map((variant) => variant.color));
  const material = product.materials[0] ? ` from ${lowerFirstWord(product.materials[0])}` : "";

  return clampDescription(
    `${product.description} Made to order in the UAE${material}. Available in ${colors} ${priceText}.`,
    180
  );
}

/** 1000×1000 "light on" render of the default variant — small enough for social crawlers. */
export function productSocialImage(product: Product) {
  const variant = product.variants[0];
  return {
    url: variant.featuredImages.lightOn,
    width: 1000,
    height: 1000,
    alt: `${product.name} lamp in ${variant.color}, switched on`,
  };
}
