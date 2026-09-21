import { PRODUCTS, type Product } from "./products.ts";

export type Category = {
  slug: string;
  /** Plural name used for the page H1, title and breadcrumbs. */
  name: string;
  /** Singular noun appended to product names in product titles, e.g. "NASAQ Table Lamp". */
  singular: string;
  /** Search/social description. Keep it true to what the category page shows. */
  description: string;
};

/**
 * Every category a product may reference. Adding a product to a new category requires an entry
 * here; `tests/seo.test.ts` fails otherwise. Categories with no products stay reachable but are
 * noindexed and excluded from the sitemap until they are stocked.
 */
export const CATEGORIES: Category[] = [
  {
    slug: "table-lamps",
    name: "Table Lamps",
    singular: "Table Lamp",
    description:
      "Sculptural table lamps for side tables, shelves and bedsides, made to order in the UAE from plant-based material with a warm, soft glow.",
  },
  {
    slug: "desk-lamps",
    name: "Desk Lamps",
    singular: "Desk Lamp",
    description:
      "Compact desk lamps with a warm, glare-free glow for workspaces and reading corners, made to order in the UAE.",
  },
  {
    slug: "floor-lamps",
    name: "Floor Lamps",
    singular: "Floor Lamp",
    description:
      "Statement floor lamps that bring soft, ambient light to living rooms and quiet corners, made to order in the UAE.",
  },
];

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((category) => category.slug === slug);
}

export function getCategoryProducts(slug: string): Product[] {
  return PRODUCTS.filter((product) => product.category === slug);
}

/** Categories worth indexing: known and currently stocked with at least one product. */
export function getIndexableCategories(): Category[] {
  return CATEGORIES.filter((category) => getCategoryProducts(category.slug).length > 0);
}
