import {
  products as seedProducts,
  categories as seedCategories,
  DELIVERY_FEE,
  TAX_RATE,
  FREE_DELIVERY_THRESHOLD,
  type CartItem,
  type Category,
  type Order,
  type OrderLine,
  type OrderStatus,
  type Product,
  type PushNotification,
  type PushAudience,
  type PushCategory,
} from "@demo/data";

/**
 * Mutable in-memory catalog. Seeded from @demo/data on boot, then editable by
 * the admin endpoints so changes show up live in the storefront. Resets when
 * the server restarts.
 */
const catalog: Product[] = seedProducts.map((p) => ({ ...p }));
const categoryList: Category[] = seedCategories.map((c) => ({ ...c }));
const cart: CartItem[] = [];
const orders: Order[] = [];
const notifications: PushNotification[] = [];

// ── Catalog reads ───────────────────────────────────────────────────────
export function getProducts(): Product[] {
  return catalog;
}
export function getProduct(id: string): Product | undefined {
  return catalog.find((p) => p.id === id);
}
export function getCategories(): Category[] {
  return categoryList;
}
export function getCategory(id: string): Category | undefined {
  return categoryList.find((c) => c.id === id);
}

// ── Catalog writes (admin) ──────────────────────────────────────────────
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
  // Coerce numeric fields if present.
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

// ── Cart ────────────────────────────────────────────────────────────────
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

export function clearCart() {
  cart.length = 0;
}

// ── Checkout & orders ───────────────────────────────────────────────────
export interface CheckoutInput {
  address?: string;
  paymentMethod?: string;
}

export function checkout(input: CheckoutInput): Order {
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

export function getOrders(): Order[] {
  return orders;
}

export function getOrderById(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}

const ORDER_FLOW: OrderStatus[] = ["confirmed", "preparing", "out_for_delivery", "delivered"];

export function updateOrderStatus(id: string, status: OrderStatus): Order {
  const order = orders.find((o) => o.id === id);
  if (!order) throw new Error("Order not found");
  if (!ORDER_FLOW.includes(status)) throw new Error("Invalid status");
  order.status = status;
  return order;
}

// ── Admin dashboard stats ───────────────────────────────────────────────
export function getStats() {
  const revenue = orders.reduce((s, o) => s + o.total, 0);
  const byStatus = ORDER_FLOW.reduce<Record<string, number>>((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {});
  const lowStock = catalog.filter((p) => !p.inStock);
  const onSale = catalog.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price);

  // Units sold per product, for a "top products" list.
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
    lowStockCount: lowStock.length,
    onSaleCount: onSale.length,
    topProducts,
    recentOrders: orders.slice(0, 5),
  };
}

// ── Push notifications ──────────────────────────────────────────────────
/** Flip any scheduled notifications whose time has arrived to "sent". */
function reconcileNotifications() {
  const now = Date.now();
  for (const n of notifications) {
    if (n.status === "scheduled" && new Date(n.scheduledFor).getTime() <= now) {
      n.status = "sent";
    }
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

/** Admin view: every notification (scheduled + sent), newest first. */
export function getAllNotifications(): PushNotification[] {
  reconcileNotifications();
  return notifications;
}

/** Customer view: only notifications that have actually gone live. */
export function getDeliveredNotifications(): PushNotification[] {
  reconcileNotifications();
  return notifications.filter((n) => n.status === "sent");
}

export function deleteNotification(id: string): void {
  const idx = notifications.findIndex((n) => n.id === id);
  if (idx !== -1) notifications.splice(idx, 1);
}

// ── helpers ─────────────────────────────────────────────────────────────
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
