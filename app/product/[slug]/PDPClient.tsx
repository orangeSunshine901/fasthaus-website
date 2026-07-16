"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductVariant } from "@/lib/data/products";
import { useCartStore } from "@/lib/store/cart";
import ProductGallery from "@/components/product/pdp/ProductGallery";
import PurchaseRow from "@/components/product/pdp/PurchaseRow";
import ProductTabs, { type ProductTab } from "@/components/product/pdp/ProductTabs";
import ProductSidebar from "@/components/product/pdp/ProductSidebar";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";

export default function PDPClient({ product }: { product: Product }) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedAddOns, setSelectedAddOns] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<ProductTab>("Product Info");
  const tabsRef = useRef<HTMLDivElement>(null);

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const cartError = useCartStore((s) => s.error);
  const adding = useCartStore((s) => s.pending.includes(selectedVariant.id));
  const router = useRouter();

  useEffect(() => {
    capture(analyticsEvents.productViewed, {
      product_id: product.id, product_name: product.name, category: product.category,
      collection: product.category, price: product.variants[0].price, currency: "AED",
      stock_status: product.variants[0].stock > 0 ? "in_stock" : "out_of_stock", made_to_order: true,
    });
  }, [product]);

  async function addSelectedItem() {
    const addOns = (product.addOns ?? [])
      .filter((ao) => selectedAddOns.has(ao.id))
      .map((ao) => ({
        id: ao.id,
        name: ao.name,
        price: ao.price,
        image: ao.image,
        quantity,
      }));

    const added = await addItem(
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
    if (added) capture(analyticsEvents.productAddedToCart, {
      product_id: product.id, product_name: product.name, category: product.category,
      price: selectedVariant.price, currency: "AED", quantity,
      cart_value: (selectedVariant.price + addOns.reduce((sum, item) => sum + item.price, 0)) * quantity,
    });
    return added;
  }

  async function handleAddToCart() {
    if (await addSelectedItem()) openDrawer();
  }

  async function handleBuyNow() {
    if (await addSelectedItem()) {
      closeDrawer();
      router.push("/checkout");
    }
  }

  function toggleAddOnSelection(id: string) {
    setSelectedAddOns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    const addOn = product.addOns?.find((item) => item.id === id);
    if (addOn && !selectedAddOns.has(id)) capture(analyticsEvents.addonSelected, { product_id: product.id, addon_id: id, addon_name: addOn.name, price: addOn.price, currency: "AED" });
  }

  function handleVariantChange(variant: ProductVariant) {
    setSelectedVariant(variant);
    setActiveImage(0);
    capture(analyticsEvents.productOptionSelected, { product_id: product.id, option_type: "color", option_value: variant.color, price: variant.price, currency: "AED" });
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
            onSelect={(index) => {
              setActiveImage(index);
              capture(analyticsEvents.productImageViewed, { product_id: product.id, image_index: index });
            }}
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
            busy={adding}
            error={cartError}
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
