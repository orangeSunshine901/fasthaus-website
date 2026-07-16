import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ChartColumn,
  Cookie,
  Copyright,
  CreditCard,
  Hammer,
  House,
  Lightbulb,
  Lock,
  Mail,
  Package,
  Palette,
  RotateCcw,
  Scale,
  ShieldCheck,
  Truck,
} from "lucide-react";

export type CalloutVariant = "info" | "success" | "warning" | "important";

export type PolicySection = {
  id: string;
  icon: LucideIcon;
  title: string;
  paras: string[];
  bullets?: string[];
  callout?: { variant: CalloutVariant; text: string };
  accordion?: { q: string; a: string }[];
};

export type Policy = {
  slug: string;
  title: string;
  icon: LucideIcon;
  desc: string;
  updated: string;
  metaDescription: string;
  cards: { icon: LucideIcon; title: string; text: string }[];
  sections: PolicySection[];
};

export const LEGAL_CONTACT = {
  email: "hello@fasthaus.studio",
  hours: "10AM–7PM · Monday to Saturday",
};

export const POLICIES: Policy[] = [
  {
    slug: "terms",
    title: "Terms & Conditions",
    icon: Scale,
    desc: "The agreement between you and FastHaus when you browse the site or place an order.",
    updated: "July 17, 2026",
    metaDescription:
      "The terms that apply when you browse the FastHaus website or place an order — products, made-to-order production, payment, shipping and governing law.",
    cards: [
      {
        icon: Hammer,
        title: "Made to order",
        text: "Most products are manufactured after payment is received.",
      },
      {
        icon: CreditCard,
        title: "Prices in AED",
        text: "VAT applies where required; payments via approved providers.",
      },
      {
        icon: Scale,
        title: "UAE law",
        text: "These terms are governed by the laws of the United Arab Emirates.",
      },
    ],
    sections: [
      {
        id: "introduction",
        icon: BookOpen,
        title: "Introduction",
        paras: [
          "Welcome to FastHaus. By using this website or placing an order you agree to these Terms & Conditions.",
        ],
      },
      {
        id: "about",
        icon: House,
        title: "About FastHaus",
        paras: [
          "FastHaus is a UAE-based design-led fabrication studio producing lighting, décor, signage and custom objects using modern manufacturing methods including 3D printing.",
        ],
      },
      {
        id: "products",
        icon: Package,
        title: "Products",
        paras: [
          "Small visual variations, layer lines and colour differences are natural characteristics of additive manufacturing and are not defects.",
        ],
        callout: {
          variant: "info",
          text: "Every piece is printed individually — subtle texture and tone differences are part of what makes yours unique.",
        },
      },
      {
        id: "made-to-order",
        icon: Hammer,
        title: "Made-to-Order",
        paras: [
          "Most products are manufactured after payment has been received. Production times shown are estimates.",
        ],
      },
      {
        id: "custom-orders",
        icon: Palette,
        title: "Custom Orders",
        paras: ["Custom and personalised products require approval before production."],
        callout: {
          variant: "warning",
          text: "Once production starts, cancellation is not possible.",
        },
      },
      {
        id: "payment",
        icon: CreditCard,
        title: "Pricing & Payment",
        paras: [
          "Prices are displayed in AED unless stated otherwise. VAT applies where required. Payments are processed securely through approved providers.",
        ],
      },
      {
        id: "shipping",
        icon: Truck,
        title: "Shipping",
        paras: [
          "Delivery estimates are not guaranteed. Delays caused by couriers, customs or force majeure are outside FastHaus's control.",
        ],
      },
      {
        id: "product-care",
        icon: Lightbulb,
        title: "Product Care",
        paras: [
          "Use products as intended. Indoor products should not be exposed to excessive heat, water or misuse unless specifically designed for it.",
        ],
      },
      {
        id: "ip",
        icon: Copyright,
        title: "Intellectual Property",
        paras: [
          "All product designs, renders, logos, photographs and website content remain the intellectual property of FastHaus.",
        ],
      },
      {
        id: "liability",
        icon: ShieldCheck,
        title: "Limitation of Liability",
        paras: [
          "FastHaus is not liable for indirect or consequential damages arising from misuse or circumstances outside its reasonable control.",
        ],
      },
      {
        id: "law",
        icon: Scale,
        title: "Governing Law",
        paras: ["These Terms are governed by the laws of the United Arab Emirates."],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy Policy",
    icon: Lock,
    desc: "What information we collect, how we use it, and the rights you have over it.",
    updated: "July 17, 2026",
    metaDescription:
      "How FastHaus collects, uses and protects your information — analytics and cookies, third parties, security safeguards and your rights.",
    cards: [
      {
        icon: Lock,
        title: "Your data, protected",
        text: "Reasonable technical and organisational safeguards throughout.",
      },
      {
        icon: ChartColumn,
        title: "Consent-first analytics",
        text: "Analytics cookies are only enabled after consent where required.",
      },
      {
        icon: Mail,
        title: "Your rights",
        text: "Request access, correction or deletion where applicable by law.",
      },
    ],
    sections: [
      {
        id: "collect",
        icon: BookOpen,
        title: "Information We Collect",
        paras: ["To provide our services we collect:"],
        bullets: [
          "Name, email and phone",
          "Billing and shipping address",
          "Order history",
          "Device and browser information",
          "Analytics data and cookie preferences",
        ],
      },
      {
        id: "use",
        icon: Lightbulb,
        title: "How We Use Information",
        paras: ["Your information is used to:"],
        bullets: [
          "Process orders and deliver products",
          "Provide customer support",
          "Prevent fraud",
          "Improve website performance",
          "Send our newsletter (with consent)",
        ],
      },
      {
        id: "analytics",
        icon: ChartColumn,
        title: "Analytics & Cookies",
        paras: ["FastHaus uses Google Analytics, PostHog and Google Consent Mode."],
        callout: {
          variant: "success",
          text: "Analytics cookies are only enabled after consent where required.",
        },
      },
      {
        id: "third-parties",
        icon: Package,
        title: "Third Parties",
        paras: [
          "Information may be shared with payment processors, shipping providers, email providers and analytics platforms solely to deliver our services.",
        ],
      },
      {
        id: "security",
        icon: ShieldCheck,
        title: "Security",
        paras: [
          "Reasonable technical and organisational safeguards are used to protect customer information.",
        ],
      },
      {
        id: "rights",
        icon: Scale,
        title: "Your Rights",
        paras: [
          "Users may request access, correction or deletion of their information where applicable by law.",
        ],
      },
    ],
  },
  {
    slug: "refunds",
    title: "Refund & Returns Policy",
    icon: RotateCcw,
    desc: "When returns are accepted, what can't be returned, and how refunds are processed.",
    updated: "July 17, 2026",
    metaDescription:
      "FastHaus returns and refunds — 14-day returns on standard products, non-returnable items, damage claims and refund processing.",
    cards: [
      {
        icon: RotateCcw,
        title: "14-day returns",
        text: "Unused standard products, in original packaging.",
      },
      {
        icon: Package,
        title: "Report damage fast",
        text: "Within 48 hours of delivery, with photographs.",
      },
      {
        icon: CreditCard,
        title: "Original method",
        text: "Approved refunds go back to the original payment method.",
      },
    ],
    sections: [
      {
        id: "standard",
        icon: RotateCcw,
        title: "Standard Returns",
        paras: [
          "Unused standard products may be returned within 14 days of delivery in original packaging.",
        ],
      },
      {
        id: "non-returnable",
        icon: Package,
        title: "Non-Returnable Items",
        paras: ["The following cannot be returned:"],
        accordion: [
          {
            q: "Personalised products",
            a: "Items customised with names, dates or bespoke colours are produced uniquely for you and cannot be restocked.",
          },
          {
            q: "Custom commissions",
            a: "One-off commissioned pieces are made to your approved specification and are non-returnable once production starts.",
          },
          {
            q: "Gift cards & digital products",
            a: "Gift cards and digital products are delivered instantly and cannot be returned or exchanged.",
          },
        ],
      },
      {
        id: "damaged",
        icon: ShieldCheck,
        title: "Damaged Items",
        paras: ["Report damage within 48 hours with photographs."],
        callout: {
          variant: "important",
          text: "Claims made after 48 hours of delivery may not be eligible for replacement.",
        },
      },
      {
        id: "variations",
        icon: Lightbulb,
        title: "Manufacturing Variations",
        paras: [
          "Visible print layers, slight texture changes and colour variation are expected characteristics of 3D printing and are not defects.",
        ],
        callout: {
          variant: "info",
          text: "These characteristics are part of the additive manufacturing process and do not qualify as damage.",
        },
      },
      {
        id: "processing",
        icon: CreditCard,
        title: "Refund Processing",
        paras: ["Approved refunds are returned to the original payment method."],
      },
    ],
  },
  {
    slug: "shipping",
    title: "Shipping Policy",
    icon: Truck,
    desc: "Production times, delivery regions, tracking and customs.",
    updated: "July 17, 2026",
    metaDescription:
      "FastHaus shipping — made-to-order production times, delivery regions starting with the UAE, tracking emails and customs responsibilities.",
    cards: [
      {
        icon: Hammer,
        title: "Made to order",
        text: "Production begins after payment is received.",
      },
      {
        icon: Truck,
        title: "UAE first",
        text: "GCC and international expansion planned.",
      },
      {
        icon: Mail,
        title: "Tracked",
        text: "Tracking information is emailed once dispatched.",
      },
    ],
    sections: [
      {
        id: "processing-time",
        icon: Hammer,
        title: "Processing Time",
        paras: ["Most products are made to order. Production begins after payment."],
      },
      {
        id: "regions",
        icon: Truck,
        title: "Shipping Regions",
        paras: ["Initially UAE, with GCC and international expansion planned."],
      },
      {
        id: "tracking",
        icon: Mail,
        title: "Tracking",
        paras: ["Tracking information is emailed once dispatched."],
      },
      {
        id: "customs",
        icon: Scale,
        title: "Customs",
        paras: ["International customers are responsible for import duties and taxes."],
        callout: {
          variant: "info",
          text: "Import duties and taxes are set by your local customs authority and are not included in our prices.",
        },
      },
    ],
  },
  {
    slug: "warranty",
    title: "Warranty Policy",
    icon: ShieldCheck,
    desc: "What's covered on electrical and printed components, and what isn't.",
    updated: "July 17, 2026",
    metaDescription:
      "FastHaus warranty — 12 months on supplied electrical components, 30-day workmanship warranty on printed components, and what is excluded.",
    cards: [
      {
        icon: ShieldCheck,
        title: "12 months",
        text: "Warranty on supplied electrical components.",
      },
      {
        icon: Hammer,
        title: "30 days",
        text: "Workmanship warranty on printed components.",
      },
      {
        icon: Mail,
        title: "Easy claims",
        text: "Email us with your order number to start a claim.",
      },
    ],
    sections: [
      {
        id: "coverage",
        icon: ShieldCheck,
        title: "Coverage",
        paras: ["Your FastHaus product is covered by:"],
        bullets: [
          "12-month warranty on supplied electrical components",
          "30-day workmanship warranty on printed components",
        ],
      },
      {
        id: "exclusions",
        icon: Scale,
        title: "Exclusions",
        paras: ["The warranty does not cover:"],
        accordion: [
          {
            q: "Misuse",
            a: "Damage from use outside the product's intended purpose, including outdoor use of indoor products.",
          },
          {
            q: "Water damage",
            a: "Exposure to water, humidity or liquids unless the product is specifically designed for it.",
          },
          {
            q: "Modifications",
            a: "Any disassembly, rewiring or alteration of the product voids the warranty.",
          },
          {
            q: "Normal wear",
            a: "Gradual cosmetic changes from everyday use are expected and not covered.",
          },
          {
            q: "Accidental damage",
            a: "Drops, impacts and other accidents are not covered under warranty.",
          },
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    icon: Cookie,
    desc: "Which cookies we use, what they do, and how to manage your preferences.",
    updated: "July 17, 2026",
    metaDescription:
      "The cookies FastHaus uses — essential cookies for cart and checkout, consent-based analytics via Google Analytics and PostHog, and how to manage preferences.",
    cards: [
      {
        icon: Cookie,
        title: "Essential only by default",
        text: "Cart, checkout and security cookies always on.",
      },
      {
        icon: ChartColumn,
        title: "Analytics after consent",
        text: "Google Analytics and PostHog run only once you agree.",
      },
      {
        icon: Lock,
        title: "You're in control",
        text: "Change preferences any time in cookie settings.",
      },
    ],
    sections: [
      {
        id: "essential",
        icon: Cookie,
        title: "Essential Cookies",
        paras: ["Required for cart, checkout, security and website functionality."],
      },
      {
        id: "analytics-cookies",
        icon: ChartColumn,
        title: "Analytics Cookies",
        paras: ["Used by Google Analytics and PostHog after consent."],
      },
      {
        id: "marketing",
        icon: Mail,
        title: "Marketing Cookies",
        paras: [
          "Reserved for future advertising integrations and only activated with consent.",
        ],
      },
      {
        id: "managing",
        icon: Lock,
        title: "Managing Cookies",
        paras: [
          "Users can change cookie preferences at any time through the cookie settings panel.",
        ],
        callout: {
          variant: "success",
          text: "You can withdraw consent at any time — preferences apply immediately.",
        },
      },
    ],
  },
];

export function getPolicy(slug: string): Policy | undefined {
  return POLICIES.find((p) => p.slug === slug);
}
