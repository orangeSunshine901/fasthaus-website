"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ChevronDown, ShieldCheck } from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { z } from "zod";
import DirhamPrice from "@/components/ui/DirhamPrice";
import { useCartStore } from "@/lib/store/cart";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";

const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

type PaymentMethod = "card" | "apple" | "tabby";

const inputStyle = {
  borderColor: "var(--color-border)",
  backgroundColor: "var(--color-surface)",
};

function generateOrderId(): string {
  return "FH-" + Math.floor(10000 + Math.random() * 90000);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

function isValidAePhone(value: string): boolean {
  return value.trim().length > 0 && isValidPhoneNumber(value, "AE");
}

function formatPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) digits = digits.slice(1);
  digits = digits.slice(0, 9);
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 9)].filter(Boolean).join(" ");
}

function formatCardNumberInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
}

function formatExpiryInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatCvcInput(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 4);
}

function luhnCheck(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

const cardNumberSchema = z
  .string()
  .transform((v) => v.replace(/\s+/g, ""))
  .refine((v) => /^\d{13,19}$/.test(v), "Enter a valid card number.")
  .refine(luhnCheck, "Enter a valid card number.");

const cardExpirySchema = z
  .string()
  .trim()
  .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format.")
  .refine((v) => {
    const [month, year] = v.split("/").map(Number);
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    if (year < currentYear) return false;
    if (year === currentYear && month < currentMonth) return false;
    return true;
  }, "Card has expired.");

const cardCvcSchema = z
  .string()
  .trim()
  .regex(/^\d{3,4}$/, "Enter a valid 3 or 4 digit code.");

const cardPaymentSchema = z.object({
  cardNumber: cardNumberSchema,
  cardExpiry: cardExpirySchema,
  cardCvc: cardCvcSchema,
});

function firstIssueMessage(result: z.ZodSafeParseResult<unknown>): string | null {
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "Invalid value.";
}

function formatDeliveryWindow(): string {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() + 5);
  const end = new Date(now);
  end.setDate(now.getDate() + 10);

  const startMonth = start.toLocaleDateString("en-US", { month: "long" });
  const endMonth = end.toLocaleDateString("en-US", { month: "long" });
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()}–${end.getDate()}, ${year}`;
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${year}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, addOns, subtotal, clearCart } = useCartStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [address, setAddress] = useState("");
  const [emirate, setEmirate] = useState("Dubai");
  const [poBox, setPoBox] = useState("");

  const emailError =
    email.length > 0 && !isValidEmail(email) ? "Enter a valid email address." : null;
  const phoneError =
    phone.length > 0 && !isValidAePhone(phone) ? "Enter a valid UAE mobile number." : null;

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardNumberTouched, setCardNumberTouched] = useState(false);
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardExpiryTouched, setCardExpiryTouched] = useState(false);
  const [cardCvc, setCardCvc] = useState("");
  const [cardCvcTouched, setCardCvcTouched] = useState(false);

  const cardNumberError =
    cardNumber.length > 0 ? firstIssueMessage(cardNumberSchema.safeParse(cardNumber)) : null;
  const cardExpiryError =
    cardExpiry.length > 0 ? firstIssueMessage(cardExpirySchema.safeParse(cardExpiry)) : null;
  const cardCvcError =
    cardCvc.length > 0 ? firstIssueMessage(cardCvcSchema.safeParse(cardCvc)) : null;

  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [newsletter, setNewsletter] = useState(false);

  const subtotalValue = subtotal();
  const hasDiscount = newsletter || discountApplied;
  const discountAmount = hasDiscount ? subtotalValue * 0.1 : 0;
  const totalValue = subtotalValue - discountAmount;

  useEffect(() => {
    if (items.length > 0) capture(analyticsEvents.checkoutStarted, { item_count: items.reduce((sum, item) => sum + item.quantity, 0), cart_value: totalValue, currency: "AED" });
  }, [items, totalValue]);

  function toggleNewsletter() {
    setNewsletter((prev) => {
      const next = !prev;
      setDiscountCode(next ? "WELCOME10" : "");
      setDiscountApplied(false);
      return next;
    });
  }

  function applyDiscountCode() {
    if (discountCode.trim().toUpperCase() === "WELCOME10") {
      setDiscountApplied(true);
    }
  }

  function handlePurchase(e: React.FormEvent) {
    e.preventDefault();

    setEmailTouched(true);
    setPhoneTouched(true);

    let valid = isValidEmail(email) && isValidAePhone(phone);

    if (paymentMethod === "card") {
      setCardNumberTouched(true);
      setCardExpiryTouched(true);
      setCardCvcTouched(true);
      const cardResult = cardPaymentSchema.safeParse({ cardNumber, cardExpiry, cardCvc });
      valid = valid && cardResult.success;
    }

    if (!valid) {
      return;
    }

    const flattenedAddOns = [
      ...items.flatMap((item) =>
        (item.addOns ?? []).map((ao) => ({
          name: ao.name,
          price: ao.price,
          quantity: ao.quantity,
          productName: item.productName,
        }))
      ),
      ...addOns.map((ao) => ({
        name: ao.name,
        price: ao.price,
        quantity: ao.quantity ?? 1,
      })),
    ];

    const orderId = generateOrderId();
    const cardLast4 =
      paymentMethod === "card" ? cardNumber.replace(/\s/g, "").slice(-4) : undefined;

    const order = {
      id: orderId,
      items,
      addOns: flattenedAddOns,
      subtotal: subtotalValue,
      discountCode: hasDiscount
        ? newsletter
          ? "Newsletter discount (10%)"
          : `Discount code (10%)`
        : undefined,
      discount: discountAmount,
      total: totalValue,
      shipping: { fullName, email, phone, address, emirate, poBox },
      payment: { method: paymentMethod, cardLast4 },
      deliveryWindow: formatDeliveryWindow(),
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("fasthaus-last-order", JSON.stringify(order));
    capture(analyticsEvents.purchaseCompleted, { order_id: orderId, revenue: totalValue, currency: "AED", item_count: items.reduce((sum, item) => sum + item.quantity, 0), first_purchase: localStorage.getItem("fasthaus-has-purchased") !== "true" });
    localStorage.setItem("fasthaus-has-purchased", "true");
    clearCart();
    router.push(`/order/${orderId}`);
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
        {/* Empty cart guard */}
        <div className="container-page flex flex-col items-center justify-center gap-4 py-32 text-center">
          <p className="type-body-md" style={{ color: "var(--color-text-secondary)" }}>
            Your cart is empty.
          </p>
          <Link
            href="/collection"
            className="type-body-sm"
            style={{ color: "var(--color-accent-amber)" }}
          >
            Back to collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--color-bg)" }}>
      <div className="container-page py-10 md:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[520px_1fr] lg:gap-16 xl:gap-[88px]">
          {/* LEFT: form */}
          <form onSubmit={handlePurchase} className="flex flex-col gap-7">
            <div className="flex flex-col gap-2">
              <Link href="/cart" className="btn-text inline-flex w-fit items-center gap-1.5">
                <ArrowLeft size={14} />
                Back to cart
              </Link>
              <h1 className="type-display-lg mt-1" style={{ color: "var(--color-text-primary)" }}>
                Complete checkout
              </h1>
              <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
                Please enter your details to complete your purchase.
              </p>
            </div>

            {/* Your details */}
            <section className="flex flex-col gap-4">
              <h2 className="eyebrow" style={{ color: "var(--color-text-secondary)" }}>
                Your details
              </h2>
              <Field label="Full name" required>
                <input
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ava Smith"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
              <Field label="Email" required error={emailTouched ? emailError : null}>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="ava@example.com"
                  className="input-field"
                  style={{
                    ...inputStyle,
                    borderColor:
                      emailTouched && emailError ? "var(--color-error)" : inputStyle.borderColor,
                  }}
                  aria-invalid={emailTouched && !!emailError}
                />
              </Field>
              <Field label="Phone number" required error={phoneTouched ? phoneError : null}>
                <div className="flex gap-2.5">
                  <div
                    className="input-field flex w-[126px] flex-shrink-0 items-center"
                    style={inputStyle}
                  >
                    <span className="type-body-sm" style={{ color: "var(--color-text-primary)" }}>
                      AE (+971)
                    </span>
                  </div>
                  <input
                    required
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                    onBlur={() => setPhoneTouched(true)}
                    placeholder="50 123 4567"
                    className="input-field flex-1"
                    style={{
                      ...inputStyle,
                      borderColor:
                        phoneTouched && phoneError ? "var(--color-error)" : inputStyle.borderColor,
                    }}
                    aria-invalid={phoneTouched && !!phoneError}
                  />
                </div>
              </Field>
            </section>

            {/* Shipping details */}
            <section
              className="flex flex-col gap-4 border-t pt-6"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h2 className="eyebrow" style={{ color: "var(--color-text-secondary)" }}>
                Shipping details
              </h2>
              <Field label="Country or region" required>
                <div
                  className="input-field flex items-center justify-between gap-3"
                  style={{ ...inputStyle, backgroundColor: "var(--color-surface-muted)" }}
                >
                  <span className="type-body-sm" style={{ color: "var(--color-text-primary)" }}>
                    United Arab Emirates
                  </span>
                  <span
                    className="type-caption-sm text-right"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    We currently ship within the UAE only
                  </span>
                </div>
              </Field>
              <Field label="Address line" required>
                <input
                  required
                  autoComplete="street-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Villa 12, Al Wasl Road"
                  className="input-field"
                  style={inputStyle}
                />
              </Field>
              <div className="grid grid-cols-[1fr_140px] gap-3.5">
                <Field label="Emirate" required>
                  <div className="relative">
                    <select
                      required
                      value={emirate}
                      onChange={(e) => setEmirate(e.target.value)}
                      className="input-field w-full appearance-none pr-9"
                      style={inputStyle}
                    >
                      {EMIRATES.map((em) => (
                        <option key={em}>{em}</option>
                      ))}
                    </select>
                    <ChevronDown
                      size={14}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--color-text-secondary)" }}
                    />
                  </div>
                </Field>
                <Field label="P.O. Box">
                  <input
                    inputMode="numeric"
                    value={poBox}
                    onChange={(e) => setPoBox(e.target.value)}
                    placeholder="00000"
                    className="input-field"
                    style={inputStyle}
                  />
                </Field>
              </div>
            </section>

            {/* Payment */}
            <section
              className="flex flex-col gap-4 border-t pt-6"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h2 className="eyebrow" style={{ color: "var(--color-text-secondary)" }}>
                Payment method
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <PaymentOption
                  label="Card"
                  active={paymentMethod === "card"}
                  onClick={() => setPaymentMethod("card")}
                  icon={<CardIcon active={paymentMethod === "card"} />}
                />
                <PaymentOption
                  label="Apple Pay"
                  active={paymentMethod === "apple"}
                  onClick={() => setPaymentMethod("apple")}
                  icon={<AppleIcon />}
                />
                {/* <PaymentOption
                  label="Tabby"
                  active={paymentMethod === "tabby"}
                  onClick={() => setPaymentMethod("tabby")}
                  icon={<TabbyIcon />}
                /> */}
              </div>

              {paymentMethod === "card" && (
                <div className="flex flex-col gap-3.5">
                  <Field
                    label="Card number"
                    required
                    error={cardNumberTouched ? cardNumberError : null}
                  >
                    <div className="relative">
                      <input
                        required
                        inputMode="numeric"
                        autoComplete="cc-number"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumberInput(e.target.value))}
                        onBlur={() => setCardNumberTouched(true)}
                        placeholder="0000 0000 0000 0000"
                        className="input-field w-full"
                        style={{
                          ...inputStyle,
                          paddingLeft: 60,
                          borderColor:
                            cardNumberTouched && cardNumberError
                              ? "var(--color-error)"
                              : inputStyle.borderColor,
                        }}
                        aria-invalid={cardNumberTouched && !!cardNumberError}
                      />
                      <span
                        className="type-caption-sm absolute left-3.5 top-1/2 -translate-y-1/2 rounded border px-1.5 py-0.5"
                        style={{
                          borderColor: "var(--color-border)",
                          color: "var(--color-text-secondary)",
                          fontSize: 10,
                        }}
                      >
                        VISA
                      </span>
                    </div>
                  </Field>
                  <div className="grid grid-cols-2 gap-3.5">
                    <Field
                      label="Expiration"
                      required
                      error={cardExpiryTouched ? cardExpiryError : null}
                    >
                      <input
                        required
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiryInput(e.target.value))}
                        onBlur={() => setCardExpiryTouched(true)}
                        placeholder="MM/YY"
                        className="input-field"
                        style={{
                          ...inputStyle,
                          borderColor:
                            cardExpiryTouched && cardExpiryError
                              ? "var(--color-error)"
                              : inputStyle.borderColor,
                        }}
                        aria-invalid={cardExpiryTouched && !!cardExpiryError}
                      />
                    </Field>
                    <Field label="CVC" required error={cardCvcTouched ? cardCvcError : null}>
                      <input
                        required
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(formatCvcInput(e.target.value))}
                        onBlur={() => setCardCvcTouched(true)}
                        placeholder="CVC"
                        className="input-field"
                        style={{
                          ...inputStyle,
                          borderColor:
                            cardCvcTouched && cardCvcError
                              ? "var(--color-error)"
                              : inputStyle.borderColor,
                        }}
                        aria-invalid={cardCvcTouched && !!cardCvcError}
                      />
                    </Field>
                  </div>
                </div>
              )}
            </section>

            <div className="flex flex-col gap-3 pt-1">
              <button type="submit" className="btn btn-primary h-[54px] w-full gap-1.5">
                <span>Purchase —</span>
                <DirhamPrice amount={totalValue} variant="white" />
              </button>
              <p
                className="type-caption-sm flex items-center justify-center gap-1.5 text-center"
                style={{ color: "var(--color-text-secondary)" }}
              >
                <ShieldCheck size={14} /> Secure checkout · Encrypted payment
              </p>
            </div>
          </form>

          {/* RIGHT: summary */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24 lg:h-fit">
            <div
              className="panel-surface flex flex-col gap-5 p-5 md:p-7"
              style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-bg)" }}
            >
              <div className="flex flex-col gap-1">
                <h2 className="type-display-sm" style={{ color: "var(--color-text-primary)" }}>
                  Summary
                </h2>
                <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
                  Review your items before completing your purchase.
                </p>
              </div>

              <div className="flex flex-col">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border-t py-3.5"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="media-rounded relative h-16 w-16 flex-shrink-0"
                        style={{ backgroundColor: "var(--color-surface-muted)" }}
                      >
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span
                          className="type-title-sm"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {item.productName}
                        </span>
                        <span
                          className="type-caption-sm"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          {item.variantColor} · {item.quantity} item{item.quantity > 1 ? "s" : ""}
                        </span>
                      </div>
                      <DirhamPrice amount={item.price * item.quantity} size="sm" />
                    </div>
                    {(item.addOns ?? []).map((ao) => (
                      <div key={ao.id} className="mt-2.5 flex items-center gap-4 pl-20">
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span
                            className="type-caption-sm"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {ao.name}
                          </span>
                          <span
                            className="type-caption-sm"
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            Add-on · {ao.quantity} item{ao.quantity > 1 ? "s" : ""}
                          </span>
                        </div>
                        <DirhamPrice amount={ao.price * ao.quantity} size="sm" />
                      </div>
                    ))}
                  </div>
                ))}
                {addOns.map((ao) => (
                  <div
                    key={ao.id}
                    className="border-t py-3.5"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="media-rounded relative h-16 w-16 flex-shrink-0"
                        style={{ backgroundColor: "var(--color-surface-muted)" }}
                      >
                        <Image src={ao.image} alt={ao.name} fill className="object-cover" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span
                          className="type-title-sm"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {ao.name}
                        </span>
                        <span
                          className="type-caption-sm"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Add-on · {ao.quantity ?? 1} item{(ao.quantity ?? 1) > 1 ? "s" : ""}
                        </span>
                      </div>
                      <DirhamPrice amount={ao.price * (ao.quantity ?? 1)} size="sm" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount */}
              <div
                className="flex flex-col gap-3.5 rounded-[var(--radius-md)] p-4"
                style={{ backgroundColor: "var(--color-surface)" }}
              >
                <div className="flex gap-2.5">
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={(e) => {
                      setDiscountCode(e.target.value);
                      setDiscountApplied(false);
                    }}
                    readOnly={newsletter}
                    className="input-field h-[46px] flex-1"
                    style={{
                      borderColor: "var(--color-border)",
                      backgroundColor: "var(--color-bg)",
                    }}
                  />
                  <button
                    type="button"
                    onClick={applyDiscountCode}
                    className="btn h-[46px] px-5"
                    style={{
                      backgroundColor: hasDiscount
                        ? "var(--color-success)"
                        : "var(--color-text-primary)",
                      color: "#fff",
                      border: "none",
                    }}
                  >
                    {hasDiscount ? "Applied" : "Apply"}
                  </button>
                </div>
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={toggleNewsletter}
                    className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 accent-[var(--color-accent-amber)]"
                  />
                  <span
                    className="type-caption-sm leading-relaxed"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    Sign up to our newsletter and save 10%{" "}
                    <span style={{ color: "var(--color-text-secondary)" }}>
                      on this order. New designs and studio news, once a month — no spam.
                    </span>
                  </span>
                </label>
              </div>

              {/* Totals */}
              <div
                className="flex flex-col gap-2.5 border-t pt-4"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="type-body-sm flex justify-between">
                  <span style={{ color: "var(--color-text-secondary)" }}>Subtotal</span>
                  <DirhamPrice amount={subtotalValue} />
                </div>
                {hasDiscount && (
                  <div className="type-body-sm flex justify-between">
                    <span style={{ color: "var(--color-success)" }}>
                      {newsletter ? "Newsletter discount (10%)" : "Discount code (10%)"}
                    </span>
                    <span
                      className="inline-flex items-center gap-0.5"
                      style={{ color: "var(--color-success)" }}
                    >
                      − <DirhamPrice amount={discountAmount} />
                    </span>
                  </div>
                )}
                <div className="type-body-sm flex justify-between">
                  <span style={{ color: "var(--color-text-secondary)" }}>Shipping</span>
                  <span style={{ color: "var(--color-success)" }}>Free</span>
                </div>
                <div
                  className="flex items-baseline justify-between border-t pt-3.5"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <span className="type-title-sm" style={{ color: "var(--color-text-primary)" }}>
                    Total
                  </span>
                  <DirhamPrice amount={totalValue} size="lg" />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 px-2">
              {["Free shipping", "30-day returns", "1-year warranty"].map((t, i, arr) => (
                <span key={t} className="flex items-center gap-3.5">
                  <span
                    className="type-caption-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {t}
                  </span>
                  {i < arr.length - 1 && <span style={{ color: "var(--color-border)" }}>·</span>}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="type-body-sm" style={{ color: "var(--color-text-primary)" }}>
        {label} {required && <span style={{ color: "var(--color-accent-amber)" }}>*</span>}
      </span>
      {children}
      {error && (
        <span className="type-caption-sm" style={{ color: "var(--color-error)" }}>
          {error}
        </span>
      )}
    </label>
  );
}

function PaymentOption({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-start gap-2.5 rounded-[var(--radius-md)] p-4 text-left transition-colors"
      style={{
        border: `1.5px solid ${active ? "var(--color-accent-amber)" : "var(--color-border)"}`,
        backgroundColor: "var(--color-bg)",
      }}
    >
      {icon}
      <span className="type-body-sm" style={{ color: "var(--color-text-primary)" }}>
        {label}
      </span>
      <span
        className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full"
        style={{
          border: `1.5px solid ${active ? "var(--color-accent-amber)" : "var(--color-border)"}`,
        }}
      >
        {active && (
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: "var(--color-accent-amber)" }}
          />
        )}
      </span>
    </button>
  );
}

function CardIcon({ active }: { active: boolean }) {
  const color = active ? "var(--color-accent-amber)" : "var(--color-text-secondary)";
  return (
    <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
      <rect x="1" y="2" width="24" height="16" rx="3" stroke={color} strokeWidth="1.8" />
      <path d="M1 7h24" stroke={color} strokeWidth="1.8" />
      <path d="M5 13h6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function AppleIcon() {
  return <Image src="/apple-logo-svgrepo-com.svg" alt="Apple Pay" width={22} height={20} />;
}

// function TabbyIcon() {
//   return (
//     <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
//       <rect
//         x="2"
//         y="4"
//         width="18"
//         height="13"
//         rx="3"
//         stroke="var(--color-text-primary)"
//         strokeWidth="1.8"
//       />
//       <path
//         d="M6 9h10M6 12.5h6"
//         stroke="var(--color-text-primary)"
//         strokeWidth="1.8"
//         strokeLinecap="round"
//       />
//     </svg>
//   );
// }
