# Fasthaus — Design Specification

> Minimal, modern lighting & home e-commerce. Fast to browse, clean to look at, effortless to buy.

---

## 1. Brand Identity

**Tagline:** *Live well. Simply.*

**Voice & Tone**
- Direct, confident, never verbose
- Warm but not casual — like a well-designed boutique, not a big-box store
- Product copy focuses on materiality, craftsmanship, and everyday function

**Logo & Brand Assets**

| Asset | Path | Use |
|---|---|---|
| Primary wordmark | `assets/fasthaus-logo-final.svg` | Header nav, footer, email — the full `fasthaus` lockup |
| Icon / short mark | `assets/short-logo.svg` | Favicon, app icon, compact/mobile header, social avatars |

- The wordmark is lowercase `fasthaus` in dark `#231F20`; the **`u` is stylized as a layered lamp/glass mark** — the brand's signature motif — built from orange `#FF7A1A`, gold `#FFD04D`, and red-orange `#FF4B1F`. `short-logo.svg` is that lamp `u` on its own.
- These colors are the source of `--color-accent-amber` (`#FF4B1F`) and inform `--color-highlight`. Keep the lamp's three-tone gradient intact — do not recolor or flatten the mark.
- Both assets are SVG; render inline or via `<img>`, never raster. Minimum wordmark height `24px`; clear space around it ≥ the height of the lamp `u`.

---

## 2. Color System

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Page background (white) |
| `--color-surface` | `#F8F6F3` | Cards, panels, order summary |
| `--color-surface-muted` | `#F2F1EF` | Hover states, secondary panels |
| `--color-border` | `#E5E5E5` | Dividers, input borders |
| `--color-text-primary` | `#141114` | Headings, body copy, dark CTA |
| `--color-text-secondary` | `#575757` | Captions, metadata, placeholders |
| `--color-text-disabled` | `#B0AEA9` | Disabled states |
| `--color-accent-amber` | `#FF4B1F` | Primary CTA, links, active nav, Remove |
| `--color-accent-amber-hover` | `#FF6F4C` | CTA hover |
| `--color-highlight` | `#FFCA1A` | Announcement bar, sale badges, warm accents |
| `--color-error` | `#C0392B` | Form errors, destructive actions |
| `--color-success` | `#2E7D5E` | Confirmations, in-stock indicators |

**Dark mode:** invert bg/surface scale; keep accent and highlight constant.

---

## 3. Typography

**Typeface**
- `DM Sans` is used for everything — headings and body/UI alike (matches the wireframe)
- Hierarchy comes from weight and size, not from a second family: headings use the heavier weights (600), body uses 400
- Sans-serif, geometric, highly legible, fast-loading

```css
--font-heading: 'DM Sans', system-ui, sans-serif;
--font-body:    'DM Sans', system-ui, sans-serif;
```

**Type Scale**

**Mobile Type Scale**

| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `--text-xs` | 12px | 500 | 17px | Labels, badges |
| `--text-sm` | 14px | 400 | 20px | Captions, metadata |
| `--text-base` | 16px | 400 | 22px | Body copy |
| `--text-md` | 20px | 300 | 18px | Sub-headings, emphasized UI |
| `--text-lg` | 28px | 600 | 25px | Section titles |
| `--text-xl` | 32px | 600 | 28px | Page headings |
| `--text-2xl` | 40px | 600 | 36px | Hero titles |
| `--text-3xl` | 48px | 600 | 43px | Large editorial moments |

**Desktop Type Scale**
| Token | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| `--text-xs` | 12px | 500 | 17px | Labels, badges |
| `--text-sm` | 14px | 400 | 20px | Captions, metadata |
| `--text-base` | 16px | 400 | 22px | Body copy |
| `--text-md` | 20px | 300 | 28px | Sub-headings, emphasized UI |
| `--text-lg` | 32px | 600 | 29px | Section titles |
| `--text-xl` | 40px | 600 | 36px | Page headings |
| `--text-2xl` | 48px | 600 | 43px | Hero titles |
| `--text-3xl` | 60px | 600 | 54px | Large editorial moments |

---

## 4. Spacing & Layout

**Grid:** 12-column on desktop, 4-column on mobile. Max content width: `1280px`.

**Spacing scale** (8px base, with 2/4/12px support steps):

```
0 · 2 · 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64
```

**Section rhythm:** `48px` top/bottom on mobile, `64px` on desktop. Use `32px` for dense product grids and forms. Avoid 96px+ vertical padding unless there is a full-bleed editorial image carrying the viewport.

**Border radius scale**

| Token | Value | Usage |
|---|---:|---|
| `--radius-none` | `0px` | Dividers, layout grid only |
| `--radius-xs` | `4px` | Tiny badges, payment marks |
| `--radius-sm` | `8px` | Buttons, inputs, compact chips |
| `--radius-md` | `14px` | Product images, cards, panels |
| `--radius-lg` | `20px` | Editorial image blocks |
| `--radius-xl` | `32px` | Large image tiles and feature media |
| `--radius-full` | `9999px` | Pills, icon buttons, swatches |

**Responsive behavior**
- Mobile first: 4-column grid, 20px side padding, 48px section padding.
- Tablet: 24px side padding, product grids move to 2-3 columns depending on density.
- Desktop: 12-column grid, 32px side padding, max content width `1280px`, 64px section padding.
- Product listing grids: `2 columns` mobile, `3 columns` tablet, `4 columns` desktop when inventory supports it.
- CTA groups stack full-width on mobile and become inline on tablet/desktop.
- Text wraps naturally; do not scale font sizes with viewport width.

---

## 5. Component Library

> Source of truth: the [Fasthaus Wireframe](https://www.figma.com/design/sGT6fd4ZYy6E8wzHIWvVNb/Fasthaus-Wireframe?node-id=87-114) (lighting / lamps store). Components below are transcribed from those screens. Two corrections from earlier drafts: corners are **rounded**, not sharp, and the wordmark is **lowercase** `fasthaus` with amber-tinted letterforms.

**Design language observed in the wireframe**
- Rounded geometry throughout: buttons `rounded-xl` / `rounded-lg`, cards `rounded-xl`, inputs `rounded-lg`
- No heavy drop shadows; separation comes from `--color-surface` panels on a white page and `1px` borders
- Amber (`--color-accent-amber`) drives every primary action, active state, link, and "remove"; near-black (`--color-text-primary`) is reserved for the newsletter/secondary CTA; yellow (`--color-highlight`) is the announcement bar only
- Prices render with the **AED dirham** symbol and two decimals. Use the SVG icon at `assets/dirham-icon.svg` (inline `<img>` / `<svg>`, sized to match the price text via `1em` height and `currentColor`), followed by the amount — e.g. `[dirham] 32.00`

### 5.0 Announcement Bar

- Full-width strip pinned above the nav, `bg-highlight` (yellow `#FFCA1A`), `text-text-primary`, `text-xs`
- Four trust items, centered, each `icon + label`, separated by spacing:
  `Free shipping` · `30-day hassle-free returns` · `Eco-friendly materials` · `2-year warranty`
- Dismissible is optional; in the wireframe it is persistent

### 5.1 Buttons

| Variant | Usage in wireframe | Style |
|---|---|---|
| Primary | Buy Now, Checkout, Quick Add, Visit about us | `bg-accent-amber text-white`, `rounded-sm` (`8px`), `inline-flex justify-center items-center gap-2`, `height: 48px`, `padding: 14px 24px`, `text-button-md`; hover/active `bg-accent-amber-hover` |
| Secondary (dark) | Newsletter "Subscribe" | `bg-text-primary text-white`, `rounded-sm`, `height: 48px`, `padding: 14px 24px`, `text-button-md` |
| Secondary (light) | Hero alternate CTA, utility actions | `bg-bg text-text-primary`, `border border-border`, `rounded-sm`, `height: 48px`, `padding: 13px 23px`, `text-button-md` |
| Outline | "Add to cart" (paired with Buy Now) | `border border-border text-text-primary bg-bg`, `rounded-sm`, `height: 48px`, `padding: 13px 23px`, `text-button-md`, optional leading cart icon |
| Pill | Small promo CTA, category strip | `rounded-full`, `padding: 10px 20px`, `text-button-sm` |
| Text / Link | "Remove", "Free shipping details", "See all" | `text-accent-amber`, no underline at rest, `hover:underline` |

- All buttons share a `150ms ease-out` transition on `background-color`, `border-color`, `color`, and `opacity`
- Primary CTAs go full-width inside cards/forms (Buy Now, Checkout)
- Loading state: swap label for a slim spinner, keep width fixed

### 5.2 Product Card

```
┌───────────────────────────┐
│                           │
│       Product Image       │  rounded-xl, aspect-ratio: 4/5
│   ┌───────────────────┐   │  hover: amber "quick add" bar
│   │     quick add     │   │  slides up over image bottom
│   └───────────────────┘   │
├───────────────────────────┤
│ Product Name     [د.إ]32.00│  name: text-base; price: text-base, right-aligned
│ Terracotta, Beige, Black  │  variant subline: text-sm, text-secondary
└───────────────────────────┘
```

- Name and price sit on **one row** (name left, price right); the variant/color list is a second line below
- Image corners rounded (`rounded-xl`); the whole card has no border or shadow — it floats on the page
- On hover: full-width amber `quick add` button slides up from the bottom edge of the image
- PLP cards and homepage "Featured" cards are identical; "You may also like" cards add a star-rating row between name and price

### 5.3 Navigation

**Desktop:**
- Sticky top bar below the announcement bar, `bg-surface`, `border-bottom: 1px solid --color-border`
- Left: logo — `assets/fasthaus-logo-final.svg` (full wordmark); swap to `assets/short-logo.svg` (lamp `u` mark) on the compact/mobile header
- Center: text links `shop ▾` (active = amber), `about`, `contact us`
- Right: search icon, cart icon (no persistent badge in wireframe; add a count badge when items > 0)

**`shop ▾` dropdown:**
- Opens a panel of collections/categories; closes on outside click or `Escape`

**Mobile:**
- Collapse center links into a hamburger drawer (left); keep logo centered and search + cart on the right

### 5.4 Search

- Search icon in the nav opens an input + results overlay
- Results panel: products (thumbnail + name + price), then collections, then recent searches
- Fully keyboard navigable; `Escape` closes

### 5.5 Cart (full page)

> The wireframe uses a **dedicated cart page**, not a slide-in drawer.

- Heading `Your Cart` + item count (e.g. "2 items")
- Line item row: thumbnail · name · `Base Color: <value>` · `Remove` (amber link) · quantity stepper `[ − 1 + ]` · line price (right)
- Add-on row with a checkbox (amber when checked), e.g. `Add-on: Dimmer Switch … [د.إ] 9.00`
- **Order Summary** card (`bg-surface`, `rounded-xl`, right column): Subtotal, Shipping (`Free`), divider, Total, full-width amber `Checkout` button, "Free shipping on all orders" note, payment-method icons (Visa, Mastercard, GPay, …)
- *(Optional enhancement)* a mini cart-drawer may be added for quick access, mirroring this layout

### 5.6 Quantity Stepper

- Inline group: `−` button · value · `+` buttons, wrapped in a `rounded-lg` bordered container
- Used on PDP ("Amount") and on each cart line item
- Disable `−` at quantity 1; clamp to available stock

### 5.7 Variant Selectors

- **Base Color:** row of circular swatches; selected swatch gets an amber ring
- **Spec / feature chips** (PDP): bordered `rounded-lg` boxes, each `icon + two-line label` (e.g. `3D Print / soft matte`, `LED light`, `Premium materials`, `Designed in-house`)
- **"Perfect For" tags:** pill chips (`Workspace`, `Bedside`, `Living Room`, `Reading Nook`)

### 5.8 Segmented Tabs

- PDP detail tabs: `Product Info` · `Specifications` · `Materials` · `Shipping`
- Pill-shaped track; the active tab is filled amber with white text, inactive tabs are plain text
- Switches the panel below (e.g. "Design Story") without navigation

### 5.9 Trust / Feature List

- Vertical list of `icon + label` rows used on the PDP and in feature sections:
  `Free shipping on all orders` · `30-day hassle-free returns` · `2-year warranty`
- Icons are line-style, monochrome; label is `text-sm`

### 5.10 Forms & Inputs

```css
input, textarea, select {
  height: 48px;
  border: 1px solid var(--color-border);
  border-radius: 8px;                 /* rounded, matches cards & buttons */
  padding: 0 16px;
  font-size: var(--text-base);
  background: var(--color-surface);
}
input:focus {
  border-color: var(--color-accent-amber);
  outline: none;
}
input.error { border-color: var(--color-error); }
```

- Checkbox: square `rounded` control, filled amber with a white check when selected (see cart add-on)
- Newsletter pattern: inline `email input + dark "Subscribe" pill`, with an "Agree Terms and Conditions" link below

### 5.11 FAQ Accordion

- Used on the "You Ask. We Answer" section and support pages
- Each row: question (left) + chevron (right) on a `1px` bottom border; expands to reveal the answer
- One item open at a time; chevron rotates on expand

### 5.12 Badges & Tags

- `New Color` — small amber-outlined label near PDP variants
- `SALE` — `bg-highlight text-text-primary`, uppercase, `text-xs`, `px-2 py-0.5`, `rounded-full`
- `NEW` — `bg-accent-amber text-white`, same treatment
- `OUT OF STOCK` — `bg-surface-muted text-text-disabled`
- `BESTSELLER` — outline variant, `border-accent-amber text-accent-amber`

### 5.13 Footer

- `bg-surface` band: logo (`assets/fasthaus-logo-final.svg`) + newsletter (`Subscribe to Newsletter *`, email input + dark Subscribe button + terms link) on the left
- Four link columns: **Company**, **Resources**, **Solutions**, **Social**
- Bottom row: `© 2026 Fasthaus Studio` (left) and payment-method icons (right)

---

## 6. Pages

### 6.1 Homepage

1. **Hero** — Full-width editorial image, overlaid heading (text-3xl) + subline + CTA button. Optional: autoplay video loop.
2. **Category Strip** — 4–6 image tiles in a horizontal scroll on mobile, grid on desktop. Label centered below each tile.
3. **Featured Products** — Grid of 4 product cards, `2×2` desktop / `1-column` mobile. Section heading left-aligned.
4. **Editorial Band** — Full-bleed lifestyle image with overlaid pull quote.
5. **New Arrivals** — Horizontal scroll carousel (6 cards), "See All" link.
6. **Brand Values** — 3-column icon strip: "Sustainable Materials", "Free Shipping over $75", "30-Day Returns".
7. **Newsletter** — Minimal 1-input email capture, `bg-surface-muted`, centered.

### 6.2 Category / PLP (Product Listing Page)

- Top: Breadcrumb + page heading + result count
- Filter sidebar (desktop, collapsible) / Filter drawer (mobile)
  - Filters: Price range, Color, Material, Brand, Rating, In Stock only
- Sort dropdown: Featured, Newest, Price Low–High, Price High–Low, Best Rated
- Product grid: `4 columns` desktop / `2 columns` mobile
- Infinite scroll or "Load More" button (prefer Load More for SEO)
- Active filter chips below the header for quick removal

### 6.3 Product Detail Page (PDP)

**Layout:** 2-column, `60% image / 40% info` (desktop), stacked (mobile)

**Image section:**
- Primary image (large), thumbnail strip below
- Zoom on hover (desktop)
- Pinch-to-zoom (mobile)
- Alt-text on all images

**Info section:**
- Breadcrumb
- Product name (`text-xl`, DM Sans 600)
- Price (with sale price if applicable)
- Rating stars + review count (links to reviews section)
- Variant selectors: Color swatches, Size/Dimension pills
- Quantity stepper
- `Add to Cart` (full-width primary button)
- `Add to Wishlist` (ghost button, heart icon)
- Accordion details: Description, Dimensions, Materials, Care Instructions, Shipping & Returns
- Trust signals: Free Shipping badge, Returns badge, Secure Checkout badge

**Below the fold:**
- `You May Also Like` — 4-card product row
- `Customer Reviews` — rating breakdown bar chart + paginated reviews

### 6.4 Cart Page

- Line items table (editable quantities, remove button)
- Order summary sidebar: subtotal, estimated shipping, promo code input, total
- `Proceed to Checkout` CTA (primary)
- `Continue Shopping` link

### 6.5 Checkout (3-step)

1. **Contact & Shipping** — Email, name, address, delivery method selector
2. **Payment** — Card (Stripe Elements), Apple Pay / Google Pay strip
3. **Review & Place Order** — Summary of all items and address before submission

- Progress indicator at top
- No distractions: hide main nav, show only logo + secure badge

### 6.6 Account Pages

- Dashboard: recent orders, saved addresses, wishlist shortcut
- Orders: list + order detail (status timeline, re-order, return initiation)
- Wishlist: product grid, move-to-cart per item
- Settings: profile, password, notification preferences, delete account

---

## 7. Motion & Interaction

- **Principle:** Motion should confirm intent, never decorate.
- Default transition: `150ms ease-out` for micro-interactions (hover, focus)
- Panel/drawer open: `250ms ease-out` slide + fade
- Page transitions: fade via Next.js `<AnimatePresence>` (optional, keep subtle)
- No parallax — prioritize perceived performance
- Respect `prefers-reduced-motion`: disable all non-essential animations

---

## 8. Accessibility

- Color contrast ratio ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI components
- All interactive elements keyboard-navigable with visible focus rings (`2px offset-2 outline-accent`)
- ARIA labels on icon-only buttons (cart, wishlist, search, close)
- Skip-to-content link as first focusable element
- Images require descriptive alt text; decorative images use `alt=""`
- Form fields paired with `<label>` (not placeholder-only)

---

## 9. Performance Targets

| Metric | Target |
|---|---|
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| Lighthouse Score | ≥ 90 all categories |

- Product images served in WebP/AVIF via Next.js `<Image>`
- Fonts loaded with `font-display: swap`; subset to used characters
- Above-the-fold CSS inlined; rest lazy-loaded
- Cart/wishlist state in Zustand (or similar) — no full-page reloads

---

## 10. Tech Stack Reference

| Layer | Choice |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS custom properties |
| UI Primitives | Radix UI (accessible headless components) |
| State | Zustand (cart, wishlist, UI) |
| Database & Auth | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Geidea (UAE-based gateway; Apple Pay + Google Pay included) |
| Forms | React Hook Form + Zod (shared client/server schemas) |
| Email | Resend + React Email (transactional: order confirmation, shipping, etc.) |
| Images | Next.js Image + Supabase Storage (or Cloudinary optional) |
| Deployment | Vercel |

**Notes:**
- Supabase Auth covers all account flows in §6.6 (login, sessions, password reset) without a separate auth service
- Zod schemas live in `lib/schemas/` and are imported by both form components and Next.js route handlers — single source of truth for validation
- Geidea docs: https://docs.geidea.net/docs/overview — supports Visa, Mastercard, mada, Apple Pay, Google Pay; suitable for UAE acquiring
- Adyen (https://docs.adyen.com/) is the upgrade path if the store expands beyond UAE

---

## 11. File & Folder Conventions

```
app/
  (shop)/
    page.tsx              # Homepage
    [category]/
      page.tsx            # PLP
    product/[slug]/
      page.tsx            # PDP
    cart/page.tsx
    checkout/page.tsx
    account/
      page.tsx
      orders/page.tsx
      wishlist/page.tsx
components/
  ui/                     # Buttons, inputs, badges, typography
  product/                # ProductCard, ProductGrid, QuickAdd
  layout/                 # Navbar, Footer, CartDrawer, MegaMenu
  checkout/               # Steps, OrderSummary
lib/
  store/                  # Zustand slices (cart, wishlist, ui)
  api/                    # Data fetching utilities
  schemas/                # Zod schemas (shared client + server)
  email/                  # React Email templates (order confirmation, shipping, etc.)
styles/
  globals.css             # CSS custom properties + Tailwind base
```
