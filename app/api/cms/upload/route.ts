import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { cmsRequestAllowed } from "@/lib/cms/auth";
import { prepareImage } from "@/lib/cms/images";
import { MEDIA_BUCKET, MAX_UPLOAD_BYTES } from "@/lib/cms/media";
import { createServiceClient } from "@/lib/supabase/server";
import { allowRequest } from "@/lib/cart/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!(await cmsRequestAllowed(request)))
    return NextResponse.json({ error: "Please sign in again." }, { status: 403 });
  if (!allowRequest(request, "cms-upload", 30))
    return NextResponse.json(
      { error: "Please wait a minute before uploading more images." },
      { status: 429 }
    );
  if (Number(request.headers.get("content-length")) > MAX_UPLOAD_BYTES + 64_000) {
    return NextResponse.json({ error: "Choose an image smaller than 4 MB." }, { status: 413 });
  }
  let image;
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > MAX_UPLOAD_BYTES)
      throw new Error("Choose an image smaller than 4 MB.");
    image = await prepareImage(Buffer.from(await file.arrayBuffer()));
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not read this image." },
      { status: 400 }
    );
  }
  try {
    const client = await createServiceClient();
    const path = `${randomUUID()}.webp`;
    const { error } = await client.storage.from(MEDIA_BUCKET).upload(path, image.data, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    const { error: recordError } = await client.from("product_media_assets").insert({
      url: publicUrl,
      path,
      width: image.width,
      height: image.height,
    });
    if (recordError) {
      await client.storage.from(MEDIA_BUCKET).remove([path]);
      throw recordError;
    }
    return NextResponse.json(
      {
        url: publicUrl,
        width: image.width,
        height: image.height,
        bytes: image.data.length,
        warning: image.warning,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("CMS image upload failed", error);
    return NextResponse.json(
      { error: "The image passed its checks, but could not be saved. Try again." },
      { status: 503 }
    );
  }
}
