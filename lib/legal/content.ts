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
    desc: "The agreement between you and Fasthaus when you browse the site or place an order.",
    updated: "July 17, 2026",
    metaDescription:
      "The terms that apply when you browse the Fasthaus website or place an order — products, made-to-order production, payment, shipping and governing law.",
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
          "Welcome to Fasthaus. By using this website or placing an order you agree to these Terms & Conditions.",
        ],
      },
      {
        id: "about",
        icon: House,
        title: "About Fasthaus",
        paras: [
          "Fasthaus is a UAE-based design-led fabrication studio producing lighting, décor, signage and custom objects using modern manufacturing methods including 3D printing.",
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
          "Delivery estimates are not guaranteed. Delays caused by couriers, customs or force majeure are outside Fasthaus's control.",
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
          "All product designs, renders, logos, photographs and website content remain the intellectual property of Fasthaus.",
        ],
      },
      {
        id: "liability",
        icon: ShieldCheck,
        title: "Limitation of Liability",
        paras: [
          "Fasthaus is not liable for indirect or consequential damages arising from misuse or circumstances outside its reasonable control.",
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
      "How Fasthaus collects, uses and protects your information — analytics and cookies, third parties, security safeguards and your rights.",
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
        paras: ["Fasthaus uses Google Analytics, PostHog and Google Consent Mode."],
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
    title: "Refund & Return Policy",
    icon: RotateCcw,
    desc: "When products may be returned, exchanged or refunded, and how to start a return.",
    updated: "August 2026",
    metaDescription:
      "Fasthaus returns and refunds — 14-day change-of-mind returns, damaged or faulty products, exchanges, cancellations and refund processing.",
    cards: [
      {
        icon: RotateCcw,
        title: "14-day returns",
        text: "Open and inspect eligible products, then return them in original condition.",
      },
      {
        icon: Package,
        title: "Report damage fast",
        text: "Contact us promptly, ideally within 48 hours for visible delivery damage.",
      },
      {
        icon: CreditCard,
        title: "5–10 business days",
        text: "Approved refunds return to the original payment method after inspection.",
      },
    ],
    sections: [
      {
        id: "change-of-mind",
        icon: RotateCcw,
        title: "1. Change of Mind Returns",
        paras: [
          "We want you to be happy with the objects you bring into your space. If something isn't quite right, we're here to help.",
          "This Refund & Return Policy explains when products purchased from Fasthaus may be returned, exchanged or refunded.",
          "Changed your mind? Eligible products may be returned within 14 days of delivery.",
          "To qualify for a return, the product must:",
        ],
        bullets: [
          "Be unused and in its original condition",
          "Be free from damage, marks, scratches or signs of prolonged use",
          "Include all original components, accessories and documentation",
          "Be returned in its original packaging wherever reasonably possible",
        ],
        callout: {
          variant: "warning",
          text: "You may open the packaging and inspect the product to make sure it is suitable for you. For lamps, briefly assembling or powering on the product for the purpose of inspection will not by itself make the product ineligible for return, provided it is returned in its original condition. Fasthaus reserves the right to refuse a change-of-mind return where a product has been used beyond what is reasonably necessary to inspect it or has been damaged after delivery.",
        },
      },
      {
        id: "starting-a-return",
        icon: BookOpen,
        title: "2. Starting a Return",
        paras: [
          "To request a return, contact us within 14 days of receiving your order and provide:",
        ],
        bullets: [
          "Your order number",
          "The product you wish to return",
          "The reason for the return",
        ],
        callout: {
          variant: "info",
          text: "We will provide the next steps and return instructions. Please do not send a product back without first contacting Fasthaus.",
        },
      },
      {
        id: "return-shipping",
        icon: Truck,
        title: "3. Return Shipping",
        paras: [
          "For change-of-mind returns, the cost of returning the product is the customer's responsibility.",
          "Original delivery charges are non-refundable unless the return is due to an error by Fasthaus or the product is faulty, damaged or otherwise does not conform to the order.",
          "Customers are responsible for ensuring returned products are securely packaged. We recommend using a trackable delivery service.",
        ],
      },
      {
        id: "damaged-faulty-incorrect",
        icon: ShieldCheck,
        title: "4. Damaged, Faulty or Incorrect Products",
        paras: [
          "If your product arrives damaged, faulty, with missing components, different from the product ordered or materially different from its description, please contact us as soon as reasonably possible.",
          "For visible delivery damage, we recommend contacting us within 48 hours of delivery so we can investigate the issue with the delivery provider quickly.",
          "Where possible, please include photographs of the product and the issue, the external and internal packaging, and the shipping label.",
          "The 48-hour notification period helps us investigate delivery damage and does not limit any rights you may have under applicable UAE consumer protection law.",
          "Once the issue has been assessed, Fasthaus may offer an appropriate repair, replacement or refund, depending on the circumstances and your applicable legal rights.",
          "Where the issue is attributable to Fasthaus, we will cover reasonable return or replacement delivery costs.",
        ],
      },
      {
        id: "custom-made-to-order",
        icon: Palette,
        title: "5. Customised & Made-to-Order Products",
        paras: [
          "Some Fasthaus pieces may be customised, personalised or produced specifically for your order.",
          "Unless faulty, damaged, incorrect or otherwise required by applicable law, customised or personalised products cannot be returned simply because you have changed your mind.",
          "Where a product is described as made-to-order but has not been personalised or customised specifically for you, any return eligibility stated on the relevant product page will apply.",
          "We recommend checking all dimensions, colours, specifications and customisation selections carefully before placing your order.",
        ],
      },
      {
        id: "non-returnable",
        icon: Package,
        title: "6. Products That Cannot Be Returned",
        paras: ["Change-of-mind returns may not be accepted for:"],
        bullets: [
          "Customised or personalised products",
          "Products damaged after delivery",
          "Products showing clear signs of prolonged use",
          "Products returned with missing essential components or accessories",
          "Products otherwise identified as non-returnable before purchase, where permitted by law",
        ],
        callout: {
          variant: "info",
          text: "Nothing in this section limits your rights where a product is defective, damaged, incorrectly supplied or otherwise does not conform to your order.",
        },
      },
      {
        id: "refunds",
        icon: CreditCard,
        title: "7. Refunds",
        paras: [
          "Once we receive your return, we will inspect the product and notify you of the outcome.",
          "If approved, your refund will be issued to the original payment method.",
          "We aim to process approved refunds within 5 to 10 business days after the returned product has been received and inspected.",
          "Your bank, card issuer or payment provider may require additional time before the refund appears in your account.",
          "Any differences caused by bank charges, foreign exchange rates or payment-provider processing are outside Fasthaus's control.",
        ],
      },
      {
        id: "exchanges",
        icon: RotateCcw,
        title: "8. Exchanges",
        paras: [
          "If you would prefer another colour, variant or eligible product, contact us and we will let you know whether an exchange is available.",
          "Exchanges are subject to product availability.",
          "Where an exchange is requested simply because you changed your mind, you may be responsible for the associated return and redelivery costs.",
          "If the exchange is required because Fasthaus supplied an incorrect, faulty or damaged product, Fasthaus will cover the reasonable associated delivery costs.",
        ],
      },
      {
        id: "cancelled-orders",
        icon: Hammer,
        title: "9. Refunds for Cancelled Orders",
        paras: [
          "If you contact us before your order has entered production, preparation or dispatch, we will do our best to cancel it.",
          "Orders that have already been dispatched will generally need to follow the normal returns process.",
          "Custom or personalised orders may not be cancellable once production has started.",
        ],
      },
      {
        id: "production-variations",
        icon: Lightbulb,
        title: "10. Colour, Texture & Production Variations",
        paras: [
          "Fasthaus products are design-led objects, and some products may have minor variations in colour, texture, surface finish or appearance resulting from the materials and production process.",
          "Small variations that are inherent to the product and do not affect its intended use are not necessarily considered defects.",
          "However, if you believe the product you received is materially different from its description or product images, contact us and we will review it with you.",
        ],
      },
      {
        id: "damage-after-delivery",
        icon: ShieldCheck,
        title: "11. Products Damaged After Delivery",
        paras: [
          "Fasthaus cannot normally provide a refund or replacement for damage resulting from:",
        ],
        bullets: [
          "Misuse or accidental damage",
          "Incorrect assembly",
          "Failure to follow care or safety instructions",
          "Improper storage",
          "Unauthorised modifications or repairs",
          "Normal wear and tear",
        ],
        callout: {
          variant: "info",
          text: "This does not affect any warranty or consumer rights that may otherwise apply.",
        },
      },
      {
        id: "consumer-rights",
        icon: Scale,
        title: "12. Consumer Rights",
        paras: [
          "This policy is intended to explain Fasthaus's returns process and does not exclude or limit any rights or remedies available to consumers under applicable laws of the United Arab Emirates.",
          "Where applicable law provides greater rights than those described in this policy, those legal rights will apply.",
        ],
      },
      {
        id: "contact",
        icon: Mail,
        title: "13. Contact Us",
        paras: [
          "If you have a question about a return, refund or product issue, please contact Fasthaus through the contact details provided on our website.",
          "When contacting us about an existing order, please include your order number so we can assist you more quickly.",
        ],
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
      "Fasthaus shipping — made-to-order production times, delivery regions starting with the UAE, tracking emails and customs responsibilities.",
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
      "Fasthaus warranty — 12 months on supplied electrical components, 30-day workmanship warranty on printed components, and what is excluded.",
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
        paras: ["Your Fasthaus product is covered by:"],
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
      "The cookies Fasthaus uses — essential cookies for cart and checkout, consent-based analytics via Google Analytics and PostHog, and how to manage preferences.",
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
        paras: ["Reserved for future advertising integrations and only activated with consent."],
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
