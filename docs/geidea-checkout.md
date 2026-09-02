# Geidea Checkout

Fasthaus uses the Geidea Checkout modal for card payments. Express wallet checkout is
disabled. Prices and order state remain server-authoritative.

## Required configuration

- `GEIDEA_MERCHANT_PUBLIC_KEY` — server-only merchant public key.
- `GEIDEA_API_PASSWORD` — server-only API password.
- `GEIDEA_API_BASE_URL` — UAE API host; defaults to `https://api.geidea.ae`.
- `GEIDEA_HPP_BASE_URL` — UAE hosted checkout host; defaults to `https://payments.geidea.ae`.
- `GEIDEA_SDK_URL` — synchronous browser SDK URL.
- `NEXT_PUBLIC_BASE_URL` — public HTTPS Fasthaus origin used for callback and return URLs.
- `CHECKOUT_PILOT_UNIT_PRICE_AED` — optional reversible pilot override applied server-side
  to every cart product and add-on unit. Remove it to restore catalog pricing.
- `GEIDEA_LOG_CALLBACKS` — set to `true` temporarily during provider testing to log the
  complete raw callback JSON before verification. Disable it immediately after capturing
  the test callback because the payload can contain sensitive payment and customer metadata.
- `GEIDEA_LOG_SESSION_CREATION` — set to `true` temporarily to log the Create Session
  request, response, and headers. Credentials, cookies, customer PII, and payment tokens
  are redacted. Disable it immediately after capturing the affected request.

`GEIDEA_MERCHANT_ID` remains a temporary backwards-compatible alias for the public key.
There is no separate webhook secret in Geidea's public callback algorithm; callbacks are
signed with the API password.

## Provider onboarding

1. Confirm that the credentials and configured hosts belong to the UAE sandbox.
2. Confirm the callback timestamp field/casing using a genuine signed sandbox callback.

The callback verifier accepts `timestamp`, `timeStamp`, or the callback order's
`updatedDate` fallback because Geidea's current guide and sample payload differ. Do not
switch to live credentials until a signed sandbox callback passes verification.

## Payment lifecycle

1. Checkout validates the anonymous cart and delivery details on the server.
2. A pending Fasthaus order and one 15-minute Geidea session are created.
3. The session opens in Geidea's card-payment modal.
4. The card-only modal omits `returnUrl`: success navigates to the order page, while cancel and
   error close back onto the unchanged checkout form through the SDK callbacks.
5. Only a valid server callback with matching merchant, amount, currency, reference, paid
   status, and success codes confirms the order.
6. Confirmation emails use a durable order-level delivery claim plus stable Resend
   idempotency keys, so sequential and concurrent callback retries cannot send a second pair.

Apply `supabase/migrations/20260807091714_geidea_payment_state.sql` before enabling the
gateway outside local test mode.
