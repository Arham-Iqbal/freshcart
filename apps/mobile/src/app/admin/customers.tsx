import { useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AdminShell } from "../../components/admin/AdminShell";
import { Card } from "../../components/admin/ui";
import { colors, spacing, radius, fontSize, formatPrice } from "../../theme";

const CUSTOMERS = [
  { name: "Aarav Sharma", email: "aarav.sharma@email.com", orders: 24, spent: 18650, joined: "Jan 2025" },
  { name: "Priya Nair", email: "priya.nair@email.com", orders: 12, spent: 9240, joined: "Mar 2025" },
  { name: "Rahul Mehta", email: "rahul.mehta@email.com", orders: 31, spent: 24100, joined: "Nov 2024" },
  { name: "Sneha Reddy", email: "sneha.r@email.com", orders: 6, spent: 4120, joined: "May 2025" },
  { name: "Karan Gupta", email: "karan.g@email.com", orders: 18, spent: 13880, joined: "Feb 2025" },
  { name: "Divya Menon", email: "divya.menon@email.com", orders: 9, spent: 7350, joined: "Apr 2025" },
  { name: "Arjun Das", email: "arjun.das@email.com", orders: 41, spent: 32900, joined: "Sep 2024" },
  { name: "Neha Kapoor", email: "neha.kapoor@email.com", orders: 3, spent: 1890, joined: "Jun 2025" },
];

export default function AdminCustomers() {
  const [q, setQ] = useState("");
  const list = CUSTOMERS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()));
  const totalSpent = CUSTOMERS.reduce((s, c) => s + c.spent, 0);

  return (
    <AdminShell title="Customers">
      <View style={styles.statRow}>
        <MiniStat icon="people" label="Total customers" value={String(CUSTOMERS.length)} tint={colors.primary} />
        <MiniStat icon="cash" label="Lifetime revenue" value={formatPrice(totalSpent)} tint={colors.accent} />
        <MiniStat icon="repeat" label="Repeat rate" value="68%" tint="#7C3AED" />
        <MiniStat icon="star" label="Avg. rating" value="4.7" tint={colors.sale} />
      </View>

      <Card>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search customers…" placeholderTextColor={colors.textMuted} style={styles.searchInput as any} />
        </View>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.th, { flex: 2.2 }]}>Customer</Text>
          <Text style={[styles.th, { flex: 1 }]}>Orders</Text>
          <Text style={[styles.th, { flex: 1.3 }]}>Total spent</Text>
          <Text style={[styles.th, { flex: 1.2 }]}>Joined</Text>
        </View>
        {list.map((c) => (
          <View key={c.email} style={styles.row}>
            <View style={{ flex: 2.2, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{c.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</Text></View>
              <View>
                <Text style={styles.name}>{c.name}</Text>
                <Text style={styles.email}>{c.email}</Text>
              </View>
            </View>
            <Text style={[styles.cell, { flex: 1 }]}>{c.orders}</Text>
            <Text style={[styles.spent, { flex: 1.3 }]}>{formatPrice(c.spent)}</Text>
            <Text style={[styles.cell, { flex: 1.2 }]}>{c.joined}</Text>
          </View>
        ))}
        {list.length === 0 && <Text style={styles.empty}>No customers match "{q}".</Text>}
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
  miniIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  miniValue: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  miniLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600" },
  searchBar: { flexDirection: "row", alignItems: "center", gap: spacing.sm, backgroundColor: colors.surfaceAlt, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  searchInput: { flex: 1, fontSize: fontSize.md, color: colors.text, outlineStyle: "none" },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerRow: { borderBottomColor: colors.border },
  th: { fontSize: fontSize.xs, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.3, textTransform: "uppercase" },
  avatar: { width: 38, height: 38, borderRadius: radius.full, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: fontSize.xs, fontWeight: "900", color: colors.primary },
  name: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  email: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  cell: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600" },
  spent: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  empty: { padding: spacing.xl, textAlign: "center", color: colors.textMuted },
});
