import { NextResponse } from "next/server";
import { ContactFormSchema } from "@/lib/schemas/contact";
import { createServiceClient } from "@/lib/supabase/server";
import { ContactInternal } from "@/lib/email/ContactInternal";
import { getResend } from "@/lib/email/resend";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ContactFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
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

  try {
    const internalEmail = process.env.INTERNAL_EMAIL;
    if (!internalEmail) {
      throw new Error("INTERNAL_EMAIL is not configured");
    }

    const { data, error } = await getResend().emails.send({
      from: "Fasthaus Contact <noreply@fasthaus.studio>",
      to: internalEmail,
      replyTo: email,
      subject: `[Contact] ${subject}`,
      react: ContactInternal({ name, email, subject, message, submittedAt }),
    });

    if (error) {
      console.error("Resend contact email error:", error);
      return NextResponse.json(
        {
          error: "Your message was saved, but the email could not be sent",
          resendError: error.message,
        },
        { status: 502 }
      );
    }

    console.info("Contact email sent:", data?.id);
  } catch (error) {
    console.error("Resend contact email exception:", error);
    return NextResponse.json(
      { error: "Your message was saved, but the email could not be sent" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
