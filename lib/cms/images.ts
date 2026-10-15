import sharp from "sharp";
import { MAX_UPLOAD_BYTES, resolutionError } from "./media.ts";

export async function prepareImage(bytes: Buffer) {
  if (!bytes.length || bytes.length > MAX_UPLOAD_BYTES)
    throw new Error("Choose an image smaller than 4 MB.");
  try {
    const image = sharp(bytes, { limitInputPixels: 40_000_000, failOn: "warning" });
    const metadata = await image.metadata();
    if (
      !metadata.format ||
      !["jpeg", "png", "webp", "heif"].includes(metadata.format) ||
      (metadata.format === "heif" && metadata.compression !== "av1")
    ) {
      throw new Error("Choose a JPEG, PNG, WebP or AVIF image.");
    }
    if ((metadata.pages ?? 1) > 1)
      throw new Error("Animated images are not supported. Choose a still image.");
    const width = metadata.autoOrient.width;
    const height = metadata.autoOrient.height;
    const error = resolutionError(width, height);
    if (error) throw new Error(error);
    // Re-encoding validates the full file, applies orientation and strips private EXIF metadata.
    const { data, info } = await image
      .rotate()
      .resize({
        width: 2400,
        height: 2400,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 90 })
      .toBuffer({ resolveWithObject: true });
    return {
      data,
      width: info.width,
      height: info.height,
      originalWidth: width,
      originalHeight: height,
      warning:
        Math.min(width, height) < 1200 || Math.max(width, height) < 1600
          ? "Accepted. For crisp full-screen views, aim for 1600 × 1200px or larger."
          : null,
    };
  } catch (error) {
    if (error instanceof Error && /^(Choose |This image |Animated )/.test(error.message))
      throw error;
    throw new Error(
      "This file could not be decoded as a safe image. Export a fresh JPEG, PNG, WebP or AVIF."
    );
  }
}
