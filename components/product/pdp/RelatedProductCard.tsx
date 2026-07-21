import Image from "next/image";
import Link from "next/link";
import { getVariantMainImage, type Product } from "@/lib/data/products";
import DirhamPrice from "@/components/ui/DirhamPrice";

export default function RelatedProductCard({ product }: { product: Product }) {
  const defaultVariant = product.variants[0];

  return (
    <Link href={`/product/${product.slug}`} className="group flex flex-col gap-3">
      <div
        className="relative aspect-[5/4] w-full overflow-hidden rounded-[14px]"
        style={{ backgroundColor: "var(--color-surface-muted)" }}
      >
        <Image
          src={getVariantMainImage(defaultVariant)}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline justify-between gap-2">
          <span
            className="text-[15.5px] font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            {product.name}
          </span>
          <DirhamPrice
            amount={defaultVariant.price}
            compareAmount={defaultVariant.comparePrice}
            size="sm"
            className="shrink-0 font-bold"
          />
        </div>
        <div className="flex items-center gap-1.5 pt-0.5">
          {product.variants.map((v) => (
            <span
              key={v.id}
              className="h-3.5 w-3.5 rounded-full border"
              style={{ backgroundColor: v.colorHex, borderColor: "var(--color-border)" }}
              title={v.color}
            />
          ))}
        </div>
      </div>
    </Link>
  );
}
