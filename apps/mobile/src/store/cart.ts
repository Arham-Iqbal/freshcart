/**
 * Cart state — the client-side source of truth for the UI. Persisted to
 * AsyncStorage so the cart survives app restarts (feels real). The cart holds
 * product snapshots so totals render instantly without re-fetching the catalog.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Product } from "@demo/data";
import { computeTotals } from "../lib/api";

export interface CartLine {
  productId: string;
  name: string;
  price: number;
  unitSize: string;
  imageKey: string;
  image: string;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  qtyOf: (productId: string) => number;
  count: () => number;
  totals: () => ReturnType<typeof computeTotals>;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],

      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === product.id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === product.id ? { ...l, qty: l.qty + qty } : l,
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                unitSize: product.unitSize,
                imageKey: product.imageKey,
                image: product.image,
                qty,
              },
            ],
          };
        }),

      setQty: (productId, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => l.productId !== productId)
              : state.lines.map((l) =>
                  l.productId === productId ? { ...l, qty } : l,
                ),
        })),

      remove: (productId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.productId !== productId),
        })),

      clear: () => set({ lines: [] }),

      qtyOf: (productId) =>
        get().lines.find((l) => l.productId === productId)?.qty ?? 0,

      count: () => get().lines.reduce((s, l) => s + l.qty, 0),

      totals: () => computeTotals(get().lines),
    }),
    {
      name: "freshcart-cart",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);
