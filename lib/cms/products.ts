import { cache } from "react";
import { unstable_cache } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { PRODUCTS } from "@/lib/data/products";
import { applyProductMedia, type MediaRow } from "./media";

export async function readMediaRows(): Promise<MediaRow[]> {
  const client = await createServiceClient();
  const { data, error } = await client.from("product_media").select("variant_id,media,version");
  if (error) throw error;
  return data ?? [];
}

const cachedMedia = unstable_cache(readMediaRows, ["product-media", process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""], {
  tags: ["product-media"],
  revalidate: 60,
});

export const getMediaProducts = cache(async () => {
  if (!process.env.CMS_AUTH_EMAIL) return PRODUCTS;
  try {
    return applyProductMedia(PRODUCTS, await cachedMedia());
  } catch (error) {
    console.error("Could not load published product media", error);
    return PRODUCTS;
  }
});
