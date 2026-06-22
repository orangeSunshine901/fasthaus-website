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
      className="flex h-full flex-col gap-3 rounded-[14px] border p-4 transition-transform duration-200 hover:-translate-y-0.5"
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

      <div className="flex items-start justify-between gap-4">
        <h3
          className="type-title-sm"
          style={{ color: "#FFFFFF" }}
        >
          {product.name}
        </h3>
        <span
          className="type-caption inline-flex shrink-0 items-center gap-1"
          style={{ color: "#FFFFFF" }}
        >
          <Image
            src="/dirham-icon.svg"
            alt="AED"
            width={12}
            height={12}
            className="inline-block"
          />
          <span>{defaultVariant.price}</span>
        </span>
      </div>

      <p
        className="type-caption-sm"
        style={{ color: "#FFFFFF" }}
      >
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
