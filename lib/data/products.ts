export type ProductCarouselImage = {
  src: string;
  mobileSrc?: string;
  uiTheme: "light" | "dark";
};

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
  /** Background image used when this variant is featured in the empty cart drawer. */
  cartDrawerImage: string;
  /** Mobile-composed image displayed on collection and category product cards. */
  collectionMobileImage?: string;
  /** Primary image shown when this color is selected on the product page. */
  mainImage?: string;
  images: ProductCarouselImage[];
};

export type FeatureItem = { icon: string; label: string };
export type SpecificationItem = { label: string; lines: string[] };
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
    description: "Layered curves made for slower, calmer evenings.",
    featured: true,
    rating: 4.2,
    reviewCount: 24,
    variants: [
      {
        id: "3-cobalt-blue",
        color: "Cobalt Blue",
        colorHex: "#007ffe",
        sku: "STL-BLU",
        price: 299,
        stock: 7,
        featuredImages: {
          lightOff: "/stack-lamp/stack-lamp-blue-off.png",
          lightOn: "/stack-lamp/stack-lamp-blue-on.png",
        },
        collectionImage: "/stack-lamp/stack-lamp-blue-off-collection.png",
        cartDrawerImage: "",
        collectionMobileImage: "/stack-lamp/stack-lamp-blue-off-product-mobile.png",
        mainImage: "/stack-lamp/stack-lamp-blue-on.png",
        images: [
          {
            src: "/stack-lamp/stack-lamp-blue-off-product.png",
            mobileSrc: "/stack-lamp/stack-lamp-blue-off-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/stack-lamp/stack-lamp-blue-on-product.png",
            mobileSrc: "/stack-lamp/stack-lamp-blue-on-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/stack-lamp/stack-lamp-blue-lifestyle.png",
            mobileSrc: "/stack-lamp/stack-lamp-blue-lifestyle.png",
            uiTheme: "light",
          },
        ],
      },
      {
        id: "3-tangerine",
        color: "Tangerine",
        colorHex: "#F7633A",
        sku: "STL-TG",
        price: 299,
        stock: 14,
        featuredImages: {
          lightOff: "/stack-lamp/stack-lamp-orange-off.png",
          lightOn: "/stack-lamp/stack-lamp-orange-on.png",
        },
        collectionImage: "/stack-lamp/stack-lamp-orange-off-collection.png",
        cartDrawerImage: "",
        collectionMobileImage: "/stack-lamp/stack-lamp-orange-off-product-mobile.png",
        mainImage: "/stack-lamp/stack-lamp-orange-on.png",
        images: [
          {
            src: "/stack-lamp/stack-lamp-orange-off-product.png",
            mobileSrc: "/stack-lamp/stack-lamp-orange-off-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/stack-lamp/stack-lamp-orange-on-product.png",
            mobileSrc: "/stack-lamp/stack-lamp-orange-on-product-mobile.png",
            uiTheme: "dark",
          },
          { src: "/stack-lamp/stack-lamp-orange-lifestyle-1.png", uiTheme: "dark" },
          { src: "/stack-lamp/stack-lamp-orange-lifestyle.png", uiTheme: "dark" },
        ],
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
        collectionImage: "/stack-lamp/stack-lamp-white-off-collection.png",
        cartDrawerImage: "",
        collectionMobileImage: "/stack-lamp/stack-lamp-white-off-product-mobile.png",
        mainImage: "/stack-lamp/stack-lamp-white-on.png",
        images: [
          {
            src: "/stack-lamp/stack-lamp-white-off-product.png",
            mobileSrc: "/stack-lamp/stack-lamp-white-off-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/stack-lamp/stack-lamp-white-on-product.png",
            mobileSrc: "/stack-lamp/stack-lamp-white-on-product-mobile.png",
            uiTheme: "dark",
          },
        ],
      },
    ],
    features: [],
    specifications: [
      {
        label: "Dimensions",
        lines: ["Ø 22 cm × H 28 cm"],
      },
      {
        label: "Lighting",
        lines: ["Warm LED Bulb"],
      },
      {
        label: "Light source",
        lines: ["E27 Solhetta Bulb 470lm 4W", "Bulb Included."],
      },
      {
        label: "Power",
        lines: ["E27 Switch Voltage (input) 220-240V", "Max Watt 4W Cord Length 1.8m / 70 in"],
      },
      {
        label: "Material",
        lines: ["Plant-based PLA", "UV-printed stainless steel"],
      },
    ],
    materialsDescription: [
      "The lamp body and shade are made from plant-based PLA, a more sustainable alternative to conventional plastics. A laser-cut, UV-printed stainless-steel base plate provides lasting strength, stability, and recyclability.",
    ],
    materials: ["Plant-based PLA", "UV-printed stainless steel"],
    dimensions: { image: "/outline/nasaq-lamp-outline.png", heightCm: 24, widthCm: 14 },
    perfectFor: [
      { icon: "/workspaces-icon.svg", label: "Workspaces" },
      { icon: "/living-room-icon.svg", label: "Dining" },
      { icon: "/bedside-icon.svg", label: "Bedside" },
      { icon: "/reading-nook-icon.svg", label: "Outdoor" },
    ],
    designStory:
      "Layered, rounded forms inspired by early-2010s abstraction that create a warm, calm presence for slower evenings.",
    addOns: [ADD_ONS[0]],
  },
  {
    id: "1",
    slug: "nujaj-desk-lamp",
    name: "NUJĀJ",
    category: "table-lamps",
    description: "Timeless fluting with a warm architectural glow.",
    featured: true,
    // badge: "BESTSELLER",
    rating: 4.4,
    reviewCount: 32,
    variants: [
      {
        id: "1-matcha",
        color: "Matcha",
        colorHex: "#c5d371",
        sku: "TFL-MG",
        price: 329,
        stock: 8,
        featuredImages: {
          lightOff: "/flute-lamp/flute-matcha-off.png",
          lightOn: "/flute-lamp/flute-matcha-on.png",
        },
        collectionImage: "/flute-lamp/flute-lamp-matcha-off-collection.png",
        cartDrawerImage: "/cart/portrait-image-1.png",
        collectionMobileImage: "/flute-lamp/flute-lamp-matcha-off-product-mobile.png",
        mainImage: "/flute-lamp/flute-clear-garden-main.jpg",
        images: [
          {
            src: "/flute-lamp/flute-lamp-matcha-off-product.png",
            mobileSrc: "/flute-lamp/flute-lamp-matcha-off-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/flute-lamp/flute-lamp-matcha-on-product.png",
            mobileSrc: "/flute-lamp/flute-lamp-matcha-on-product-mobile.png",
            uiTheme: "dark",
          },
          { src: "/flute-lamp/flute-matcha-lifestyle-shot.png", uiTheme: "dark" },
          { src: "/flute-lamp/flute-matcha-lifestyle-shot-dark.png", uiTheme: "dark" },
        ],
      },
      {
        id: "1-cherry-red",
        color: "Cherry Red",
        colorHex: "#942025",
        sku: "TFL-CR",
        price: 329,
        stock: 12,
        featuredImages: {
          lightOff: "/flute-lamp/flute-fire-red-off.png",
          lightOn: "/flute-lamp/flute-fire-red-on.png",
        },
        collectionImage: "/flute-lamp/flute-lamp-red-off-collection.png",
        cartDrawerImage: "",
        collectionMobileImage: "/flute-lamp/flute-lamp-red-off-product-mobile.png",
        mainImage: "/flute-lamp/flute-clear-garden-main.jpg",
        images: [
          {
            src: "/flute-lamp/flute-lamp-red-off-product.png",
            mobileSrc: "/flute-lamp/flute-lamp-red-off-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/flute-lamp/flute-lamp-red-on-product.png",
            mobileSrc: "/flute-lamp/flute-lamp-red-on-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/flute-lamp/flute-red-lifestyle.png",
            mobileSrc: "/flute-lamp/flute-red-lifestyle.png",
            uiTheme: "dark",
          },
          {
            src: "/flute-lamp/flute-red-close-up.png",
            mobileSrc: "/flute-lamp/flute-red-close-up.png",
            uiTheme: "dark",
          },
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
        collectionImage: "/flute-lamp/flute-lamp-clear-off-collection.png",
        cartDrawerImage: "",
        collectionMobileImage: "/flute-lamp/flute-lamp-clear-off-product-mobile.png",
        mainImage: "/flute-lamp/flute-clear-interaction-shot-dark.png",
        images: [
          {
            src: "/flute-lamp/flute-lamp-clear-off-product.png",
            mobileSrc: "/flute-lamp/flute-lamp-clear-off-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/flute-lamp/flute-lamp-clear-on-product.png",
            mobileSrc: "/flute-lamp/flute-lamp-clear-on-product-mobile.png",
            uiTheme: "dark",
          },
          { src: "/flute-lamp/flute-clear-lifestyle-shot-dark-3.png", uiTheme: "light" },
          { src: "/flute-lamp/flute-clear-lifestyle-shot-dark-4.png", uiTheme: "light" },
          { src: "/flute-lamp/flute-clear-interaction-shot-dark.png", uiTheme: "light" },
          { src: "/flute-lamp/flute-clear-lifestyle-shot-dark-2.png", uiTheme: "light" },
          { src: "/flute-lamp/flute-clear-lifestyle-shot-dark-1.png", uiTheme: "light" },
          { src: "/flute-lamp/flute-clear-lifestyle-shot-dark.png", uiTheme: "light" },
        ],
      },
    ],
    features: [],
    specifications: [
      {
        label: "Dimensions",
        lines: ["Ø 22 cm × H 28 cm"],
      },
      {
        label: "Lighting",
        lines: ["Warm LED Bulb"],
      },
      {
        label: "Light source",
        lines: ["E27 Solhetta Bulb 470lm 4W", "Bulb Included."],
      },
      {
        label: "Power",
        lines: ["E27 Switch Voltage (input) 220-240V", "Max Watt 4W Cord Length 1.8m / 70 in"],
      },
      {
        label: "Material",
        lines: ["Plant-based PLA", "PETG", "UV-printed stainless steel"],
      },
    ],
    materialsDescription: [
      "The lamp base is made from plant-based PLA and paired with a laser-cut, UV-printed stainless-steel base plate. The PETG shade offers excellent translucency and durability and can be recycled where suitable facilities are available.",
    ],
    materials: ["Plant-based PLA", "PETG", "UV-printed stainless steel"],
    dimensions: { image: "/outline/nujaj-lamp-outline.png", heightCm: 28, widthCm: 22 },
    perfectFor: [
      { icon: "/workspaces-icon.svg", label: "Workspaces" },
      { icon: "/bedside-icon.svg", label: "Bedside" },
      { icon: "/living-room-icon.svg", label: "Living Room" },
      { icon: "/reading-nook-icon.svg", label: "Reading Nook" },
    ],
    designStory:
      "Inspired by timeless fluted architecture, bringing warmth, texture, and elegance to modern interiors.",
    addOns: ADD_ONS,
  },
  {
    id: "4",
    slug: "hamrah-lamp",
    name: "HAMRAH",
    category: "table-lamps",
    description: "UAE pearl heritage, reimagined in sculptural light.",
    featured: true,
    rating: 4.5,
    reviewCount: 11,
    variants: [
      {
        id: "4-cherry-red",
        color: "Cherry Red",
        colorHex: "#942025",
        sku: "PTL-FRD",
        price: 379,
        stock: 9,
        featuredImages: {
          lightOff: "/pearl-lamp/pearl-lamp-red-off.png",
          lightOn: "/pearl-lamp/pearl-lamp-red-on.png",
        },
        collectionImage: "/pearl-lamp/pearl-lamp-red-off-collection.png",
        cartDrawerImage: "",
        collectionMobileImage: "/pearl-lamp/pearl-lamp-red-off-product-mobile.png",
        mainImage: "/pearl-lamp/pearl-lamp-red-off.png",
        images: [
          {
            src: "/pearl-lamp/pearl-lamp-red-off-product.png",
            mobileSrc: "/pearl-lamp/pearl-lamp-red-off-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/pearl-lamp/pearl-lamp-red-on-product.png",
            mobileSrc: "/pearl-lamp/pearl-lamp-red-on-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/pearl-lamp/pearl-lamp-red-lifestyle.png",
            mobileSrc: "/pearl-lamp/pearl-lamp-red-lifestyle.png",
            uiTheme: "dark",
          },
        ],
      },
      {
        id: "4-cobalt-blue",
        color: "Cobalt Blue",
        colorHex: "#007ffe",
        sku: "PTL-BLU",
        price: 379,
        stock: 4,
        featuredImages: {
          lightOff: "/pearl-lamp/pearl-lamp-blue-off.png",
          lightOn: "/pearl-lamp/pearl-lamp-blue-on.png",
        },
        collectionImage: "/pearl-lamp/pearl-lamp-blue-off-collection.png",
        cartDrawerImage: "",
        collectionMobileImage: "/pearl-lamp/pearl-lamp-blue-off-product-mobile.png",
        mainImage: "/pearl-lamp/pearl-lamp-blue-off.png",
        images: [
          {
            src: "/pearl-lamp/pearl-lamp-blue-off-product.png",
            mobileSrc: "/pearl-lamp/pearl-lamp-blue-off-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/pearl-lamp/pearl-lamp-blue-on-product.png",
            mobileSrc: "/pearl-lamp/pearl-lamp-blue-on-product-mobile.png",
            uiTheme: "dark",
          },
        ],
      },
      {
        id: "4-olive-green",
        color: "Olive Green",
        colorHex: "#4b562e",
        sku: "PTL-OG",
        price: 379,
        stock: 4,
        featuredImages: {
          lightOff: "/pearl-lamp/pearl-lamp-green-off.png",
          lightOn: "/pearl-lamp/pearl-lamp-green-on.png",
        },
        collectionImage: "/pearl-lamp/pearl-lamp-green-off-collection.png",
        cartDrawerImage: "",
        collectionMobileImage: "/pearl-lamp/pearl-lamp-green-off-product-mobile.png",
        mainImage: "/pearl-lamp/pearl-lamp-green-off-product.png",
        images: [
          {
            src: "/pearl-lamp/pearl-lamp-green-off-product.png",
            mobileSrc: "/pearl-lamp/pearl-lamp-green-off-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/pearl-lamp/pearl-lamp-green-on-product.png",
            mobileSrc: "/pearl-lamp/pearl-lamp-green-on-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/pearl-lamp/pearl-lamp-green-lifestyle.png",
            mobileSrc: "/pearl-lamp/pearl-lamp-green-lifestyle.png",
            uiTheme: "dark",
          },
        ],
      },
    ],
    features: [],
    specifications: [
      {
        label: "Dimensions",
        lines: ["Ø 22 cm × H 28 cm"],
      },
      {
        label: "Lighting",
        lines: ["Warm LED Bulb"],
      },
      {
        label: "Light source",
        lines: ["E27 Solhetta Bulb 470lm 4W", "Bulb Included."],
      },
      {
        label: "Power",
        lines: ["E27 Switch Voltage (input) 220-240V", "Max Watt 4W Cord Length 1.8m / 70 in"],
      },
      {
        label: "Material",
        lines: ["Plant-based PLA", "UV-printed stainless steel"],
      },
    ],
    materialsDescription: [
      "The lamp body and shade are made from plant-based PLA, a more sustainable alternative to conventional plastics. A laser-cut, UV-printed stainless-steel base plate provides lasting strength, stability, and recyclability.",
    ],
    materials: ["Plant-based PLA", "UV-printed stainless steel"],
    dimensions: { image: "/outline/hamrah-lamp-outline.png", heightCm: 32, widthCm: 20 },
    perfectFor: [
      { icon: "/living-room-icon.svg", label: "Living Room" },
      { icon: "/bedside-icon.svg", label: "Bedside" },
      { icon: "/reading-nook-icon.svg", label: "Reading Nook" },
    ],
    designStory: "PEARL is a sculptural table lamp inspired by the UAE’s pearl-diving heritage.",
    addOns: ADD_ONS,
  },
  {
    id: "2",
    slug: "kasane-lamp",
    name: "KASANE",
    category: "table-lamps",
    description: "Desert ripples shaped into a calming glow.",
    featured: true,
    // badge: "BESTSELLER",
    rating: 4.7,
    reviewCount: 18,
    variants: [
      {
        id: "2-tangerine",
        color: "Tangerine",
        colorHex: "#f7633a",
        sku: "ML-TG",
        price: 399,
        stock: 6,
        featuredImages: {
          lightOff: "/mushroom-lamp/mushroom-orange-off.png",
          lightOn: "/mushroom-lamp/mushroom-orange-on.png",
        },
        collectionImage: "/mushroom-lamp/mushroom-lamp-orange-off-collection.png",
        cartDrawerImage: "",
        collectionMobileImage: "/mushroom-lamp/mushroom-lamp-orange-off-product-mobile.png",
        mainImage: "/mushroom-lamp/mushroom-lamp-orange-off-product.png",
        images: [
          {
            src: "/mushroom-lamp/mushroom-lamp-orange-off-product.png",
            mobileSrc: "/mushroom-lamp/mushroom-lamp-orange-off-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/mushroom-lamp/mushroom-lamp-orange-on-product.png",
            mobileSrc: "/mushroom-lamp/mushroom-lamp-orange-on-product-mobile.png",
            uiTheme: "dark",
          },
        ],
      },
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
        collectionImage: "/mushroom-lamp/mushroom-lamp-blue-off-collection.png",
        cartDrawerImage: "",
        collectionMobileImage: "/mushroom-lamp/mushroom-lamp-blue-off-product-mobile.png",
        mainImage: "/mushroom-lamp/mushroom-lamp-blue-off-product.png",
        images: [
          {
            src: "/mushroom-lamp/mushroom-lamp-blue-off-product.png",
            mobileSrc: "/mushroom-lamp/mushroom-lamp-blue-off-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/mushroom-lamp/mushroom-lamp-blue-on-product.png",
            mobileSrc: "/mushroom-lamp/mushroom-lamp-blue-on-product-mobile.png",
            uiTheme: "dark",
          },
        ],
      },
      {
        id: "2-black",
        color: "Black",
        colorHex: "#161515",
        sku: "ML-BLK",
        price: 399,
        stock: 10,
        featuredImages: {
          lightOff: "/mushroom-lamp/mushroom-black-off.png",
          lightOn: "/mushroom-lamp/mushroom-black-on.png",
        },
        collectionImage: "/mushroom-lamp/mushroom-lamp-black-off-collection.png",
        cartDrawerImage: "",
        collectionMobileImage: "/mushroom-lamp/mushroom-lamp-black-off-product-mobile.png",
        mainImage: "/mushroom-lamp/mushroom-lamp-black-off-product.png",
        images: [
          {
            src: "/mushroom-lamp/mushroom-lamp-black-off-product.png",
            mobileSrc: "/mushroom-lamp/mushroom-lamp-black-off-product-mobile.png",
            uiTheme: "dark",
          },
          {
            src: "/mushroom-lamp/mushroom-lamp-black-on-product.png",
            mobileSrc: "/mushroom-lamp/mushroom-lamp-black-on-product-mobile.png",
            uiTheme: "dark",
          },
          { src: "/mushroom-lamp/kasane-lamp-black-lifestyle-shot.png", uiTheme: "dark" },
          { src: "/mushroom-lamp/kasane-lamp-black-interaction-shot.png", uiTheme: "light" },
          { src: "/mushroom-lamp/kasane-lamp-black-detail-shot.png", uiTheme: "dark" },
        ],
      },
    ],
    features: [],
    specifications: [
      {
        label: "Dimensions",
        lines: ["Ø 22 cm × H 28 cm"],
      },
      {
        label: "Lighting",
        lines: ["Warm LED Bulb"],
      },
      {
        label: "Light source",
        lines: ["E27 Solhetta Bulb 470lm 4W", "Bulb Included."],
      },
      {
        label: "Power",
        lines: ["E27 Switch Voltage (input) 220-240V", "Max Watt 4W Cord Length 1.8m / 70 in"],
      },
      {
        label: "Material",
        lines: ["Plant-based PLA", "UV-printed stainless steel"],
      },
    ],
    materialsDescription: [
      "The lamp body and shade are made from plant-based PLA, a more sustainable alternative to conventional plastics. A laser-cut, UV-printed stainless-steel base plate provides lasting strength, stability, and recyclability.",
    ],
    materials: ["Plant-based PLA", "UV-printed stainless steel"],
    dimensions: { image: "/outline/kasane-lamp-outline.png", heightCm: 38, widthCm: 26 },
    perfectFor: [
      { icon: "/living-room-icon.svg", label: "Living Room" },
      { icon: "/bedside-icon.svg", label: "Bedside" },
      { icon: "/reading-nook-icon.svg", label: "Reading Nook" },
    ],
    designStory:
      "Desert sand ripples, translated into a sculptural lamp that casts a soft, calming glow.",
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
  return variant.mainImage ?? variant.images[0]?.src ?? variant.collectionImage;
}

export function getVariantGalleryImages(variant: ProductVariant): ProductCarouselImage[] {
  const mainImage = getVariantMainImage(variant);
  const matchingImage = variant.images.find((image) => image.src === mainImage);
  return [
    matchingImage ?? { src: mainImage, uiTheme: "dark" },
    ...variant.images.filter((image) => image.src !== mainImage),
  ];
}

export function formatPrice(amount: number): string {
  return amount.toFixed(2);
}
