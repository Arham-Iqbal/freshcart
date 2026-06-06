/**
 * Order history store. Persisted so the profile screen keeps past orders across
 * restarts — makes repeat demos feel like a real account. Orders are produced by
 * the checkout flow (api.submitCheckout) and recorded here.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Order } from "@demo/data";

interface OrdersState {
  orders: Order[];
  add: (order: Order) => void;
  getById: (id: string) => Order | undefined;
}

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      add: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      getById: (id) => get().orders.find((o) => o.id === id),
    }),
    {
      name: "freshcart-orders",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
