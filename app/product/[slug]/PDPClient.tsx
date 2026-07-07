"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductVariant } from "@/lib/data/products";
import { useCartStore } from "@/lib/store/cart";
import ProductGallery from "@/components/product/pdp/ProductGallery";
import PurchaseRow from "@/components/product/pdp/PurchaseRow";
import ProductTabs, { type ProductTab } from "@/components/product/pdp/ProductTabs";
import ProductSidebar from "@/components/product/pdp/ProductSidebar";

export default function PDPClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<ProductTab>("Product Info");
  const tabsRef = useRef<HTMLDivElement>(null);

  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  function handleAddToCart() {
    const addOns = (product.addOns ?? [])
      .filter((ao) => selectedAddOns.has(ao.id))
      .map((ao) => ({
        id: ao.id,
        name: ao.name,
        price: ao.price,
        image: ao.image,
        quantity,
      }));

    addItem(
      {
        id: selectedVariant.id,
        productId: product.id,
        productSlug: product.slug,
        productName: product.name,
        variantColor: selectedVariant.color,
        price: selectedVariant.price,
        quantity,
        image: selectedVariant.images[0],
      },
      addOns
    );
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

  function handleVariantChange(variant: ProductVariant) {
    setSelectedVariant(variant);
    setActiveImage(0);
  }

  function handleShowShippingDetails() {
    setActiveTab("Shipping & Returns");
    requestAnimationFrame(() => {
      tabsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const addOnsTotal = (product.addOns ?? []).reduce(
    (sum, ao) => (selectedAddOns.has(ao.id) ? sum + ao.price * quantity : sum),
    0
  );

  return (
    <div className="flex flex-col gap-8 lg:gap-12">
      {/* Single grid so mobile reads gallery → purchase → add-ons, while large
          screens keep gallery | rail on row one and the purchase row below. */}
      <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_356px] lg:gap-x-12 lg:gap-y-12">
        <div className="order-1 lg:order-none lg:col-start-1 lg:row-start-1 lg:min-h-0">
          <ProductGallery
            images={selectedVariant.images}
            name={product.name}
            activeIndex={activeImage}
            onSelect={setActiveImage}
          />
        </div>
        <div className="order-3 lg:order-none lg:col-start-2 lg:row-start-1">
          <ProductSidebar
            addOns={product.addOns ?? []}
            selectedAddOns={selectedAddOns}
            onToggleAddOn={toggleAddOnSelection}
            onShowShippingDetails={handleShowShippingDetails}
          />
        </div>
        <div className="order-2 lg:order-none lg:col-span-2 lg:row-start-2">
          <PurchaseRow
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={handleVariantChange}
            quantity={quantity}
            onQuantityChange={setQuantity}
            addOnsTotal={addOnsTotal}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        </div>
      </div>
      <div ref={tabsRef} className="scroll-mt-28">
        <ProductTabs product={product} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
