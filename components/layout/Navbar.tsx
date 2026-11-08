"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronDown, Menu, ShoppingCart, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart";
import { useMediaProducts } from "@/components/product/ProductMediaProvider";
import { getCollectionMenuItems } from "@/lib/data/collection-menu";
import { FloatingNav } from "@/components/ui/floating-navbar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { setPageScrollLocked } from "@/lib/page-scroll-lock";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const MOBILE_NAV = [
  { label: "About", href: "/about" },
  { label: "Contact us", href: "/contact" },
];

function CartBadge({ size = 20, className = "" }: { size?: number; className?: string }) {
  const itemCount = useCartStore((s) => s.itemCount());
  const cartHydrated = useCartStore((s) => s.loaded);
  const openDrawer = useCartStore((s) => s.openDrawer);

  return (
    <button
      type="button"
      onClick={openDrawer}
      className={`relative inline-flex min-h-11 min-w-11 items-center justify-center cursor-pointer p-2.5 -m-2.5 ${className}`}
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
  const items = getCollectionMenuItems(useMediaProducts());
  const [activeProductId, setActiveProductId] = useState(items[0]?.product.id);
  const activeItem = items.find(({ product }) => product.id === activeProductId) ?? items[0];

  return (
    <div className="grid gap-3 xl:h-[360px] xl:grid-cols-[0.9fr_1.1fr]">
      <div className="relative hidden h-full overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-surface-muted)] xl:block">
        {activeItem && (
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={activeItem.product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <Image
                src={activeItem.image}
                alt={`${activeItem.product.name} in ${activeItem.variant.color}`}
                width={1080}
                height={1080}
                sizes="360px"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <div className="grid min-w-0 grid-cols-2 gap-3 xl:grid-cols-1 xl:grid-rows-4 xl:gap-1">
        {items.map(({ product, variant, image }) => (
          <NavigationMenuLink key={product.id} asChild>
            <Link
              href={`/product/${product.slug}?variant=${encodeURIComponent(variant.id)}`}
              onMouseEnter={() => setActiveProductId(product.id)}
              onFocus={() => setActiveProductId(product.id)}
              className="min-w-0 overflow-hidden rounded-[var(--radius-sm)] p-3 outline-none transition-colors hover:bg-[var(--color-surface-muted)] focus:bg-[var(--color-surface-muted)] xl:p-4"
            >
              <Image
                src={image}
                alt=""
                width={480}
                height={270}
                sizes="(min-width: 1280px) 0px, 45vw"
                className="mb-2 h-[min(16svh,160px)] w-full rounded-[var(--radius-sm)] object-cover xl:hidden"
              />
              <span className="block text-base font-bold leading-6">{product.name}</span>
              <span className="mt-1 line-clamp-2 text-sm leading-5 text-[var(--color-text-secondary)] xl:block xl:truncate">
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
  const menuItems = getCollectionMenuItems(useMediaProducts());
  const headerRef = useRef<HTMLElement>(null);
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
  const desktopTextColor = isProductPage ? "var(--product-nav-color)" : "#FFFDF5";
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

    setPageScrollLocked("mobile-menu", true);

    const closeOnEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      setPageScrollLocked("mobile-menu", false);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!isHomePage) return;

    const layout = headerRef.current?.closest<HTMLElement>("[data-home-reveal]");
    const hero = (layout ?? headerRef.current?.parentElement)?.querySelector<HTMLElement>(
      "[data-home-hero]"
    );
    if (!hero) return;

    const updateNavbar = () => {
      const rect = hero.getBoundingClientRect();
      // Until the first-scroll reveal runs the page is held at the top, so the hero
      // cannot have been passed. Content with no layout yet reports an empty rect,
      // which is likewise not a passed hero.
      const revealPending = layout?.dataset.homeReveal === "pending";
      setHomeHeroPassed(!revealPending && rect.height > 0 && rect.bottom <= 0);
    };

    updateNavbar();
    const sizeObserver = new ResizeObserver(updateNavbar);
    sizeObserver.observe(hero);
    // The reveal can resolve either side of this effect, so watch it rather than
    // relying on a later scroll to correct the bar.
    let revealObserver: MutationObserver | undefined;
    if (layout) {
      revealObserver = new MutationObserver(updateNavbar);
      revealObserver.observe(layout, {
        attributes: true,
        attributeFilter: ["data-home-reveal"],
      });
    }
    window.addEventListener("scroll", updateNavbar, { passive: true });
    return () => {
      sizeObserver.disconnect();
      revealObserver?.disconnect();
      window.removeEventListener("scroll", updateNavbar);
    };
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
              <Image
                src="/fasthaus-logo-final-ivory.svg"
                alt="Fasthaus"
                width={104}
                height={21}
                loading="eager"
                style={{ aspectRatio: "8230.08 / 1656.08", height: "auto" }}
              />
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
        ref={headerRef}
        data-product-nav={isProductPage ? "" : undefined}
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
                ? cn(
                    "z-40 w-full border-[var(--color-border)] bg-[var(--color-surface)] md:-mb-16 md:border-transparent md:bg-transparent",
                    isAboutPage ? "sticky top-0 md:relative" : "relative"
                  )
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
              style={{ color: isProductPage ? "var(--product-nav-color)" : homeMobileOverlay ? "#FFFDF5" : "var(--color-text-primary)" }}
            />
          </button>
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 p-2"
            aria-label="Fasthaus home"
          >
            <Image
              src={
                homeMobileOverlay ? "/fasthaus-logo-final-ivory.svg" : "/fasthaus-logo-final.svg"
              }
              alt="Fasthaus"
              width={100}
              height={20}
              className={isProductPage ? "product-nav-dark-logo" : undefined}
              style={{ aspectRatio: "8230.08 / 1656.08", height: "auto" }}
              preload
            />
            {isProductPage && (
              <Image
                src="/fasthaus-logo-final-ivory.svg"
                alt="Fasthaus"
                width={100}
                height={20}
                className="product-nav-light-logo"
                style={{ aspectRatio: "8230.08 / 1656.08", height: "auto" }}
              />
            )}
          </Link>
          <CartBadge
            size={22}
            className={isProductPage ? "text-[var(--product-nav-color)]" : homeMobileOverlay ? "text-[#FFFDF5]" : "text-[var(--color-text-primary)]"}
          />
        </div>

        {/* Desktop nav — logo | links | icons */}
        <div
          data-home-reveal-item={revealOnFirstScroll ? "" : undefined}
          className="relative mx-auto hidden h-16 w-full md:flex xl:max-w-[1240px] xl:translate-y-8"
        >
          {/* Glass background layer — clipped separately so the blur doesn't leak past the rounded corners on hover-triggered repaints */}
          <div
            aria-hidden="true"
            className="glass-surface pointer-events-none absolute inset-0 overflow-hidden xl:rounded-[24px]"
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
                  className={isProductPage ? "product-nav-light-logo" : undefined}
                  style={{ aspectRatio: "8230.08 / 1656.08", height: "auto" }}
                  preload
                />
                {isProductPage && (
                  <Image
                    src="/fasthaus-logo-final.svg"
                    alt="Fasthaus"
                    width={128}
                    height={26}
                    className="product-nav-dark-logo"
                    style={{ aspectRatio: "8230.08 / 1656.08", height: "auto" }}
                  />
                )}
              </Link>

              {/* Center links */}
              <NavigationMenu className="static h-full w-[360px] flex-none text-current lg:w-[453px] [&>div]:!static" viewport={false}>
                <NavigationMenuList className="h-full w-full justify-between gap-0">
                  <NavigationMenuItem className="static flex h-full items-center">
                      <Link
                        href="/collection"
                        className={cn(
                          "flex h-16 items-center justify-center rounded-none px-2 text-sm font-semibold leading-6 underline-offset-4 outline-none transition-colors hover:underline focus-visible:underline focus:text-[var(--color-accent-amber)]",
                          isActive("/collection")
                            ? "text-[var(--color-accent-amber)]"
                            : "text-current"
                        )}
                      >
                        collection
                      </Link>
                    <NavigationMenuTrigger
                      showChevron={false}
                      unstyled
                      aria-label="Browse lamp collection"
                      className="grid h-11 w-11 place-items-center rounded-full text-current outline-none hover:text-[var(--color-accent-amber)] focus-visible:ring-2 focus-visible:ring-current data-[state=open]:text-[var(--color-accent-amber)]"
                    >
                        <ChevronDown
                          className="size-4 transition duration-300 group-data-[state=open]:rotate-180"
                          aria-hidden="true"
                        />
                    </NavigationMenuTrigger>
                    <NavigationMenuContent data-lenis-prevent className="collection-menu-content left-1/2 top-[calc(100%+12px)] max-h-[calc(100dvh-180px)] !w-[min(860px,calc(100vw-48px))] -translate-x-1/2 !overflow-y-auto overscroll-contain rounded-[var(--radius-md)] border bg-white p-3 text-[var(--color-text-primary)] shadow-xl md:max-xl:!mt-0 md:max-xl:max-h-[calc(100dvh-108px)] md:max-xl:!w-screen md:max-xl:!rounded-none">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#ebe8e3] min-[414px]:p-3"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex h-full max-h-[844px] w-full max-w-[390px] flex-col overflow-hidden bg-white min-[414px]:rounded-[20px]">
              {/* Overlay header */}
              <div className="flex h-16 flex-shrink-0 items-center justify-between border-b border-[#e7e1da] pl-5 pr-3">
                <Link href="/" onClick={() => setMobileOpen(false)} aria-label="Fasthaus home">
                  <Image
                    src="/fasthaus-logo-final.svg"
                    alt="Fasthaus"
                    width={86}
                    height={17}
                    style={{ aspectRatio: "8230.08 / 1656.08", height: "auto" }}
                  />
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                  className="grid h-11 w-11 place-items-center"
                >
                  <X size={24} strokeWidth={1.8} className="text-[var(--color-text-primary)]" />
                </button>
              </div>

              <ScrollArea className="min-h-0 flex-1" data-lenis-prevent>
                <motion.nav
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                  className="px-3 pb-5 pt-5 min-[390px]:px-5"
                >
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#8e857c]">
                    OUR COLLECTION
                  </p>

                  <div className="grid grid-cols-[repeat(2,minmax(0,169px))] justify-center gap-x-3 gap-y-3">
                    {menuItems.map(({ product, variant, image }) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.slug}?variant=${encodeURIComponent(variant.id)}`}
                        className="group min-w-0"
                        onClick={() => setMobileOpen(false)}
                      >
                        <div className="relative aspect-square w-full max-w-[169px] overflow-hidden rounded-[14px] bg-[var(--color-surface-muted)]">
                          <Image
                            src={image}
                            alt={product.name}
                            width={169}
                            height={169}
                            sizes="169px"
                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                        </div>
                        <span className="mt-2 block text-sm font-semibold leading-5 text-[var(--color-text-primary)]">
                          {product.name}
                        </span>
                      </Link>
                    ))}
                  </div>

                  <Link
                    href="/collection"
                    className="mt-4 flex h-[50px] items-center justify-center gap-2 rounded-[12px] bg-[#181512] text-[16px] font-normal text-[var(--color-bg)]"
                    onClick={() => setMobileOpen(false)}
                  >
                    See all lamps
                    <ArrowRight className="mt-1" size={14} strokeWidth={1.8} />
                  </Link>

                  <div className="mt-[16px] border-t border-[#e7e1da]">
                    {MOBILE_NAV.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                          "block border-b border-[#e7e1da] py-[16px] text-[length:var(--text-md)] font-semibold leading-7 last:border-b-0",
                          isActive(link.href)
                            ? "text-[var(--color-accent-amber)]"
                            : "text-[var(--color-text-primary)]"
                        )}
                        onClick={() => setMobileOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>

                  <div
                    className="border-t border-[#e7e1da] pt-2"
                    style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                  >
                    <button
                      type="button"
                      className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[12px] bg-[var(--color-accent-amber)] font-normal text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                      onClick={() => {
                        setMobileOpen(false);
                        openCartDrawer();
                      }}
                    >
                      <ShoppingCart size={14} strokeWidth={1.8} />
                      View Cart
                    </button>
                  </div>
                </motion.nav>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
