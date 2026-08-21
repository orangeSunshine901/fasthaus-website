import { NextResponse } from "next/server";
import { clearCart, getCart } from "@/lib/cart/service";
import { cartErrorResponse, isSameOrigin } from "@/lib/cart/http";
import { allowRequest } from "@/lib/cart/rate-limit";

export async function GET() {
  try { return NextResponse.json(await getCart()); } catch (error) { return cartErrorResponse(error); }
}

export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Cross-origin request rejected." } }, { status: 403 });
  if (!allowRequest(request, "cart-mutation", 60)) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Too many cart requests." } }, { status: 429 });
  try {
    const purchasedCartId = new URL(request.url).searchParams.get("purchasedCartId");
    const cleared = await clearCart(purchasedCartId ?? undefined);
    return purchasedCartId
      ? NextResponse.json({ cleared })
      : new NextResponse(null, { status: 204 });
  } catch (error) { return cartErrorResponse(error); }
}
