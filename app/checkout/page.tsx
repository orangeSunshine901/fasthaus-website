"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ChevronDown, ShieldCheck } from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";
import DirhamPrice from "@/components/ui/DirhamPrice";
import { useCartStore } from "@/lib/store/cart";
import { capture } from "@/lib/analytics/client";
import { analyticsEvents } from "@/lib/analytics/events";
import { formatPhoneInput } from "@/lib/checkout/phone-input";
import GeideaExpressWallets from "@/components/checkout/GeideaExpressWallets";

const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

type CheckoutSession = {
  orderId: string;
  sessionId: string;
  expiresAt: string;
  cardRedirectUrl: string;
};

type PreparedCheckoutSession = CheckoutSession & { detailsKey: string };

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
  const { items, addOns, subtotal } = useCartStore();

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

  const emailError =
    email.length > 0 && !isValidEmail(email) ? "Enter a valid email address." : null;
  const phoneError =
    phone.length > 0 && !isValidAePhone(phone) ? "Enter a valid UAE mobile number." : null;

  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [walletSession, setWalletSession] = useState<PreparedCheckoutSession | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [walletRetry, setWalletRetry] = useState(0);

  const subtotalValue = subtotal();
  const hasDiscount = newsletter || discountApplied;
  const discountAmount = hasDiscount ? subtotalValue * 0.1 : 0;
  const totalValue = subtotalValue - discountAmount;
  const checkoutDetailsReady =
    isValidEmail(email) &&
    isValidAePhone(phone) &&
    !!fullName.trim() &&
    !!streetAddress.trim() &&
    !!unitVilla.trim() &&
    !!buildingCluster.trim();
  const checkoutDetailsKey = JSON.stringify([
    fullName,
    email,
    phone,
    streetAddress,
    unitVilla,
    buildingCluster,
    landmark,
    emirate,
    poBox,
    hasDiscount,
    totalValue,
  ]);
  const activeWalletSession =
    walletSession?.detailsKey === checkoutDetailsKey ? walletSession : null;

  useEffect(() => {
    if (items.length > 0)
      capture(analyticsEvents.checkoutStarted, {
        item_count: items.reduce((sum, item) => sum + item.quantity, 0),
        cart_value: totalValue,
        currency: "AED",
      });
  }, [items, totalValue]);

  const requestCheckoutSession = useCallback(
    async (signal?: AbortSignal): Promise<CheckoutSession> => {
      const [firstName, ...lastNameParts] = fullName.trim().split(/\s+/);
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal,
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
          discountCode: hasDiscount ? "WELCOME10" : undefined,
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
      return {
        orderId: body.orderId,
        sessionId: body.sessionId,
        expiresAt: body.expiresAt,
        cardRedirectUrl: body.cardRedirectUrl,
      };
    },
    [
      buildingCluster,
      email,
      emirate,
      fullName,
      hasDiscount,
      landmark,
      phone,
      poBox,
      streetAddress,
      unitVilla,
    ]
  );

  useEffect(() => {
    if (!checkoutDetailsReady || items.length === 0 || activeWalletSession || purchasing) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setWalletLoading(true);
      setWalletError(null);
      try {
        const session = await requestCheckoutSession(controller.signal);
        setWalletSession({ ...session, detailsKey: checkoutDetailsKey });
      } catch (error) {
        if (!controller.signal.aborted) {
          setWalletError(
            error instanceof Error ? error.message : "Express checkout could not be started."
          );
        }
      } finally {
        if (!controller.signal.aborted) setWalletLoading(false);
      }
    }, 600);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    activeWalletSession,
    checkoutDetailsKey,
    checkoutDetailsReady,
    items.length,
    purchasing,
    requestCheckoutSession,
    walletRetry,
  ]);

  useEffect(() => {
    if (!walletSession) return;
    const remaining = Date.parse(walletSession.expiresAt) - Date.now() - 30_000;
    const timer = window.setTimeout(() => setWalletSession(null), Math.max(0, remaining));
    return () => window.clearTimeout(timer);
  }, [walletSession]);

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

  async function startCheckout() {
    setEmailTouched(true);
    setPhoneTouched(true);

    if (!checkoutDetailsReady) return;
    setPurchasing(true);
    setPurchaseError(null);
    try {
      const session = activeWalletSession ?? (await requestCheckoutSession());
      window.location.assign(session.cardRedirectUrl);
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
          <form onSubmit={handlePurchase} noValidate className="flex flex-col gap-7">
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
                          phoneTouched && phoneError
                            ? "var(--color-error)"
                            : inputStyle.borderColor,
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
                <Field label="Address" required>
                  <input
                    required
                    autoComplete="address-line1"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Street name and Area"
                    className="input-field"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Apt & Floor No. / Villa No." required>
                  <input
                    required
                    autoComplete="address-line2"
                    value={unitVilla}
                    onChange={(e) => setUnitVilla(e.target.value)}
                    placeholder="Apt 804, Floor 8 or Villa 12"
                    className="input-field"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Building / Cluster name" required>
                  <input
                    required
                    autoComplete="address-line3"
                    value={buildingCluster}
                    onChange={(e) => setBuildingCluster(e.target.value)}
                    placeholder="Marina Heights or Cluster J"
                    className="input-field"
                    style={inputStyle}
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

              <section
                className="flex flex-col gap-4 border-t pt-6"
                style={{ borderColor: "var(--color-border)" }}
              >
                <h2 className="eyebrow" style={{ color: "var(--color-text-secondary)" }}>
                  Express checkout
                </h2>
                {!checkoutDetailsReady ? (
                  <p className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
                    Complete the required contact and delivery details to enable supported wallets.
                  </p>
                ) : activeWalletSession ? (
                  <>
                    <GeideaExpressWallets
                      sessionId={activeWalletSession.sessionId}
                      orderId={activeWalletSession.orderId}
                    />
                    <p
                      className="type-caption-sm text-center"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      Apple Pay, Google Pay, and Samsung Pay appear automatically on supported
                      devices and browsers.
                    </p>
                  </>
                ) : walletLoading ? (
                  <div
                    className="flex min-h-[60px] items-center justify-center rounded-[var(--radius-md)] border"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span className="type-body-sm" style={{ color: "var(--color-text-secondary)" }}>
                      Loading secure wallets…
                    </span>
                  </div>
                ) : walletError ? (
                  <div className="flex flex-col gap-2.5">
                    <p
                      role="alert"
                      className="type-body-sm"
                      style={{ color: "var(--color-error)" }}
                    >
                      {walletError}
                    </p>
                    <button
                      type="button"
                      onClick={() => setWalletRetry((value) => value + 1)}
                      className="btn-text w-fit"
                    >
                      Retry express checkout
                    </button>
                  </div>
                ) : null}
              </section>

              <div className="flex flex-col gap-3 pt-1">
                {activeWalletSession && (
                  <div className="flex items-center gap-3" aria-hidden="true">
                    <span
                      className="h-px flex-1"
                      style={{ backgroundColor: "var(--color-border)" }}
                    />
                    <span
                      className="type-caption-sm"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      or pay by card
                    </span>
                    <span
                      className="h-px flex-1"
                      style={{ backgroundColor: "var(--color-border)" }}
                    />
                  </div>
                )}
                {purchaseError && (
                  <p role="alert" className="type-body-sm" style={{ color: "var(--color-error)" }}>
                    {purchaseError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={purchasing || walletLoading}
                  className="btn btn-primary h-[54px] w-full gap-1.5 disabled:opacity-60"
                >
                  <ShieldCheck size={16} />
                  <span>{purchasing ? "Redirecting securely…" : "Pay securely by card —"}</span>
                  {!purchasing && <DirhamPrice amount={totalValue} variant="white" />}
                </button>
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
              {["Free shipping", "14-day eligible returns", "1-year warranty"].map(
                (t, i, arr) => (
                <span key={t} className="flex items-center gap-3.5">
                  <span
                    className="type-caption-sm"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {t}
                  </span>
                  {i < arr.length - 1 && <span style={{ color: "var(--color-border)" }}>·</span>}
                </span>
                )
              )}
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
