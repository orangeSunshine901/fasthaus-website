# Customer checkout discount

`MAXINE100` takes AED 100 off the merchandise subtotal once per order, capped at the subtotal.
Its customer email and exclusive expiry (`2027-05-14T00:00:00+04:00`, midnight after
13 May 2027 in Dubai) live in the service-role-only database record. The existing
`FASTE10` offer still takes 10% off. Checkout accepts one code at a time.

## Activation

Implementation and local verification do not activate the offer in production.

1. Apply `supabase/migrations/20261113102050_customer_discount.sql` after all existing
   migrations, using the project's normal reviewed Supabase migration process.
   This adds the private offer record, order discount fields, and checkout RPCs.
   The legacy `prepare_checkout_order` RPC remains available for the previous app
   version during rollout. Do not rerun the seed or clear redemption state on deploy.
2. Deploy the application changes together. Keep `CHECKOUT_TEST_MODE` unset/false
   and the existing `CHECKOUT_DISCOUNTS_ENABLED` flag enabled. The simulated payment
   mode deliberately rejects MAXINE100, so it cannot redeem a real customer's code.
   No new environment variable or browser secret is needed.
3. In an isolated Supabase/Geidea sandbox, verify a real paid callback, a failed
   payment, duplicate delivery, and abandonment followed by retry. In particular,
   verify the merchant-reference lookup's response for an expired session with no
   provider order. Recovery accepts HTTP 404 as absence; an unexpected response or
   provider outage keeps the reservation and asks the shopper to retry.
4. Verify checkout shows the discount and matching total on the deployed version.
   Use separate sandbox redemption state for testing; a successful real MAXINE100
   purchase permanently consumes the production offer.

## Lifecycle

- Apply requests a server quote using the current cart and checkout email. A quote
  does not reserve or redeem anything. Changing email, code, or subtotal invalidates
  the displayed quote. Payment always revalidates the code in the database and
  rejects changed totals rather than opening a differently priced payment.
- `prepare_checkout_order_with_discount` locks the private offer and cart, calculates
  the discount, stores its code/amount, and reserves it for one order. Concurrent
  requests for that order wait for or reuse the same session. Another cart is blocked.
- The short session-creation claim lasts 30 seconds. `complete_checkout_session`
  atomically stores the provider's session and expiry in the order/cart before
  returning its URL. A stale creator cannot publish a session after losing its claim.
  Session creation failure releases the reservation without redemption.
- Checkout details remain fixed while a payable session is open. Editing cart items
  already clones the cart using the existing cart service. Expired attempts retain
  their immutable order reference; retry creates a new order rather than overwriting
  the amount associated with an old payment callback.
- Recovery runs lazily on the next MAXINE100 quote or payment attempt; no scheduled
  job is required. Expired delivered sessions are checked against Geidea by merchant
  reference before release. A paid result confirms/redeems and sends the existing
  confirmation emails; an in-flight payment keeps the reservation. An abandoned
  creation claim needs no provider lookup because its session was never delivered.
- The verified callback records payment, confirms the order, converts the cart and
  redeems MAXINE100 in one transaction. Repeated callbacks preserve the first paid
  provider order and redemption timestamp. Confirmation email claims/idempotency
  keys are shared with recovered payments. Code expiry prevents new payment starts;
  an already reserved payment can complete after that deadline.
- A subtotal at or below AED 100 produces a zero total. The server completes that
  order atomically as `No payment required` and redeems the code; it does not submit
  a zero-value charge to Geidea.

## Verification

```sh
npm test
npx tsc --noEmit
npm run lint
npm run build
```

The real PostgreSQL transaction tests require an **empty, disposable** database
named `fasthaus_discount_test`, with a local superuser connection. They bootstrap
only the checkout's actual prerequisite migrations and never use production data.
No additional project dependency is required; `psql` must be available.

```sh
CHECKOUT_DISCOUNT_TEST_DATABASE_URL='postgresql://…/fasthaus_discount_test' \
  node --test --experimental-strip-types tests/checkout-discount*.test.ts
```

Set `PSQL` to the executable path if it is outside `PATH`. Recreate the disposable
database before another run. Without this URL, `npm test` skips the database suite.

With a local app running, `node scripts/check-checkout-discount.mjs` checks checkout
at 390px and 1280px with mocked cart/checkout endpoints. It covers displayed fixed
and percentage totals, email changes, error messages and a payment-time rejection;
it does not create provider payments or exercise production Supabase.
