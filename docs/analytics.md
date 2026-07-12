# FastHaus analytics

PostHog is initialized in `instrumentation-client.ts` and remains opted out until the visitor accepts analytics. Consent is stored under `fasthaus-analytics-consent`. Declining stops recording, opts out, and resets the anonymous identity.

All forms, visible text, and element attributes are masked in replay. Autocapture is disabled; only pageviews, exceptions, and the events below are sent. Never add email, phone, address, payment fields, authentication values, or free text to event properties.

## Environment

Set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST` (EU default: `https://eu.i.posthog.com`). The same token is used by the server SDK for confirmed Geidea purchases.

## Event taxonomy

| Event | Trigger | Key properties |
| --- | --- | --- |
| `collection_viewed` | Collection/category loads | `collection`, `product_count` |
| `product_impression` | Product card renders | product identity, category, price, currency |
| `product_viewed` | PDP loads | product identity, category/collection, price, stock, made-to-order |
| `product_option_selected` | Colour changes | product ID, option type/value, price |
| `product_image_viewed` | Gallery image selected | product ID, image index |
| `addon_selected` | Add-on selected | product/add-on identity, price, currency |
| `product_added_to_cart` | Add to cart / buy now | product identity, price, quantity, cart value |
| `cart_viewed` | Non-empty cart loads/changes | item count, cart value, currency |
| `checkout_started` | Checkout click/page | item count, cart value, currency |
| `purchase_completed` | Confirmed payment callback; demo checkout fallback | order ID, revenue, currency, item count |
| `enquiry_started` | Contact submit starts | none |
| `enquiry_submitted` | Contact API succeeds | none |

Marketing attribution, referrer, device, and geographic properties should use PostHog's standard automatically enriched properties rather than duplicating client-derived values.

## PostHog setup

Create these insights in the PostHog UI and add them to the named dashboards:

- **Website Overview:** unique visitors, pageviews, sessions, top paths, referrers, UTM source/medium/campaign.
- **Product Performance:** `product_impression`, `product_viewed`, add-to-cart rate grouped by product/category/collection.
- **Ecommerce Performance:** revenue and purchases, average order value, product-view → add-to-cart → checkout → purchase funnel.
- **UX & Technical Health:** `$exception`, rage/dead clicks, checkout failures, replay links filtered by journey events.

Funnels:

1. `product_viewed` → `product_added_to_cart` → `checkout_started` → `purchase_completed`
2. `product_viewed` → `product_option_selected` → `product_added_to_cart`
3. `cart_viewed` → `addon_selected` → `purchase_completed`
4. `product_viewed` → `enquiry_submitted`

Feature flags require no extra provider: import `posthog` from `posthog-js` and use `posthog.isFeatureEnabled()` only after consent.
