/**
 * Typed API client with offline fallback. Catalog reads try the network with a
 * short timeout, then fall back to the bundled @demo/data catalog — so the
 * installed APK shows a complete, working store with NO server running. Cart and
 * orders are owned client-side (see store/cart.ts); checkout uses the API when
 * reachable and otherwise synthesizes an identically-shaped order locally.
 */
import {
  categories as localCategories,
  products as localProducts,
  getCategoryById,
  getProductById,
  getProductsByCategory,
  getFeaturedProducts,
  searchProducts,
  DELIVERY_FEE,
  TAX_RATE,
  FREE_DELIVERY_THRESHOLD,
  type Category,
  type Product,
  type Order,
  type OrderLine,
} from "@demo/data";
import { API_BASE, NETWORK_ENABLED } from "./config";

const TIMEOUT_MS = 2500;

async function tryFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (!NETWORK_ENABLED) return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(API_BASE + path, { ...init, signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ── Catalog (network-first, local fallback) ─────────────────────────────
export async function fetchCategories(): Promise<Category[]> {
  return (await tryFetch<Category[]>("/api/categories")) ?? localCategories;
}

export async function fetchCategory(id: string): Promise<Category | undefined> {
  return (await tryFetch<Category>(`/api/categories/${id}`)) ?? getCategoryById(id);
}

export async function fetchProducts(params?: {
  category?: string;
  badge?: string;
  sort?: string;
}): Promise<Product[]> {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const remote = await tryFetch<Product[]>(`/api/products${qs ? "?" + qs : ""}`);
  if (remote) return remote;

  let list = params?.category ? getProductsByCategory(params.category) : [...localProducts];
  if (params?.badge) list = list.filter((p) => p.badges?.includes(params.badge as any));
  if (params?.sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (params?.sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (params?.sort === "rating") list.sort((a, b) => b.rating - a.rating);
  return list;
}

export async function fetchProduct(id: string): Promise<Product | undefined> {
  return (await tryFetch<Product>(`/api/products/${id}`)) ?? getProductById(id);
}

export async function fetchFeatured(): Promise<Product[]> {
  return (await tryFetch<Product[]>("/api/products/featured")) ?? getFeaturedProducts();
}

export async function fetchSearch(query: string): Promise<Product[]> {
  const remote = await tryFetch<Product[]>(`/api/search?q=${encodeURIComponent(query)}`);
  return remote ?? searchProducts(query);
}

// ── Totals + checkout (offline-safe) ────────────────────────────────────
const round = (n: number) => Math.round(n);

export function computeTotals(lines: { price: number; qty: number }[]) {
  const subtotal = round(lines.reduce((s, l) => s + l.price * l.qty, 0));
  const deliveryFee =
    subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const tax = round(subtotal * TAX_RATE);
  const total = round(subtotal + deliveryFee + tax);
  return { subtotal, deliveryFee, tax, total, freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD };
}

export interface CheckoutPayload {
  lines: { productId: string; name: string; qty: number; price: number; imageKey: string }[];
  address: string;
  paymentMethod: string;
}

export async function submitCheckout(payload: CheckoutPayload): Promise<Order> {
  // Mirror the cart to the API and use its order if reachable…
  const remote = await tryFetch<Order>("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address: payload.address, paymentMethod: payload.paymentMethod }),
  });
  if (remote && remote.items?.length) return remote;

  // …otherwise synthesize an identically-shaped order locally.
  const lines: OrderLine[] = payload.lines.map((l) => ({
    productId: l.productId,
    name: l.name,
    qty: l.qty,
    price: l.price,
    imageKey: l.imageKey,
  }));
  const totals = computeTotals(lines);
  return {
    id: "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    createdAt: new Date().toISOString(),
    items: lines,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    tax: totals.tax,
    total: totals.total,
    status: "confirmed",
    address: payload.address,
    eta: "25–35 min",
    paymentMethod: payload.paymentMethod,
  };
}
