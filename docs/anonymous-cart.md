# Anonymous cart deployment

The cart is stored in Supabase. The browser receives only the opaque cart UUID in an HttpOnly first-party cookie. The cookie is strictly necessary and does not depend on analytics consent.

## Deploy the database migration

Link the Supabase CLI to the intended project, then apply migrations:

```sh
npx supabase@latest link --project-ref YOUR_PROJECT_REF
npx supabase@latest db push
```

The migration creates `carts`, `cart_items`, backend-only grants, atomic duplicate-item adds, order/cart linkage, and `expire_anonymous_carts()`.

Schedule expiry once per day with Supabase Cron (enable `pg_cron` first if the project does not already use it):

```sql
select cron.schedule(
  'expire-anonymous-carts',
  '15 2 * * *',
  $$select public.expire_anonymous_carts();$$
);
```

## Required environment variables

Copy the names from `.env.local.example`. `SUPABASE_SECRET_KEY` and all Geidea secrets must remain server-only. Production must use HTTPS so the cart cookie is named `__Host-fasthaus_cart` and sent with `Secure`; localhost uses `fasthaus_cart` without `Secure`.
