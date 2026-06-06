import { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "../../components/admin/AdminShell";
import { Card, TonePill } from "../../components/admin/ui";
import { SmartImage } from "../../components/SmartImage";
import { adminApi } from "../../lib/admin";
import { colors, spacing, radius, fontSize } from "../../theme";

// Deterministic pseudo-stock from the product id so the demo looks consistent.
function stockFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100;
  return h;
}

export default function AdminInventory() {
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const products = useQuery({ queryKey: ["admin", "products"], queryFn: adminApi.products });

  const rows = (products.data ?? []).map((p) => {
    const stock = p.inStock ? stockFor(p.id) + 5 : 0;
    const level = stock === 0 ? "out" : stock < 20 ? "low" : "ok";
    return { p, stock, level };
  });
  const filtered = rows.filter((r) => (filter === "all" ? true : filter === "low" ? r.level === "low" : r.level === "out"));

  const lowCount = rows.filter((r) => r.level === "low").length;
  const outCount = rows.filter((r) => r.level === "out").length;

  const FILTERS: { key: typeof filter; label: string }[] = [
    { key: "all", label: `All (${rows.length})` },
    { key: "low", label: `Low stock (${lowCount})` },
    { key: "out", label: `Out of stock (${outCount})` },
  ];

  return (
    <AdminShell title="Inventory">
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Text key={f.key} onPress={() => setFilter(f.key)} style={[styles.filterChip, filter === f.key && styles.filterChipActive]}>
            {f.label}
          </Text>
        ))}
      </View>

      <Card>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.th, { flex: 3 }]}>Product</Text>
          <Text style={[styles.th, { flex: 1.5 }]}>Stock level</Text>
          <Text style={[styles.th, { flex: 1 }]}>Units</Text>
          <Text style={[styles.th, { flex: 1.3 }]}>Status</Text>
        </View>
        {products.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ padding: spacing.xl }} />
        ) : (
          filtered.map(({ p, stock, level }) => (
            <View key={p.id} style={styles.row}>
              <View style={{ flex: 3, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <SmartImage source={p} style={styles.thumb} />
                <View>
                  <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.unit}>{p.unitSize}</Text>
                </View>
              </View>
              <View style={{ flex: 1.5, paddingRight: spacing.lg }}>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.min(100, stock)}%`, backgroundColor: level === "out" ? colors.sale : level === "low" ? colors.accent : colors.primary }]} />
                </View>
              </View>
              <Text style={[styles.units, { flex: 1 }]}>{stock}</Text>
              <View style={{ flex: 1.3 }}>
                <TonePill label={level === "out" ? "Out of stock" : level === "low" ? "Low" : "In stock"} tone={level === "out" ? "red" : level === "low" ? "amber" : "green"} />
              </View>
            </View>
          ))
        )}
        {!products.isLoading && filtered.length === 0 && <Text style={styles.empty}>Nothing here — stock looks healthy. ✅</Text>}
      </Card>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: "row", gap: spacing.sm },
  filterChip: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, fontSize: fontSize.sm, fontWeight: "700", color: colors.textSecondary, overflow: "hidden" },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary, color: colors.white },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerRow: { borderBottomColor: colors.border },
  th: { fontSize: fontSize.xs, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.3, textTransform: "uppercase" },
  thumb: { width: 40, height: 40, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt },
  name: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  unit: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  track: { height: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radius.full },
  units: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  empty: { padding: spacing.xl, textAlign: "center", color: colors.textMuted },
});
