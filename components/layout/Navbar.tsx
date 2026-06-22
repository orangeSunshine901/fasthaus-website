"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";

const SHOP_LINKS = [
  { label: "All Products", href: "/shop" },
  { label: "Desk Lamps", href: "/shop/desk-lamps" },
  { label: "Table Lamps", href: "/shop/table-lamps" },
  { label: "Floor Lamps", href: "/shop/floor-lamps" },
];

const MOBILE_NAV = [
  { label: "Collection", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact us", href: "/contact" },
];

function CartBadge({ size = 20 }: { size?: number }) {
  const itemCount = useCartStore((s) => s.itemCount());
  return (
    <Link href="/cart" className="relative" aria-label="Cart">
      <ShoppingCart size={size} style={{ color: "var(--color-text-primary)" }} className="transition-opacity hover:opacity-70" />
      {itemCount > 0 && (
        <span
          className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-[10px] font-semibold flex items-center justify-center text-white"
          style={{ backgroundColor: "var(--color-accent-amber)" }}
        >
          {itemCount}
        </span>
      )}
    </Link>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full border-b"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
      >
        {/* Mobile nav — hamburger | logo | cart */}
        <div className="flex h-14 items-center justify-between px-5 md:hidden">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} style={{ color: "var(--color-text-primary)" }} />
          </button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={100} height={24} priority />
          </Link>
          <CartBadge size={22} />
        </div>

        {/* Desktop nav — logo | links | icons */}
        <div className="container-page hidden h-20 items-center justify-between md:flex">
          <Link href="/" className="flex-shrink-0">
            <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={120} height={28} priority />
          </Link>

          {/* Center links */}
          <nav className="flex items-center gap-8">
            <div className="relative">
              <button
                className="type-title-sm flex items-center gap-1 transition-colors"
                style={{ color: shopOpen ? "var(--color-accent-amber)" : "var(--color-text-primary)" }}
                onClick={() => setShopOpen(!shopOpen)}
              >
                collection
                <ChevronDown
                  size={14}
                  className="transition-transform"
                  style={{ transform: shopOpen ? "rotate(180deg)" : "rotate(0)" }}
                />
              </button>
              {shopOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShopOpen(false)} />
                  <div
                    className="absolute left-1/2 top-8 z-20 w-48 -translate-x-1/2 rounded-[var(--radius-md)] border p-2 shadow-lg"
                    style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
                  >
                    {SHOP_LINKS.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="type-body-sm block rounded-[var(--radius-sm)] px-3 py-2 transition-colors hover:bg-[var(--color-surface-muted)]"
                        style={{ color: "var(--color-text-primary)" }}
                        onClick={() => setShopOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
            <Link href="/about" className="type-title-sm transition-colors hover:text-[var(--color-accent-amber)]" style={{ color: "var(--color-text-primary)" }}>
              about
            </Link>
            <Link href="/contact" className="type-title-sm transition-colors hover:text-[var(--color-accent-amber)]" style={{ color: "var(--color-text-primary)" }}>
              contact us
            </Link>
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <Link href="/shop" aria-label="Search">
              <Search size={20} style={{ color: "var(--color-text-primary)" }} className="hover:opacity-70 transition-opacity" />
            </Link>
            <CartBadge />
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: "var(--color-bg)" }}
        >
          {/* Overlay header */}
          <div
            className="flex items-center justify-between px-4 h-14 border-b flex-shrink-0"
            style={{ borderColor: "var(--color-border)" }}
          >
            <Link href="/" onClick={() => setMobileOpen(false)}>
              <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={100} height={24} />
            </Link>
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <X size={22} style={{ color: "var(--color-text-primary)" }} />
            </button>
          </div>

          {/* Overlay links */}
          <nav className="flex flex-col px-6 pt-4">
            {MOBILE_NAV.map((link) => (
              <Link
                key={link.href}
                href={link.href}
            className="type-display-sm border-b py-5"
                style={{ color: "var(--color-text-primary)", borderColor: "var(--color-border)" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Bottom cart shortcut */}
          <div className="px-6 mt-auto pb-8">
            <Link
              href="/cart"
              className="type-caption flex items-center gap-3 py-5"
              style={{ color: "var(--color-text-secondary)" }}
              onClick={() => setMobileOpen(false)}
            >
              <ShoppingCart size={18} />
              View Cart
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
