"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  return (
    <header
      className="sticky top-0 z-50 w-full border-b"
      style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex-shrink-0">
          <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={120} height={28} priority />
        </Link>

        {/* Center: Nav Links (desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <div className="relative">
            <button
              className="flex items-center gap-1 text-sm font-medium transition-colors"
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
                  className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-48 rounded-xl shadow-lg border p-2"
                  style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-border)" }}
                >
                  {[
                    { label: "All Products", href: "/shop" },
                    { label: "Desk Lamps", href: "/shop/desk-lamps" },
                    { label: "Table Lamps", href: "/shop/table-lamps" },
                    { label: "Floor Lamps", href: "/shop/floor-lamps" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 text-sm rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors"
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
          <Link
            href="/about"
            className="text-sm font-medium transition-colors hover:text-[var(--color-accent-amber)]"
            style={{ color: "var(--color-text-primary)" }}
          >
            about
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium transition-colors hover:text-[var(--color-accent-amber)]"
            style={{ color: "var(--color-text-primary)" }}
          >
            contact us
          </Link>
        </nav>

        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          <Link href="/shop" aria-label="Search">
            <Search size={20} style={{ color: "var(--color-text-primary)" }} className="hover:opacity-70 transition-opacity" />
          </Link>
          <Link href="/cart" className="relative" aria-label="Cart">
            <ShoppingCart size={20} style={{ color: "var(--color-text-primary)" }} className="hover:opacity-70 transition-opacity" />
            {itemCount > 0 && (
              <span
                className="absolute -top-2 -right-2 w-4 h-4 rounded-full text-[10px] font-semibold flex items-center justify-center text-white"
                style={{ backgroundColor: "var(--color-accent-amber)" }}
              >
                {itemCount}
              </span>
            )}
          </Link>
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X size={20} style={{ color: "var(--color-text-primary)" }} />
            ) : (
              <Menu size={20} style={{ color: "var(--color-text-primary)" }} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div
          className="md:hidden border-t px-6 py-4 flex flex-col gap-4"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}
        >
          <Link href="/shop" className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }} onClick={() => setMobileOpen(false)}>
            Collection
          </Link>
          <Link href="/about" className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }} onClick={() => setMobileOpen(false)}>
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }} onClick={() => setMobileOpen(false)}>
            Contact Us
          </Link>
        </div>
      )}
    </header>
  );
}
