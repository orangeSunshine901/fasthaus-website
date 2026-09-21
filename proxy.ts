import { updateSession } from "@/lib/supabase/middleware";
import { PRODUCTS } from "@/lib/data/products";
import { NextResponse, type NextRequest } from "next/server";

const PRODUCT_SLUGS = new Set(PRODUCTS.map((product) => product.slug));
const PRODUCT_PATH = /^\/product\/([^/]+)\/?$/;

export async function proxy(request: NextRequest) {
  // Product pages stream (they read ?variant= at request time), so notFound() there can only
  // produce a soft 404 with status 200. Rewriting unknown slugs to an unmatched path lets
  // Next.js serve app/not-found.tsx with a real 404 status before anything streams.
  const productSlug = request.nextUrl.pathname.match(PRODUCT_PATH)?.[1];
  if (productSlug && !PRODUCT_SLUGS.has(decodeURIComponent(productSlug))) {
    return NextResponse.rewrite(new URL("/_product-not-found", request.url));
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
