import { View, Text, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Order, OrderStatus } from "@demo/data";
import { AdminShell } from "../../components/admin/AdminShell";
import { adminApi } from "../../lib/admin";
import { colors, spacing, radius, fontSize, shadow, formatPrice } from "../../theme";

const FLOW: OrderStatus[] = ["confirmed", "preparing", "out_for_delivery", "delivered"];
const META: Record<OrderStatus, { label: string; color: string; surface: string }> = {
  confirmed: { label: "Confirmed", color: colors.accent, surface: colors.accentSurface },
  preparing: { label: "Preparing", color: "#7C3AED", surface: "#F5F3FF" },
  out_for_delivery: { label: "Out for delivery", color: colors.primary, surface: colors.primarySurface },
  delivered: { label: "Delivered", color: colors.textSecondary, surface: colors.surfaceAlt },
};

export default function AdminOrders() {
  const qc = useQueryClient();
  const orders = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: adminApi.orders,
    refetchInterval: 4000,
  });

  const advance = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      adminApi.updateOrderStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin"] }),
  });

  const list = orders.data ?? [];

  return (
    <AdminShell title="Orders">
      {orders.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />
      ) : list.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySub}>
            Place an order in the storefront — it will appear here instantly for you to process.
          </Text>
        </View>
      ) : (
        <View style={{ gap: spacing.lg }}>
          {list.map((order) => (
            <OrderCard key={order.id} order={order} onAdvance={advance.mutate} busy={advance.isPending} />
          ))}
        </View>
      )}
    </AdminShell>
  );
}

function OrderCard({
  order,
  onAdvance,
  busy,
}: {
  order: Order;
  onAdvance: (v: { id: string; status: OrderStatus }) => void;
  busy: boolean;
}) {
  const meta = META[order.status];
  const stepIndex = FLOW.indexOf(order.status);
  const next = FLOW[stepIndex + 1];

  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={{ flex: 1 }}>
          <View style={styles.idRow}>
            <Text style={styles.orderId}>{order.id}</Text>
            <View style={[styles.statusPill, { backgroundColor: meta.surface }]}>
              <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
            </View>
          </View>
          <Text style={styles.meta}>
            {new Date(order.createdAt).toLocaleString()} · {order.paymentMethod}
          </Text>
          <Text style={styles.address}>📍 {order.address}</Text>
        </View>
        <View style={styles.totalCol}>
          <Text style={styles.total}>{formatPrice(order.total)}</Text>
          <Text style={styles.itemCount}>{order.items.length} item{order.items.length === 1 ? "" : "s"}</Text>
        </View>
      </View>

      {/* Progress dots */}
      <View style={styles.progress}>
        {FLOW.map((s, i) => (
          <View key={s} style={styles.progressStep}>
            <View style={[styles.dot, i <= stepIndex && { backgroundColor: colors.primary, borderColor: colors.primary }]} />
            {i < FLOW.length - 1 && <View style={[styles.line, i < stepIndex && { backgroundColor: colors.primary }]} />}
          </View>
        ))}
      </View>

      {/* Items */}
      <View style={styles.items}>
        {order.items.map((it) => (
          <Text key={it.productId} style={styles.itemLine} numberOfLines={1}>
            <Text style={{ fontWeight: "800", color: colors.primary }}>{it.qty}× </Text>
            {it.name}
          </Text>
        ))}
      </View>

      {/* Action */}
      <View style={styles.actions}>
        {next ? (
          <Pressable
            style={[styles.advanceBtn, busy && { opacity: 0.6 }]}
            onPress={() => onAdvance({ id: order.id, status: next })}
            disabled={busy}
          >
            <Ionicons name="arrow-forward-circle" size={18} color={colors.white} />
            <Text style={styles.advanceText}>Mark as {META[next].label}</Text>
          </Pressable>
        ) : (
          <View style={styles.doneTag}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.doneText}>Delivered</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { alignItems: "center", gap: spacing.sm, padding: spacing.xxxl },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text, marginTop: spacing.sm },
  emptySub: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: "center", maxWidth: 380, lineHeight: 22 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  cardHead: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  idRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  orderId: { fontSize: fontSize.lg, fontWeight: "900", color: colors.text },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.full },
  statusText: { fontSize: 11, fontWeight: "800" },
  meta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4, fontWeight: "600" },
  address: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4, fontWeight: "600" },
  totalCol: { alignItems: "flex-end" },
  total: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text },
  itemCount: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: "600" },

  progress: { flexDirection: "row", alignItems: "center", marginVertical: spacing.lg },
  progressStep: { flexDirection: "row", alignItems: "center", flex: 1 },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
  line: { flex: 1, height: 2, backgroundColor: colors.border, marginHorizontal: 2 },

  items: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  itemLine: { fontSize: fontSize.sm, color: colors.text, fontWeight: "600" },

  actions: { flexDirection: "row", marginTop: spacing.lg },
  advanceBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    borderRadius: radius.md,
  },
  advanceText: { color: colors.white, fontWeight: "800", fontSize: fontSize.sm },
  doneTag: { flexDirection: "row", alignItems: "center", gap: 6 },
  doneText: { color: colors.primary, fontWeight: "800", fontSize: fontSize.sm },
});
