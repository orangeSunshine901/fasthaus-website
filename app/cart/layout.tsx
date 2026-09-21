import { privatePageMetadata } from "@/lib/seo/metadata";

// Cart contents are per-visitor: keep it out of search results but let crawlers follow its links.
export const metadata = privatePageMetadata("Your Cart", { follow: true });

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
