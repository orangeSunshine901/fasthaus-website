"use client";

import { createContext, useContext } from "react";
import { PRODUCTS, type Product } from "@/lib/data/products";

const ProductMediaContext = createContext(PRODUCTS);

export function ProductMediaProvider({
  products,
  children,
}: {
  products: Product[];
  children: React.ReactNode;
}) {
  return <ProductMediaContext.Provider value={products}>{children}</ProductMediaContext.Provider>;
}

export const useMediaProducts = () => useContext(ProductMediaContext);
