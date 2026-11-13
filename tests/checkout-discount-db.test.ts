import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";
import test from "node:test";

const run = promisify(execFile);
const database = process.env.CHECKOUT_DISCOUNT_TEST_DATABASE_URL;
const psql = process.env.PSQL ?? "psql";
async function sql(statement: string) {
  const { stdout } = await run(psql, [
    database!,
    "-X",
    "-qAt",
    "-v",
    "ON_ERROR_STOP=1",
    "-c",
    statement,
  ]);
  return stdout.trim();
}
const email = "maxine.chehab@gmail.com";
const items = JSON.stringify([
  {
    catalog_variant_id: "test",
    product_name: "Lamp",
    variant_name: "White",
    quantity: 1,
    unit_price: 987,
  },
]);
function prepare(cart: string, code = "MAXINE100", customerEmail = email, subtotal = 987) {
  return `select row_to_json(p) from public.prepare_checkout_order_with_discount('${cart}', '${customerEmail}', ${subtotal}, '${code}', '{}', '${items}', now() + interval '30 seconds', 'standard') p`;
}
async function cart() {
  const id = randomUUID();
  await sql(`insert into carts(id) values ('${id}')`);
  return id;
}
async function reset() {
  await sql(
    "update checkout_customer_discount set reserved_order_id=null, redeemed_order_id=null, redeemed_at=null, expires_at='2027-05-14T00:00:00+04:00'"
  );
}
function payment(order: string, paid = true, provider = randomUUID()) {
  return `select public.record_checkout_payment('${order}','${provider}',887,'AED',${paid},true,'${paid ? "Paid" : "Failed"}',null,'Card')`;
}

test(
  "checkout discount database transactions (dedicated empty scratch database only)",
  { skip: !database },
  async (t) => {
    assert.equal(
      new URL(database!).pathname,
      "/fasthaus_discount_test",
      "Refusing to run outside the named scratch database"
    );
    assert.equal(
      await sql("select to_regclass('public.orders') is null"),
      "t",
      "Use an empty scratch database"
    );
    await sql(`do $$ begin create role anon; exception when duplicate_object then null; end $$;
    do $$ begin create role authenticated; exception when duplicate_object then null; end $$;
    do $$ begin create role service_role bypassrls; exception when duplicate_object then null; end $$;
    create schema if not exists auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql as 'select null::uuid';`);
    for (const file of [
      "0001_initial_schema.sql",
      "20260715193526_anonymous_cart.sql",
      "20260807091714_geidea_payment_state.sql",
      "20260814092650_prepare_checkout_order.sql",
      "20260902162829_prevent_duplicate_order_confirmation_emails.sql",
      "20260902201429_split_geidea_checkout_session_modes.sql",
      "20261113102050_customer_discount.sql",
    ]) {
      await sql(readFileSync(new URL(`../supabase/migrations/${file}`, import.meta.url), "utf8"));
    }

    await t.test("private data and RPCs are inaccessible to browser roles", async () => {
      assert.equal(
        await sql(`select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace
        where n.nspname='public' and p.proname in ('checkout_discount_amount','quote_checkout_discount',
        'prepare_checkout_order_with_discount','complete_checkout_session','record_checkout_payment','release_expired_checkout_discount')
        and (p.prosecdef or has_function_privilege('anon',p.oid,'execute') or has_function_privilege('authenticated',p.oid,'execute'))`),
        "0"
      );
      await assert.rejects(
        sql("set role anon; select * from checkout_customer_discount"),
        /permission denied/
      );
      await assert.rejects(
        sql(
          "set role authenticated; select public.checkout_discount_amount('MAXINE100','x',987,null)"
        ),
        /permission denied/
      );
    });
    await t.test(
      "fixed and percentage pricing, normalization, no stacking and no negative totals",
      async () => {
        assert.equal(
          await sql(
            `set role service_role; select checkout_discount_amount(' maxine100 ', ' MAXINE.CHEHAB@GMAIL.COM ', 987, null)`
          ),
          "100"
        );
        assert.equal(
          await sql(
            `select checkout_discount_amount(' faste10 ', 'any@example.com', 100.05, null)`
          ),
          "10.01"
        );
        assert.equal(
          await sql(`select checkout_discount_amount('MAXINE100', '${email}', 50, null)`),
          "50"
        );
        await assert.rejects(
          sql(`select checkout_discount_amount('MAXINE100,FASTE10', '${email}',987,null)`),
          /DISCOUNT_INVALID/
        );
        const order = JSON.parse(await sql(prepare(await cart(), "MAXINE100", email, 50)));
        assert.equal(Number(order.order_total), 0);
        const percentage = JSON.parse(
          await sql(prepare(await cart(), " faste10 ", "ANY@Example.com", 987))
        );
        assert.equal(Number(percentage.order_total), 888.3);
        assert.equal(
          await sql(
            `select discount_code || ':' || discount_amount || ':' || guest_email from orders where id='${percentage.order_id}'`
          ),
          "FASTE10:98.70:any@example.com"
        );
        await reset();
      }
    );
    await t.test(
      "wrong email and precise Dubai expiry boundary are rejected at order creation",
      async () => {
        const id = await cart();
        await assert.rejects(
          sql(prepare(id, "MAXINE100", "different@example.com")),
          /DISCOUNT_EMAIL/
        );
        // The production cutoff is exact; moving it to the DB transaction timestamp tests equality deterministically.
        assert.equal(
          await sql(
            "select expires_at = '2027-05-13T20:00:00Z'::timestamptz from checkout_customer_discount"
          ),
          "t"
        );
        await assert.rejects(
          sql(
            `begin; update checkout_customer_discount set expires_at=transaction_timestamp(); ${prepare(id)}; commit;`
          ),
          /DISCOUNT_EXPIRED/
        );
        await sql(`begin; update checkout_customer_discount set expires_at=clock_timestamp()+interval '1 second';
      do $$ begin assert checkout_discount_amount('MAXINE100','${email}',987,null) = 100; end $$; rollback;`);
      }
    );
    await t.test(
      "simultaneous different carts reserve exactly once; same order retries reuse it",
      async () => {
        const carts = await Promise.all([cart(), cart()]);
        const outcomes = await Promise.allSettled(
          carts.map((id) => sql(`begin; ${prepare(id)}; select pg_sleep(0.1); commit;`))
        );
        assert.equal(outcomes.filter((x) => x.status === "fulfilled").length, 1);
        const failure = outcomes.find((x) => x.status === "rejected");
        assert.match(
          String(failure?.status === "rejected" ? failure.reason : ""),
          /DISCOUNT_RESERVED/
        );
        const id = await sql("select reserved_order_id from checkout_customer_discount");
        const winningCart = await sql(`select cart_id from orders where id='${id}'`);
        const retry = JSON.parse(await sql(prepare(winningCart)));
        assert.equal(retry.order_id, id);
        assert.equal(retry.create_session, false);
        assert.equal(
          await sql(`select redeemed_order_id is null from checkout_customer_discount`),
          "t"
        );
        const claim = await sql(`select geidea_session_expires_at from orders where id='${id}'`);
        assert.equal(
          await sql(
            `select complete_checkout_session('${id}','${claim}','session-one',now()+interval '15 minutes','https://pay.test')`
          ),
          "t"
        );
        const reuse = JSON.parse(await sql(prepare(winningCart)));
        assert.equal(reuse.checkout_session_id, "session-one");
        assert.equal(Number(reuse.order_total), 887);
        await assert.rejects(sql(prepare(winningCart, "FASTE10")), /DISCOUNT_CHECKOUT_ACTIVE/);
        await reset();
      }
    );
    await t.test(
      "failed creation releases the offer; abandoned claims recover and stale creators cannot publish",
      async () => {
        const first = JSON.parse(await sql(prepare(await cart())));
        const claim = await sql(
          `select geidea_session_expires_at from orders where id='${first.order_id}'`
        );
        assert.equal(
          await sql(
            `select complete_checkout_session('${first.order_id}','${claim}',null,null,null)`
          ),
          "t"
        );
        const second = JSON.parse(await sql(prepare(await cart())));
        await sql(
          `update orders set geidea_session_expires_at=now()-interval '1 second' where id='${second.order_id}'`
        );
        assert.equal(
          await sql(`select release_expired_checkout_discount('${second.order_id}',null)`),
          "t"
        );
        const third = JSON.parse(await sql(prepare(await cart())));
        assert.notEqual(third.order_id, second.order_id);
        assert.equal(
          await sql(
            `select complete_checkout_session('${second.order_id}','${claim}','stale',now()+interval '15 minutes','https://pay.test')`
          ),
          "f"
        );
        await reset();
      }
    );
    await t.test(
      "expired delivered sessions require reconciliation before releasing, and cannot release an active session",
      async () => {
        const id = await cart();
        const order = JSON.parse(await sql(prepare(id)));
        const claim = await sql(
          `select geidea_session_expires_at from orders where id='${order.order_id}'`
        );
        await sql(
          `select complete_checkout_session('${order.order_id}','${claim}','expired-session',now()+interval '15 minutes','https://pay.test')`
        );
        assert.equal(
          await sql(
            `select release_expired_checkout_discount('${order.order_id}','expired-session')`
          ),
          "f"
        );
        await sql(
          `update orders set geidea_session_expires_at=now()-interval '1 second' where id='${order.order_id}'`
        );
        await assert.rejects(sql(prepare(id)), /DISCOUNT_RESERVED/);
        assert.equal(
          await sql(
            `select release_expired_checkout_discount('${order.order_id}','expired-session')`
          ),
          "t"
        );
        assert.equal(JSON.parse(await sql(prepare(id))).create_session, true);
        await reset();
      }
    );
    await t.test(
      "verified failure releases; duplicate failures cannot clear a newer reservation",
      async () => {
        const id = await cart();
        const first = JSON.parse(await sql(prepare(id)));
        await sql(payment(first.order_id, false));
        const second = JSON.parse(await sql(prepare(id)));
        assert.equal(await sql(payment(first.order_id, false)), "f");
        assert.equal(
          await sql("select reserved_order_id from checkout_customer_discount"),
          second.order_id
        );
        assert.equal(await sql(`select status from carts where id='${id}'`), "CHECKOUT_STARTED");
        await reset();
      }
    );
    await t.test(
      "paid confirmation and redemption are atomic; concurrent duplicate callbacks are idempotent",
      async () => {
        const order = JSON.parse(await sql(prepare(await cart())));
        const provider = randomUUID();
        await assert.rejects(
          sql(payment(order.order_id, true, provider).replace(",887,", ",987,")),
          /amount does not match/
        );
        assert.equal(
          await sql("select redeemed_order_id is null from checkout_customer_discount"),
          "t"
        );
        const outcomes = await Promise.all([
          sql(payment(order.order_id, true, provider)),
          sql(payment(order.order_id, true, provider)),
        ]);
        assert.deepEqual(outcomes, ["t", "t"]);
        const redeemedAt = await sql("select redeemed_at from checkout_customer_discount");
        assert.equal(await sql(payment(order.order_id, true, provider)), "t");
        assert.equal(await sql("select redeemed_at from checkout_customer_discount"), redeemedAt);
        assert.equal(
          await sql("select redeemed_order_id from checkout_customer_discount"),
          order.order_id
        );
        assert.equal(
          await sql(`select status from orders where id='${order.order_id}'`),
          "confirmed"
        );
        assert.equal(await sql(payment(order.order_id, false)), "f");
        await assert.rejects(sql(prepare(await cart())), /DISCOUNT_USED/);
      }
    );
  }
);
