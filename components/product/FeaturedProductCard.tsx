"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data/products";

type Props = {
  product: Product;
  summary: string;
};

export default function FeaturedProductCard({ product, summary }: Props) {
  const defaultVariant = product.variants[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex h-full flex-col gap-3 rounded-[14px] border p-4 transition-transform duration-200 hover:-translate-y-0.5"
      style={{
        borderColor: "#575757",
        backgroundColor: "transparent",
      }}
    >
      <div
        className="media-rounded relative w-full"
        style={{
          backgroundColor: "#111111",
          aspectRatio: "238 / 325",
        }}
      >
        <Image
          src={defaultVariant.images[0]}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
        />
      </div>

      <div
        className="mt-4 flex justify-center opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0"
        style={{ perspective: "1000px" }}
      >
        <div
          className="px-4 py-2 rounded-[10px] outline outline-1 outline-offset-[-1px] inline-flex items-center gap-2 translate-y-[-16px]"
          style={{
            outlineColor: "#575757",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            backgroundColor: "rgba(33, 33, 33, 0.36)",
            boxShadow:
              "rgba(255, 255, 255, 0.02) -3.35374px -3.35374px 167.687px 0px inset, rgba(0, 0, 0, 0.08) 0px 4px 22px 0px",
          }}
        >
          <span className="text-sm font-medium text-white font-['DM_Sans'] leading-5">
            View Product
          </span>
          <div className="w-5 h-5 relative">
            <Image src="/ArrowRight.svg" alt="" fill className="object-contain" />
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between gap-4">
        <h3 className="type-title-sm" style={{ color: "#FFFFFF" }}>
          {product.name}
        </h3>
        <span
          className="type-caption inline-flex shrink-0 items-center gap-1"
          style={{ color: "#FFFFFF" }}
        >
          <Image src="/dirham-icon.svg" alt="AED" width={12} height={12} className="inline-block" />
          <span>{defaultVariant.price}</span>
        </span>
      </div>

      <p className="type-caption-sm" style={{ color: "#FFFFFF" }}>
        {summary}
      </p>

      <div className="flex items-center gap-2">
        {product.variants.map((variant) => (
          <span
            key={variant.id}
            className="h-[13px] w-[13px] rounded-full border"
            style={{
              backgroundColor: variant.colorHex,
              borderColor: "rgba(255,255,255,0.16)",
            }}
            aria-label={variant.color}
            title={variant.color}
          />
        ))}
      </div>
    </Link>
  );
}
