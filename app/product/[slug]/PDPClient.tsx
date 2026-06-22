"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, Minus, Plus, Truck, RotateCcw, Shield } from "lucide-react";
import type { Product, ProductVariant } from "@/lib/data/products";
import DirhamPrice from "@/components/ui/DirhamPrice";
import { useCartStore } from "@/lib/store/cart";
import { useRouter } from "next/navigation";

const TABS = ["Product Info", "Specifications", "Materials", "Shipping"] as const;

export default function PDPClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Product Info");
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());

  const addItem = useCartStore((s) => s.addItem);
  const toggleAddOn = useCartStore((s) => s.toggleAddOn);
  const router = useRouter();

  function handleAddToCart() {
    addItem({
      id: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantColor: selectedVariant.color,
      price: selectedVariant.price,
      quantity,
      image: selectedVariant.images[0],
    });
    product.addOns?.forEach((ao) => {
      if (selectedAddOns.has(ao.id)) {
        toggleAddOn({ id: ao.id, name: ao.name, price: ao.price, image: ao.image });
      }
    });
  }

  function handleBuyNow() {
    handleAddToCart();
    router.push("/cart");
  }

  function toggleAddOnSelection(id: string) {
    setSelectedAddOns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const images = selectedVariant.images;

  return (
    <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
      {/* Image Gallery */}
      <div>
        <div
          className="media-rounded relative mb-3"
          style={{ aspectRatio: "4/3", backgroundColor: "var(--color-surface-muted)" }}
        >
          <Image
            src={images[activeImage] ?? images[0]}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveImage(i)}
              className="relative overflow-hidden rounded-[var(--radius-sm)] border-2 transition-all"
              style={{
                width: 72,
                height: 72,
                borderColor: i === activeImage ? "var(--color-accent-amber)" : "var(--color-border)",
                backgroundColor: "var(--color-surface-muted)",
              }}
            >
              <Image src={img} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info */}
      <div>
        {/* Add-ons panel (right side) */}
        {product.addOns && product.addOns.length > 0 && (
          <div
            className="panel-surface mb-6 p-4"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="type-title-md" style={{ color: "var(--color-text-primary)" }}>Add-ons</span>
              <span
                className="type-badge rounded-full border px-2 py-1"
                style={{ borderColor: "var(--color-accent-amber)", color: "var(--color-accent-amber)" }}
              >
                Recommended
              </span>
            </div>
            {product.addOns.map((ao) => (
              <div
                key={ao.id}
                className="flex items-center gap-3 py-3 border-t first:border-t-0"
                style={{ borderColor: "var(--color-border)" }}
              >
                <input
                  type="checkbox"
                  checked={selectedAddOns.has(ao.id)}
                  onChange={() => toggleAddOnSelection(ao.id)}
                  className="h-4 w-4 rounded accent-[var(--color-accent-amber)]"
                />
                <div className="flex-1">
                  <p className="type-caption" style={{ color: "var(--color-text-primary)" }}>{ao.name}</p>
                  <p className="type-caption-sm" style={{ color: "var(--color-text-secondary)" }}>{ao.description}</p>
                </div>
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-[var(--radius-sm)]" style={{ backgroundColor: "var(--color-surface-muted)" }}>
                  <Image src={ao.image} alt={ao.name} fill className="object-cover" />
                </div>
                <DirhamPrice amount={ao.price} size="sm" />
              </div>
            ))}
          </div>
        )}

        {/* Name + Rating */}
        <h1 className="type-display-xl mb-2" style={{ color: "var(--color-text-primary)" }}>
          {product.name}
        </h1>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.round(product.rating) ? "var(--color-accent-amber)" : "none"}
                stroke={i < Math.round(product.rating) ? "var(--color-accent-amber)" : "var(--color-text-disabled)"}
              />
            ))}
          </div>
          <span className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
            {product.rating} ({product.reviewCount} reviews)
          </span>
        </div>

        {/* Price */}
        <div className="mb-5">
          <DirhamPrice
            amount={selectedVariant.price}
            compareAmount={selectedVariant.comparePrice}
            size="lg"
          />
        </div>

        {/* Color selector */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="type-caption" style={{ color: "var(--color-text-primary)" }}>Base Color:</span>
            <span className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>{selectedVariant.color}</span>
          </div>
          <div className="flex gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => { setSelectedVariant(v); setActiveImage(0); }}
                className="h-7 w-7 rounded-full border-2 transition-all"
                style={{
                  backgroundColor: v.colorHex,
                  borderColor: selectedVariant.id === v.id ? "var(--color-accent-amber)" : "var(--color-border)",
                  outline: selectedVariant.id === v.id ? "2px solid var(--color-accent-amber)" : "none",
                  outlineOffset: 2,
                }}
                aria-label={v.color}
              />
            ))}
          </div>
        </div>

        {/* Quantity + Actions */}
        <div className="flex items-center gap-3 mb-4">
          <span className="type-caption" style={{ color: "var(--color-text-primary)" }}>Amount</span>
          <div
            className="flex items-center overflow-hidden rounded-[var(--radius-sm)] border"
            style={{ borderColor: "var(--color-border)" }}
          >
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="px-3 py-2 disabled:opacity-40 hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="type-caption px-4" style={{ color: "var(--color-text-primary)" }}>{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
              disabled={quantity >= selectedVariant.stock}
              className="px-3 py-2 disabled:opacity-40 hover:bg-[var(--color-surface-muted)] transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-6">
          <button
            onClick={() => handleAddToCart()}
            className="btn btn-outline w-full"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text-primary)" }}
          >
            Add to cart
          </button>
          <button
            onClick={handleBuyNow}
            className="btn btn-primary w-full"
          >
            Buy Now — <DirhamPrice amount={selectedVariant.price * quantity} size="sm" className="text-white" />
          </button>
        </div>

        {/* Trust signals */}
        <div className="flex flex-col gap-2 mb-6">
          {[
            { icon: Truck, label: "Free shipping on all orders" },
            { icon: RotateCcw, label: "30-day hassle-free returns" },
            { icon: Shield, label: "2-year warranty" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon size={14} style={{ color: "var(--color-text-secondary)" }} />
              <span className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Delivery */}
        <div
          className="panel-surface mb-6 p-4"
          style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)" }}
        >
          <h3 className="type-title-md mb-2" style={{ color: "var(--color-text-primary)" }}>Delivery & Production</h3>
          <p className="type-body-sm mb-1" style={{ color: "var(--color-text-secondary)" }}>Made to order</p>
          <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>Production time: 2–3 business days</p>
          <button className="btn-text mt-2">
            See shipping details →
          </button>
        </div>

        {/* Spec chips */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {product.specs.map((spec) => (
            <div
              key={spec.label}
              className="flex items-center gap-2 rounded-[var(--radius-sm)] border p-3"
              style={{ borderColor: "var(--color-border)" }}
            >
              <span className="text-base">{spec.icon}</span>
              <div>
                <p className="type-badge" style={{ color: "var(--color-text-primary)" }}>{spec.label}</p>
                <p className="type-caption-sm" style={{ color: "var(--color-text-secondary)" }}>{spec.sublabel}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="mb-4">
          <div
            className="flex overflow-x-auto rounded-[var(--radius-full)] p-1 gap-1"
            style={{ backgroundColor: "var(--color-surface-muted)" }}
          >
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="type-badge flex-1 whitespace-nowrap rounded-[var(--radius-full)] py-2 transition-all"
                style={{
                  backgroundColor: activeTab === tab ? "var(--color-accent-amber)" : "transparent",
                  color: activeTab === tab ? "#fff" : "var(--color-text-secondary)",
                }}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="type-body-sm mt-4" style={{ color: "var(--color-text-secondary)" }}>
            {activeTab === "Product Info" && (
              <div>
                <h4 className="type-title-md mb-2" style={{ color: "var(--color-text-primary)" }}>Design Story</h4>
                <p>{product.designStory}</p>
                <div className="mt-4">
                  <h4 className="type-title-md mb-2" style={{ color: "var(--color-text-primary)" }}>Perfect For</h4>
                  <div className="flex flex-wrap gap-2">
                    {product.perfectFor.map((tag) => (
                      <span
                        key={tag}
                        className="type-badge rounded-full border px-3 py-1"
                        style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {activeTab === "Specifications" && <p>{product.description}</p>}
            {activeTab === "Materials" && <p>3D-printed PLA diffuser, powder-coated aluminium base, integrated LED module (non-replaceable), braided textile cable.</p>}
            {activeTab === "Shipping" && <p>Free shipping to all UAE emirates. Production takes 2–3 business days; delivery 3–5 business days after dispatch. Tracking number provided via email.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
