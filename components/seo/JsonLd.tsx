import { serializeJsonLd } from "@/lib/seo/json-ld";

type Props = { data: Record<string, unknown> | Record<string, unknown>[] };

/** Server-rendered structured data. A native <script> (not next/script) is correct for JSON-LD. */
export default function JsonLd({ data }: Props) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />
  );
}
