import test from "node:test";
import assert from "node:assert/strict";
import { ContactSchema, ShippingAddressSchema } from "../lib/schemas/checkout.ts";
import { formatPhoneInput } from "../lib/checkout/phone-input.ts";

const email = "ava@example.com";

test("accepts the grouped UAE number shown in checkout and normalizes it", () => {
  const parsed = ContactSchema.parse({ email, phone: "50 123 4567" });

  assert.equal(parsed.phone, "+971501234567");
});

test("rejects an invalid UAE number", () => {
  const parsed = ContactSchema.safeParse({ email, phone: "51 123 4567" });

  assert.equal(parsed.success, false);
});

test("formats the phone after editing finishes", () => {
  assert.equal(formatPhoneInput("50 13 4567"), "50 134 567");
});

test("requires unit and building details while keeping landmark optional", () => {
  const address = {
    firstName: "Ava",
    lastName: "Smith",
    streetAddress: "Al Marsa Street",
    line1: "Apt 804, Floor 8",
    line2: "Marina Heights",
    emirate: "Dubai",
  };

  assert.equal(ShippingAddressSchema.safeParse(address).success, true);
  assert.equal(ShippingAddressSchema.safeParse({ ...address, streetAddress: "" }).success, false);
  assert.equal(ShippingAddressSchema.safeParse({ ...address, line2: "" }).success, false);
});
