"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ShopLayout from "@/components/layout/ShopLayout";
import { FAQS, FAQ_CATEGORIES as CATEGORIES } from "@/lib/data/faq";

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = FAQS.filter((f) => activeCategory === "All" || f.category === activeCategory);

  return (
    <ShopLayout>
      <div id="faq" className="scroll-target mx-auto max-w-[720px] px-5 py-10 md:py-14">
        {/* Page header */}
        <h1
          className="type-display-xl mb-2 text-center"
          style={{ color: "var(--color-text-primary)" }}
        >
          You Ask. We Answer.
        </h1>
        <p
          className="type-body-md mb-10 text-center"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Everything you need to know about our lamps, shipping, returns and custom work.
        </p>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="btn btn-pill min-h-0 px-4 py-1.5 transition-all"
              style={{
                backgroundColor:
                  activeCategory === cat
                    ? "var(--color-accent-amber)"
                    : "var(--color-surface-muted)",
                color: activeCategory === cat ? "#fff" : "var(--color-text-secondary)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="flex flex-col divide-y" style={{ borderColor: "var(--color-border)" }}>
          {filtered.map((faq, i) => (
            <div key={i} className="py-4" style={{ borderColor: "var(--color-border)" }}>
              <button
                className="w-full flex items-center justify-between text-left gap-4"
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="type-caption" style={{ color: "var(--color-text-primary)" }}>
                  {faq.question}
                </span>
                <ChevronDown
                  size={16}
                  className="flex-shrink-0 transition-transform"
                  style={{
                    transform: openIndex === i ? "rotate(180deg)" : "rotate(0)",
                    color: "var(--color-text-secondary)",
                  }}
                />
              </button>
              {/* Always rendered (just hidden) so answers are in the HTML for search engines. */}
              <p
                id={`faq-answer-${i}`}
                hidden={openIndex !== i}
                className="type-body-sm mt-3"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ShopLayout>
  );
}
