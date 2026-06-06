/**
 * Admin gate (demo-grade). Protects the web-only /admin console with a single
 * shared password so casual visitors can't open it.
 *
 * The password comes from EXPO_PUBLIC_ADMIN_PASSWORD (set in Vercel env). A
 * sensible default is used for local dev if the env var is unset. The unlocked
 * flag is persisted in the browser so the admin doesn't re-enter it on every nav.
 *
 * Note: this is client-side protection appropriate for a demo. It is not
 * bank-grade — for production you'd verify on the server and protect the API.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

/** Configured admin password. Override per-environment via the env var. */
export const ADMIN_PASSWORD = process.env.EXPO_PUBLIC_ADMIN_PASSWORD || "freshcart2025";

interface AdminAuthState {
  unlocked: boolean;
  /** Returns true on success, false on wrong password. */
  unlock: (password: string) => boolean;
  lock: () => void;
}

export const useAdminAuth = create<AdminAuthState>()(
  persist(
    (set) => ({
      unlocked: false,
      unlock: (password: string) => {
        const ok = password === ADMIN_PASSWORD;
        if (ok) set({ unlocked: true });
        return ok;
      },
      lock: () => set({ unlocked: false }),
    }),
    {
      name: "freshcart-admin-auth",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
