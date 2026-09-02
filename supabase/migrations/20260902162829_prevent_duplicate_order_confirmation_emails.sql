alter table public.orders
  add column if not exists confirmation_emails_claimed_at timestamptz,
  add column if not exists confirmation_emails_sent_at timestamptz;

-- Existing confirmed orders have already passed through the legacy email path.
-- Marking them delivered prevents a delayed payment-provider retry from sending
-- their customer and production notifications again after this migration.
update public.orders
set confirmation_emails_sent_at = coalesce(payment_confirmed_at, created_at, now())
where status = 'confirmed'
  and confirmation_emails_sent_at is null;

comment on column public.orders.confirmation_emails_claimed_at is
  'Short-lived application claim that serializes customer and production confirmation email delivery.';
comment on column public.orders.confirmation_emails_sent_at is
  'Set only after both paid-order confirmation emails are accepted by the email provider.';
