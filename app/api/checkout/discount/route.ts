import { NextResponse } from "next/server";
import { z } from "zod";
import { ContactSchema } from "@/lib/schemas/checkout";
import { validateCartForCheckout } from "@/lib/cart/service";
import { cartErrorResponse, isSameOrigin } from "@/lib/cart/http";
import { allowRequest } from "@/lib/cart/rate-limit";
import { CartError } from "@/lib/cart/types";
import { createServiceClient } from "@/lib/supabase/server";
import { checkoutDiscountError, recoverExpiredDiscount } from "@/lib/checkout/discount-server";
import { normalizeDiscountCode } from "@/lib/checkout/discount";

const DiscountSchema = z
  .object({
    code: z.string().trim().min(1).max(32),
    email: ContactSchema.shape.email,
  })
  .strict();

export async function POST(request: Request) {
  if (!isSameOrigin(request))
    return NextResponse.json(
      { error: { message: "Cross-origin request rejected." } },
      { status: 403 }
    );
  if (!allowRequest(request, "discount", 20))
    return NextResponse.json(
      { error: { message: "Too many requests. Please try again shortly." } },
      { status: 429 }
    );
  try {
    const parsed = DiscountSchema.safeParse(await request.json());
    if (!parsed.success)
      throw new CartError(
        "INVALID_REQUEST",
        parsed.error.issues[0]?.message ?? "Enter a code and a valid checkout email."
      );
    const cart = await validateCartForCheckout();
    const supabase = await createServiceClient();
    const code = normalizeDiscountCode(parsed.data.code);
    await recoverExpiredDiscount(supabase, code);
    const { data, error } = await supabase.rpc("quote_checkout_discount", {
      p_cart_id: cart.id,
      p_code: code,
      p_email: parsed.data.email,
      p_subtotal: cart.subtotal / 100,
    });
    if (error) checkoutDiscountError(error);
    return NextResponse.json({ code, discountAmount: Number(data), subtotal: cart.subtotal / 100 });
  } catch (error) {
    return cartErrorResponse(error);
  }
}
