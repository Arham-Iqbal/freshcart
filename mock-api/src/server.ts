import express from "express";
import cors from "cors";
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
} from "./store.ts";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.use(cors());
app.use(express.json());

// Artificial latency so loading skeletons are visible during the demo.
app.use((_req, _res, next) => setTimeout(next, 180 + Math.random() * 140));

app.get("/api/health", (_req, res) => res.json({ ok: true, name: "FreshCart API" }));

// ── Catalog (reads from the mutable store) ──────────────────────────────
app.get("/api/categories", (_req, res) => res.json(getCategories()));

app.get("/api/categories/:id", (req, res) => {
  const category = getCategory(req.params.id);
  if (!category) return res.status(404).json({ error: "Category not found" });
  res.json(category);
});

app.get("/api/products/featured", (_req, res) => {
  const featured = getProducts().filter(
    (p) => p.badges?.includes("bestseller") || p.badges?.includes("new"),
  );
  res.json(featured);
});

app.get("/api/products", (req, res) => {
  const { category, q, badge, sort } = req.query as Record<string, string>;
  let list = [...getProducts()];
  if (category) list = list.filter((p) => p.categoryId === category);
  if (badge) list = list.filter((p) => p.badges?.includes(badge as any));
  if (q) {
    const needle = q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle),
    );
  }
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);
  res.json(list);
});

app.get("/api/products/:id", (req, res) => {
  const product = getProduct(req.params.id);
  if (!product) return res.status(404).json({ error: "Product not found" });
  res.json(product);
});

app.get("/api/search", (req, res) => {
  const q = String(req.query.q ?? "").trim().toLowerCase();
  if (!q) return res.json([]);
  res.json(
    getProducts().filter(
      (p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q),
    ),
  );
});

// ── Cart ───────────────────────────────────────────────────────────────
app.get("/api/cart", (_req, res) => res.json(getResolvedCart()));

app.post("/api/cart/items", (req, res) => {
  const { productId, qty } = req.body ?? {};
  try {
    res.json(addToCart(String(productId), Number(qty) || 1));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.patch("/api/cart/items/:productId", (req, res) => {
  const qty = Number(req.body?.qty);
  res.json(setCartQty(req.params.productId, qty));
});

app.delete("/api/cart/items/:productId", (req, res) => {
  res.json(removeFromCart(req.params.productId));
});

// ── Checkout & Orders ──────────────────────────────────────────────────
app.post("/api/checkout", (req, res) => {
  try {
    res.json(checkout(req.body ?? {}));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/orders", (_req, res) => res.json(getOrders()));

app.get("/api/orders/:id", (req, res) => {
  const order = getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});

// ═══════════════════════════════════════════════════════════════════════
//  ADMIN — write endpoints. In a real app these would sit behind auth.
// ═══════════════════════════════════════════════════════════════════════
app.get("/api/admin/stats", (_req, res) => res.json(getStats()));

app.post("/api/admin/products", (req, res) => {
  try {
    res.status(201).json(createProduct(req.body ?? {}));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.put("/api/admin/products/:id", (req, res) => {
  try {
    res.json(updateProduct(req.params.id, req.body ?? {}));
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

app.delete("/api/admin/products/:id", (req, res) => {
  try {
    deleteProduct(req.params.id);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(404).json({ error: e.message });
  }
});

app.patch("/api/admin/orders/:id/status", (req, res) => {
  try {
    res.json(updateOrderStatus(req.params.id, req.body?.status));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

// ── Push notifications ──
app.get("/api/admin/notifications", (_req, res) => res.json(getAllNotifications()));

app.post("/api/admin/notifications", (req, res) => {
  try {
    res.status(201).json(createNotification(req.body ?? {}));
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

app.delete("/api/admin/notifications/:id", (req, res) => {
  deleteNotification(req.params.id);
  res.json({ ok: true });
});

// Customer-facing: only notifications whose scheduled time has passed.
app.get("/api/notifications", (_req, res) => res.json(getDeliveredNotifications()));

const server = app.listen(PORT, () => {
  console.log(`🛒 FreshCart API running at http://localhost:${PORT}`);
});

// Friendly handling when the port is already taken (a previous instance is still
// running) — print a clear hint instead of an unhandled crash + stack trace.
server.on("error", (err: NodeJS.ErrnoException) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\n⚠  Port ${PORT} is already in use — the FreshCart API is probably already running.\n` +
        `   You don't need to start it again. To force a restart, free the port first:\n` +
        `   PowerShell:  Get-NetTCPConnection -LocalPort ${PORT} -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }\n`,
    );
    process.exit(0); // clean exit, no scary stack trace
  }
  throw err;
});
