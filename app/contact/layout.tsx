import { pageMetadata } from "@/lib/seo/metadata";

// The contact page is a client component, so its metadata lives here.
export const metadata = pageMetadata({
  title: "Contact Us",
  description:
    "Questions about a lamp, an order or a custom project? Contact the Fasthaus studio in Sharjah by email, WhatsApp or Instagram. We usually reply within one business day.",
  path: "/contact",
});

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
