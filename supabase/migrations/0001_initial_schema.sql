-- ============================================================
-- Fasthaus — initial schema
-- ============================================================

-- Categories
create table if not exists categories (
  id   uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

-- Products
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  category_id uuid references categories(id),
  featured    boolean default false,
  badge       text check (badge in ('NEW', 'SALE', 'BESTSELLER')),
  rating      numeric(3,1) default 0,
  review_count int default 0,
  specs       jsonb default '[]',
  perfect_for text[] default '{}',
  design_story text,
  created_at  timestamptz default now()
);

-- Product variants
create table if not exists product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid references products(id) on delete cascade,
  color          text,
  color_hex      text,
  sku            text unique not null,
  price          numeric(10,2) not null,
  compare_price  numeric(10,2),
  stock_quantity int not null default 0,
  image_urls     text[] default '{}'
);

-- Add-ons
create table if not exists add_ons (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  price       numeric(10,2) not null,
  image_url   text,
  description text
);

-- Customers (extends Supabase auth.users)
create table if not exists customers (
  id         uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name  text,
  phone      text,
  created_at timestamptz default now()
);

-- Saved addresses
create table if not exists addresses (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id) on delete cascade,
  label       text,
  first_name  text not null,
  last_name   text not null,
  line1       text not null,
  line2       text,
  emirate     text not null,
  postal_code text,
  is_default  boolean default false
);

-- Orders
create table if not exists orders (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid references customers(id),
  guest_email      text,
  status           text not null default 'pending'
                     check (status in ('pending','confirmed','shipped','delivered','cancelled','failed')),
  subtotal         numeric(10,2) not null,
  shipping_total   numeric(10,2) not null default 0,
  total            numeric(10,2) not null,
  shipping_address jsonb not null,
  geidea_order_id  text,
  created_at       timestamptz default now(),
  constraint guest_or_customer check (
    customer_id is not null or guest_email is not null
  )
);

-- Order line items
create table if not exists order_items (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid references orders(id) on delete cascade,
  variant_id uuid references product_variants(id),
  quantity   int not null,
  unit_price numeric(10,2) not null
);

-- Newsletter subscribers
create table if not exists newsletter_subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz default now()
);

-- Contact form submissions
create table if not exists contact_submissions (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  subject    text not null,
  message    text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table products enable row level security;
alter table product_variants enable row level security;
alter table categories enable row level security;
alter table add_ons enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table customers enable row level security;
alter table addresses enable row level security;
alter table newsletter_subscribers enable row level security;
alter table contact_submissions enable row level security;

-- Public read access to product catalog
create policy "public can view products" on products for select using (true);
create policy "public can view variants" on product_variants for select using (true);
create policy "public can view categories" on categories for select using (true);
create policy "public can view add_ons" on add_ons for select using (true);

-- Newsletter + contact: insert-only from anon
create policy "anyone can subscribe" on newsletter_subscribers
  for insert with check (true);

create policy "anyone can submit contact" on contact_submissions
  for insert with check (true);

-- Orders: service role handles inserts; guests can read their own order by email
create policy "guest read own order" on orders
  for select using (guest_email = current_setting('request.jwt.claims', true)::json->>'email');

create policy "authenticated read own orders" on orders
  for select using (customer_id = auth.uid());

-- Customers: own row only
create policy "customer read own profile" on customers
  for select using (id = auth.uid());

create policy "customer update own profile" on customers
  for update using (id = auth.uid());

-- Addresses: own rows only
create policy "customer manage own addresses" on addresses
  for all using (customer_id = auth.uid());
