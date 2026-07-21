import Link from "next/link";
import { Check, Clock, ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";
import PurchaseCompleted from "@/components/analytics/PurchaseCompleted";
import DirhamPrice from "@/components/ui/DirhamPrice";
import { createServiceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServiceClient();
  const { data: order } = await supabase.from("orders").select("id,status,total,shipping_address,created_at").eq("id", id).maybeSingle();
  if (!order) notFound();
  const { data: items } = await supabase.from("order_items").select("id,product_name,variant_name,quantity,unit_price").eq("order_id", id);
  const confirmed = order.status === "confirmed";
  const shipping = order.shipping_address as { firstName?: string; lastName?: string; line1?: string; emirate?: string };

  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      {confirmed && (
        <PurchaseCompleted
          orderId={order.id}
          revenue={Number(order.total)}
          itemCount={(items ?? []).reduce((sum, item) => sum + Number(item.quantity), 0)}
        />
      )}
      <div className="mx-auto max-w-[760px] px-5 py-16 md:py-24">
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2" style={{ borderColor: confirmed ? "var(--color-success)" : "var(--color-accent-amber)" }}>
            {confirmed ? <Check size={26} style={{ color: "var(--color-success)" }} /> : <Clock size={25} style={{ color: "var(--color-accent-amber)" }} />}
          </span>
          <p className="type-caption-sm">Order #{order.id.slice(0, 8).toUpperCase()}</p>
          <h1 className="type-display-xl">{confirmed ? "Thank you for your order!" : "Payment is being confirmed"}</h1>
          <p className="type-body-md" style={{ color: "var(--color-text-secondary)" }}>
            {confirmed ? "Your payment is confirmed and we’re preparing your order." : "We’ll confirm this order only after the payment provider verifies the payment."}
          </p>
          <Link href="/collection" className="btn btn-primary gap-2"><ShoppingBag size={16} />Continue shopping</Link>
        </div>

        <section className="panel-surface p-6 md:p-8" style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}>
          <h2 className="type-display-sm mb-5">Order summary</h2>
          <div className="flex flex-col">
            {(items ?? []).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-5 border-t py-4" style={{ borderColor: "var(--color-border)" }}>
                <div><p className="type-title-sm">{item.product_name}</p><p className="type-caption-sm" style={{ color: "var(--color-text-secondary)" }}>{item.variant_name} · Qty {item.quantity}</p></div>
                <DirhamPrice amount={Number(item.unit_price) * item.quantity} />
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t pt-4" style={{ borderColor: "var(--color-border)" }}><span className="type-title-sm">Total</span><DirhamPrice amount={Number(order.total)} size="lg" /></div>
          <div className="mt-7 border-t pt-5" style={{ borderColor: "var(--color-border)" }}>
            <h2 className="type-title-sm mb-2">Shipping to</h2>
            <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>{[shipping.firstName, shipping.lastName].filter(Boolean).join(" ")}<br />{shipping.line1}<br />{shipping.emirate}, United Arab Emirates</p>
          </div>
        </section>
      </div>
    </main>
  );
}
