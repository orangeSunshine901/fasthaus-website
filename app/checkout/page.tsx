"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CalendarCheck, ChevronDown, Shield, ShieldCheck, Truck } from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";
import { Tooltip } from "radix-ui";
import DirhamPrice from "@/components/ui/DirhamPrice";
import { useCartStore } from "@/lib/store/cart";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";
import { formatPhoneInput } from "@/lib/checkout/phone-input";
import { discountRateFor, WELCOME_DISCOUNT_CODE } from "@/lib/checkout/discount";
import { startGeideaCardCheckout } from "@/lib/payment/geidea-client";

const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

const CHECKOUT_BENEFITS = [
  { icon: Truck, label: "Free shipping" },
  { icon: CalendarCheck, label: "14-day eligible returns" },
  { icon: Shield, label: "1-year warranty" },
];

type CheckoutSession = {
  orderId: string;
  sessionId: string;
  expiresAt: string;
  cardRedirectUrl: string;
};

const inputStyle = {
  borderColor: "var(--color-border)",
  backgroundColor: "var(--color-surface)",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

function isValidAePhone(value: string): boolean {
  return value.trim().length > 0 && isValidPhoneNumber(value, "AE");
}

export default function CheckoutPage() {
  const { items, addOns, subtotal, pending } = useCartStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [streetAddress, setStreetAddress] = useState("");
  const [unitVilla, setUnitVilla] = useState("");
  const [buildingCluster, setBuildingCluster] = useState("");
  const [landmark, setLandmark] = useState("");
  const [emirate, setEmirate] = useState("Dubai");
  const [poBox, setPoBox] = useState("");
  const [validationAttempted, setValidationAttempted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const fullNameError = fullName.trim() ? null : "Enter your full name.";
  const emailError = !email.trim()
    ? "Enter your email address."
    : !isValidEmail(email)
      ? "Enter a valid email address."
      : null;
  const phoneError = !phone.trim()
    ? "Enter your phone number."
    : !isValidAePhone(phone)
      ? "Enter a valid UAE mobile number."
      : null;
  const streetAddressError = streetAddress.trim() ? null : "Enter your street and area.";
  const unitVillaError = unitVilla.trim() ? null : "Enter your apartment, floor, or villa number.";
  const buildingClusterError = buildingCluster.trim()
    ? null
    : "Enter your building or cluster name.";

  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [newsletter, setNewsletter] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseNotice, setPurchaseNotice] = useState<string | null>(null);

  const subtotalValue = subtotal();
  const hasDiscount = newsletter || discountApplied;
  const discountAmount = hasDiscount ? subtotalValue * discountRateFor(WELCOME_DISCOUNT_CODE) : 0;
  const totalValue = subtotalValue - discountAmount;
  const cartSyncing = pending.length > 0;
  const checkoutDetailsReady =
    !fullNameError &&
    !emailError &&
    !phoneError &&
    !streetAddressError &&
    !unitVillaError &&
    !buildingClusterError;
  const checkoutDisabled = !checkoutDetailsReady || purchasing || cartSyncing;

  useEffect(() => {
    if (items.length > 0)
      capture(analyticsEvents.checkoutStarted, {
        item_count: items.reduce((sum, item) => sum + item.quantity, 0),
        cart_value: totalValue,
        currency: "AED",
      });
  }, [items, totalValue]);

  async function requestCheckoutSession(): Promise<CheckoutSession> {
    const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/);
    const response = await fetch("/api/checkout/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contact: { email, phone },
        shippingAddress: {
          firstName,
          lastName: lastNameParts.join(" ") || firstName,
          streetAddress,
          line1: unitVilla,
          line2: buildingCluster,
          landmark: landmark || undefined,
          emirate,
          postalCode: poBox || undefined,
        },
        discountCode: hasDiscount ? WELCOME_DISCOUNT_CODE : undefined,
      }),
    });
    const body = (await response.json()) as Partial<CheckoutSession> & {
      error?: { message?: string };
    };
    if (
      !response.ok ||
      !body.orderId ||
      !body.sessionId ||
      !body.expiresAt ||
      !body.cardRedirectUrl
    ) {
      throw new Error(body.error?.message ?? "Checkout could not be started.");
    }
    return body as CheckoutSession;
  }

  function toggleNewsletter() {
    setNewsletter((prev) => {
      const next = !prev;
      setDiscountCode(next ? WELCOME_DISCOUNT_CODE : "");
      setDiscountApplied(false);
      setDiscountError(null);
      return next;
    });
  }

  function applyDiscountCode() {
    const valid = discountRateFor(discountCode) > 0;
    setDiscountApplied(valid);
    setDiscountError(valid ? null : "That discount code isn’t valid.");
  }

  async function startCheckout() {
    setValidationAttempted(true);
    setEmailTouched(true);
    setPhoneTouched(true);
    setPurchaseError(null);
    setPurchaseNotice(null);

    if (!checkoutDetailsReady) {
      window.requestAnimationFrame(() => {
        const firstInvalidField =
          formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]');
        firstInvalidField?.focus({ preventScroll: true });
        firstInvalidField?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    if (cartSyncing) return;
    setPurchasing(true);
    try {
      const session = await requestCheckoutSession();
      if (session.sessionId.startsWith("test-geidea-session-")) {
        window.location.assign(session.cardRedirectUrl);
        return;
      }
      startGeideaCardCheckout(session.sessionId, {
        onSuccess: () => {
          window.location.assign(`/order/${session.orderId}`);
        },
        onError: (data) => {
          setPurchaseError(
            data.detailedResponseMessage ??
              data.responseMessage ??
              "The payment could not be completed. Please try again."
          );
          setPurchasing(false);
        },
        onCancel: () => {
          setPurchaseNotice(
            "Payment cancelled. No charge was made and your details are still here."
          );
          setPurchasing(false);
        },
      });
    } catch (error) {
      setPurchaseError(error instanceof Error ? error.message : "Checkout could not be started.");
      setPurchasing(false);
    }
  }

  function handlePurchase(e: React.FormEvent) {
    e.preventDefault();
    void startCheckout();
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
          <form ref={formRef} onSubmit={handlePurchase} noValidate className="flex flex-col gap-7">
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

            <>
              {/* Your details */}
              <section className="flex flex-col gap-4">
                <h2 className="eyebrow" style={{ color: "var(--color-text-secondary)" }}>
                  Your details
                </h2>
                <Field
                  label="Full name"
                  required
                  error={validationAttempted ? fullNameError : null}
                  errorId="full-name-error"
                >
                  <input
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ava Smith"
                    className="input-field"
                    style={{
                      ...inputStyle,
                      borderColor:
                        validationAttempted && fullNameError
                          ? "var(--color-error)"
                          : inputStyle.borderColor,
                    }}
                    aria-invalid={validationAttempted && !!fullNameError}
                    aria-describedby={
                      validationAttempted && fullNameError ? "full-name-error" : undefined
                    }
                  />
                </Field>
                <Field
                  label="Email"
                  required
                  error={emailTouched || validationAttempted ? emailError : null}
                  errorId="email-error"
                >
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
                        (emailTouched || validationAttempted) && emailError
                          ? "var(--color-error)"
                          : inputStyle.borderColor,
                    }}
                    aria-invalid={(emailTouched || validationAttempted) && !!emailError}
                    aria-describedby={
                      (emailTouched || validationAttempted) && emailError
                        ? "email-error"
                        : undefined
                    }
                  />
                </Field>
                <Field
                  label="Phone number"
                  required
                  error={phoneTouched || validationAttempted ? phoneError : null}
                  errorId="phone-error"
                >
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
                      onChange={(event) => setPhone(event.currentTarget.value)}
                      onBlur={(event) => {
                        setPhone(formatPhoneInput(event.currentTarget.value));
                        setPhoneTouched(true);
                      }}
                      placeholder="50 123 4567"
                      className="input-field flex-1"
                      style={{
                        ...inputStyle,
                        borderColor:
                          (phoneTouched || validationAttempted) && phoneError
                            ? "var(--color-error)"
                            : inputStyle.borderColor,
                      }}
                      aria-invalid={(phoneTouched || validationAttempted) && !!phoneError}
                      aria-describedby={
                        (phoneTouched || validationAttempted) && phoneError
                          ? "phone-error"
                          : undefined
                      }
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
                <Field
                  label="Address"
                  required
                  error={validationAttempted ? streetAddressError : null}
                  errorId="street-address-error"
                >
                  <input
                    required
                    autoComplete="address-line1"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Street name and Area"
                    className="input-field"
                    style={{
                      ...inputStyle,
                      borderColor:
                        validationAttempted && streetAddressError
                          ? "var(--color-error)"
                          : inputStyle.borderColor,
                    }}
                    aria-invalid={validationAttempted && !!streetAddressError}
                    aria-describedby={
                      validationAttempted && streetAddressError ? "street-address-error" : undefined
                    }
                  />
                </Field>
                <Field
                  label="Apt & Floor No. / Villa No."
                  required
                  error={validationAttempted ? unitVillaError : null}
                  errorId="unit-villa-error"
                >
                  <input
                    required
                    autoComplete="address-line2"
                    value={unitVilla}
                    onChange={(e) => setUnitVilla(e.target.value)}
                    placeholder="Apt 804, Floor 8 or Villa 12"
                    className="input-field"
                    style={{
                      ...inputStyle,
                      borderColor:
                        validationAttempted && unitVillaError
                          ? "var(--color-error)"
                          : inputStyle.borderColor,
                    }}
                    aria-invalid={validationAttempted && !!unitVillaError}
                    aria-describedby={
                      validationAttempted && unitVillaError ? "unit-villa-error" : undefined
                    }
                  />
                </Field>
                <Field
                  label="Building / Cluster name"
                  required
                  error={validationAttempted ? buildingClusterError : null}
                  errorId="building-cluster-error"
                >
                  <input
                    required
                    autoComplete="address-line3"
                    value={buildingCluster}
                    onChange={(e) => setBuildingCluster(e.target.value)}
                    placeholder="Marina Heights or Cluster J"
                    className="input-field"
                    style={{
                      ...inputStyle,
                      borderColor:
                        validationAttempted && buildingClusterError
                          ? "var(--color-error)"
                          : inputStyle.borderColor,
                    }}
                    aria-invalid={validationAttempted && !!buildingClusterError}
                    aria-describedby={
                      validationAttempted && buildingClusterError
                        ? "building-cluster-error"
                        : undefined
                    }
                  />
                </Field>
                <Field label="Landmark">
                  <input
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    placeholder="Near the main entrance (optional)"
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

              <div className="flex flex-col gap-3 pt-1">
                {purchaseError && (
                  <p role="alert" className="type-body-sm" style={{ color: "var(--color-error)" }}>
                    {purchaseError}
                  </p>
                )}
                {purchaseNotice && (
                  <p
                    role="status"
                    className="type-body-sm"
                    style={{ color: "var(--color-accent-amber-hover)" }}
                  >
                    {purchaseNotice}
                  </p>
                )}
                <Tooltip.Provider delayDuration={200}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <span className="block" tabIndex={!checkoutDetailsReady ? 0 : -1}>
                        <button
                          type="submit"
                          disabled={checkoutDisabled}
                          className="btn btn-primary h-[54px] w-full gap-1.5 enabled:cursor-pointer disabled:opacity-60"
                          style={
                            checkoutDisabled
                              ? {
                                  backgroundColor: "var(--color-accent-amber-hover)",
                                  borderColor: "var(--color-accent-amber-hover)",
                                }
                              : undefined
                          }
                        >
                          <ShieldCheck size={16} />
                          <span>
                            {cartSyncing
                              ? "Preparing cart…"
                              : purchasing
                                ? "Opening secure payment…"
                                : "Pay securely by card —"}
                          </span>
                          {!purchasing && !cartSyncing && (
                            <DirhamPrice amount={totalValue} variant="white" />
                          )}
                        </button>
                      </span>
                    </Tooltip.Trigger>
                    {!checkoutDetailsReady && (
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="top"
                          sideOffset={10}
                          className="z-50 max-w-72 rounded-md bg-[var(--color-text-primary)] px-3 py-2 text-center text-xs font-medium text-white shadow-md"
                        >
                          Fill in all mandatory fields to proceed with checkout.
                          <Tooltip.Arrow className="fill-[var(--color-text-primary)]" />
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    )}
                  </Tooltip.Root>
                </Tooltip.Provider>
                <p
                  className="type-caption-sm flex items-center justify-center gap-1.5 text-center"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Secure checkout by Geidea · Encrypted payment
                </p>
              </div>
            </>
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
                      setDiscountError(null);
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
                {discountError && (
                  <p
                    className="type-caption-sm"
                    style={{ color: "var(--color-error)" }}
                    role="alert"
                  >
                    {discountError}
                  </p>
                )}
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

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 px-2">
              {CHECKOUT_BENEFITS.map(({ icon: Icon, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <Icon
                    size={14}
                    aria-hidden="true"
                    style={{ color: "var(--color-text-primary)" }}
                  />
                  <span
                    className="type-caption-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {label}
                  </span>
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
  errorId,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  errorId?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="type-body-sm" style={{ color: "var(--color-text-primary)" }}>
        {label} {required && <span style={{ color: "var(--color-accent-amber)" }}>*</span>}
      </span>
      {children}
      {error && (
        <span id={errorId} className="type-caption-sm" style={{ color: "var(--color-error)" }}>
          {error}
        </span>
      )}
    </label>
  );
}
