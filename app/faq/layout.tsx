import JsonLd from "@/components/seo/JsonLd";
import { FAQS } from "@/lib/data/faq";
import { faqJsonLd } from "@/lib/seo/json-ld";
import { pageMetadata } from "@/lib/seo/metadata";

// The FAQ page is a client component, so its metadata and structured data live here.
export const metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers about Fasthaus lamps: materials, made-to-order production times, UAE delivery, 14-day returns, the 1-year warranty and custom lighting projects.",
  path: "/faq",
});

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={faqJsonLd(FAQS)} />
      {children}
    </>
  );
}
