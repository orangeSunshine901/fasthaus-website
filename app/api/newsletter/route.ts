import { NextResponse } from "next/server";
import { Resend } from "resend";
import { NewsletterSchema } from "@/lib/schemas/newsletter";
import { createServiceClient } from "@/lib/supabase/server";
import { NewsletterWelcome } from "@/lib/email/NewsletterWelcome";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = NewsletterSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { email } = parsed.data;
  const supabase = await createServiceClient();

  const { error: dbError } = await supabase
    .from("newsletter_subscribers")
    .insert({ email })
    .select()
    .single();

  if (dbError) {
    if (dbError.code === "23505") {
      // Already subscribed — treat as success to avoid enumeration
      return NextResponse.json({ ok: true });
    }
    console.error("Newsletter insert error:", dbError);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  await resend.emails.send({
    from: "Fasthaus <hello@fasthaus.ae>",
    to: email,
    subject: "Welcome to Fasthaus",
    react: NewsletterWelcome({ email }),
  });

  return NextResponse.json({ ok: true });
}
