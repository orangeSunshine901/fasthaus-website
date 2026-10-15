import { createClient } from "@/lib/supabase/server";

export const cmsCookieOptions = {
  name: "fh-cms-auth",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function cmsClient() {
  return createClient(cmsCookieOptions);
}

export async function isCmsEditor() {
  const email = process.env.CMS_AUTH_EMAIL;
  if (!email) return false;
  const client = await cmsClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  return !error && !!user && user.email?.toLowerCase() === email.toLowerCase();
}

export async function cmsRequestAllowed(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin && (await isCmsEditor());
}
