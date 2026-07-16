import { NextResponse } from "next/server";
import { z } from "zod";
import { addCartItem } from "@/lib/cart/service";
import { cartErrorResponse, isSameOrigin } from "@/lib/cart/http";
import { allowRequest } from "@/lib/cart/rate-limit";

const schema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
  addOns: z.array(z.object({ id: z.string().min(1), quantity: z.number().int().min(1).max(10) })).optional(),
}).strict();

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Cross-origin request rejected." } }, { status: 403 });
  if (!allowRequest(request, "cart-mutation", 60)) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: "Too many cart requests." } }, { status: 429 });
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: { code: "INVALID_REQUEST", message: parsed.error.issues[0]?.message ?? "Invalid request." } }, { status: 400 });
    return NextResponse.json(await addCartItem(parsed.data), { status: 201 });
  } catch (error) { return cartErrorResponse(error); }
}
