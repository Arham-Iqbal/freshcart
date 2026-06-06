/**
 * In-memory store for the Vercel serverless API. Identical logic to
 * mock-api/src/store.ts, kept self-contained here so the serverless function
 * has no workspace-path dependencies at deploy time.
 *
 * NOTE: serverless instances are ephemeral — state (cart, orders, admin edits)
 * persists only while a warm instance is reused, and resets on cold start. This
 * matches the demo's "reset-on-restart is fine" expectation. The storefront also
 * keeps cart/orders client-side, so the shopping flow never depends on this.
 */
// Runtime values come from the generated, self-contained bundle (api/_data.js)
// so the deployed serverless function has NO workspace-path dependency. Types
// are erased at compile time, so importing them from @demo/data is free.
// _data.js is generated from packages/data by scripts/gen-api-data.mjs.
// @ts-expect-error — generated JS, no types; the type-only import below covers it.
import {
  products as seedProducts,
  categories as seedCategories,
  DELIVERY_FEE,
  TAX_RATE,
  FREE_DELIVERY_THRESHOLD,
} from "./_data.js";
import type {
  CartItem,
  Category,
  Order,
  OrderLine,
  OrderStatus,
  Product,
  PushNotification,
  PushAudience,
  PushCategory,
} from "@demo/data";

const catalog: Product[] = seedProducts.map((p) => ({ ...p }));
const categoryList: Category[] = seedCategories.map((c) => ({ ...c }));
const cart: CartItem[] = [];
const orders: Order[] = [];
const notifications: PushNotification[] = [];

export const getProducts = () => catalog;
export const getProduct = (id: string) => catalog.find((p) => p.id === id);
export const getCategories = () => categoryList;
export const getCategory = (id: string) => categoryList.find((c) => c.id === id);

export function createProduct(input: Partial<Product>): Product {
  if (!input.name) throw new Error("Name is required");
  const id = input.id || "p-" + Math.random().toString(36).slice(2, 8);
  const product: Product = {
    id,
    name: input.name,
    categoryId: input.categoryId || categoryList[0]?.id || "",
    price: Number(input.price) || 0,
    compareAtPrice: input.compareAtPrice ? Number(input.compareAtPrice) : undefined,
    unit: input.unit || "each",
    unitSize: input.unitSize || "1 unit",
    image: input.image || "",
    imageKey: input.imageKey || id,
    rating: input.rating ?? 4.5,
    reviewCount: input.reviewCount ?? 0,
    inStock: input.inStock ?? true,
    badges: input.badges,
    description: input.description || "",
    nutrition: input.nutrition,
  };
  catalog.unshift(product);
  return product;
}

export function updateProduct(id: string, patch: Partial<Product>): Product {
  const product = catalog.find((p) => p.id === id);
  if (!product) throw new Error("Product not found");
  if (patch.price != null) patch.price = Number(patch.price);
  if (patch.compareAtPrice != null) patch.compareAtPrice = Number(patch.compareAtPrice) || undefined;
  Object.assign(product, patch, { id });
  return product;
}

export function deleteProduct(id: string): void {
  const idx = catalog.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Product not found");
  catalog.splice(idx, 1);
}

export function getResolvedCart() {
  const lines = cart
    .map((item) => {
      const product = getProduct(item.productId);
      if (!product) return null;
      return {
        productId: product.id,
        name: product.name,
        unitSize: product.unitSize,
        price: product.price,
        qty: item.qty,
        imageKey: product.imageKey,
        image: product.image,
        lineTotal: round(product.price * item.qty),
      };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);
  return { items: lines, ...computeTotals(lines) };
}

export function addToCart(productId: string, qty: number) {
  if (!getProduct(productId)) throw new Error("Unknown product");
  const existing = cart.find((i) => i.productId === productId);
  if (existing) existing.qty += qty;
  else cart.push({ productId, qty });
  return getResolvedCart();
}

export function setCartQty(productId: string, qty: number) {
  const idx = cart.findIndex((i) => i.productId === productId);
  if (idx === -1) return getResolvedCart();
  if (qty <= 0) cart.splice(idx, 1);
  else cart[idx].qty = qty;
  return getResolvedCart();
}

export function removeFromCart(productId: string) {
  const idx = cart.findIndex((i) => i.productId === productId);
  if (idx !== -1) cart.splice(idx, 1);
  return getResolvedCart();
}

export const clearCart = () => {
  cart.length = 0;
};

export function checkout(input: { address?: string; paymentMethod?: string }): Order {
  const resolved = getResolvedCart();
  if (resolved.items.length === 0) throw new Error("Cart is empty");
  const lines: OrderLine[] = resolved.items.map((l) => ({
    productId: l.productId,
    name: l.name,
    qty: l.qty,
    price: l.price,
    imageKey: l.imageKey,
  }));
  const order: Order = {
    id: "ORD-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    createdAt: new Date().toISOString(),
    items: lines,
    subtotal: resolved.subtotal,
    deliveryFee: resolved.deliveryFee,
    tax: resolved.tax,
    total: resolved.total,
    status: "confirmed",
    address: input.address || "12, MG Road, Indiranagar, Bengaluru 560038",
    eta: "25–35 min",
    paymentMethod: input.paymentMethod || "UPI · you@okaxis",
  };
  orders.unshift(order);
  clearCart();
  return order;
}

export const getOrders = () => orders;
export const getOrderById = (id: string) => orders.find((o) => o.id === id);

const ORDER_FLOW: OrderStatus[] = ["confirmed", "preparing", "out_for_delivery", "delivered"];
export function updateOrderStatus(id: string, status: OrderStatus): Order {
  const order = orders.find((o) => o.id === id);
  if (!order) throw new Error("Order not found");
  if (!ORDER_FLOW.includes(status)) throw new Error("Invalid status");
  order.status = status;
  return order;
}

export function getStats() {
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const byStatus = ORDER_FLOW.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});
  const unitsByProduct = new Map<string, { name: string; units: number; revenue: number }>();
  for (const o of orders) {
    for (const it of o.items) {
      const cur = unitsByProduct.get(it.productId) ?? { name: it.name, units: 0, revenue: 0 };
      cur.units += it.qty;
      cur.revenue += it.qty * it.price;
      unitsByProduct.set(it.productId, cur);
    }
  }
  const topProducts = [...unitsByProduct.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);
  return {
    revenue,
    orderCount: orders.length,
    productCount: catalog.length,
    categoryCount: categoryList.length,
    avgOrderValue: orders.length ? Math.round(revenue / orders.length) : 0,
    ordersByStatus: byStatus,
    lowStockCount: catalog.filter((p) => !p.inStock).length,
    onSaleCount: catalog.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price).length,
    topProducts,
    recentOrders: orders.slice(0, 5),
  };
}

// ── Push notifications ──
function reconcileNotifications() {
  const now = Date.now();
  for (const n of notifications) {
    if (n.status === "scheduled" && new Date(n.scheduledFor).getTime() <= now) n.status = "sent";
  }
}

export function createNotification(input: {
  title?: string;
  body?: string;
  category?: PushCategory;
  audience?: PushAudience;
  scheduledFor?: string;
}): PushNotification {
  if (!input.title?.trim()) throw new Error("Title is required");
  const now = new Date();
  const scheduled = input.scheduledFor ? new Date(input.scheduledFor) : now;
  const notif: PushNotification = {
    id: "ntf-" + Math.random().toString(36).slice(2, 8),
    title: input.title.trim(),
    body: (input.body ?? "").trim(),
    category: input.category ?? "promo",
    audience: input.audience ?? "all",
    createdAt: now.toISOString(),
    scheduledFor: scheduled.toISOString(),
    status: scheduled.getTime() <= now.getTime() ? "sent" : "scheduled",
  };
  notifications.unshift(notif);
  return notif;
}

export function getAllNotifications(): PushNotification[] {
  reconcileNotifications();
  return notifications;
}

export function getDeliveredNotifications(): PushNotification[] {
  reconcileNotifications();
  return notifications.filter((n) => n.status === "sent");
}

export function deleteNotification(id: string): void {
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx !== -1) notifications.splice(idx, 1);
}

function round(n: number) {
  return Math.round(n);
}

export function computeTotals(lines: { price: number; qty: number }[]) {
  const subtotal = round(lines.reduce((s, l) => s + l.price * l.qty, 0));
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD || subtotal === 0 ? 0 : DELIVERY_FEE;
  const tax = round(subtotal * TAX_RATE);
  const total = round(subtotal + deliveryFee + tax);
  return { subtotal, deliveryFee, tax, total, freeDeliveryThreshold: FREE_DELIVERY_THRESHOLD };
}
