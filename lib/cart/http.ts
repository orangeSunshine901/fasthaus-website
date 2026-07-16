import { NextResponse } from "next/server";
import { CartError } from "./types";

export function cartErrorResponse(error: unknown) {
  if (error instanceof CartError) return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status });
  console.error("Cart request failed", error);
  return NextResponse.json({ error: { code: "CART_CONFLICT", message: "The cart could not be updated." } }, { status: 500 });
}

export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
