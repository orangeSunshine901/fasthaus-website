import { getVariantMainImage, type Product } from "./products.ts";

export function getCollectionMenuItems(products: Product[]) {
  return [...products]
    .sort((a, b) => Number(a.slug === "hamrah-lamp") - Number(b.slug === "hamrah-lamp"))
    .map((product) => {
      const variant = product.variants.find((item) => item.id === "3-white") ?? product.variants[0];
      const image = ["3-white", "1-matcha"].includes(variant.id)
        ? getVariantMainImage(variant)
        : variant.collectionImage;
      return { product, variant, image };
    });
}
