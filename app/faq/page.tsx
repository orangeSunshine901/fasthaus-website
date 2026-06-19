"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ShopLayout from "@/components/layout/ShopLayout";

const CATEGORIES = ["All", "Products", "Shipping", "Returns", "Warranty", "Custom Projects"] as const;

const FAQS: { category: string; question: string; answer: string }[] = [
  {
    category: "Products",
    question: "What are your lamps made of?",
    answer: "Our lamps are primarily made from 3D-printed PLA and PETG, combined with powder-coated aluminium bases, acrylic diffusers, and braided textile cables. Each material is chosen for durability, aesthetics, and low environmental impact.",
  },
  {
    category: "Products",
    question: "How long does production take?",
    answer: "Each lamp is made to order at our Dubai studio. Production takes 2–3 business days. You will get a notification the moment it ships.",
  },
  {
    category: "Shipping",
    question: "Do you ship internationally?",
    answer: "Currently we ship to all seven UAE emirates. International shipping is coming soon — sign up for our newsletter to be the first to know.",
  },
  {
    category: "Returns",
    question: "What is your return policy?",
    answer: "We offer 30-day hassle-free returns for any reason. Simply email us at returns@fasthaus.ae with your order number and we will arrange a pickup at no cost to you.",
  },
  {
    category: "Custom Projects",
    question: "Can you create a custom lamp for my space?",
    answer: "Yes! We take custom projects for residential and commercial spaces. Reach out via the contact page with your brief and we will get back to you within one business day.",
  },
  {
    category: "Warranty",
    question: "What does the 2-year warranty cover?",
    answer: "Our warranty covers manufacturing defects, LED module failure, electrical components, and structural integrity. It does not cover accidental damage, misuse, or normal wear and surface marks.",
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>("All");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filtered = FAQS.filter(
    (f) => activeCategory === "All" || f.category === activeCategory
  );

  return (
    <ShopLayout>
      <div className="max-w-[720px] mx-auto px-6 py-14">
        <h1 className="text-4xl font-semibold text-center mb-2" style={{ color: "var(--color-text-primary)" }}>
          You Ask. We Answer.
        </h1>
        <p className="text-base text-center mb-10" style={{ color: "var(--color-text-secondary)" }}>
          Everything you need to know about our lamps, shipping, returns and custom work.
        </p>

        {/* Category tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: activeCategory === cat ? "var(--color-accent-amber)" : "var(--color-surface-muted)",
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
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
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
              {openIndex === i && (
                <p className="mt-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </ShopLayout>
  );
}
