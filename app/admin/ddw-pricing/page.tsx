import type { Metadata } from "next";
import TeamLogin from "@/components/cms/TeamLogin";
import { isCmsEditor } from "@/lib/cms/auth";
import { PRODUCTS } from "@/lib/data/products";
import PricingCalculator from "./PricingCalculator";

export const metadata: Metadata = {
  title: "DDW pricing calculator",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default async function DdwPricingPage() {
  if (!(await isCmsEditor())) {
    return <TeamLogin configured={!!process.env.CMS_AUTH_EMAIL} />;
  }

  const lamps = PRODUCTS.flatMap((product) => {
    const prices = [...new Set(product.variants.map((variant) => variant.price))];
    return prices.map((price) => {
      const colors = product.variants
        .filter((variant) => variant.price === price)
        .map((variant) => variant.color);
      return {
        id: `${product.id}-${price}`,
        name: prices.length === 1 ? product.name : `${product.name} · ${colors.join(", ")}`,
        unitPriceFils: Math.round(price * 100),
      };
    });
  });

  return (
    <PricingCalculator
      lamps={lamps}
      offer={{
        discountPercent: 10,
        twoLampDiscountFils: 3000,
        threePlusLampDiscountFils: 6000,
      }}
    />
  );
}
