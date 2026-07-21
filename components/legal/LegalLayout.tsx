"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CalendarClock,
  ChevronDown,
  CircleCheck,
  Info,
  Mail,
  OctagonAlert,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  LEGAL_CONTACT,
  POLICIES,
  getPolicy,
  type CalloutVariant,
  type Policy,
} from "@/lib/legal/content";

/* Warm neutral palette shared with the footer */
const INK = "#1D1A17";
const BODY = "#3A332B";
const SECONDARY = "#6E655B";
const MUTED = "#8A8075";
const BORDER = "#EEE9E3";
const BORDER_SOFT = "#F2EDE7";
const PAGE_BG = "#FAF7F3";
const ACCENT = "var(--color-accent-amber)";

const CALLOUT_STYLES: Record<
  CalloutVariant,
  { bg: string; border: string; color: string; text: string; icon: LucideIcon }
> = {
  info: { bg: "#F0F4F8", border: "#D8E2EC", color: "#3B6491", text: "#2E4E71", icon: Info },
  success: {
    bg: "#F0F7F3",
    border: "#D3E6DC",
    color: "#1F8A5B",
    text: "#1B6B48",
    icon: CircleCheck,
  },
  warning: {
    bg: "#FDF6E7",
    border: "#F2E2BC",
    color: "#A97614",
    text: "#8A6110",
    icon: TriangleAlert,
  },
  important: {
    bg: "#FDF0EB",
    border: "#F4D8CC",
    color: "#C2370A",
    text: "#A02F09",
    icon: OctagonAlert,
  },
};

function TocLinks({
  policy,
  activeSection,
  onNavigate,
  variant,
}: {
  policy: Policy;
  activeSection: string;
  onNavigate?: () => void;
  variant: "sidebar" | "mobile";
}) {
  return (
    <>
      {policy.sections.map((s) => {
        const active = activeSection === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            onClick={onNavigate}
            aria-current={active ? "true" : undefined}
            className={
              variant === "sidebar"
                ? "border-l-2 px-3 py-[7px] text-[13.5px] transition-colors hover:!text-[#1D1A17]"
                : "border-l-2 px-3 py-2 text-[14px] transition-colors"
            }
            style={{
              borderColor: active ? "var(--color-accent-amber)" : BORDER,
              color: active ? INK : MUTED,
              fontWeight: active ? 700 : 500,
            }}
          >
            {s.title}
          </a>
        );
      })}
    </>
  );
}

export default function LegalLayout({ slug }: { slug: string }) {
  // Icon components can't cross the server→client boundary, so the page
  // passes the slug and the policy is resolved here.
  const policy = getPolicy(slug);
  if (!policy) throw new Error(`Unknown legal policy: ${slug}`);
  return <LegalLayoutInner policy={policy} />;
}

function LegalLayoutInner({ policy }: { policy: Policy }) {
  const [activeSection, setActiveSection] = useState("");
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      let active = "";
      for (const s of policy.sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < 160) active = s.id;
      }
      setActiveSection((prev) => (prev === active ? prev : active));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [policy]);

  const related = POLICIES.filter((p) => p.slug !== policy.slug).slice(0, 3);

  return (
    <div style={{ backgroundColor: PAGE_BG, paddingTop: "32px" }}>
      {/* ── Hero ── */}
      <div className="border-b bg-white" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-[1280px] px-5 pb-8 pt-8 md:px-10 md:pb-10 md:pt-12">
          <nav
            aria-label="Breadcrumb"
            className="mb-5 flex items-center gap-2.5 text-[13.5px] print:hidden"
          >
            <Link
              href="/"
              className="font-medium transition-colors hover:text-[var(--color-accent-amber)]"
              style={{ color: MUTED }}
            >
              Home
            </Link>
            <span aria-hidden="true" style={{ color: "#C9C1B7" }}>
              /
            </span>
            <span className="font-medium" style={{ color: MUTED }}>
              Legal
            </span>
            <span aria-hidden="true" style={{ color: "#C9C1B7" }}>
              /
            </span>
            <span className="font-semibold" style={{ color: INK }}>
              {policy.title}
            </span>
          </nav>
          <div className="flex max-w-[720px] flex-col gap-3">
            <h1
              className="text-[34px] font-extrabold leading-[1.05] tracking-[-0.03em] md:text-[46px]"
              style={{ color: INK }}
            >
              {policy.title}
            </h1>
            <p
              className="text-[16px] font-medium leading-[1.65] md:text-[17px]"
              style={{ color: SECONDARY, textWrap: "pretty" }}
            >
              {policy.desc}
            </p>
            <span
              className="mt-1.5 inline-flex items-center gap-2 self-start rounded-full border px-3.5 py-1.5 text-[13px] font-semibold"
              style={{ borderColor: BORDER, backgroundColor: PAGE_BG, color: MUTED }}
            >
              <CalendarClock size={14} aria-hidden="true" />
              Last updated {policy.updated}
            </span>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <main className="mx-auto max-w-[1280px] px-5 pb-20 pt-6 md:px-10 lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:items-start lg:gap-16 lg:pt-12 print:block">
        {/* Mobile policy switcher */}
        <nav
          aria-label="Policies"
          className="scrollbar-hide -mx-5 mb-4 flex gap-2 overflow-x-auto px-5 lg:hidden print:hidden"
        >
          {POLICIES.map((p) => {
            const active = p.slug === policy.slug;
            const Icon = p.icon;
            return (
              <Link
                key={p.slug}
                href={`/legal/${p.slug}`}
                aria-current={active ? "page" : undefined}
                className="flex flex-shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13.5px] transition-colors"
                style={{
                  backgroundColor: active ? INK : "#FFFFFF",
                  borderColor: active ? INK : BORDER,
                  color: active ? "#FFFFFF" : SECONDARY,
                  fontWeight: active ? 700 : 500,
                }}
              >
                <Icon size={15} aria-hidden="true" />
                {p.title}
              </Link>
            );
          })}
        </nav>

        {/* Mobile collapsible TOC */}
        <div
          className="mb-6 overflow-hidden rounded-[14px] border bg-white lg:hidden print:hidden"
          style={{ borderColor: BORDER }}
        >
          <button
            type="button"
            onClick={() => setTocOpen((o) => !o)}
            aria-expanded={tocOpen}
            className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-[14.5px] font-bold"
            style={{ color: INK }}
          >
            On this page
            <ChevronDown
              size={16}
              aria-hidden="true"
              className="transition-transform duration-[250ms]"
              style={{ color: MUTED, transform: tocOpen ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>
          {tocOpen && (
            <nav
              aria-label="On this page"
              className="flex flex-col border-t px-4 pb-4 pt-3"
              style={{ borderColor: BORDER_SOFT }}
            >
              <TocLinks
                policy={policy}
                activeSection={activeSection}
                onNavigate={() => setTocOpen(false)}
                variant="mobile"
              />
            </nav>
          )}
        </div>

        {/* Desktop sidebar */}
        <aside
          className="sticky hidden flex-col gap-7 lg:flex print:hidden"
          style={{ top: "calc(var(--scroll-offset) + 16px)" }}
        >
          <nav aria-label="Policies" className="flex flex-col gap-1">
            <span
              className="px-3 pb-2 text-[12.5px] font-bold uppercase tracking-[0.08em]"
              style={{ color: MUTED }}
            >
              Policies
            </span>
            {POLICIES.map((p) => {
              const active = p.slug === policy.slug;
              const Icon = p.icon;
              return (
                <Link
                  key={p.slug}
                  href={`/legal/${p.slug}`}
                  aria-current={active ? "page" : undefined}
                  className="flex items-center gap-2.5 rounded-[10px] px-3 py-[9px] text-[14.5px] transition-colors hover:bg-[#F2EDE7]"
                  style={{
                    backgroundColor: active ? "#FFFFFF" : "transparent",
                    color: active ? INK : SECONDARY,
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <Icon size={16} aria-hidden="true" className="flex-shrink-0" />
                  {p.title}
                </Link>
              );
            })}
          </nav>
          <nav
            aria-label="On this page"
            className="flex flex-col gap-1 border-t pt-6"
            style={{ borderColor: BORDER }}
          >
            <span
              className="px-3 pb-2 text-[12.5px] font-bold uppercase tracking-[0.08em]"
              style={{ color: MUTED }}
            >
              On this page
            </span>
            <TocLinks policy={policy} activeSection={activeSection} variant="sidebar" />
          </nav>
        </aside>

        {/* Content */}
        <article className="flex min-w-0 max-w-[780px] flex-col gap-5">
          {/* Summary cards */}
          <div className="mb-3 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            {policy.cards.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.title}
                  className="flex flex-col gap-2 rounded-[14px] border bg-white p-[18px]"
                  style={{ borderColor: BORDER }}
                >
                  <Icon size={20} aria-hidden="true" style={{ color: ACCENT }} />
                  <span className="text-[14.5px] font-extrabold" style={{ color: INK }}>
                    {c.title}
                  </span>
                  <span
                    className="text-[13.5px] font-medium leading-[1.55]"
                    style={{ color: SECONDARY }}
                  >
                    {c.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Sections */}
          {policy.sections.map((s) => {
            const Icon = s.icon;
            const co = s.callout ? CALLOUT_STYLES[s.callout.variant] : null;
            const CoIcon = co?.icon;
            return (
              <section
                key={s.id}
                id={s.id}
                className="flex flex-col gap-3.5 pt-3"
                style={{ scrollMarginTop: "calc(var(--scroll-offset) + 24px)" }}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-[12px] border bg-white"
                    style={{ borderColor: BORDER }}
                  >
                    <Icon size={19} aria-hidden="true" style={{ color: ACCENT }} />
                  </span>
                  <h2
                    className="text-[22px] font-extrabold tracking-[-0.02em] md:text-[27px]"
                    style={{ color: INK }}
                  >
                    {s.title}
                  </h2>
                </div>
                {s.paras.map((p) => (
                  <p
                    key={p}
                    className="text-[16px] leading-[1.75] md:text-[16.5px]"
                    style={{ color: BODY, textWrap: "pretty" }}
                  >
                    {p}
                  </p>
                ))}
                {s.bullets && (
                  <ul className="flex list-none flex-col gap-2 pl-1">
                    {s.bullets.map((b) => (
                      <li
                        key={b}
                        className="flex gap-3 text-[16px] font-medium leading-[1.6]"
                        style={{ color: BODY }}
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[9px] h-1.5 w-1.5 flex-shrink-0 rounded-full"
                          style={{ backgroundColor: ACCENT }}
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                {s.callout && co && CoIcon && (
                  <div
                    className="flex gap-3 rounded-[14px] border px-[18px] py-4"
                    style={{ backgroundColor: co.bg, borderColor: co.border }}
                  >
                    <CoIcon
                      size={18}
                      aria-hidden="true"
                      className="mt-0.5 flex-shrink-0"
                      style={{ color: co.color }}
                    />
                    <span
                      className="text-[14.5px] font-semibold leading-[1.6]"
                      style={{ color: co.text }}
                    >
                      {s.callout.text}
                    </span>
                  </div>
                )}
                {s.accordion && (
                  <Accordion
                    type="single"
                    collapsible
                    className="overflow-hidden rounded-[14px] border bg-white"
                    style={{ borderColor: BORDER }}
                  >
                    {s.accordion.map((a, i) => (
                      <AccordionItem
                        key={a.q}
                        value={`${s.id}-${i}`}
                        style={{ borderColor: BORDER_SOFT }}
                      >
                        <AccordionTrigger
                          className="rounded-none px-5 py-4 text-[15.5px] font-bold hover:bg-[#FAF7F3] hover:no-underline [&>svg]:text-[#8A8075]"
                          style={{ color: INK }}
                        >
                          {a.q}
                        </AccordionTrigger>
                        <AccordionContent
                          className="px-5 pb-[18px] text-[15px] leading-[1.7]"
                          style={{ color: "#4A4239" }}
                        >
                          {a.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </section>
            );
          })}

          {/* Contact card */}
          <div
            className="mt-5 flex flex-col gap-4 rounded-[18px] p-6 sm:flex-row sm:items-center sm:gap-5 sm:px-7 print:hidden"
            style={{ backgroundColor: INK }}
          >
            <span
              className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-[14px]"
              style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            >
              <Mail size={22} aria-hidden="true" style={{ color: ACCENT }} />
            </span>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-[17px] font-extrabold text-white">
                Questions about this policy?
              </span>
              <span className="text-[14px] font-medium" style={{ color: "rgba(255,255,255,0.65)" }}>
                {LEGAL_CONTACT.hours}
              </span>
            </div>
            <a
              href={`mailto:${LEGAL_CONTACT.email}`}
              className="inline-flex h-[46px] items-center self-start rounded-[12px] px-[22px] text-[14.5px] font-bold text-white transition-[filter] hover:brightness-[0.94] sm:self-auto"
              style={{ backgroundColor: "var(--color-accent-amber)" }}
            >
              {LEGAL_CONTACT.email}
            </a>
          </div>

          {/* Related policies */}
          <div className="mt-6 flex flex-col gap-4 print:hidden">
            <span
              className="text-[13px] font-bold uppercase tracking-[0.08em]"
              style={{ color: MUTED }}
            >
              Related policies
            </span>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {related.map((r) => {
                const Icon = r.icon;
                return (
                  <Link
                    key={r.slug}
                    href={`/legal/${r.slug}`}
                    className="flex flex-col gap-2.5 rounded-[14px] border bg-white p-[18px] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(20,16,12,0.08)]"
                    style={{ borderColor: BORDER }}
                  >
                    <Icon size={19} aria-hidden="true" style={{ color: ACCENT }} />
                    <span className="text-[15px] font-extrabold" style={{ color: INK }}>
                      {r.title}
                    </span>
                    <span
                      className="text-[13px] font-medium leading-[1.5]"
                      style={{ color: SECONDARY }}
                    >
                      {r.desc}
                    </span>
                    <span className="text-[13px] font-bold" style={{ color: ACCENT }}>
                      Read policy →
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
