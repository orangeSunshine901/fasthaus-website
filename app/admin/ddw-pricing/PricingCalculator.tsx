"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { calculateDdwQuote, type DdwOffer } from "@/lib/admin/ddw-pricing";

type Lamp = { id: string; name: string; unitPriceFils: number };

const money = new Intl.NumberFormat("en-AE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatAed(fils: number) {
  return `AED ${money.format(fils / 100)}`;
}

const stepButton =
  "grid size-11 place-items-center rounded-lg border border-neutral-300 bg-white hover:border-[#20251e] hover:bg-[#f5f3ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#20251e] disabled:border-neutral-200 disabled:bg-white disabled:text-neutral-400";

export default function PricingCalculator({ lamps, offer }: { lamps: Lamp[]; offer: DdwOffer }) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const quote = calculateDdwQuote(
    lamps.map((lamp) => ({ ...lamp, quantity: quantities[lamp.id] ?? 0 })),
    offer
  );
  const hasLamps = quote.quantity > 0;

  function changeQuantity(id: string, change: number) {
    setQuantities((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) + change) }));
  }

  return (
    <main className="min-h-svh bg-[#f5f3ef] text-[#20251e]">
      <header className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-5xl px-5 md:px-8">
          <Link
            href="/admin"
            prefetch={false}
            className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Admin
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-6 md:px-8 md:py-10">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">DDW pricing calculator</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Set the lamp quantities to quote a price at the booth.
        </p>

        <div className="mt-5 grid items-start gap-4 md:mt-8 md:grid-cols-[minmax(0,1fr)_20rem] md:gap-6">
          <section
            aria-labelledby="ddw-lamps"
            className="rounded-xl border border-black/10 bg-white"
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 md:px-5">
              <h2 id="ddw-lamps" className="text-base font-bold">
                Lamps
              </h2>
              <button
                type="button"
                onClick={() => setQuantities({})}
                disabled={!hasLamps}
                className="min-h-11 rounded px-2 text-sm font-semibold underline underline-offset-4 disabled:text-neutral-400 disabled:no-underline"
              >
                Reset quote
              </button>
            </div>

            <ul className="divide-y divide-black/10">
              {lamps.map((lamp) => {
                const quantity = quantities[lamp.id] ?? 0;
                return (
                  <li
                    key={lamp.id}
                    className="flex items-center justify-between gap-3 px-4 py-2 md:px-5"
                  >
                    <div>
                      <p className="font-bold">{lamp.name}</p>
                      <p className="text-sm tabular-nums text-neutral-600">
                        {formatAed(lamp.unitPriceFils)} each
                      </p>
                    </div>
                    <div
                      role="group"
                      aria-label={`${lamp.name} quantity`}
                      className="flex shrink-0 items-center"
                    >
                      <button
                        type="button"
                        className={stepButton}
                        aria-label={`Remove one ${lamp.name}`}
                        onClick={() => changeQuantity(lamp.id, -1)}
                        disabled={quantity === 0}
                      >
                        <Minus size={17} aria-hidden="true" />
                      </button>
                      <span className="min-w-9 px-1 text-center font-semibold tabular-nums">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className={stepButton}
                        aria-label={`Add one ${lamp.name}`}
                        onClick={() => changeQuantity(lamp.id, 1)}
                      >
                        <Plus size={17} aria-hidden="true" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section
            aria-labelledby="ddw-total"
            className="rounded-xl border border-black/10 bg-white p-4 md:p-5"
          >
            <h2 id="ddw-total" className="text-base font-bold">
              Total to quote
            </h2>
            <p
              className="mt-1 break-words text-3xl font-bold tracking-tight tabular-nums"
              aria-live="polite"
              aria-atomic="true"
            >
              {formatAed(quote.totalFils)}
            </p>
            <p className="mt-1 text-sm text-neutral-600">
              {hasLamps
                ? `${quote.quantity} ${quote.quantity === 1 ? "lamp" : "lamps"}`
                : "Add a lamp to start a quote."}
            </p>

            <dl className="mt-4 space-y-2 border-t border-black/10 pt-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt>Lamp subtotal</dt>
                <dd className="shrink-0 tabular-nums">{formatAed(quote.subtotalFils)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>DDW discount ({offer.discountPercent}%)</dt>
                <dd className="shrink-0 tabular-nums">
                  {quote.eventDiscountFils > 0 && "−"}
                  {formatAed(quote.eventDiscountFils)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Bundle discount</dt>
                <dd className="shrink-0 tabular-nums">
                  {quote.bundleDiscountFils > 0 && "−"}
                  {formatAed(quote.bundleDiscountFils)}
                </dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-black/10 pt-3 text-sm text-neutral-600">
              Two lamps save an extra AED {offer.twoLampDiscountFils / 100}. Three or more save an
              extra AED {offer.threePlusLampDiscountFils / 100}.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
