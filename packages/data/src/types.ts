export type Unit = "each" | "kg" | "g" | "lb" | "L" | "ml" | "pack" | "dozen";

export type Badge = "organic" | "sale" | "new" | "bestseller";

export interface Category {
  id: string;
  name: string;
  slug: string;
  /** Remote image URL (used on web / when online). */
  image: string;
  /** Stable key into the app's bundled image registry (offline-safe). */
  imageKey: string;
  /** Accent tint used for the category chip. */
  color: string;
  emoji: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  /** When present and > price, the item is shown as on sale. */
  compareAtPrice?: number;
  unit: Unit;
  /** Human label for the unit/size, e.g. "500 g", "1 dozen". */
  unitSize: string;
  image: string;
  imageKey: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  badges?: Badge[];
  description: string;
  nutrition?: Record<string, string>;
}

export interface CartItem {
  productId: string;
  qty: number;
}

export interface Cart {
  items: CartItem[];
}

export interface OrderLine {
  productId: string;
  name: string;
  qty: number;
  price: number;
  imageKey: string;
}

export type OrderStatus =
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered";

export interface Order {
  id: string;
  createdAt: string;
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  status: OrderStatus;
  address: string;
  eta: string;
  paymentMethod: string;
}

/** Tax rate + delivery fee (in ₹) shared by the API and offline checkout path. */
export const DELIVERY_FEE = 29;
export const TAX_RATE = 0.05;
export const FREE_DELIVERY_THRESHOLD = 499;

export type PushAudience = "all" | "active" | "lapsed";
export type PushCategory = "promo" | "order" | "system";

/** A push notification composed in the admin and delivered to the customer app. */
export interface PushNotification {
  id: string;
  title: string;
  body: string;
  category: PushCategory;
  audience: PushAudience;
  /** Creation time (admin composed it). */
  createdAt: string;
  /** When it should go live. For "send now" this equals createdAt. */
  scheduledFor: string;
  /** "scheduled" until its time passes, then "sent". */
  status: "scheduled" | "sent";
}
