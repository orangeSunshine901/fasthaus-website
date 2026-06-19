export type ProductVariant = {
  id: string;
  color: string;
  colorHex: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  images: string[];
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  featured: boolean;
  badge?: "NEW" | "SALE" | "BESTSELLER";
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  specs: { icon: string; label: string; sublabel: string }[];
  perfectFor: string[];
  designStory: string;
  addOns?: { id: string; name: string; price: number; image: string; description: string }[];
};

export const ADD_ONS = [
  {
    id: "dimmer-switch",
    name: "Dimmer Switch",
    price: 99,
    image: "/add-on-dimmer-switch.png",
    description: "Adjust brightness to feel like perfect mood.",
  },
  {
    id: "care-kit",
    name: "Care Kit",
    price: 45,
    image: "/add-on-care-kit.png",
    description: "Keep your lamp feeling perfect for years.",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "luna-desk-lamp",
    name: "Luna Desk Lamp",
    category: "desk-lamps",
    description:
      "A modern desk lamp featuring a textured 3D-printed diffuser, warm integrated LED lighting, and a powder-coated aluminium base.",
    featured: true,
    badge: "BESTSELLER",
    rating: 4.4,
    reviewCount: 32,
    variants: [
      {
        id: "1-terracotta",
        color: "Terracotta",
        colorHex: "#C1694F",
        sku: "LDL-TRC",
        price: 220,
        stock: 12,
        images: ["/lamp-feature-1.png"],
      },
      {
        id: "1-beige",
        color: "Beige",
        colorHex: "#D9C5A0",
        sku: "LDL-BGE",
        price: 220,
        stock: 8,
        images: ["/lamp-feature-2.png", "/lamp-feature-1.png", "/lamp-feature-3.png"],
      },
      {
        id: "1-charcoal",
        color: "Charcoal",
        colorHex: "#3A3A3A",
        sku: "LDL-CHR",
        price: 220,
        stock: 5,
        images: ["/lamp-feature-3.png", "/lamp-feature-1.png", "/lamp-feature-2.png"],
      },
    ],
    specs: [
      { icon: "🖨️", label: "3D Print", sublabel: "soft matte" },
      { icon: "💡", label: "LED light", sublabel: "2700K warm" },
      { icon: "✨", label: "Premium materials", sublabel: "aluminium base" },
      { icon: "🏠", label: "Designed in-house", sublabel: "Dubai studio" },
    ],
    perfectFor: ["Workspace", "Bedside", "Living Room", "Reading Nook"],
    designStory:
      "Inspired by architectural forms and soft evening light, the Luna Desk Lamp was designed to create a calm focal point within a workspace. The layered diffuser transforms the visible characteristics of additive manufacturing into a deliberate design feature, creating a warm glow and subtle texture that changes throughout the day.",
    addOns: ADD_ONS,
  },
  {
    id: "2",
    slug: "arc-table-lamp",
    name: "Arc Table Lamp",
    category: "table-lamps",
    description:
      "A sculptural table lamp with a sweeping arc silhouette and frosted glass diffuser. Pairs effortlessly with modern and mid-century interiors.",
    featured: true,
    badge: "NEW",
    rating: 4.7,
    reviewCount: 18,
    variants: [
      {
        id: "2-white",
        color: "White",
        colorHex: "#F5F5F5",
        sku: "ATL-WHT",
        price: 190,
        stock: 10,
        images: ["/lamp-feature-2.png","/collection-image-2.png"],
      },
      {
        id: "2-black",
        color: "Black",
        colorHex: "#1A1A1A",
        sku: "ATL-BLK",
        price: 190,
        stock: 6,
        images: ["/lamp-feature-4.png", "/collection-image-1.png"],
      },
    ],
    specs: [
      { icon: "🔮", label: "Frosted glass", sublabel: "diffused light" },
      { icon: "💡", label: "LED light", sublabel: "3000K natural" },
      { icon: "✨", label: "Premium materials", sublabel: "steel frame" },
      { icon: "🏠", label: "Designed in-house", sublabel: "Dubai studio" },
    ],
    perfectFor: ["Living Room", "Bedside", "Reading Nook"],
    designStory:
      "The Arc Table Lamp draws from the geometry of suspension bridges — tension and balance expressed in a single sweeping form. The frosted glass diffuser softens the LED source into an even, comfortable glow suited for long evenings.",
    addOns: ADD_ONS,
  },
  {
    id: "3",
    slug: "porta-table-lamp",
    name: "Porta Table Lamp",
    category: "table-lamps",
    description:
      "Compact and portable with a rechargeable base. Move it from desk to dining table to bedside without hunting for an outlet.",
    featured: true,
    rating: 4.2,
    reviewCount: 24,
    variants: [
      {
        id: "3-sand",
        color: "Sand",
        colorHex: "#C9B99A",
        sku: "PTL-SND",
        price: 175,
        stock: 14,
        images: ["/lamp-feature-3.png","/collection-image-2.png"],
      },
      {
        id: "3-sage",
        color: "Sage",
        colorHex: "#7A9E7E",
        sku: "PTL-SGE",
        price: 175,
        stock: 7,
        images: ["/lamp-feature-4.png", "/collection-image-2.png"],
      },
    ],
    specs: [
      { icon: "🔋", label: "Rechargeable", sublabel: "12hr battery" },
      { icon: "💡", label: "LED light", sublabel: "adjustable warmth" },
      { icon: "✨", label: "Premium materials", sublabel: "ceramic body" },
      { icon: "🏠", label: "Designed in-house", sublabel: "Dubai studio" },
    ],
    perfectFor: ["Workspace", "Dining", "Bedside", "Outdoor"],
    designStory:
      "The Porta was designed around one constraint: freedom. No cable, no fixed spot. A 12-hour rechargeable base and a magnetic USB-C port mean it goes where you go — from morning work session to evening dinner table.",
    addOns: [ADD_ONS[0]],
  },
  {
    id: "4",
    slug: "ribbed-table-lamp",
    name: "Ribbed Table Lamp",
    category: "table-lamps",
    description:
      "A tactile ribbed ceramic body that plays with light and shadow. Each piece is slightly unique — the result of a hand-finishing process.",
    featured: true,
    rating: 4.5,
    reviewCount: 11,
    variants: [
      {
        id: "4-terracotta",
        color: "Terracotta",
        colorHex: "#C1694F",
        sku: "RTL-TRC",
        price: 195,
        stock: 9,
        images: ["/lamp-feature-4.png","/collection-image-3.png"],
      },
      {
        id: "4-chalk",
        color: "Chalk",
        colorHex: "#EAE8E4",
        sku: "RTL-CHK",
        price: 195,
        stock: 4,
        images: ["/lamp-feature-2.png", "/collection-image-3.png"],
      },
    ],
    specs: [
      { icon: "🏺", label: "Handfinished", sublabel: "ceramic body" },
      { icon: "💡", label: "LED light", sublabel: "2700K warm" },
      { icon: "✨", label: "Premium materials", sublabel: "linen shade" },
      { icon: "🏠", label: "Designed in-house", sublabel: "Dubai studio" },
    ],
    perfectFor: ["Living Room", "Bedside", "Reading Nook"],
    designStory:
      "The ribbed texture was born from a material experiment — pressing linen weave into soft clay to see what light would do with the result. The answer: something that feels alive as the sun moves through the room.",
    addOns: ADD_ONS,
  },
  {
    id: "5",
    slug: "dome-table-lamp",
    name: "Dome Table Lamp",
    category: "table-lamps",
    description:
      "A clean, minimal dome silhouette in spun aluminium. Equally at home in a minimalist apartment or an art director's studio.",
    featured: false,
    badge: "SALE",
    rating: 4.6,
    reviewCount: 29,
    variants: [
      {
        id: "5-charcoal",
        color: "Charcoal",
        colorHex: "#3A3A3A",
        sku: "DTL-CHR",
        price: 210,
        comparePrice: 260,
        stock: 6,
        images: ["/collection-image-4.png", "/lamp-feature-4.png"],
      },
      {
        id: "5-white",
        color: "White",
        colorHex: "#F5F5F5",
        sku: "DTL-WHT",
        price: 210,
        comparePrice: 260,
        stock: 3,
        images: ["/lamp-feature-4.png", "/collection-image-4.png"],
      },
    ],
    specs: [
      { icon: "🔩", label: "Spun aluminium", sublabel: "lightweight" },
      { icon: "💡", label: "LED light", sublabel: "3000K natural" },
      { icon: "✨", label: "Premium materials", sublabel: "matte finish" },
      { icon: "🏠", label: "Designed in-house", sublabel: "Dubai studio" },
    ],
    perfectFor: ["Workspace", "Studio", "Living Room"],
    designStory:
      "The Dome is the lamp that disappears. Its single-radius silhouette was refined over 14 iterations to achieve a form that reads as obvious in retrospect — the kind of design that just belongs in a room.",
    addOns: ADD_ONS,
  },
  {
    id: "6",
    slug: "canvas-tote-lamp",
    name: "Canvas Floor Lamp",
    category: "floor-lamps",
    description:
      "A floor lamp with a natural canvas shade and solid oak tripod base. Warm, organic, and impossible to over-style.",
    featured: false,
    rating: 4.3,
    reviewCount: 8,
    variants: [
      {
        id: "6-natural",
        color: "Natural",
        colorHex: "#C9B99A",
        sku: "CFL-NAT",
        price: 310,
        stock: 5,
        images: ["/collections-hero-img-1.png", "/lamp-feature-3.png"],
      },
    ],
    specs: [
      { icon: "🌿", label: "Natural canvas", sublabel: "hand-sewn shade" },
      { icon: "💡", label: "LED bulb", sublabel: "2700K warm" },
      { icon: "🪵", label: "Oak tripod", sublabel: "solid wood" },
      { icon: "🏠", label: "Designed in-house", sublabel: "Dubai studio" },
    ],
    perfectFor: ["Living Room", "Reading Nook", "Bedroom"],
    designStory:
      "The Canvas Floor Lamp started as a sketch of a structure you'd find in a photographer's studio. The oak tripod grounds it; the hand-sewn canvas shade softens it. The result is a lamp that feels curated rather than bought.",
    addOns: [ADD_ONS[1]],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.featured);
}

export function getNewArrivals(): Product[] {
  return PRODUCTS.slice(0, 6);
}

export function getRelatedProducts(currentSlug: string, category: string): Product[] {
  return PRODUCTS.filter((p) => p.slug !== currentSlug && p.category === category).slice(0, 4);
}

export function getDefaultVariant(product: Product): ProductVariant {
  return product.variants[0];
}

export function formatPrice(amount: number): string {
  return amount.toFixed(2);
}
