import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AdminShell } from "../../components/admin/AdminShell";
import { Card, BarChart } from "../../components/admin/ui";
import { colors, spacing, radius, fontSize, formatPrice } from "../../theme";

const RANGES = ["Today", "7 days", "30 days"] as const;
type Range = (typeof RANGES)[number];

const SALES: Record<Range, { label: string; value: number }[]> = {
  Today: ["9a", "11a", "1p", "3p", "5p", "7p", "9p"].map((l, i) => ({ label: l, value: [12, 28, 41, 33, 52, 78, 64][i] })),
  "7 days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((l, i) => ({ label: l, value: [42, 51, 38, 63, 74, 92, 81][i] })),
  "30 days": ["W1", "W2", "W3", "W4"].map((l, i) => ({ label: l, value: [320, 410, 380, 520][i] })),
};

const CATEGORIES = [
  { label: "Fruit & Veg", value: 92 },
  { label: "Dairy", value: 68 },
  { label: "Bakery", value: 54 },
  { label: "Beverages", value: 47 },
  { label: "Snacks", value: 39 },
  { label: "Frozen", value: 28 },
];

const HOURLY = ["6a", "9a", "12p", "3p", "6p", "9p", "12a"].map((l, i) => ({ label: l, value: [8, 24, 38, 30, 64, 52, 14][i] }));

export default function AdminAnalytics() {
  const [range, setRange] = useState<Range>("7 days");

  return (
    <AdminShell title="Analytics">
      <View style={styles.rangeRow}>
        {RANGES.map((r) => (
          <Pressable key={r} style={[styles.rangeChip, range === r && styles.rangeChipActive]} onPress={() => setRange(r)}>
            <Text style={[styles.rangeText, range === r && styles.rangeTextActive]}>{r}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statRow}>
        <MiniStat icon="cash" label="Revenue" value={formatPrice(124500)} delta="+12.4%" up tint={colors.primary} />
        <MiniStat icon="receipt" label="Orders" value="486" delta="+8.1%" up tint={colors.accent} />
        <MiniStat icon="cart" label="Conversion" value="4.6%" delta="-0.3%" tint="#7C3AED" />
        <MiniStat icon="people" label="New customers" value="73" delta="+21%" up tint={colors.sale} />
      </View>

      <View style={styles.cols}>
        <Card style={{ flex: 1.5, minWidth: 360 }}>
          <Text style={styles.title}>Sales · {range}</Text>
          <View style={{ marginTop: spacing.md }}>
            <BarChart data={SALES[range]} height={180} />
          </View>
        </Card>
        <Card style={{ flex: 1, minWidth: 280 }}>
          <Text style={styles.title}>Top categories</Text>
          <View style={{ marginTop: spacing.md, gap: spacing.md }}>
            {CATEGORIES.map((c) => {
              const max = CATEGORIES[0].value;
              return (
                <View key={c.label}>
                  <View style={styles.catHead}>
                    <Text style={styles.catLabel}>{c.label}</Text>
                    <Text style={styles.catVal}>{c.value}%</Text>
                  </View>
                  <View style={styles.catTrack}><View style={[styles.catFill, { width: `${(c.value / max) * 100}%` }]} /></View>
                </View>
              );
            })}
          </View>
        </Card>
      </View>

      <View style={styles.cols}>
        <Card style={{ flex: 1, minWidth: 360 }}>
          <Text style={styles.title}>Orders by hour</Text>
          <View style={{ marginTop: spacing.md }}>
            <BarChart data={HOURLY} height={150} color={colors.accent} />
          </View>
        </Card>
        <Card style={{ flex: 1, minWidth: 280 }}>
          <Text style={styles.title}>Conversion funnel</Text>
          <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
            {[
              { label: "Visited store", value: 100, count: "12,400" },
              { label: "Added to cart", value: 42, count: "5,208" },
              { label: "Started checkout", value: 24, count: "2,976" },
              { label: "Completed order", value: 18, count: "2,232" },
            ].map((f) => (
              <View key={f.label}>
                <View style={styles.catHead}>
                  <Text style={styles.catLabel}>{f.label}</Text>
                  <Text style={styles.catVal}>{f.count}</Text>
                </View>
                <View style={styles.funnelTrack}><View style={[styles.funnelFill, { width: `${f.value}%` }]} /></View>
              </View>
            ))}
          </View>
        </Card>
      </View>
    </AdminShell>
  );
}

function MiniStat({ icon, label, value, delta, up, tint }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; delta: string; up?: boolean; tint: string }) {
  return (
    <Card style={{ flex: 1, minWidth: 170 }}>
      <View style={[styles.miniIcon, { backgroundColor: tint + "18" }]}><Ionicons name={icon} size={20} color={tint} /></View>
      <Text style={styles.miniValue}>{value}</Text>
      <View style={styles.miniBottom}>
        <Text style={styles.miniLabel}>{label}</Text>
        <Text style={[styles.delta, { color: up ? colors.primary : colors.sale }]}>{delta}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  rangeRow: { flexDirection: "row", gap: spacing.sm },
  rangeChip: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  rangeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rangeText: { fontSize: fontSize.sm, fontWeight: "700", color: colors.textSecondary },
  rangeTextActive: { color: colors.white },
  statRow: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" },
  cols: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" },
  miniIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  miniValue: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  miniBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  miniLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600" },
  delta: { fontSize: fontSize.xs, fontWeight: "800" },
  title: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text },
  catHead: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  catLabel: { fontSize: fontSize.sm, fontWeight: "700", color: colors.textSecondary },
  catVal: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  catTrack: { height: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, overflow: "hidden" },
  catFill: { height: "100%", borderRadius: radius.full, backgroundColor: colors.primary },
  funnelTrack: { height: 22, borderRadius: radius.sm, backgroundColor: colors.surfaceAlt, overflow: "hidden" },
  funnelFill: { height: "100%", borderRadius: radius.sm, backgroundColor: colors.primary, opacity: 0.85 },
});
