import { z } from "zod";
import { PRODUCTS, type Product, type ProductVariant } from "../data/products.ts";

export const MEDIA_BUCKET = "product-media";
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MIN_SHORT_EDGE = 800;
export const MIN_LONG_EDGE = 1200;
export const IMAGE_SLOTS = [
  { key: "featuredOff", label: "Homepage · light off", required: true },
  { key: "featuredOn", label: "Homepage · light on", required: true },
  { key: "collection", label: "Collection card · desktop", required: true },
  { key: "collectionMobile", label: "Collection card · mobile", required: false },
  { key: "cart", label: "Empty cart background", required: false },
  { key: "hero", label: "Collection spotlight", required: false },
] as const;
export type ImageSlot = (typeof IMAGE_SLOTS)[number]["key"];

const imageSource = z.string().max(2048);
export const variantMediaSchema = z
  .object({
    featuredOff: imageSource.min(1),
    featuredOn: imageSource.min(1),
    collection: imageSource.min(1),
    collectionMobile: imageSource,
    cart: imageSource,
    hero: imageSource,
    images: z
      .array(
        z
          .object({
            src: imageSource.min(1),
            mobileSrc: imageSource.optional(),
            uiTheme: z.enum(["light", "dark"]),
          })
          .strict()
      )
      .min(1, "Keep at least one gallery image.")
      .max(30)
      .refine(
        (images) => new Set(images.map((image) => image.src)).size === images.length,
        "The gallery contains duplicate images."
      ),
  })
  .strict();
export type VariantMedia = z.infer<typeof variantMediaSchema>;
export type MediaRow = { variant_id: string; media: VariantMedia; version: number };

export function variantMedia(variant: ProductVariant): VariantMedia {
  return {
    featuredOff: variant.featuredImages.lightOff,
    featuredOn: variant.featuredImages.lightOn,
    collection: variant.collectionImage,
    collectionMobile: variant.collectionMobileImage ?? "",
    cart: variant.cartDrawerImage,
    hero: variant.collectionHeroImage ?? "",
    images: variant.images.map((image) => ({ ...image })),
  };
}

export function mediaSources(media: VariantMedia): string[] {
  return [
    ...IMAGE_SLOTS.map(({ key }) => media[key]),
    ...media.images.flatMap((image) => [image.src, image.mobileSrc ?? ""]),
  ].filter(Boolean);
}

export function applyProductMedia(products: Product[], rows: MediaRow[]): Product[] {
  const byVariant = new Map(rows.map((row) => [row.variant_id, row.media]));
  return products.map((product) => ({
    ...product,
    variants: product.variants.map((variant) => {
      const parsed = variantMediaSchema.safeParse(byVariant.get(variant.id));
      if (!parsed.success) return variant;
      const media = parsed.data;
      return {
        ...variant,
        featuredImages: { lightOff: media.featuredOff, lightOn: media.featuredOn },
        collectionImage: media.collection,
        collectionMobileImage: media.collectionMobile || undefined,
        cartDrawerImage: media.cart,
        collectionHeroImage: media.hero || undefined,
        images: media.images,
      };
    }),
  }));
}

export function knownProductSources(): Set<string> {
  return new Set(
    PRODUCTS.flatMap((product) =>
      product.variants.flatMap((variant) => mediaSources(variantMedia(variant)))
    )
  );
}

export function resolutionError(width: number, height: number): string | null {
  if (Math.min(width, height) < MIN_SHORT_EDGE || Math.max(width, height) < MIN_LONG_EDGE) {
    return `This image is ${width} × ${height}px. Use at least ${MIN_LONG_EDGE}px on the long side and ${MIN_SHORT_EDGE}px on the short side.`;
  }
  return null;
}
