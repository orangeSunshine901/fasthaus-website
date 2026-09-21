/** FAQ content shared by the /faq page UI and its FAQPage structured data. */
export const FAQ_CATEGORIES = [
  "All",
  "Products",
  "Shipping",
  "Returns",
  "Warranty",
  "Custom Projects",
] as const;

export const FAQS: { category: string; question: string; answer: string }[] = [
  {
    category: "Products",
    question: "What are your lamps made of?",
    answer:
      "Our lamps are primarily made from 3D-printed PLA and PETG, combined with a stainless steel base. Each material is chosen for durability, aesthetics, and low environmental impact.",
  },
  {
    category: "Products",
    question: "How long does production take?",
    answer:
      "Each lamp is made to order at our studio. Production takes 2–3 business days. You will get a notification the moment it ships.",
  },
  {
    category: "Shipping",
    question: "Do you ship internationally?",
    answer:
      "Currently we ship to all seven UAE emirates. International shipping is coming soon — sign up for our newsletter to be the first to know.",
  },
  {
    category: "Returns",
    question: "What is your return policy?",
    answer:
      "Eligible products may be returned within 14 days of delivery after reasonable inspection, provided they remain in their original condition. Email hello@fasthaus.studio with your order number, the product and your reason for returning it before sending anything back. Change-of-mind return shipping is the customer's responsibility, and customised products are generally excluded unless faulty, damaged or incorrect.",
  },
  {
    category: "Custom Projects",
    question: "Can you create a custom lamp for my space?",
    answer:
      "Yes! We take custom projects for residential and commercial spaces. Reach out via the contact page with your brief and we will get back to you within one business day.",
  },
  {
    category: "Warranty",
    question: "What does the 1-year warranty cover?",
    answer:
      "Our warranty covers manufacturing defects, LED module failure, electrical components, and structural integrity. It does not cover accidental damage, misuse, or normal wear and surface marks.",
  },
];
