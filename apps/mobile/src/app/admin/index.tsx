import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "../../components/admin/AdminShell";
import { BarChart } from "../../components/admin/ui";
import { adminApi } from "../../lib/admin";
import { colors, spacing, radius, fontSize, shadow, formatPrice } from "../../theme";

const STATUS_META: Record<string, { label: string; color: string }> = {
  confirmed: { label: "Confirmed", color: colors.accent },
  preparing: { label: "Preparing", color: "#7C3AED" },
  out_for_delivery: { label: "Out for delivery", color: colors.primary },
  delivered: { label: "Delivered", color: colors.textSecondary },
};

// Mock data for the richer dashboard panels (illustrative — not wired to the API).
const REVENUE_7D = [
  { label: "Mon", value: 4200 },
  { label: "Tue", value: 5100 },
  { label: "Wed", value: 3800 },
  { label: "Thu", value: 6300 },
  { label: "Fri", value: 7400 },
  { label: "Sat", value: 9200 },
  { label: "Sun", value: 8100 },
];

const ACTIVITY: { icon: keyof typeof Ionicons.glyphMap; tint: string; text: string; time: string }[] = [
  { icon: "receipt-outline", tint: colors.primary, text: "New order ORD-9F2A1C placed", time: "2 min ago" },
  { icon: "pricetag-outline", tint: colors.accent, text: "Aarav updated price of Organic Bananas", time: "18 min ago" },
  { icon: "cube-outline", tint: colors.sale, text: "Mature Cheddar marked out of stock", time: "1 hr ago" },
  { icon: "person-add-outline", tint: "#7C3AED", text: "New customer Priya Nair signed up", time: "3 hrs ago" },
  { icon: "bicycle-outline", tint: colors.primary, text: "Rider Imran completed 4 deliveries", time: "5 hrs ago" },
];

const LOW_STOCK = [
  { name: "Mature Cheddar", qty: 3, pct: 12 },
  { name: "Free-Range Eggs", qty: 8, pct: 28 },
  { name: "Greek Yogurt", qty: 6, pct: 22 },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: adminApi.stats,
    refetchInterval: 4000, // keep the dashboard feeling live
  });

  return (
    <AdminShell title="Dashboard">
      {isError ? (
        <ServerOffline />
      ) : isLoading || !stats ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : (
        <>
          {/* Stat cards */}
          <View style={styles.statRow}>
            <StatCard
              icon="cash-outline"
              label="Total revenue"
              value={formatPrice(stats.revenue)}
              tint={colors.primary}
            />
            <StatCard
              icon="receipt-outline"
              label="Orders"
              value={String(stats.orderCount)}
              tint={colors.accent}
            />
            <StatCard
              icon="trending-up-outline"
              label="Avg order value"
              value={formatPrice(stats.avgOrderValue)}
              tint="#7C3AED"
            />
            <StatCard
              icon="pricetags-outline"
              label="Products"
              value={String(stats.productCount)}
              tint={colors.sale}
            />
          </View>

          <View style={styles.columns}>
            {/* Orders by status */}
            <View style={[styles.panel, { flex: 1 }]}>
              <Text style={styles.panelTitle}>Orders by status</Text>
              {stats.orderCount === 0 ? (
                <Text style={styles.empty}>No orders yet. Place one in the storefront to see it here.</Text>
              ) : (
                <View style={{ gap: spacing.md, marginTop: spacing.md }}>
                  {Object.entries(stats.ordersByStatus).map(([key, count]) => {
                    const meta = STATUS_META[key];
                    const pct = stats.orderCount ? (count / stats.orderCount) * 100 : 0;
                    return (
                      <View key={key}>
                        <View style={styles.statusHead}>
                          <Text style={styles.statusLabel}>{meta?.label ?? key}</Text>
                          <Text style={styles.statusCount}>{count}</Text>
                        </View>
                        <View style={styles.bar}>
                          <View
                            style={[styles.barFill, { width: `${pct}%`, backgroundColor: meta?.color ?? colors.primary }]}
                          />
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Top products */}
            <View style={[styles.panel, { flex: 1 }]}>
              <Text style={styles.panelTitle}>Top products</Text>
              {stats.topProducts.length === 0 ? (
                <Text style={styles.empty}>Sales data appears once orders come in.</Text>
              ) : (
                <View style={{ marginTop: spacing.md }}>
                  {stats.topProducts.map((p, i) => (
                    <View key={p.id} style={styles.topRow}>
                      <Text style={styles.topRank}>{i + 1}</Text>
                      <Text style={styles.topName} numberOfLines={1}>{p.name}</Text>
                      <Text style={styles.topUnits}>{p.units} sold</Text>
                      <Text style={styles.topRevenue}>{formatPrice(p.revenue)}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Revenue trend + Recent activity */}
          <View style={styles.columns}>
            <View style={[styles.panel, { flex: 1.4 }]}>
              <View style={styles.trendHead}>
                <View>
                  <Text style={styles.panelTitle}>Revenue · last 7 days</Text>
                  <Text style={styles.trendValue}>{formatPrice(REVENUE_7D.reduce((a, b) => a + b.value, 0))}</Text>
                </View>
                <View style={styles.trendUp}>
                  <Ionicons name="trending-up" size={14} color={colors.primary} />
                  <Text style={styles.trendUpText}>+12.4%</Text>
                </View>
              </View>
              <BarChart data={REVENUE_7D} height={150} />
            </View>

            <View style={[styles.panel, { flex: 1 }]}>
              <Text style={styles.panelTitle}>Recent activity</Text>
              <View style={{ marginTop: spacing.md, gap: spacing.md }}>
                {ACTIVITY.map((a, i) => (
                  <View key={i} style={styles.activityRow}>
                    <View style={[styles.activityIcon, { backgroundColor: a.tint + "18" }]}>
                      <Ionicons name={a.icon} size={15} color={a.tint} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.activityText}>{a.text}</Text>
                      <Text style={styles.activityTime}>{a.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Low stock alert */}
          <View style={[styles.panel, { borderColor: colors.accentSurface, backgroundColor: "#FFFDF8" }]}>
            <View style={styles.trendHead}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Ionicons name="alert-circle" size={20} color={colors.accent} />
                <Text style={styles.panelTitle}>Low stock alert</Text>
              </View>
              <Pressable onPress={() => router.push("/admin/inventory")}>
                <Text style={styles.viewAll}>View inventory →</Text>
              </Pressable>
            </View>
            <Text style={styles.lowStockSub}>
              {stats.lowStockCount} product{stats.lowStockCount === 1 ? "" : "s"} running low. Restock soon to avoid missed sales.
            </Text>
            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
              {LOW_STOCK.map((p, i) => (
                <View key={i} style={styles.lowRow}>
                  <Text style={styles.lowName}>{p.name}</Text>
                  <View style={styles.lowBar}>
                    <View style={[styles.lowBarFill, { width: `${p.pct}%`, backgroundColor: p.pct < 20 ? colors.sale : colors.accent }]} />
                  </View>
                  <Text style={styles.lowQty}>{p.qty} left</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Quick actions */}
          <View style={styles.columns}>
            <Pressable style={[styles.actionCard, { flex: 1 }]} onPress={() => router.push("/admin/products")}>
              <View style={[styles.actionIcon, { backgroundColor: colors.primarySurface }]}>
                <Ionicons name="add-circle-outline" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Manage products</Text>
                <Text style={styles.actionSub}>{stats.productCount} products · {stats.onSaleCount} on sale</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>

            <Pressable style={[styles.actionCard, { flex: 1 }]} onPress={() => router.push("/admin/orders")}>
              <View style={[styles.actionIcon, { backgroundColor: colors.accentSurface }]}>
                <Ionicons name="time-outline" size={22} color={colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Process orders</Text>
                <Text style={styles.actionSub}>
                  {(stats.ordersByStatus.confirmed ?? 0) + (stats.ordersByStatus.preparing ?? 0)} awaiting action
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
        </>
      )}
    </AdminShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: tint + "18" }]}>
        <Ionicons name={icon} size={22} color={tint} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ServerOffline() {
  return (
    <View style={styles.offline}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
      <Text style={styles.offlineTitle}>Can't reach the API</Text>
      <Text style={styles.offlineSub}>
        The admin panel needs the mock API running. Start it with{" "}
        <Text style={{ fontWeight: "800", color: colors.text }}>npm run api</Text> and refresh.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" },
  statCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: fontSize.xxl, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  statLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600" },

  columns: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" },
  panel: {
    minWidth: 320,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  panelTitle: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text },
  empty: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.md, lineHeight: 20 },

  statusHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  statusLabel: { fontSize: fontSize.sm, fontWeight: "700", color: colors.textSecondary },
  statusCount: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  bar: { height: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: radius.full },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  topRank: { width: 20, fontSize: fontSize.sm, fontWeight: "900", color: colors.primary },
  topName: { flex: 1, fontSize: fontSize.sm, fontWeight: "700", color: colors.text },
  topUnits: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: "600" },
  topRevenue: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text, width: 80, textAlign: "right" },

  actionCard: {
    minWidth: 280,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  actionTitle: { fontSize: fontSize.md, fontWeight: "800", color: colors.text },
  actionSub: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: "600", marginTop: 1 },

  offline: { alignItems: "center", gap: spacing.sm, padding: spacing.xxxl },
  offlineTitle: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text, marginTop: spacing.sm },
  offlineSub: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: "center", maxWidth: 380, lineHeight: 22 },

  // Revenue trend + activity
  trendHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  trendValue: { fontSize: fontSize.xxl, fontWeight: "900", color: colors.text, marginTop: 2, letterSpacing: -0.5 },
  trendUp: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  trendUpText: { fontSize: fontSize.xs, fontWeight: "800", color: colors.primaryDark },
  activityRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  activityIcon: { width: 32, height: 32, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  activityText: { fontSize: fontSize.sm, color: colors.text, fontWeight: "600" },
  activityTime: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  viewAll: { fontSize: fontSize.sm, fontWeight: "800", color: colors.primary },

  // Low stock
  lowStockSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: spacing.xs, fontWeight: "600" },
  lowRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  lowName: { width: 140, fontSize: fontSize.sm, fontWeight: "700", color: colors.text },
  lowBar: { flex: 1, height: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, overflow: "hidden" },
  lowBarFill: { height: "100%", borderRadius: radius.full },
  lowQty: { width: 60, fontSize: fontSize.xs, fontWeight: "700", color: colors.textSecondary, textAlign: "right" },
});
