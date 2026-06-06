export * from "./types";
export { DELIVERY_FEE, TAX_RATE, FREE_DELIVERY_THRESHOLD } from "./types";
export { categories } from "./categories";
export { products } from "./products";

import { products } from "./products";
import { categories } from "./categories";
import type { Product, Category } from "./types";

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((p) => p.categoryId === categoryId);
}

export function getFeaturedProducts(): Product[] {
  return products.filter(
    (p) => p.badges?.includes("bestseller") || p.badges?.includes("new"),
  );
}

export function getOnSaleProducts(): Product[] {
  return products.filter(
    (p) => p.compareAtPrice != null && p.compareAtPrice > p.price,
  );
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  );
}
