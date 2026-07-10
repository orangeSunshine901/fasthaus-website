"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/data/products";

type Props = {
  product: Product;
  summary: string;
  hoverImages?: { off: string; on: string };
  compactMobile?: boolean;
  activeMobile?: boolean;
};

export default function FeaturedProductCard({
  product,
  summary,
  hoverImages,
  compactMobile = false,
  activeMobile,
}: Props) {
  const defaultVariant = product.variants[0];

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`group flex h-full flex-col rounded-[14px] border transition-transform duration-200 hover:-translate-y-0.5 ${
        compactMobile ? "gap-2 p-3 md:gap-3 md:p-4" : "gap-2 p-4 pt-0"
      }`}
      style={{
        borderColor: "#575757",
        backgroundColor: "transparent",
      }}
    >
      <div
        className={`media-rounded relative ${hoverImages ? "-mx-4 w-[calc(100%+2rem)]" : "w-full"}`}
        style={{
          // backgroundColor: "#111111",
          aspectRatio: compactMobile
            ? hoverImages
              ? "1260 / 1376"
              : "238 / 260"
            : hoverImages
              ? "1260 / 1720"
              : "238 / 325",
        }}
      >
        <Image
          src={hoverImages ? hoverImages.off : defaultVariant.images[0]}
          alt={product.name}
          fill
          className={`object-cover ${
            product.slug === "luna-desk-lamp" ? "scale-80 md:scale-100" : ""
          }`}
          sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
        />
        {hoverImages && (
          <Image
            src={hoverImages.on}
            alt=""
            fill
            className={`object-cover transition-all duration-500 ${
              activeMobile === undefined
                ? "opacity-0 group-hover:opacity-100"
                : activeMobile
                  ? "opacity-100"
                  : "opacity-0"
            } ${product.slug === "luna-desk-lamp" ? "scale-80 md:scale-100" : ""}`}
            sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw"
          />
        )}
      </div>

      <div
        className={`${compactMobile ? "mt-2 md:mt-4" : "mt-4"} flex justify-center transition-all duration-500 ${
          activeMobile === undefined
            ? "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            : activeMobile
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0"
        }`}
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
