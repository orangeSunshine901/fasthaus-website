import { NextResponse } from "next/server";
import { ContactFormSchema } from "@/lib/schemas/contact";
import { createServiceClient } from "@/lib/supabase/server";
import { ContactInternal } from "@/lib/email/ContactInternal";
import { getResend } from "@/lib/email/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ContactFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { name, email, subject, message } = parsed.data;
  const submittedAt = new Date().toISOString();

  const supabase = await createServiceClient();

  const { error: dbError } = await supabase
    .from("contact_submissions")
    .insert({ name, email, subject, message });

  if (dbError) {
    console.error("Contact insert error:", dbError);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }

  await getResend().emails.send({
    from: "Fasthaus Contact <noreply@fasthaus.ae>",
    to: process.env.INTERNAL_EMAIL!,
    replyTo: email,
    subject: `[Contact] ${subject}`,
    react: ContactInternal({ name, email, subject, message, submittedAt }),
  });

  return NextResponse.json({ ok: true });
}
