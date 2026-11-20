import { GALLERY_PORTRAITS } from "./gallery-portraits.ts";
import { MOBILE_GALLERY_IMAGES } from "./mobile-gallery-images.ts";

// Unknown/CMS-uploaded media retains its selected URL. Only known local photos
// use the pre-encoded mobile copy, after applying the reviewed portrait crop.
export function getMobileGallerySource(source: string) {
  const portrait = GALLERY_PORTRAITS[source] ?? source;
  return MOBILE_GALLERY_IMAGES[portrait] ?? portrait;
}

// CSS-hidden desktop images still download. A media-qualified transparent
// source keeps their requests off phones without waiting for hydration.
export const MOBILE_HIDDEN_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
