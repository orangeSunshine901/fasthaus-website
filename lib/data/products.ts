export type ProductVariant = {
  id: string;
  color: string;
  colorHex: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  /** Images used by featured cards for the light-off and light-on states. */
  featuredImages: {
    lightOff: string;
    lightOn: string;
  };
  /** Image displayed on collection and category product cards for this variant. */
  collectionImage: string;
  /** Primary image shown when this color is selected on the product page. */
  mainImage?: string;
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
  materialsDescription: string[];
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
    id: "3",
    slug: "nasaq-lamp",
    name: "NASAQ",
    category: "table-lamps",
    description:
      "Layered, rounded forms inspired by early-2010s abstraction create a warm, calm presence for slower evenings.",
    featured: true,
    rating: 4.2,
    reviewCount: 24,
    variants: [
      {
        id: "3-orange",
        color: "Burnt Orange",
        colorHex: "#F7633A",
        sku: "STL-ORNG",
        price: 299,
        stock: 14,
        featuredImages: {
          lightOff: "/stack-lamp/stack-lamp-orange-off.png",
          lightOn: "/stack-lamp/stack-lamp-orange-on.png",
        },
        collectionImage: "/stack-lamp/stack-lamp-orange-off-product-shadow.png",
        mainImage: "/stack-lamp/stack-lamp-orange-on.png",
        images: ["/stack-lamp/stack-lamp-orange-on.png", "/stack-lamp/stack-lamp-orange-off.png"],
      },
      {
        id: "3-blue",
        color: "Cobalt Blue",
        colorHex: "#007ffe",
        sku: "STL-BLU",
        price: 299,
        stock: 7,
        featuredImages: {
          lightOff: "/stack-lamp/stack-lamp-blue-off.png",
          lightOn: "/stack-lamp/stack-lamp-blue-on.png",
        },
        collectionImage: "/stack-lamp/stack-lamp-blue-off-product-shadow.png",
        mainImage: "/stack-lamp/stack-lamp-blue-on.png",
        images: ["/stack-lamp/stack-lamp-blue-on.png", "/stack-lamp/stack-lamp-blue-off.png"],
      },
      {
        id: "3-white",
        color: "White",
        colorHex: "#F5F5F5",
        sku: "STL-WHT",
        price: 299,
        stock: 7,
        featuredImages: {
          lightOff: "/stack-lamp/stack-lamp-white-off.png",
          lightOn: "/stack-lamp/stack-lamp-white-on.png",
        },
        collectionImage: "/stack-lamp/stack-lamp-white-off-product-shadow.png",
        mainImage: "/stack-lamp/stack-lamp-white-on.png",
        images: ["/stack-lamp/stack-lamp-white-off.png", "/stack-lamp/stack-lamp-white-on.png"],
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
    materialsDescription: [
      "The lamp body and shade are made from plant-based PLA, a more sustainable alternative to conventional plastics. A laser-cut, UV-printed stainless-steel base plate provides lasting strength, stability, and recyclability.",
    ],
    materials: ["Plant-based PLA", "UV-printed stainless steel"],
    dimensions: { image: "/lamp-feature-3.png", heightCm: 24, widthCm: 14 },
    perfectFor: [
      { icon: "/workspaces-icon.svg", label: "Workspaces" },
      { icon: "/living-room-icon.svg", label: "Dining" },
      { icon: "/bedside-icon.svg", label: "Bedside" },
      { icon: "/reading-nook-icon.svg", label: "Outdoor" },
    ],
    designStory:
      "The Flute was designed around one constraint: freedom. No cable, no fixed spot. A 12-hour rechargeable base and a magnetic USB-C port mean it goes where you go — from morning work session to evening dinner table.",
    addOns: [ADD_ONS[0]],
  },
  {
    id: "1",
    slug: "nujaj-desk-lamp",
    name: "NUJĀJ",
    category: "table-lamps",
    description:
      "Inspired by timeless fluted architecture, bringing warmth, texture, and elegance to modern interiors.",
    featured: true,
    // badge: "BESTSELLER",
    rating: 4.4,
    reviewCount: 32,
    variants: [
      {
        id: "1-matcha-green",
        color: "Matcha Green",
        colorHex: "#c5d371",
        sku: "TFL-MG",
        price: 329,
        stock: 8,
        featuredImages: {
          lightOff: "/flute-lamp/flute-matcha-off.png",
          lightOn: "/flute-lamp/flute-matcha-on.png",
        },
        collectionImage: "/flute-lamp/flute-matcha-hero.png",
        mainImage: "/flute-lamp/flute-clear-garden-main.jpg",
        images: [
          "/flute-lamp/flute-matcha-hero.png",
          "/flute-lamp/flute-matcha-hero-light.png",
          "/flute-lamp/flute-matcha-on.png",
          "/flute-lamp/flute-clear-garden.png",
        ],
      },
      {
        id: "1-fire-red",
        color: "Cherry Red",
        colorHex: "#942025",
        sku: "TFL-FR",
        price: 329,
        stock: 12,
        featuredImages: {
          lightOff: "/flute-lamp/flute-fire-red-off.png",
          lightOn: "/flute-lamp/flute-fire-red-on.png",
        },
        collectionImage: "/flute-lamp/flute-red-hero.png",
        mainImage: "/flute-lamp/flute-clear-garden-main.jpg",
        images: [
          "/flute-lamp/flute-red-hero.png",
          "/flute-lamp/flute-fire-red-off.png",
          "/flute-lamp/flute-clear-garden.png",
        ],
      },
      {
        id: "1-clear",
        color: "Clear",
        colorHex: "#F5F5F5",
        sku: "LDL-CLR",
        price: 329,
        stock: 5,
        featuredImages: {
          lightOff: "/flute-lamp/flute-clear-off.png",
          lightOn: "/flute-lamp/flute-clear-on.png",
        },
        collectionImage: "/flute-lamp/flute-clear-off-shadow-product.png",
        mainImage: "/flute-lamp/flute-clear-garden-main.jpg",
        images: [
          "/flute-lamp/flute-clear-off.png",
          "/flute-lamp/flute-clear-on.png",
          "/flute-lamp/flute-clear-garden.png",
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
        lines: ["Smart bulb compatible but not advisable with the dimmer switch."],
      },
    ],
    materialsDescription: [
      "The lamp base is made from plant-based PLA and paired with a laser-cut, UV-printed stainless-steel base plate. The PETG shade offers excellent translucency and durability and can be recycled where suitable facilities are available.",
    ],
    materials: ["Plant-based PLA", "PETG", "UV-printed stainless steel"],
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
    id: "4",
    slug: "hamrah-lamp",
    name: "HAMRAH",
    category: "table-lamps",
    description:
      "A ribbed sculptural lamp inspired by pearl-diving heritage, with a hidden warm glow that feels calm and inviting.",
    featured: true,
    rating: 4.5,
    reviewCount: 11,
    variants: [
      {
        id: "4-red",
        color: "Cherry Red",
        colorHex: "#942025",
        sku: "PTL-FRD",
        price: 379,
        stock: 9,
        featuredImages: {
          lightOff: "/pearl-lamp/pearl-lamp-red-off.png",
          lightOn: "/pearl-lamp/pearl-lamp-red-on.png",
        },
        collectionImage: "/pearl-lamp/pearl-lamp-red-off-product-shadow.png",
        mainImage: "/pearl-lamp/pearl-lamp-red-off.png",
        images: ["/pearl-lamp/pearl-lamp-red-off.png", "/pearl-lamp/pearl-lamp-red-on.png"],
      },
      {
        id: "4-blue",
        color: "Cobalt Blue",
        colorHex: "#007ffe",
        sku: "PTL-BLU",
        price: 379,
        stock: 4,
        featuredImages: {
          lightOff: "/pearl-lamp/pearl-lamp-blue-off.png",
          lightOn: "/pearl-lamp/pearl-lamp-blue-on.png",
        },
        collectionImage: "/pearl-lamp/pearl-lamp-blue-off-shadow.png",
        mainImage: "/pearl-lamp/pearl-lamp-blue-off.png",
        images: ["/pearl-lamp/pearl-lamp-blue-off.png", "/pearl-lamp/pearl-lamp-blue-on.png"],
      },
      {
        id: "4-white",
        color: "White",
        colorHex: "#F5F5F5",
        sku: "PTL-WHT",
        price: 379,
        stock: 4,
        featuredImages: {
          lightOff: "/pearl-lamp/pearl-lamp-white-off.png",
          lightOn: "/pearl-lamp/pearl-lamp-white-on.png",
        },
        collectionImage: "/pearl-lamp/pearl-lamp-white-off-product-shadow.png",
        mainImage: "/pearl-lamp/pearl-lamp-white-off.png",
        images: ["/pearl-lamp/pearl-lamp-white-off.png", "/pearl-lamp/pearl-lamp-white-on.png"],
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
        lines: ["Smart bulb compatible but not advisable with the dimmer switch."],
      },
    ],
    materialsDescription: [
      "The lamp body and shade are made from plant-based PLA, a more sustainable alternative to conventional plastics. A laser-cut, UV-printed stainless-steel base plate provides lasting strength, stability, and recyclability.",
    ],
    materials: ["Plant-based PLA", "UV-printed stainless steel"],
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
    id: "2",
    slug: "kasane-lamp",
    name: "KASANE",
    category: "table-lamps",
    description:
      "Desert sand ripples, translated into a sculptural lamp that casts a soft, calming glow.",
    featured: true,
    // badge: "BESTSELLER",
    rating: 4.7,
    reviewCount: 18,
    variants: [
      {
        id: "2-cobalt-blue",
        color: "Cobalt Blue",
        colorHex: "#007ffe",
        sku: "ML-CB",
        price: 399,
        stock: 6,
        featuredImages: {
          lightOff: "/mushroom-lamp/mushroom-blue-off.png",
          lightOn: "/mushroom-lamp/mushroom-blue-on.png",
        },
        collectionImage: "/mushroom-lamp/mushroom-blue-off-product-shadow.png",
        mainImage: "/mushroom-lamp/mushroom-lamp-main-amber.jpg",
        images: [
          "/mushroom-lamp/mushroom-lamp-top.jpg",
          "/mushroom-lamp/mushroom-lamp-side.jpg",
          "/mushroom-lamp/mushroom-lamp-close.jpg",
          "/mushroom-lamp/mushroom-lamp-close-side.jpg",
        ],
      },
      {
        id: "2-burnt-orange",
        color: "Burnt Orange",
        colorHex: "#f7633a",
        sku: "ML-BO",
        price: 399,
        stock: 6,
        featuredImages: {
          lightOff: "/mushroom-lamp/mushroom-orange-off.png",
          lightOn: "/mushroom-lamp/mushroom-orange-on.png",
        },
        collectionImage: "/mushroom-lamp/mushroom-orange-off-product-shadow.png",
        mainImage: "/mushroom-lamp/mushroom-lamp-main-amber.jpg",
        images: [
          "/mushroom-lamp/mushroom-lamp-top.jpg",
          "/mushroom-lamp/mushroom-lamp-side.jpg",
          "/mushroom-lamp/mushroom-lamp-close.jpg",
          "/mushroom-lamp/mushroom-lamp-close-side.jpg",
        ],
      },

      {
        id: "2-white",
        color: "White",
        colorHex: "#F5F5F5",
        sku: "ML-WHT",
        price: 399,
        stock: 10,
        featuredImages: {
          lightOff: "/mushroom-lamp/mushroom-white-off.png",
          lightOn: "/mushroom-lamp/mushroom-white-on.png",
        },
        collectionImage: "/mushroom-lamp/mushroom-white-off-product-shadow.png",
        mainImage: "/mushroom-lamp/mushroom-lamp-main-amber.jpg",
        images: [
          "/mushroom-lamp/mushroom-lamp-top.jpg",
          "/mushroom-lamp/mushroom-lamp-side.jpg",
          "/mushroom-lamp/mushroom-lamp-close.jpg",
          "/mushroom-lamp/mushroom-lamp-close-side.jpg",
        ],
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
        lines: ["Smart bulb compatible but not advisable with the dimmer switch."],
      },
    ],
    materialsDescription: [
      "The lamp body and shade are made from plant-based PLA, a more sustainable alternative to conventional plastics. A laser-cut, UV-printed stainless-steel base plate provides lasting strength, stability, and recyclability.",
    ],
    materials: ["Plant-based PLA", "UV-printed stainless steel"],
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

export function getVariantImage(variant: ProductVariant): string {
  return variant.collectionImage;
}

export function getVariantMainImage(variant: ProductVariant): string {
  return variant.mainImage ?? variant.images[0] ?? variant.collectionImage;
}

export function getVariantGalleryImages(variant: ProductVariant): string[] {
  const mainImage = getVariantMainImage(variant);
  return [mainImage, ...variant.images.filter((image) => image !== mainImage)];
}

export function formatPrice(amount: number): string {
  return amount.toFixed(2);
}
