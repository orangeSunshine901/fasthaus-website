"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown, Search, ShoppingCart, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { FloatingNav } from "@/components/ui/floating-navbar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const SHOP_LINKS = [
  { label: "All Products", href: "/collection" },
  { label: "Desk Lamps", href: "/collection/desk-lamps" },
  { label: "Table Lamps", href: "/collection/table-lamps" },
  { label: "Floor Lamps", href: "/collection/floor-lamps" },
];

const MOBILE_NAV = [
  { label: "Collection", href: "/collection" },
  { label: "About", href: "/about" },
  { label: "Contact us", href: "/contact" },
];

const SHOP_FEATURES = [
  {
    label: "Desk lamps",
    href: "/collection/desk-lamps",
    description: "Focused lighting for workspaces, studios, and reading corners.",
  },
  {
    label: "Table lamps",
    href: "/collection/table-lamps",
    description: "Sculptural pieces for sideboards, bedsides, and dining surfaces.",
  },
  {
    label: "Floor lamps",
    href: "/collection/floor-lamps",
    description: "Tall ambient lighting for lounges and open-plan rooms.",
  },
];

function useCartHydrated() {
  return useSyncExternalStore(
    (onStoreChange) => useCartStore.persist.onFinishHydration(onStoreChange),
    () => useCartStore.persist.hasHydrated(),
    () => false
  );
}

function CartBadge({ size = 20, className = "" }: { size?: number; className?: string }) {
  const itemCount = useCartStore((s) => s.itemCount());
  const cartHydrated = useCartHydrated();

  return (
    <Link href="/cart" className={`relative inline-flex ${className}`} aria-label="Cart">
      <ShoppingCart size={size} className="transition-opacity hover:opacity-70" />
      {cartHydrated && itemCount > 0 && (
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

function CollectionMegaMenuContent() {
  return (
    <div className="grid grid-cols-[0.9fr_1.1fr] gap-3">
      <NavigationMenuLink asChild>
        <Link
          href="/collection"
          className="flex min-h-[220px] flex-col justify-between rounded-[var(--radius-sm)] bg-[var(--color-text-primary)] p-5 text-white outline-none transition-colors hover:bg-[#2a272a] focus:bg-[#2a272a]"
        >
          <div>
            <p className="text-sm font-medium text-white/65">Fasthaus collection</p>
            <p className="mt-3 text-2xl font-semibold leading-7">
              Warm, sculptural lighting for modern rooms.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-amber)]">
            Shop all
            <ArrowRight size={15} aria-hidden="true" />
          </span>
        </Link>
      </NavigationMenuLink>

      <div className="grid gap-1">
        {SHOP_FEATURES.map((item) => (
          <NavigationMenuLink key={item.href} asChild>
            <Link
              href={item.href}
              className="rounded-[var(--radius-sm)] p-4 outline-none transition-colors hover:bg-[var(--color-surface-muted)] focus:bg-[var(--color-surface-muted)]"
            >
              <span className="block text-base font-semibold leading-6">{item.label}</span>
              <span className="mt-1 block text-sm leading-5 text-[var(--color-text-secondary)]">
                {item.description}
              </span>
            </Link>
          </NavigationMenuLink>
        ))}
        <div className="mt-2 grid grid-cols-2 gap-1 border-t border-[var(--color-border)] pt-2">
          {SHOP_LINKS.slice(0, 2).map((item) => (
            <NavigationMenuLink key={item.href} asChild>
              <Link
                href={item.href}
                className="rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold outline-none transition-colors hover:bg-[var(--color-surface-muted)] focus:bg-[var(--color-surface-muted)]"
              >
                {item.label}
              </Link>
            </NavigationMenuLink>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const usesHeroOverlay =
    pathname === "/" || pathname === "/collection" || pathname.startsWith("/collection/");
  const desktopTextColor = "#FFFDF5";
  const desktopNavStyle = {
    color: desktopTextColor,
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    backgroundColor: "rgba(33, 33, 33, 0.36)",
    boxShadow:
      "rgba(255, 255, 255, 0.02) -3.35374px -3.35374px 167.687px 0px inset, rgba(0, 0, 0, 0.08) 0px 4px 22px 0px",
  };
  const floatingNavItems = [
    { name: "collection", link: "/collection", megaMenu: <CollectionMegaMenuContent /> },
    { name: "about", link: "/about" },
    { name: "contact us", link: "/contact" },
  ];

  return (
    <>
      {usesHeroOverlay && (
        <FloatingNav
          navItems={floatingNavItems}
          className="hidden md:flex"
          leftSlot={
            <Link href="/" className="inline-flex items-center" aria-label="Fasthaus home">
              <Image src="/fasthaus-logo-final-ivory.svg" alt="Fasthaus" width={104} height={22} />
            </Link>
          }
          rightSlot={
            <div className="flex items-center gap-4 px-1">
              <Link
                href="/collection"
                aria-label="Collection"
                className="inline-flex h-6 w-6 items-center justify-center"
              >
                <Search size={20} className="transition-opacity hover:opacity-70" />
              </Link>
              <CartBadge size={20} />
            </div>
          }
        />
      )}

      <header
        className={
          usesHeroOverlay
            ? "relative z-40 w-full border-[var(--color-border)] bg-[var(--color-surface)] md:-mb-16 md:border-transparent md:bg-transparent"
            : "sticky top-0 z-40 w-full]"
        }
      >
        {/* Mobile nav — hamburger | logo | cart */}
        <div className="flex h-14 items-center justify-between px-5 md:hidden">
          <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
            <Menu size={22} style={{ color: "var(--color-text-primary)" }} />
          </button>
          <Link href="/" className="absolute left-1/2 -translate-x-1/2">
            <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={100} height={24} priority />
          </Link>
          <CartBadge size={22} className="text-[var(--color-text-primary)]" />
        </div>

        {/* Desktop nav — logo | links | icons */}
        <div
          className="mx-auto hidden h-16 w-full max-w-[1240px] items-center justify-center rounded-[24px] px-8 md:flex md:translate-y-8"
          style={desktopNavStyle}
        >
          <div className="flex h-full w-full max-w-[1148px] items-center justify-between">
            <Link href="/" className="flex flex-1 items-center justify-start">
              <Image
                src="/fasthaus-logo-final-ivory.svg"
                alt="Fasthaus"
                width={128}
                height={26}
                priority
              />
            </Link>

            {/* Center links */}
            <NavigationMenu className="h-full w-[453px] flex-none text-current" viewport={false}>
              <NavigationMenuList className="h-full w-full justify-between gap-0">
                <NavigationMenuItem className="flex h-full items-center">
                  <NavigationMenuTrigger asChild showChevron={false} unstyled>
                    <Link
                      href="/collection"
                      className={cn(
                        "group box-content flex h-16 w-[100px] items-center justify-center rounded-none p-2 text-sm font-semibold leading-6 outline-none transition-colors focus:text-[var(--color-accent-amber)] data-[state=open]:text-[var(--color-accent-amber)]",
                        isActive("/collection")
                          ? "text-[var(--color-accent-amber)]"
                          : "text-current"
                      )}
                    >
                      collection
                      <ChevronDown
                        className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
                        aria-hidden="true"
                      />
                    </Link>
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="left-1/2 top-[calc(100%+12px)] w-[min(860px,calc(100vw-48px))] -translate-x-1/2 rounded-[var(--radius-md)] border bg-white p-3 text-[var(--color-text-primary)] shadow-xl md:!w-[860px]">
                    <CollectionMegaMenuContent />
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem className="flex h-full items-center">
                  <NavigationMenuLink asChild>
                    <Link
                      href="/about"
                      className={cn(
                        "flex  w-[100px] h-16 items-center justify-center rounded-none p-2 text-base font-semibold leading-6 outline-none transition-colors hover:text-[var(--color-accent-amber)] focus:text-[var(--color-accent-amber)]",
                        isActive("/about") ? "text-[var(--color-accent-amber)]" : "text-current"
                      )}
                    >
                      about
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem className="flex h-full items-center">
                  <NavigationMenuLink asChild>
                    <Link
                      href="/contact"
                      className={cn(
                        "flex w-[100px] h-16 min-w-20 items-center justify-center whitespace-nowrap rounded-none p-2 text-base font-semibold leading-6 outline-none transition-colors hover:text-[var(--color-accent-amber)] focus:text-[var(--color-accent-amber)]",
                        isActive("/contact") ? "text-[var(--color-accent-amber)]" : "text-current"
                      )}
                    >
                      contact us
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Right icons */}
            <div className="flex flex-1 items-center justify-end">
              <div className="flex w-24 items-center justify-center gap-6">
                {/* <Link href="/shop" aria-label="Search" className="inline-flex h-6 w-6 items-center justify-center">
                  <Search size={22} className="transition-opacity hover:opacity-70" />
                </Link> */}
                <CartBadge size={22} />
              </div>
            </div>
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
                className={cn(
                  "type-display-sm border-b py-5",
                  isActive(link.href)
                    ? "text-[var(--color-accent-amber)]"
                    : "text-[var(--color-text-primary)]"
                )}
                style={{ borderColor: "var(--color-border)" }}
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
