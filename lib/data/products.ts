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

export type FeatureItem = { icon: string; label: string };
export type SpecificationItem = { icon: string; lines: string[] };
export type PerfectForItem = { icon: string; label: string };
export type Dimensions = { image: string; heightCm: number; widthCm: number };

export type AddOn = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  bullets?: string[];
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
  features: FeatureItem[];
  specifications: SpecificationItem[];
  materials: string[];
  dimensions: Dimensions;
  perfectFor: PerfectForItem[];
  designStory: string;
  addOns?: AddOn[];
};

export const ADD_ONS: AddOn[] = [
  {
    id: "dimmer-switch",
    name: "Dimmer Switch",
    price: 99,
    image: "/add-on-dimmer-switch.png",
    description: "Adjust brightness to set the perfect mood.",
    bullets: ["Turn to dim", "10% – 100% brightness", "Compatible with Luna Desk Lamp"],
  },
  {
    id: "care-kit",
    name: "Care Kit",
    price: 49,
    image: "/add-on-care-kit.png",
    description: "Keep your lamp looking perfect for years.",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "luna-desk-lamp",
    name: "Luna Desk Lamp",
    category: "desk-lamps",
    description:
      "A modern desk lamp featuring a textured 3D-printed diffuser, warm integrated LED lighting, and a powder-coated aluminium stem. \n A modern desk lamp featuring a textured 3D-printed diffuser, warm integrated LED lighting, and a powder-coated aluminium stem.",
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
        images: [
          "/lamp-feature-1.png",
          "/lamp-feature-2.png",
          "/lamp-feature-3.png",
          "/lamp-feature-4.png",
          "/collection-image-1.png",
        ],
      },
      {
        id: "1-beige",
        color: "Beige",
        colorHex: "#D9C5A0",
        sku: "LDL-BGE",
        price: 220,
        stock: 8,
        images: [
          "/lamp-feature-2.png",
          "/lamp-feature-1.png",
          "/lamp-feature-3.png",
          "/lamp-feature-4.png",
          "/collection-image-2.png",
        ],
      },
      {
        id: "1-charcoal",
        color: "Charcoal",
        colorHex: "#3A3A3A",
        sku: "LDL-CHR",
        price: 220,
        stock: 5,
        images: [
          "/lamp-feature-3.png",
          "/lamp-feature-1.png",
          "/lamp-feature-2.png",
          "/lamp-feature-4.png",
          "/collection-image-3.png",
        ],
      },
    ],
    features: [
      { icon: "/3d-printer-icon.svg", label: "3D printed with care" },
      { icon: "/warm-led-icon.svg", label: "Warm LED Light" },
      { icon: "/premium-material-icon.svg", label: "Premium Materials" },
      { icon: "/designed-in-house-icon.svg", label: "Designed in house" },
    ],
    specifications: [
      {
        icon: "/e27-switch-icon.svg",
        lines: ["E27 Switch Voltage (input) 220-240V", "Max Watt 40W Cord Length 1.8m / 70 in"],
      },
      {
        icon: "/e27-bulb-icon-amber.svg",
        lines: ["E27 Solhetta Bulb 470lm 40W", "Bulb Included."],
      },
      {
        icon: "/smart-bulb-icon.svg",
        lines: ["Smart bulb compatible"],
      },
    ],
    materials: ["PLA", "Stainless Steel"],
    dimensions: { image: "/dimensions-lamp.png", heightCm: 28, widthCm: 22 },
    perfectFor: [
      { icon: "/workspaces-icon.svg", label: "Workspaces" },
      { icon: "/bedside-icon.svg", label: "Bedside" },
      { icon: "/living-room-icon.svg", label: "Living Room" },
      { icon: "/reading-nook-icon.svg", label: "Reading Nook" },
    ],
    designStory:
      "Inspired by architectural forms and soft evening light, the Luna Desk Lamp was designed to create a calm focal point within a workspace. The layered diffuser transforms the visible characteristics of additive manufacturing into a deliberate design feature, producing a warm glow and subtle texture that changes throughout the day.",
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
        images: ["/lamp-feature-2.png", "/collection-image-2.png"],
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
    features: [
      { icon: "/premium-material-icon.svg", label: "Frosted glass diffuser" },
      { icon: "/warm-led-icon.svg", label: "Natural LED Light" },
      { icon: "/premium-material-icon.svg", label: "Premium Materials" },
      { icon: "/designed-in-house-icon.svg", label: "Designed in house" },
    ],
    specifications: [
      {
        icon: "/spec-plug-icon.svg",
        lines: ["E27 Switch Voltage (input) 220-240V", "Max Watt 40W Cord Length 1.8m / 70 in"],
      },
      {
        icon: "/spec-bulb-icon.svg",
        lines: ["E27 Solhetta Bulb 470lm 40W", "Bulb Included."],
      },
      {
        icon: "/smart-bulb-icon.svg",
        lines: ["Smart bulb compatible"],
      },
    ],
    materials: ["Frosted Glass", "Powder-Coated Steel"],
    dimensions: { image: "/lamp-feature-2.png", heightCm: 38, widthCm: 26 },
    perfectFor: [
      { icon: "/living-room-icon.svg", label: "Living Room" },
      { icon: "/bedside-icon.svg", label: "Bedside" },
      { icon: "/reading-nook-icon.svg", label: "Reading Nook" },
    ],
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
        images: ["/lamp-feature-3.png", "/collection-image-2.png"],
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
    features: [
      { icon: "/premium-material-icon.svg", label: "12hr battery life" },
      { icon: "/warm-led-icon.svg", label: "Adjustable warmth" },
      { icon: "/premium-material-icon.svg", label: "Ceramic body" },
      { icon: "/designed-in-house-icon.svg", label: "Designed in house" },
    ],
    specifications: [
      {
        icon: "/spec-plug-icon.svg",
        lines: ["USB-C Charging 5V/2A", "12-hour battery runtime"],
      },
      {
        icon: "/spec-bulb-icon.svg",
        lines: ["Integrated LED 350lm 5W", "Adjustable 2700–4000K"],
      },
    ],
    materials: ["Ceramic", "Aluminium"],
    dimensions: { image: "/lamp-feature-3.png", heightCm: 24, widthCm: 14 },
    perfectFor: [
      { icon: "/workspaces-icon.svg", label: "Workspaces" },
      { icon: "/living-room-icon.svg", label: "Dining" },
      { icon: "/bedside-icon.svg", label: "Bedside" },
      { icon: "/reading-nook-icon.svg", label: "Outdoor" },
    ],
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
        images: ["/lamp-feature-4.png", "/collection-image-3.png"],
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
    features: [
      { icon: "/premium-material-icon.svg", label: "Handfinished ceramic" },
      { icon: "/warm-led-icon.svg", label: "Warm LED Light" },
      { icon: "/premium-material-icon.svg", label: "Linen shade" },
      { icon: "/designed-in-house-icon.svg", label: "Designed in house" },
    ],
    specifications: [
      {
        icon: "/spec-plug-icon.svg",
        lines: ["E27 Switch Voltage (input) 220-240V", "Max Watt 40W Cord Length 1.8m / 70 in"],
      },
      {
        icon: "/spec-bulb-icon.svg",
        lines: ["E27 Solhetta Bulb 470lm 40W", "Bulb Included."],
      },
      {
        icon: "/smart-bulb-icon.svg",
        lines: ["Smart bulb compatible"],
      },
    ],
    materials: ["Ceramic", "Linen"],
    dimensions: { image: "/lamp-feature-4.png", heightCm: 32, widthCm: 20 },
    perfectFor: [
      { icon: "/living-room-icon.svg", label: "Living Room" },
      { icon: "/bedside-icon.svg", label: "Bedside" },
      { icon: "/reading-nook-icon.svg", label: "Reading Nook" },
    ],
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
    features: [
      { icon: "/premium-material-icon.svg", label: "Spun aluminium" },
      { icon: "/warm-led-icon.svg", label: "Natural LED Light" },
      { icon: "/premium-material-icon.svg", label: "Matte finish" },
      { icon: "/designed-in-house-icon.svg", label: "Designed in house" },
    ],
    specifications: [
      {
        icon: "/spec-plug-icon.svg",
        lines: ["E27 Switch Voltage (input) 220-240V", "Max Watt 40W Cord Length 1.8m / 70 in"],
      },
      {
        icon: "/spec-bulb-icon.svg",
        lines: ["E27 Solhetta Bulb 470lm 40W", "Bulb Included."],
      },
      {
        icon: "/smart-bulb-icon.svg",
        lines: ["Smart bulb compatible"],
      },
    ],
    materials: ["Spun Aluminium"],
    dimensions: { image: "/collection-image-4.png", heightCm: 30, widthCm: 24 },
    perfectFor: [
      { icon: "/workspaces-icon.svg", label: "Workspaces" },
      { icon: "/workspaces-icon.svg", label: "Studio" },
      { icon: "/living-room-icon.svg", label: "Living Room" },
    ],
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
    features: [
      { icon: "/premium-material-icon.svg", label: "Hand-sewn canvas" },
      { icon: "/warm-led-icon.svg", label: "Warm LED Light" },
      { icon: "/premium-material-icon.svg", label: "Solid oak tripod" },
      { icon: "/designed-in-house-icon.svg", label: "Designed in house" },
    ],
    specifications: [
      {
        icon: "/spec-plug-icon.svg",
        lines: ["E27 Switch Voltage (input) 220-240V", "Max Watt 60W Cord Length 2.2m / 87 in"],
      },
      {
        icon: "/spec-bulb-icon.svg",
        lines: ["E27 Solhetta Bulb 806lm 60W", "Bulb Included."],
      },
      {
        icon: "/smart-bulb-icon.svg",
        lines: ["Smart bulb compatible"],
      },
    ],
    materials: ["Canvas", "Solid Oak"],
    dimensions: { image: "/collections-hero-img-1.png", heightCm: 140, widthCm: 55 },
    perfectFor: [
      { icon: "/living-room-icon.svg", label: "Living Room" },
      { icon: "/reading-nook-icon.svg", label: "Reading Nook" },
      { icon: "/bedside-icon.svg", label: "Bedroom" },
    ],
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
  const sameCategory = PRODUCTS.filter((p) => p.slug !== currentSlug && p.category === category);
  const others = PRODUCTS.filter((p) => p.slug !== currentSlug && p.category !== category);
  return [...sameCategory, ...others].slice(0, 4);
}

export function getDefaultVariant(product: Product): ProductVariant {
  return product.variants[0];
}

export function formatPrice(amount: number): string {
  return amount.toFixed(2);
}
