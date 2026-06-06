import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AdminShell } from "../../components/admin/AdminShell";
import { Card, TonePill, Toggle, Field, Input } from "../../components/admin/ui";
import { colors, spacing, radius, fontSize, formatPrice } from "../../theme";

const ZONES = [
  { name: "Indiranagar", fee: 0, eta: "20–30 min", on: true },
  { name: "Koramangala", fee: 29, eta: "25–35 min", on: true },
  { name: "Whitefield", fee: 49, eta: "35–45 min", on: true },
  { name: "Electronic City", fee: 49, eta: "40–55 min", on: false },
];

const RIDERS = [
  { name: "Imran Khan", status: "On delivery", tone: "blue", deliveries: 12 },
  { name: "Suresh Babu", status: "Available", tone: "green", deliveries: 9 },
  { name: "Anita Rao", status: "Available", tone: "green", deliveries: 7 },
  { name: "Vikram Singh", status: "Offline", tone: "gray", deliveries: 0 },
] as const;

export default function AdminDelivery() {
  const [zones, setZones] = useState(ZONES.map((z) => z.on));

  return (
    <AdminShell title="Delivery">
      <View style={styles.statRow}>
        <MiniStat icon="bicycle" label="Active riders" value="3" tint={colors.primary} />
        <MiniStat icon="cube" label="Out for delivery" value="14" tint={colors.accent} />
        <MiniStat icon="time" label="Avg. delivery time" value="28 min" tint="#7C3AED" />
        <MiniStat icon="checkmark-done" label="Delivered today" value="86" tint={colors.sale} />
      </View>

      <View style={styles.cols}>
        <Card style={{ flex: 1.3, minWidth: 340 }}>
          <Text style={styles.title}>Delivery zones</Text>
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.th, { flex: 2 }]}>Zone</Text>
            <Text style={[styles.th, { flex: 1 }]}>Fee</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>ETA</Text>
            <Text style={[styles.th, { width: 60, textAlign: "right" }]}>On</Text>
          </View>
          {ZONES.map((z, i) => (
            <View key={z.name} style={styles.row}>
              <Text style={[styles.zoneName, { flex: 2 }]}>{z.name}</Text>
              <Text style={[styles.cell, { flex: 1 }]}>{z.fee === 0 ? "Free" : formatPrice(z.fee)}</Text>
              <Text style={[styles.cell, { flex: 1.4 }]}>{z.eta}</Text>
              <View style={{ width: 60, alignItems: "flex-end" }}>
                <Toggle value={zones[i]} onValueChange={(v) => setZones((s) => s.map((x, j) => (j === i ? v : x)))} />
              </View>
            </View>
          ))}
        </Card>

        <Card style={{ flex: 1, minWidth: 300 }}>
          <Text style={styles.title}>Delivery partners</Text>
          {RIDERS.map((r) => (
            <View key={r.name} style={styles.riderRow}>
              <View style={styles.riderAvatar}>
                <Ionicons name="person" size={16} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.riderName}>{r.name}</Text>
                <Text style={styles.riderMeta}>{r.deliveries} deliveries today</Text>
              </View>
              <TonePill label={r.status} tone={r.tone as any} />
            </View>
          ))}
        </Card>
      </View>

      <Card>
        <Text style={styles.title}>Delivery settings</Text>
        <View style={styles.settingsRow}>
          <Field label="Base delivery fee (₹)" style={{ flex: 1 }}><Input defaultValue="29" keyboardType="numeric" /></Field>
          <Field label="Free delivery above (₹)" style={{ flex: 1 }}><Input defaultValue="499" keyboardType="numeric" /></Field>
          <Field label="Max delivery radius (km)" style={{ flex: 1 }}><Input defaultValue="12" keyboardType="numeric" /></Field>
        </View>
      </Card>
    </AdminShell>
  );
}

function MiniStat({ icon, label, value, tint }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tint: string }) {
  return (
    <Card style={{ flex: 1, minWidth: 170 }}>
      <View style={[styles.miniIcon, { backgroundColor: tint + "18" }]}><Ionicons name={icon} size={20} color={tint} /></View>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" },
  cols: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" },
  miniIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  miniValue: { fontSize: fontSize.xxl, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  miniLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600" },
  title: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text, marginBottom: spacing.md },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerRow: { borderBottomColor: colors.border },
  th: { fontSize: fontSize.xs, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.3, textTransform: "uppercase" },
  zoneName: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  cell: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600" },
  riderRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  riderAvatar: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center" },
  riderName: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  riderMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  settingsRow: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" },
});
