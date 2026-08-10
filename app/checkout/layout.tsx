import { getGeideaSdkUrl } from "@/lib/payment/geidea";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Geidea requires a synchronous script without async or defer. */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script src={getGeideaSdkUrl()} />
      {children}
    </>
  );
}
