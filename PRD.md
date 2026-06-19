# Fasthaus — Product Requirements Document

> Companion to [`design.md`](./design.md). That file owns visual spec, component library, and tech stack. This file owns *what we're building, for whom, and what done means.*

---

## 1. Product Overview

Fasthaus is a UAE-focused direct-to-consumer e-commerce store selling lighting and home goods. The brand is built on a minimal, fast-browsing experience — the product itself (quality, materiality) does the selling. All prices are in **AED (د.إ)**.

**Core jobs to be done:**
1. A shopper discovers a product and understands it well enough to buy with confidence
2. Checkout is frictionless — local payment methods, no account required
3. Post-purchase, the customer knows exactly what happens next (email confirmation, shipping update)

---

## 2. Goals & Success Metrics

| Goal | Metric | Target |
|---|---|---|
| Conversion | Add-to-cart → purchase rate | ≥ 3% |
| Checkout completion | Initiated → placed order | ≥ 70% |
| Page speed | Core Web Vitals (LCP / CLS / INP) | See `design.md §9` |
| Email deliverability | Resend delivery rate | ≥ 99% |
| Return rate | Customers who place a 2nd order within 90 days | ≥ 20% |

---

## 3. User Roles

| Role | How they arrive | What they can do |
|---|---|---|
| **Guest** | Direct / search / social | Browse, add to cart, checkout without account |
| **Authenticated customer** | Created account at checkout or sign-up | All guest actions + order history, saved addresses, wishlist |
| **Admin** | Internal | Manage products, orders, inventory (out of scope for Phase 1) |

Guest checkout must convert the cart into an order without forcing account creation. Account creation is offered optionally at order confirmation.

---

## 4. MVP Scope (Phase 1)

Phase 1 ships a fully shoppable storefront. Everything a customer needs to go from landing page to placed order.

### In scope

| Area | Included |
|---|---|
| Pages | Homepage, PLP (one category), PDP, Cart, Checkout (3-step), Order Confirmation |
| Auth | Sign up, log in, password reset (Supabase Auth) — account creation offered post-checkout |
| Payments | Geidea — card (Visa, Mastercard), Apple Pay, Google Pay |
| Email | Order confirmation, order shipped (Resend + React Email) |
| Content | Static: About, Contact (form → Resend email to internal inbox) |
| Search | Basic product search (Supabase full-text search on `products.name` + `description`) |

### Explicitly out of scope for Phase 1

- Admin dashboard / CMS (product management done directly in Supabase Studio)
- Customer reviews & ratings (UI exists in `design.md` but data pipeline deferred)
- Wishlist (Zustand-only, not persisted — upgrade in Phase 2)
- Promo codes / discounts
- Multi-currency
- Inventory reservation / real-time stock sync
- Returns / refund initiation flow

---

## 5. Phase Roadmap

| Phase | Description | Key additions |
|---|---|---|
| **1 — MVP** | Shoppable storefront | Homepage → PDP → Cart → Checkout → Confirmation |
| **2 — Accounts** | Authenticated experience | Order history, saved addresses, persisted wishlist, re-order |
| **3 — Growth** | Retention & discovery | Reviews, promo codes, email marketing (Resend campaigns), multi-category PLP |
| **4 — Ops** | Internal tooling | Admin dashboard, inventory management, returns flow |

---

## 6. Functional Requirements

### 6.1 Homepage

| Requirement | Acceptance criteria |
|---|---|
| Hero renders above the fold on desktop and mobile | LCP image is preloaded; CLS = 0 |
| Featured Products grid shows 4 products | Sourced from `products` table, filtered by `featured = true` |
| New Arrivals carousel shows up to 6 products | Filtered by `created_at DESC`, horizontal scroll on mobile |
| Newsletter form captures email | Validates email (Zod), inserts to `newsletter_subscribers`, sends welcome email via Resend |

### 6.2 PLP (Product Listing Page)

| Requirement | Acceptance criteria |
|---|---|
| Displays all products in a category | Paginated, 12 per page, "Load More" button |
| Filter by: Price range, Color, In Stock | Filters update URL query params; page is shareable/linkable |
| Sort: Featured, Newest, Price ↑, Price ↓ | Sort param persists on filter change |
| Active filter chips visible below header | Each chip has an ✕ to remove that filter |
| Empty state | Shows "No products found" + CTA to browse all |

### 6.3 PDP (Product Detail Page)

| Requirement | Acceptance criteria |
|---|---|
| Color variant selector updates image gallery | No page reload; selected color reflected in URL param |
| Quantity stepper clamps to available stock | `−` disabled at 1; `+` disabled at `stock_quantity` |
| Add to Cart | Adds selected variant + quantity to Zustand cart slice; shows cart item count in nav |
| Out of stock state | Button replaced with "Notify me" (email capture, Phase 2) |
| "You May Also Like" | 4 products from same category, excluding current |

### 6.4 Cart Page

| Requirement | Acceptance criteria |
|---|---|
| Shows all cart line items | Name, variant, thumbnail, quantity stepper, line price, Remove |
| Quantity changes persist in Zustand | No page reload; totals recalculate immediately |
| Remove item | Line removed from Zustand; if cart empty, show empty state + "Continue Shopping" CTA |
| Order summary | Subtotal, Shipping (Free), Total — all calculated client-side from Zustand |
| Checkout CTA | Routes to `/checkout` |

### 6.5 Checkout (3-step)

See Geidea integration detail in §8.

| Step | Fields | Validation |
|---|---|---|
| 1 — Contact & Shipping | Email, First name, Last name, Phone, Address line 1, Address line 2, Emirate (dropdown), Postal code | All required except Address 2; email format; UAE phone format |
| 2 — Payment | Geidea-hosted payment widget (card / Apple Pay / Google Pay) | Handled by Geidea SDK |
| 3 — Review & Place Order | Read-only summary of items, address, payment method | Confirm button submits order |

- Step progress indicator always visible
- Authenticated customers: shipping step pre-fills from saved address
- Guest customers: offered account creation on confirmation page

### 6.6 Order Confirmation Page

| Requirement | Acceptance criteria |
|---|---|
| Shows order number, items, delivery address, estimated delivery | Rendered server-side from order record |
| Triggers order confirmation email | Resend fires within 30s of order placed |
| Guest account creation offer | "Save your details for next time" — one-click with password field |

### 6.7 Contact Page

| Requirement | Acceptance criteria |
|---|---|
| Form: Name, Email, Subject, Message | Zod validation; all fields required |
| On submit | Inserts to `contact_submissions`; sends email to internal inbox via Resend |
| Success state | "We'll get back to you within 24 hours" |

---

## 7. Data Model

All tables live in Supabase (PostgreSQL). Supabase Auth manages `auth.users`; the `customers` table extends it.

### Core Tables

```sql
-- Products
products (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  name        text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id),
  featured    boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
)

-- Product variants (color × size combinations)
product_variants (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id     uuid REFERENCES products(id) ON DELETE CASCADE,
  color          text,
  sku            text UNIQUE NOT NULL,
  price          numeric(10,2) NOT NULL,         -- AED
  compare_price  numeric(10,2),                  -- original price if on sale
  stock_quantity int NOT NULL DEFAULT 0,
  image_urls     text[]                          -- ordered; [0] is primary
)

-- Categories
categories (
  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL
)

-- Orders
orders (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     uuid REFERENCES customers(id),   -- null for guest orders
  guest_email     text,                             -- set for guest orders
  status          text NOT NULL DEFAULT 'pending',  -- pending | confirmed | shipped | delivered | cancelled
  subtotal        numeric(10,2) NOT NULL,
  shipping_total  numeric(10,2) NOT NULL DEFAULT 0,
  total           numeric(10,2) NOT NULL,
  shipping_address jsonb NOT NULL,
  geidea_order_id  text,                            -- Geidea's reference
  created_at      timestamptz DEFAULT now()
)

-- Order line items
order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid REFERENCES orders(id) ON DELETE CASCADE,
  variant_id  uuid REFERENCES product_variants(id),
  quantity    int NOT NULL,
  unit_price  numeric(10,2) NOT NULL               -- price at time of purchase
)

-- Customers (extends Supabase auth.users)
customers (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  text,
  last_name   text,
  phone       text,
  created_at  timestamptz DEFAULT now()
)

-- Saved addresses
addresses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  uuid REFERENCES customers(id) ON DELETE CASCADE,
  label        text,                               -- 'Home', 'Work', etc.
  first_name   text NOT NULL,
  last_name    text NOT NULL,
  line1        text NOT NULL,
  line2        text,
  emirate      text NOT NULL,
  postal_code  text,
  is_default   boolean DEFAULT false
)

-- Newsletter subscribers
newsletter_subscribers (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
)

-- Contact form submissions
contact_submissions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  email      text NOT NULL,
  subject    text NOT NULL,
  message    text NOT NULL,
  created_at timestamptz DEFAULT now()
)
```

### Row Level Security

| Table | Guest can | Authenticated customer can |
|---|---|---|
| `products`, `product_variants`, `categories` | SELECT | SELECT |
| `orders`, `order_items` | INSERT (own session), SELECT by `guest_email` | SELECT / INSERT own rows |
| `customers`, `addresses` | — | SELECT / UPDATE / INSERT own rows |
| `newsletter_subscribers`, `contact_submissions` | INSERT | INSERT |

---

## 8. Geidea Payment Integration

Geidea docs: https://docs.geidea.net/docs/overview

### Flow

```
Customer clicks "Place Order" (step 3)
  → Next.js API route: POST /api/checkout/create-order
      - Validate cart + address (Zod)
      - Insert order record (status: 'pending')
      - Call Geidea Create Order API → returns orderId + paymentSessionId
  → Client renders Geidea payment widget (hosted JS drop-in)
      - Customer enters card / taps Apple Pay / Google Pay
  → Geidea posts result to: POST /api/checkout/geidea-callback
      - Verify signature (HMAC)
      - If success: update order status → 'confirmed', trigger confirmation email
      - If failure: update order status → 'failed', return error to client
  → Client redirects to /order/[orderId]/confirmation
```

### Key considerations

- **Idempotency:** the callback endpoint must be idempotent — Geidea may fire it more than once
- **Signature verification:** never trust the callback without verifying the HMAC signature using the Geidea merchant secret (stored in Vercel env vars, never in client code)
- **Webhook vs redirect:** Geidea supports both; use the server-to-server webhook as the authoritative source of truth, plus a client-side redirect for UX
- **Currency:** all amounts sent to Geidea in AED (currency code `AED`), no conversion needed
- **3DS:** Geidea handles 3D Secure natively — no extra work required

### Environment variables required

```
GEIDEA_MERCHANT_ID=
GEIDEA_API_PASSWORD=
GEIDEA_WEBHOOK_SECRET=
```

---

## 9. Email Triggers (Resend + React Email)

| Trigger | Template | To | When |
|---|---|---|---|
| Order placed | `OrderConfirmation` | Customer email (guest or auth) | Immediately on order `status = confirmed` |
| Order shipped | `OrderShipped` | Customer email | When order `status` updated to `shipped` (manual trigger in Phase 1) |
| Contact form submitted | `ContactInternal` | Internal inbox | On `contact_submissions` insert |
| Newsletter signup | `NewsletterWelcome` | Subscriber email | On `newsletter_subscribers` insert |

### Template contents

**OrderConfirmation** — order number, line items (name + variant + qty + price), shipping address, order total, estimated delivery window, "Track your order" placeholder link

**OrderShipped** — order number, tracking number (if available), carrier, estimated arrival

**ContactInternal** — name, email, subject, message verbatim, timestamp

**NewsletterWelcome** — brief brand message, CTA to shop

---

## 10. Zod Schema Locations

Schemas live in `lib/schemas/` and are imported by both client components and server route handlers.

```
lib/schemas/
  checkout.ts       # ShippingAddressSchema, ContactSchema
  product.ts        # ProductSchema, VariantSchema (for API responses)
  contact.ts        # ContactFormSchema
  newsletter.ts     # NewsletterSchema
  order.ts          # OrderSchema, OrderItemSchema
```

---

## 11. Open Questions

| Question | Owner | Status |
|---|---|---|
| Will Geidea provide a merchant account directly, or is an intermediary needed? | Latif | Open |
| Emirate list — are all 7 UAE emirates supported for delivery? | Latif | Open |
| Shipping is shown as "Free" in the wireframe — is this always free, or free above a threshold? | Latif | **Resolved: Always free** |
| Product data entry — will products be seeded via SQL or through a lightweight admin UI before Phase 1 ships? | Latif | Open |
| Do we need Arabic (RTL) language support in Phase 1? | Latif | **Resolved: No, Phase 1 is English only** |
