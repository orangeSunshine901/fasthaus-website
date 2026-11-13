import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

// Compile the server-only helper with mocked I/O; exercise its real recovery branches.
const source = ts.transpileModule(
  readFileSync(new URL("../lib/checkout/discount-server.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }
).outputText;
function harness({
  session = "session",
  expired = true,
  payment = null,
  lookupFails = false,
}: {
  session?: string | null;
  expired?: boolean;
  payment?: Record<string, unknown> | null;
  lookupFails?: boolean;
} = {}) {
  const calls: string[] = [];
  const exports: Record<string, (...args: unknown[]) => Promise<unknown>> = {};
  class CartError extends Error {}
  runInNewContext(source, {
    exports,
    require(name: string) {
      if (name === "server-only") return {};
      if (name.endsWith("order-emails"))
        return {
          sendConfirmedOrderEmails: async () => {
            calls.push("emails");
          },
        };
      if (name.endsWith("cart/types")) return { CartError };
      if (name.endsWith("payment/geidea"))
        return {
          fetchVerifiedGeideaOrderByReference: async () => {
            calls.push("lookup");
            if (lookupFails) throw new Error("Provider unavailable");
            return payment;
          },
        };
      if (name.endsWith("discount"))
        return { normalizeDiscountCode: (value: string) => value.trim().toUpperCase() };
      throw new Error(`Unexpected import ${name}`);
    },
  });
  const client = {
    from(table: string) {
      const query = {
        select() {
          return query;
        },
        eq() {
          return query;
        },
        async single() {
          return {
            data:
              table === "checkout_customer_discount"
                ? { reserved_order_id: "order" }
                : {
                    id: "order",
                    total: 887,
                    geidea_session_id: session,
                    geidea_session_expires_at: new Date(
                      Date.now() + (expired ? -1000 : 60_000)
                    ).toISOString(),
                  },
            error: null,
          };
        },
      };
      return query;
    },
    async rpc(name: string) {
      calls.push(name);
      return { data: true, error: null };
    },
  };
  return { calls, recover: () => exports.recoverExpiredDiscount(client, " maxine100 ") };
}
const paid = {
  merchantReferenceId: "order",
  orderId: "provider-order",
  amount: 887,
  totalAmount: 887,
  currency: "AED",
  isPaid: true,
  status: "Success",
  detailedStatus: "Paid",
  reference: null,
  paymentMethod: "Card",
};

test("an active payment retains its reservation without querying Geidea", async () => {
  const h = harness({ expired: false });
  await h.recover();
  assert.deepEqual(h.calls, []);
});
test("an abandoned creation claim can recover without a delivered payment session", async () => {
  const h = harness({ session: null });
  await h.recover();
  assert.deepEqual(h.calls, ["release_expired_checkout_discount"]);
});
test("an expired delivered session checks the provider before releasing an abandoned reservation", async () => {
  const h = harness();
  await h.recover();
  assert.deepEqual(h.calls, ["lookup", "release_expired_checkout_discount"]);
});
test("a delayed paid result redeems and sends confirmations instead of releasing", async () => {
  const h = harness({ payment: paid });
  await h.recover();
  assert.deepEqual(h.calls, ["lookup", "record_checkout_payment", "emails"]);
});
test("an in-flight transaction retains the reservation after session expiry", async () => {
  const h = harness({ payment: { ...paid, status: "InProgress", isPaid: false } });
  await h.recover();
  assert.deepEqual(h.calls, ["lookup", "record_checkout_payment"]);
});
test("provider errors and mismatched amounts fail closed without releasing", async () => {
  const unavailable = harness({ lookupFails: true });
  await assert.rejects(unavailable.recover());
  assert.deepEqual(unavailable.calls, ["lookup"]);
  const mismatch = harness({ payment: { ...paid, totalAmount: 987 } });
  await assert.rejects(mismatch.recover());
  assert.deepEqual(mismatch.calls, ["lookup"]);
});
