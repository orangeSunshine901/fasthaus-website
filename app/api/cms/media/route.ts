import { z } from "zod";
import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { cmsRequestAllowed } from "@/lib/cms/auth";
import { knownProductSources, mediaSources, variantMediaSchema } from "@/lib/cms/media";
import { PRODUCTS } from "@/lib/data/products";
import { createServiceClient } from "@/lib/supabase/server";

const publishSchema = z
  .object({
    variantId: z.string().max(100),
    version: z.number().int().min(0),
    media: variantMediaSchema,
  })
  .strict();

export async function PUT(request: Request) {
  if (!(await cmsRequestAllowed(request)))
    return NextResponse.json({ error: "Please sign in again." }, { status: 403 });
  let body;
  try {
    body = publishSchema.safeParse(await request.json());
  } catch {
    return NextResponse.json({ error: "Could not read these changes." }, { status: 400 });
  }
  if (!body.success)
    return NextResponse.json({ error: body.error.issues[0].message }, { status: 400 });
  const { variantId, version, media } = body.data;
  if (!PRODUCTS.some((product) => product.variants.some((variant) => variant.id === variantId))) {
    return NextResponse.json({ error: "Unknown product colour." }, { status: 400 });
  }
  try {
    const client = await createServiceClient();
    const existing = knownProductSources();
    const uploads = [...new Set(mediaSources(media).filter((src) => !existing.has(src)))];
    if (uploads.length) {
      const { data, error } = await client
        .from("product_media_assets")
        .select("url")
        .in("url", uploads);
      if (error) throw error;
      if (data.length !== uploads.length)
        return NextResponse.json(
          { error: "Use images uploaded through this editor." },
          { status: 400 }
        );
    }
    const values = { media, version: version + 1, updated_at: new Date().toISOString() };
    const result =
      version === 0
        ? await client
            .from("product_media")
            .insert({ variant_id: variantId, ...values })
            .select("version")
            .single()
        : await client
            .from("product_media")
            .update(values)
            .eq("variant_id", variantId)
            .eq("version", version)
            .select("version")
            .maybeSingle();
    if (result.error?.code === "23505" || (!result.error && !result.data)) {
      return NextResponse.json(
        {
          error:
            "Someone published changes to this colour. Reload the editor before continuing; your draft is still on screen.",
        },
        { status: 409 }
      );
    }
    if (result.error) throw result.error;
    revalidateTag("product-media", { expire: 0 });
    revalidatePath("/", "layout");
    return NextResponse.json({ version: result.data!.version });
  } catch (error) {
    console.error("CMS publish failed", error);
    return NextResponse.json(
      { error: "Could not publish. Your draft is still here; try again." },
      { status: 503 }
    );
  }
}
