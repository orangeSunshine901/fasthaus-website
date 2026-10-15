"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getVariantImage, type Product, type ProductVariant } from "@/lib/data/products";
import { useCartStore } from "@/lib/store/cart";
import ProductGallery from "@/components/product/pdp/ProductGallery";
import PurchaseRow from "@/components/product/pdp/PurchaseRow";
import ProductTabs, { type ProductTab } from "@/components/product/pdp/ProductTabs";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";
import { productItem, pushEcommerceEventWhenConsentReady } from "@/lib/analytics/ecommerce";

export default function PDPClient({
  product,
  initialVariantId,
}: {
  product: Product;
  initialVariantId: string;
}) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(
    product.variants.find((variant) => variant.id === initialVariantId) ?? product.variants[0]
  );
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<ProductTab>("Materials");

  const addItem = useCartStore((s) => s.addItem);
  const openDrawer = useCartStore((s) => s.openDrawer);
  const closeDrawer = useCartStore((s) => s.closeDrawer);
  const cartError = useCartStore((s) => s.error);
  const adding = useCartStore((s) => s.pending.includes(selectedVariant.id));
  const router = useRouter();

  useEffect(() => {
    capture(analyticsEvents.productViewed, {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      collection: product.category,
      price: product.variants[0].price,
      currency: "AED",
      stock_status: product.variants[0].stock > 0 ? "in_stock" : "out_of_stock",
      made_to_order: true,
    });
  }, [product]);

  // GA4 view_item: once per page view and again whenever the shopper switches variant.
  useEffect(
    () =>
      pushEcommerceEventWhenConsentReady("view_item", [
        productItem({
          variantId: selectedVariant.id,
          productName: product.name,
          variantName: selectedVariant.color,
          price: selectedVariant.price,
          quantity: 1,
        }),
      ]),
    [product.name, selectedVariant]
  );

  async function addSelectedItem(quantity: number) {
    const added = await addItem({
      id: selectedVariant.id,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantColor: selectedVariant.color,
      price: selectedVariant.price,
      quantity,
      image: getVariantImage(selectedVariant),
    });
    if (added)
      capture(analyticsEvents.productAddedToCart, {
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        price: selectedVariant.price,
        currency: "AED",
        quantity,
        cart_value: selectedVariant.price * quantity,
      });
    return added;
  }

  async function handleAddToCart() {
    const addingItem = addSelectedItem(quantity);
    openDrawer();
    await addingItem;
  }

  async function handleBuyNow() {
    const addingItem = addSelectedItem(quantity);
    closeDrawer();
    router.push("/checkout");
    await addingItem;
  }

  // Hero shortcut: one of the selected colour, then checkout, where the quantity can be
  // changed. A colour already in the cart is not added again, so its quantity stays put.
  async function handleQuickBuy() {
    const inCart = useCartStore.getState().items.some((item) => item.id === selectedVariant.id);
    const addingItem = inCart ? Promise.resolve(true) : addSelectedItem(1);
    closeDrawer();
    router.push("/checkout");
    return addingItem;
  }

  function handleVariantChange(variant: ProductVariant) {
    setSelectedVariant(variant);
    setActiveImage(0);
    window.history.replaceState(
      window.history.state,
      "",
      `?variant=${encodeURIComponent(variant.id)}`
    );
    capture(analyticsEvents.productOptionSelected, {
      product_id: product.id,
      option_type: "color",
      option_value: variant.color,
      price: variant.price,
      currency: "AED",
    });
  }

  return (
    <div className="flex flex-col gap-8 lg:gap-12">
      <ProductGallery
        images={selectedVariant.images}
        name={product.name}
        description={product.designStory}
        variants={product.variants}
        selectedVariant={selectedVariant}
        activeIndex={activeImage}
        onVariantChange={handleVariantChange}
        onQuickBuy={handleQuickBuy}
        onSelect={(index) => {
          setActiveImage(index);
          capture(analyticsEvents.productImageViewed, {
            product_id: product.id,
            image_index: index,
          });
        }}
      />
      <PurchaseRow
        product={product}
        selectedVariant={selectedVariant}
        quantity={quantity}
        onQuantityChange={setQuantity}
        addOnsTotal={0}
        busy={adding}
        error={cartError}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />
      <div className="scroll-mt-28">
        <ProductTabs product={product} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
