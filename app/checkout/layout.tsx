import { privatePageMetadata } from "@/lib/seo/metadata";

export const metadata = privatePageMetadata("Checkout", { follow: false });

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
