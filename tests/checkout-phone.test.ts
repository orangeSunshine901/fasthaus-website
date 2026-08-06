import test from "node:test";
import assert from "node:assert/strict";
import { ContactSchema } from "../lib/schemas/checkout.ts";

const email = "ava@example.com";

test("accepts the grouped UAE number shown in checkout and normalizes it", () => {
  const parsed = ContactSchema.parse({ email, phone: "50 123 4567" });

  assert.equal(parsed.phone, "+971501234567");
});

test("rejects an invalid UAE number", () => {
  const parsed = ContactSchema.safeParse({ email, phone: "51 123 4567" });

  assert.equal(parsed.success, false);
});
