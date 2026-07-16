import { cookies } from "next/headers";
import { cookiePolicy } from "./rules";

const policy = cookiePolicy(process.env.NODE_ENV === "production");
export const CART_COOKIE_NAME = policy.name;
export const CART_COOKIE_OPTIONS = policy.options;

export async function readCartId() {
  return (await cookies()).get(CART_COOKIE_NAME)?.value ?? null;
}

export async function setCartId(id: string) {
  (await cookies()).set(CART_COOKIE_NAME, id, CART_COOKIE_OPTIONS);
}

export async function clearCartId() {
  (await cookies()).set(CART_COOKIE_NAME, "", { ...CART_COOKIE_OPTIONS, maxAge: 0 });
}
