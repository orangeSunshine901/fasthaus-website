export const analyticsEvents = {
  collectionViewed: "collection_viewed",
  productViewed: "product_viewed",
  productOptionSelected: "product_option_selected",
  productImageViewed: "product_image_viewed",
  productAddedToCart: "product_added_to_cart",
  cartViewed: "cart_viewed",
  addonSelected: "addon_selected",
  checkoutStarted: "checkout_started",
  purchaseCompleted: "purchase_completed",
  enquiryStarted: "enquiry_started",
  enquirySubmitted: "enquiry_submitted",
  productImpression: "product_impression",
} as const;

export type AnalyticsEvent = (typeof analyticsEvents)[keyof typeof analyticsEvents];
export type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;
