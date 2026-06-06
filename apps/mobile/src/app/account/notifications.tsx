import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import { useNotifications } from "../../store/notifications";
import { AccountHeader } from "../../components/AccountHeader";
import { colors, spacing, radius, fontSize, shadow, FORM_WIDTH } from "../../theme";

const ROWS: { key: "orders" | "promotions" | "priceDrops"; icon: keyof typeof Ionicons.glyphMap; title: string; sub: string }[] = [
  { key: "orders", icon: "receipt-outline", title: "Order updates", sub: "Status of your deliveries in real time" },
  { key: "promotions", icon: "pricetag-outline", title: "Promotions & offers", sub: "Deals, discount codes and seasonal sales" },
  { key: "priceDrops", icon: "trending-down-outline", title: "Price drops", sub: "When something in your favourites gets cheaper" },
];

const CAT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  promo: "pricetag",
  order: "bag-handle",
  system: "information-circle",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationsScreen() {
  const router = useRouter();
  const notify = useAuth((s) => s.notify);
  const setNotifyChannel = useAuth((s) => s.setNotifyChannel);

  const [tab, setTab] = useState<"inbox" | "settings">("inbox");

  const items = useNotifications((s) => s.items);
  const readIds = useNotifications((s) => s.readIds);
  const refresh = useNotifications((s) => s.refresh);
  const markAllRead = useNotifications((s) => s.markAllRead);

  // Refresh on open, and mark everything read once viewed.
  useEffect(() => {
    refresh();
  }, [refresh]);
  useEffect(() => {
    if (tab === "inbox") {
      const t = setTimeout(() => markAllRead(), 800);
      return () => clearTimeout(t);
    }
  }, [tab, items.length, markAllRead]);

  return (
    <View style={styles.root}>
      <AccountHeader title="Notifications" onBack={() => router.back()} />

      {/* Tabs */}
      <View style={styles.tabsWrap}>
        <View style={[styles.tabs, { maxWidth: FORM_WIDTH }]}>
          {(["inbox", "settings"] as const).map((t) => (
            <Pressable key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                {t === "inbox" ? "Inbox" : "Preferences"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.center, { maxWidth: FORM_WIDTH }]}>
          {tab === "inbox" ? (
            items.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="notifications-outline" size={32} color={colors.primary} />
                </View>
                <Text style={styles.emptyTitle}>No notifications yet</Text>
                <Text style={styles.emptySub}>Offers and order updates from FreshCart will show up here.</Text>
              </View>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {items.map((n) => {
                  const unread = !readIds.includes(n.id);
                  return (
                    <View key={n.id} style={[styles.notif, unread && styles.notifUnread]}>
                      <View style={styles.notifIcon}>
                        <Ionicons name={CAT_ICON[n.category] ?? "notifications"} size={20} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <View style={styles.notifTop}>
                          <Text style={styles.notifTitle} numberOfLines={1}>{n.title}</Text>
                          {unread && <View style={styles.dot} />}
                        </View>
                        {!!n.body && <Text style={styles.notifBody}>{n.body}</Text>}
                        <Text style={styles.notifTime}>{timeAgo(n.scheduledFor)}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )
          ) : (
            <>
              <View style={styles.card}>
                {ROWS.map((row, i) => (
                  <View key={row.key} style={[styles.row, i < ROWS.length - 1 && styles.rowBorder]}>
                    <View style={styles.icon}>
                      <Ionicons name={row.icon} size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.title}>{row.title}</Text>
                      <Text style={styles.sub}>{row.sub}</Text>
                    </View>
                    <Switch
                      value={notify[row.key]}
                      onValueChange={(v) => setNotifyChannel(row.key, v)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.white}
                    />
                  </View>
                ))}
              </View>
              <Text style={styles.note}>You can change these anytime. We never share your contact details.</Text>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  tabsWrap: { backgroundColor: colors.surface, alignItems: "center", paddingBottom: spacing.md },
  tabs: { flexDirection: "row", gap: spacing.sm, width: "100%", paddingHorizontal: spacing.lg },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.full, backgroundColor: colors.surfaceAlt },
  tabActive: { backgroundColor: colors.primarySurface },
  tabText: { fontSize: fontSize.sm, fontWeight: "800", color: colors.textSecondary },
  tabTextActive: { color: colors.primaryDark },

  scroll: { paddingVertical: spacing.lg, alignItems: "center" },
  center: { width: "100%", alignSelf: "center", paddingHorizontal: spacing.lg },

  empty: { alignItems: "center", gap: spacing.md, padding: spacing.xxl },
  emptyIcon: { width: 72, height: 72, borderRadius: radius.full, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: "900", color: colors.text },
  emptySub: { fontSize: fontSize.sm, color: colors.textSecondary, textAlign: "center", maxWidth: 280, lineHeight: 20 },

  notif: { flexDirection: "row", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.borderLight, ...shadow.soft },
  notifUnread: { borderColor: colors.primaryLight, backgroundColor: colors.primarySurface },
  notifIcon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.borderLight },
  notifTop: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  notifTitle: { flex: 1, fontSize: fontSize.md, fontWeight: "800", color: colors.text },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.sale },
  notifBody: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2, lineHeight: 19 },
  notifTime: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4, fontWeight: "600" },

  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderLight, overflow: "hidden", ...shadow.soft },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.lg },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  icon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center" },
  title: { fontSize: fontSize.md, fontWeight: "800", color: colors.text },
  sub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, lineHeight: 16 },
  note: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: "center", marginTop: spacing.lg, fontWeight: "600" },
});
