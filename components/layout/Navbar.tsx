"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ShoppingCart, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { PRODUCTS } from "@/lib/data/products";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const MOBILE_NAV = [
  { label: "Collection", href: "/collection" },
  { label: "About", href: "/about" },
  { label: "Contact us", href: "/contact" },
];

const SHOP_LINKS = [
  { label: "All Products", href: "/collection" },
  { label: "Desk Lamps", href: "/collection/desk-lamps" },
  { label: "Table Lamps", href: "/collection/table-lamps" },
  { label: "Floor Lamps", href: "/collection/floor-lamps" },
];

function CartBadge({ size = 20, className = "" }: { size?: number; className?: string }) {
  const itemCount = useCartStore((s) => s.itemCount());
  const cartHydrated = useCartStore((s) => s.loaded);
  const openDrawer = useCartStore((s) => s.openDrawer);

  return (
    <button
      type="button"
      onClick={openDrawer}
      className={`relative inline-flex cursor-pointer p-2.5 -m-2.5 ${className}`}
      aria-label="Open cart"
    >
      <ShoppingCart size={size} className="transition-opacity hover:opacity-70" />
      {cartHydrated && itemCount > 0 && (
        <span
          className="absolute top-0 right-0 w-4 h-4 rounded-full text-[10px] font-semibold flex items-center justify-center text-white"
          style={{ backgroundColor: "var(--color-accent-amber)" }}
        >
          {itemCount}
        </span>
      )}
    </button>
  );
}

function CollectionMegaMenuContent() {
  const [activeProductId, setActiveProductId] = useState(PRODUCTS[0]?.id);
  const activeProduct = PRODUCTS.find((product) => product.id === activeProductId) ?? PRODUCTS[0];
  const previewVariant = activeProduct?.variants[0];

  return (
    <div className="grid h-[360px] grid-cols-[0.9fr_1.1fr] gap-3">
      <div className="relative h-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)]">
        {activeProduct && previewVariant && (
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeProduct.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={previewVariant.collectionImage}
                alt={`${activeProduct.name} in ${previewVariant.color}`}
                fill
                sizes="360px"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <div className="grid min-w-0 grid-rows-4 gap-1">
        {PRODUCTS.map((product) => (
          <NavigationMenuLink key={product.id} asChild>
            <Link
              href={`/product/${product.slug}`}
              onMouseEnter={() => setActiveProductId(product.id)}
              onFocus={() => setActiveProductId(product.id)}
              className="min-w-0 overflow-hidden rounded-[var(--radius-sm)] p-4 outline-none transition-colors hover:bg-[var(--color-surface-muted)] focus:bg-[var(--color-surface-muted)]"
            >
              <span className="block text-base font-semibold leading-6">{product.name}</span>
              <span className="mt-1 block truncate text-sm leading-5 text-[var(--color-text-secondary)]">
                {product.description}
              </span>
            </Link>
          </NavigationMenuLink>
        ))}
      </div>
    </div>
  );
}

export default function Navbar({ revealOnFirstScroll = false }: { revealOnFirstScroll?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [homeHeroPassed, setHomeHeroPassed] = useState(false);
  const openCartDrawer = useCartStore((s) => s.openDrawer);
  const [hiddenMainNavPath, setHiddenMainNavPath] = useState<string | null>(null);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const isAboutPage = pathname === "/about";
  const isContactPage = pathname === "/contact";
  const isLegalPage = pathname === "/legal" || pathname.startsWith("/legal/");
  const isProductPage = pathname.startsWith("/product/");
  const aboutMainNavHidden = isAboutPage && hiddenMainNavPath === pathname;
  const usesHeroOverlay =
    pathname === "/" ||
    isAboutPage ||
    pathname === "/contact" ||
    pathname === "/collection" ||
    pathname.startsWith("/collection/") ||
    isProductPage;
  const desktopTextColor = "#FFFDF5";
  const homeMobileOverlay = isHomePage && !homeHeroPassed;
  const floatingNavItems = [
    { name: "collection", link: "/collection", megaMenu: <CollectionMegaMenuContent /> },
    { name: "about", link: "/about" },
    { name: "contact us", link: "/contact" },
  ];

  // Lock body scroll while the mobile menu overlay is open.
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!isHomePage) return;

    const hero = document.querySelector<HTMLElement>("[data-home-hero]");
    if (!hero) return;

    const updateNavbar = () => {
      setHomeHeroPassed(hero.getBoundingClientRect().bottom <= 0);
    };

    updateNavbar();
    window.addEventListener("scroll", updateNavbar, { passive: true });
    return () => window.removeEventListener("scroll", updateNavbar);
  }, [isHomePage]);

  useEffect(() => {
    if (!isAboutPage) {
      return;
    }

    const hideAfterScroll = () => {
      if (window.scrollY > 80) {
        setHiddenMainNavPath(pathname);
      }
    };

    window.addEventListener("scroll", hideAfterScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", hideAfterScroll);
    };
  }, [isAboutPage, pathname]);

  return (
    <>
      {usesHeroOverlay && !isContactPage && (
        <FloatingNav
          key={pathname}
          navItems={floatingNavItems}
          className="hidden md:flex"
          allowVisibleAtTop={aboutMainNavHidden}
          leftSlot={
            <Link href="/" className="inline-flex items-center" aria-label="Fasthaus home">
              <Image src="/fasthaus-logo-final-ivory.svg" alt="Fasthaus" width={104} height={22} />
            </Link>
          }
          rightSlot={
            <div className="flex items-center gap-4 px-1">
              <CartBadge size={20} />
            </div>
          }
        />
      )}

      <header
        className={cn(
          isProductPage
            ? "absolute top-11 z-40 w-full border-transparent bg-transparent md:h-24"
            : isHomePage
              ? cn(
                  "z-40 w-full transition-[background-color,border-color,box-shadow] duration-200",
                  homeHeroPassed
                    ? "fixed top-0 border-b border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm"
                    : "absolute top-11 border-transparent bg-transparent",
                  "md:relative md:top-auto md:-mb-16 md:border-transparent md:bg-transparent md:shadow-none"
                )
            : usesHeroOverlay
              ? "relative z-40 w-full border-[var(--color-border)] bg-[var(--color-surface)] md:-mb-16 md:border-transparent md:bg-transparent"
              : cn("z-40 w-full", isLegalPage ? "relative" : "sticky top-0"),
          aboutMainNavHidden && "md:pointer-events-none md:opacity-0"
        )}
      >
        {/* Mobile nav — hamburger | logo | cart */}
        <div className="flex h-14 items-center justify-between px-5 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            className="grid h-11 w-11 -ml-3 place-items-center"
          >
            <Menu
              size={22}
              style={{ color: homeMobileOverlay ? "#FFFDF5" : "var(--color-text-primary)" }}
            />
          </button>
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 p-2"
            aria-label="Fasthaus home"
          >
            <Image
              src={homeMobileOverlay ? "/fasthaus-logo-final-ivory.svg" : "/fasthaus-logo-final.svg"}
              alt="Fasthaus"
              width={100}
              height={24}
              priority
            />
          </Link>
          <CartBadge
            size={22}
            className={homeMobileOverlay ? "text-[#FFFDF5]" : "text-[var(--color-text-primary)]"}
          />
        </div>

        {/* Desktop nav — logo | links | icons */}
        <div
          data-home-reveal-item={revealOnFirstScroll ? "" : undefined}
          className="relative mx-auto hidden h-16 w-full max-w-[1240px] md:flex md:translate-y-8"
        >
          {/* Glass background layer — clipped separately so the blur doesn't leak past the rounded corners on hover-triggered repaints */}
          <div
            aria-hidden="true"
            className="glass-surface pointer-events-none absolute inset-0 overflow-hidden rounded-[24px]"
          />
          <div
            className="relative flex h-full w-full items-center justify-center px-8"
            style={{ color: desktopTextColor }}
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
                          "group box-content flex h-16 w-[100px] items-center justify-center rounded-none p-2 text-sm font-semibold leading-6 underline-offset-4 outline-none transition-colors hover:underline focus:text-[var(--color-accent-amber)] data-[state=open]:text-[var(--color-accent-amber)]",
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
                    <NavigationMenuContent className="collection-menu-content left-1/2 top-[calc(100%+12px)] w-[min(860px,calc(100vw-48px))] -translate-x-1/2 rounded-[var(--radius-md)] border bg-white p-3 text-[var(--color-text-primary)] shadow-xl md:!w-[860px]">
                      <CollectionMegaMenuContent />
                    </NavigationMenuContent>
                  </NavigationMenuItem>

                  <NavigationMenuItem className="flex h-full items-center">
                    <NavigationMenuLink asChild>
                      <Link
                        href="/about"
                        className={cn(
                          "flex  w-[100px] h-16 items-center justify-center rounded-none p-2 text-base font-semibold leading-6 underline-offset-4 outline-none transition-colors hover:text-[var(--color-accent-amber)] hover:underline focus:text-[var(--color-accent-amber)]",
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
                          "flex w-[100px] h-16 min-w-20 items-center justify-center whitespace-nowrap rounded-none p-2 text-base font-semibold leading-6 underline-offset-4 outline-none transition-colors hover:text-[var(--color-accent-amber)] hover:underline focus:text-[var(--color-accent-amber)]",
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
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: "var(--color-bg)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            {/* Overlay header */}
            <div
              className="flex items-center justify-between pl-5 pr-2 h-14 border-b flex-shrink-0"
              style={{ borderColor: "var(--color-border)" }}
            >
              <Link href="/" onClick={() => setMobileOpen(false)} aria-label="Fasthaus home">
                <Image src="/fasthaus-logo-final.svg" alt="Fasthaus" width={100} height={24} />
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="grid h-11 w-11 place-items-center"
              >
                <X size={22} style={{ color: "var(--color-text-primary)" }} />
              </button>
            </div>

            <ScrollArea className="min-h-0 flex-1" data-lenis-prevent>
              <div className="flex min-h-[calc(100vh-56px)] flex-col">
                {/* Overlay links */}
                <motion.nav
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col px-6 pt-4"
                >
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

                  <div className="grid grid-cols-2 gap-x-4 pt-5">
                    {SHOP_LINKS.slice(1).map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="type-body-md py-2.5"
                        style={{ color: "var(--color-text-secondary)" }}
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </motion.nav>

                {/* Bottom cart shortcut */}
                <div
                  className="mt-auto px-6"
                  style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom))" }}
                >
                  <button
                    type="button"
                    className="btn btn-light w-full gap-2.5"
                    onClick={() => {
                      setMobileOpen(false);
                      openCartDrawer();
                    }}
                  >
                    <ShoppingCart size={18} />
                    View Cart
                  </button>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
