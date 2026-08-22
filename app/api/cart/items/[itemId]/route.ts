import { NextResponse } from "next/server";
import { z } from "zod";
import { removeCartItem, updateCartItem } from "@/lib/cart/service";
import { cartErrorResponse, isSameOrigin } from "@/lib/cart/http";
import { allowRequest } from "@/lib/cart/rate-limit";

const schema = z.object({
  variantId: z.string().min(1).optional(),
  quantity: z.number().int().min(1).max(10),
  addOns: z.array(z.object({ id: z.string().min(1), quantity: z.number().int().min(1).max(10) })).optional(),
}).strict();

export async function PATCH(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Cross-origin request rejected." } }, { status: 403 });
  if (!allowRequest(request, "cart-mutation", 60)) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Too many cart requests." } }, { status: 429 });
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: parsed.error.issues[0]?.message ?? "Invalid request." } }, { status: 400 });
    return NextResponse.json(await updateCartItem((await params).itemId, parsed.data.quantity, parsed.data.addOns, parsed.data.variantId));
  } catch (error) { return cartErrorResponse(error); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Cross-origin request rejected." } }, { status: 403 });
  if (!allowRequest(request, "cart-mutation", 60)) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Too many cart requests." } }, { status: 429 });
  try { return NextResponse.json(await removeCartItem((await params).itemId)); } catch (error) { return cartErrorResponse(error); }
}
