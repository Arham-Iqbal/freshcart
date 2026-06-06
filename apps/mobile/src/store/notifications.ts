/**
 * Customer notification inbox. Polls the API for delivered push notifications
 * (those whose scheduled time has passed), tracks which the user has read
 * (persisted), and surfaces the newest unseen one so the UI can pop a toast.
 *
 * Read-state is persisted; the notifications themselves come from the server.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { PushNotification } from "@demo/data";
import { API_BASE, NETWORK_ENABLED } from "../lib/config";

interface NotifState {
  items: PushNotification[];
  readIds: string[];
  /** Id of the most recent notification surfaced as a toast (so we show it once). */
  lastToastId: string | null;
  /** The notification to currently display as a toast, or null. */
  toast: PushNotification | null;

  refresh: () => Promise<void>;
  markAllRead: () => void;
  markRead: (id: string) => void;
  dismissToast: () => void;
  unreadCount: () => number;
}

export const useNotifications = create<NotifState>()(
  persist(
    (set, get) => ({
      items: [],
      readIds: [],
      lastToastId: null,
      toast: null,

      refresh: async () => {
        if (!NETWORK_ENABLED) return;
        try {
          const res = await fetch(API_BASE + "/api/notifications");
          if (!res.ok) return;
          const items = (await res.json()) as PushNotification[];

          // Detect a brand-new notification (newest item we've never seen) → toast it.
          const newest = items[0];
          const state = get();
          let toast = state.toast;
          let lastToastId = state.lastToastId;
          if (
            newest &&
            newest.id !== state.lastToastId &&
            !state.readIds.includes(newest.id) &&
            // only toast if it wasn't already in our list (i.e. it just arrived)
            !state.items.some((i) => i.id === newest.id)
          ) {
            toast = newest;
            lastToastId = newest.id;
          }
          set({ items, toast, lastToastId });
        } catch {
          /* offline — keep what we have */
        }
      },

      markAllRead: () => set((s) => ({ readIds: Array.from(new Set([...s.readIds, ...s.items.map((i) => i.id)])) })),
      markRead: (id) => set((s) => ({ readIds: Array.from(new Set([...s.readIds, id])) })),
      dismissToast: () => set({ toast: null }),
      unreadCount: () => {
        const s = get();
        return s.items.filter((i) => !s.readIds.includes(i.id)).length;
      },
    }),
    {
      name: "freshcart-notifications",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist read-state + toast tracking; items are re-fetched live.
      partialize: (s) => ({ readIds: s.readIds, lastToastId: s.lastToastId } as any),
    },
  ),
);
