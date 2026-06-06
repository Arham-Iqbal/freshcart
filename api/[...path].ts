/**
 * Vercel serverless handler for the FreshCart mock API. Mirrors the routes in
 * mock-api/src/server.ts (which still runs locally via `npm run api`). Deployed
 * as a single catch-all function so the whole demo is one Vercel project.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getProducts,
  getProduct,
  getCategories,
  getCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  getResolvedCart,
  addToCart,
  setCartQty,
  removeFromCart,
  checkout,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getStats,
  createNotification,
  getAllNotifications,
  getDeliveredNotifications,
  deleteNotification,
} from "./_store";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — the static site and API share an origin on Vercel, but allow all for safety.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Normalize the path. Prefer req.url (always the real request path) over
  // req.query.path, which Vercel doesn't reliably populate for [...path] under
  // this config. Strip the leading /api and any query string, then derive the
  // route segments used for dynamic params (/products/:id etc.).
  let segments: string[];
  const rawUrl = req.url ?? "";
  if (rawUrl) {
    const noQuery = rawUrl.split("?")[0].replace(/^\/api/, "");
    segments = noQuery.split("/").filter(Boolean);
  } else {
    segments = ([] as string[]).concat((req.query.path as string[] | string) ?? []);
  }
  const path = "/" + segments.join("/");
  const method = req.method ?? "GET";
  const q = req.query as Record<string, string>;
  const body = typeof req.body === "string" ? safeJson(req.body) : req.body ?? {};

  try {
    // ── Health ──
    if (path === "/health") return res.json({ ok: true, name: "FreshCart API" });

    // ── Catalog ──
    if (path === "/categories" && method === "GET") return res.json(getCategories());
    if (segments[0] === "categories" && segments[1] && method === "GET") {
      const c = getCategory(segments[1]);
      return c ? res.json(c) : res.status(404).json({ error: "Category not found" });
    }
    if (path === "/products/featured" && method === "GET") {
      return res.json(getProducts().filter((p) => p.badges?.includes("bestseller") || p.badges?.includes("new")));
    }
    if (path === "/products" && method === "GET") {
      let list = [...getProducts()];
      if (q.category) list = list.filter((p) => p.categoryId === q.category);
      if (q.badge) list = list.filter((p) => p.badges?.includes(q.badge as any));
      if (q.q) {
        const n = q.q.toLowerCase();
        list = list.filter((p) => p.name.toLowerCase().includes(n) || p.description.toLowerCase().includes(n));
      }
      if (q.sort === "price-asc") list.sort((a, b) => a.price - b.price);
      else if (q.sort === "price-desc") list.sort((a, b) => b.price - a.price);
      else if (q.sort === "rating") list.sort((a, b) => b.rating - a.rating);
      return res.json(list);
    }
    if (segments[0] === "products" && segments[1] && method === "GET") {
      const p = getProduct(segments[1]);
      return p ? res.json(p) : res.status(404).json({ error: "Product not found" });
    }
    if (path === "/search" && method === "GET") {
      const n = String(q.q ?? "").trim().toLowerCase();
      if (!n) return res.json([]);
      return res.json(getProducts().filter((p) => p.name.toLowerCase().includes(n) || p.description.toLowerCase().includes(n)));
    }

    // ── Cart ──
    if (path === "/cart" && method === "GET") return res.json(getResolvedCart());
    if (path === "/cart/items" && method === "POST") return res.json(addToCart(String(body.productId), Number(body.qty) || 1));
    if (segments[0] === "cart" && segments[1] === "items" && segments[2] && method === "PATCH")
      return res.json(setCartQty(segments[2], Number(body.qty)));
    if (segments[0] === "cart" && segments[1] === "items" && segments[2] && method === "DELETE")
      return res.json(removeFromCart(segments[2]));

    // ── Checkout & orders ──
    if (path === "/checkout" && method === "POST") return res.json(checkout(body));
    if (path === "/orders" && method === "GET") return res.json(getOrders());
    if (segments[0] === "orders" && segments[1] && method === "GET") {
      const o = getOrderById(segments[1]);
      return o ? res.json(o) : res.status(404).json({ error: "Order not found" });
    }

    // ── Admin ──
    if (path === "/admin/stats" && method === "GET") return res.json(getStats());
    if (path === "/admin/products" && method === "POST") return res.status(201).json(createProduct(body));
    if (segments[0] === "admin" && segments[1] === "products" && segments[2] && method === "PUT")
      return res.json(updateProduct(segments[2], body));
    if (segments[0] === "admin" && segments[1] === "products" && segments[2] && method === "DELETE") {
      deleteProduct(segments[2]);
      return res.json({ ok: true });
    }
    if (segments[0] === "admin" && segments[1] === "orders" && segments[3] === "status" && method === "PATCH")
      return res.json(updateOrderStatus(segments[2], body.status));

    // ── Push notifications ──
    if (path === "/admin/notifications" && method === "GET") return res.json(getAllNotifications());
    if (path === "/admin/notifications" && method === "POST") return res.status(201).json(createNotification(body));
    if (segments[0] === "admin" && segments[1] === "notifications" && segments[2] && method === "DELETE") {
      deleteNotification(segments[2]);
      return res.json({ ok: true });
    }
    if (path === "/notifications" && method === "GET") return res.json(getDeliveredNotifications());

    return res.status(404).json({ error: "Not found", path, method });
  } catch (e: any) {
    return res.status(400).json({ error: e?.message ?? "Request failed" });
  }
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
