/**
 * Admin API client. Unlike the storefront client (lib/api.ts), the admin panel
 * requires a live server — there is no offline fallback because it performs
 * writes. All calls go to the same mock API.
 */
import type { Product, Category, Order, OrderStatus, PushNotification } from "@demo/data";
import { API_BASE } from "./config";

// Admin is web-only and always uses the same API base as the storefront
// (from EXPO_PUBLIC_API_URL, or same-origin on the hosted site). No hardcoded URLs.
export const ADMIN_API_URL = API_BASE;

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {}
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export interface AdminStats {
  revenue: number;
  orderCount: number;
  productCount: number;
  categoryCount: number;
  avgOrderValue: number;
  ordersByStatus: Record<string, number>;
  lowStockCount: number;
  onSaleCount: number;
  topProducts: { id: string; name: string; units: number; revenue: number }[];
  recentOrders: Order[];
}

export const adminApi = {
  health: () => req<{ ok: boolean }>("/api/health"),
  stats: () => req<AdminStats>("/api/admin/stats"),

  products: () => req<Product[]>("/api/products"),
  categories: () => req<Category[]>("/api/categories"),

  createProduct: (input: Partial<Product>) =>
    req<Product>("/api/admin/products", { method: "POST", body: JSON.stringify(input) }),
  updateProduct: (id: string, patch: Partial<Product>) =>
    req<Product>(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(patch) }),
  deleteProduct: (id: string) =>
    req<{ ok: boolean }>(`/api/admin/products/${id}`, { method: "DELETE" }),

  orders: () => req<Order[]>("/api/orders"),
  updateOrderStatus: (id: string, status: OrderStatus) =>
    req<Order>(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  notifications: () => req<PushNotification[]>("/api/admin/notifications"),
  createNotification: (input: {
    title: string;
    body: string;
    category: PushNotification["category"];
    audience: PushNotification["audience"];
    scheduledFor?: string;
  }) => req<PushNotification>("/api/admin/notifications", { method: "POST", body: JSON.stringify(input) }),
  deleteNotification: (id: string) =>
    req<{ ok: boolean }>(`/api/admin/notifications/${id}`, { method: "DELETE" }),
};
