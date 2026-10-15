import { NextResponse } from "next/server";
import { cmsClient, cmsRequestAllowed } from "@/lib/cms/auth";
import { allowRequest } from "@/lib/cart/rate-limit";

export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  const email = process.env.CMS_AUTH_EMAIL;
  if (!email)
    return NextResponse.json(
      { error: "Team access has not been configured yet." },
      { status: 503 }
    );
  // shortcut: this extra throttle is per instance; use shared storage if Supabase Auth limits are insufficient.
  if (!allowRequest(request, "cms-login", 5, 60_000)) {
    return NextResponse.json(
      { error: "Too many attempts. Wait a minute and try again." },
      { status: 429 }
    );
  }
  try {
    const body = await request.json();
    if (typeof body.password !== "string" || body.password.length > 256 || !body.password) {
      return NextResponse.json({ error: "Enter your team password." }, { status: 400 });
    }
    const client = await cmsClient();
    const { error } = await client.auth.signInWithPassword({ email, password: body.password });
    if (error)
      return NextResponse.json(
        { error: "Could not sign in. Check the team password or try again later." },
        { status: 401 }
      );
    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!(await cmsRequestAllowed(request)))
    return NextResponse.json({ error: "Please sign in again." }, { status: 403 });
  const client = await cmsClient();
  const { error } = await client.auth.signOut({ scope: "local" });
  if (error) return NextResponse.json({ error: "Could not sign out. Try again." }, { status: 503 });
  return NextResponse.json({ ok: true });
}
