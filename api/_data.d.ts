/**
 * Types for the generated api/_data.js (a self-contained bundle of @demo/data,
 * produced by scripts/gen-api-data.mjs). Lets api/_store.ts import the catalog
 * with full typing and no @ts-expect-error. Mirrors the runtime exports.
 */
import type { Product, Category } from "@demo/data";

export const products: Product[];
export const categories: Category[];
export const DELIVERY_FEE: number;
export const TAX_RATE: number;
export const FREE_DELIVERY_THRESHOLD: number;
