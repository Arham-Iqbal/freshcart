/**
 * Auth / account store. Holds the logged-in customer, their saved delivery
 * addresses, favourite product ids, payment methods, and notification prefs.
 * Persisted to AsyncStorage so the demo account survives restarts and feels
 * like a real signed-in session. Seeded with a populated demo user so the app
 * looks lived-in by default, but you can log in as someone else.
 *
 * IMPORTANT: selectors must never return freshly-allocated objects/arrays.
 * Select the persisted arrays/primitives directly and derive with useMemo.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  name: string;
  email: string;
  phone?: string;
}

export type AddressLabel = "Home" | "Work" | "Other";

export interface Address {
  id: string;
  label: AddressLabel;
  line: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "upi" | "card" | "cod";
  label: string;
  /** Card-only: last 4 digits, used for the masked display. */
  last4?: string;
  isDefault: boolean;
}

interface AuthState {
  user: User | null;
  addresses: Address[];
  payments: PaymentMethod[];
  favourites: string[];
  notificationsEnabled: boolean;
  /** Per-channel notification toggles for the settings screen. */
  notify: { orders: boolean; promotions: boolean; priceDrops: boolean };

  // ── Session ──
  login: (name: string, email: string, phone?: string) => void;
  signup: (name: string, email: string, phone?: string) => void;
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;

  // ── Addresses ──
  addAddress: (a: Omit<Address, "id" | "isDefault"> & { isDefault?: boolean }) => void;
  updateAddress: (id: string, patch: Partial<Omit<Address, "id">>) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;

  // ── Payments ──
  addPayment: (p: Omit<PaymentMethod, "id" | "isDefault"> & { isDefault?: boolean }) => void;
  removePayment: (id: string) => void;
  setDefaultPayment: (id: string) => void;

  // ── Favourites ──
  toggleFavourite: (productId: string) => void;

  // ── Notifications ──
  setNotifications: (enabled: boolean) => void;
  setNotifyChannel: (channel: keyof AuthState["notify"], value: boolean) => void;
}

const DEMO_USER: User = {
  name: "Aarav Sharma",
  email: "aarav.sharma@email.com",
  phone: "+91 98765 43210",
};

const DEMO_ADDRESSES: Address[] = [
  {
    id: "addr-home",
    label: "Home",
    line: "12, MG Road, Indiranagar, Bengaluru 560038",
    isDefault: true,
  },
  {
    id: "addr-work",
    label: "Work",
    line: "5th Floor, Prestige Tech Park, Bengaluru 560103",
    isDefault: false,
  },
];

const DEMO_PAYMENTS: PaymentMethod[] = [
  { id: "pay-upi", type: "upi", label: "UPI · aarav@okaxis", isDefault: true },
  { id: "pay-card", type: "card", label: "HDFC Card", last4: "4242", isDefault: false },
  { id: "pay-cod", type: "cod", label: "Cash on delivery", isDefault: false },
];

const DEMO_FAVOURITES = ["p-avocado", "p-strawberry", "p-milk", "p-eggs"];

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: DEMO_USER,
      addresses: DEMO_ADDRESSES,
      payments: DEMO_PAYMENTS,
      favourites: DEMO_FAVOURITES,
      notificationsEnabled: true,
      notify: { orders: true, promotions: true, priceDrops: false },

      login: (name, email, phone) => set({ user: { name, email, phone } }),
      signup: (name, email, phone) => set({ user: { name, email, phone } }),
      logout: () => set({ user: null }),
      updateProfile: (patch) =>
        set((s) => (s.user ? { user: { ...s.user, ...patch } } : s)),

      addAddress: (a) =>
        set((s) => {
          const makeDefault = a.isDefault || s.addresses.length === 0;
          const next: Address = {
            id: uid("addr"),
            label: a.label,
            line: a.line,
            isDefault: makeDefault,
          };
          const cleared = makeDefault
            ? s.addresses.map((x) => ({ ...x, isDefault: false }))
            : s.addresses;
          return { addresses: [...cleared, next] };
        }),

      updateAddress: (id, patch) =>
        set((s) => ({
          addresses: s.addresses.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        })),

      removeAddress: (id) =>
        set((s) => {
          const removed = s.addresses.find((a) => a.id === id);
          let next = s.addresses.filter((a) => a.id !== id);
          // If we removed the default, promote the first remaining one.
          if (removed?.isDefault && next.length > 0) {
            next = next.map((a, i) => ({ ...a, isDefault: i === 0 }));
          }
          return { addresses: next };
        }),

      setDefaultAddress: (id) =>
        set((s) => ({
          addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
        })),

      addPayment: (p) =>
        set((s) => {
          const makeDefault = p.isDefault || s.payments.length === 0;
          const next: PaymentMethod = {
            id: uid("pay"),
            type: p.type,
            label: p.label,
            last4: p.last4,
            isDefault: makeDefault,
          };
          const cleared = makeDefault
            ? s.payments.map((x) => ({ ...x, isDefault: false }))
            : s.payments;
          return { payments: [...cleared, next] };
        }),

      removePayment: (id) =>
        set((s) => {
          const removed = s.payments.find((p) => p.id === id);
          let next = s.payments.filter((p) => p.id !== id);
          if (removed?.isDefault && next.length > 0) {
            next = next.map((p, i) => ({ ...p, isDefault: i === 0 }));
          }
          return { payments: next };
        }),

      setDefaultPayment: (id) =>
        set((s) => ({
          payments: s.payments.map((p) => ({ ...p, isDefault: p.id === id })),
        })),

      toggleFavourite: (productId) =>
        set((s) => ({
          favourites: s.favourites.includes(productId)
            ? s.favourites.filter((f) => f !== productId)
            : [...s.favourites, productId],
        })),

      setNotifications: (enabled) => set({ notificationsEnabled: enabled }),
      setNotifyChannel: (channel, value) =>
        set((s) => ({ notify: { ...s.notify, [channel]: value } })),
    }),
    {
      name: "freshcart-auth",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
