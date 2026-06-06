import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AdminShell } from "../../components/admin/AdminShell";
import { Card, Field, Input, Toggle } from "../../components/admin/ui";
import { colors, spacing, radius, fontSize } from "../../theme";

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [notify, setNotify] = useState({ newOrder: true, lowStock: true, dailyReport: false });

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <AdminShell title="Settings">
      <Card>
        <Text style={styles.title}>Store profile</Text>
        <View style={styles.grid}>
          <Field label="Store name" style={{ flex: 1, minWidth: 220 }}><Input defaultValue="FreshCart" /></Field>
          <Field label="Support email" style={{ flex: 1, minWidth: 220 }}><Input defaultValue="support@freshcart.app" autoCapitalize="none" /></Field>
          <Field label="Phone" style={{ flex: 1, minWidth: 220 }}><Input defaultValue="1800-200-FRESH" /></Field>
          <Field label="Address" style={{ flex: 1, minWidth: 220 }}><Input defaultValue="MG Road, Indiranagar, Bengaluru" /></Field>
        </View>
      </Card>

      <Card>
        <Text style={styles.title}>Tax & charges</Text>
        <View style={styles.grid}>
          <Field label="GST (%)" style={{ flex: 1, minWidth: 200 }}><Input defaultValue="5" keyboardType="numeric" /></Field>
          <Field label="Base delivery fee (₹)" style={{ flex: 1, minWidth: 200 }}><Input defaultValue="29" keyboardType="numeric" /></Field>
          <Field label="Free delivery above (₹)" style={{ flex: 1, minWidth: 200 }}><Input defaultValue="499" keyboardType="numeric" /></Field>
        </View>
      </Card>

      <Card>
        <Text style={styles.title}>Business hours</Text>
        <View style={styles.grid}>
          <Field label="Opens at" style={{ flex: 1, minWidth: 200 }}><Input defaultValue="08:00 AM" /></Field>
          <Field label="Closes at" style={{ flex: 1, minWidth: 200 }}><Input defaultValue="10:00 PM" /></Field>
        </View>
      </Card>

      <Card>
        <Text style={styles.title}>Owner notifications</Text>
        {([
          ["newOrder", "New order received"],
          ["lowStock", "Low stock alerts"],
          ["dailyReport", "Daily sales report email"],
        ] as const).map(([key, label], i, arr) => (
          <View key={key} style={[styles.toggleRow, i < arr.length - 1 && styles.toggleBorder]}>
            <Text style={styles.toggleLabel}>{label}</Text>
            <Toggle value={notify[key]} onValueChange={(v) => setNotify((n) => ({ ...n, [key]: v }))} />
          </View>
        ))}
      </Card>

      <Card style={{ borderColor: colors.saleSurface, backgroundColor: "#FFFBFB" }}>
        <Text style={[styles.title, { color: colors.sale }]}>Danger zone</Text>
        <Text style={styles.dangerSub}>These actions are permanent and can't be undone.</Text>
        <View style={styles.dangerRow}>
          <Pressable style={styles.dangerBtn}><Text style={styles.dangerBtnText}>Reset catalog</Text></Pressable>
          <Pressable style={styles.dangerBtn}><Text style={styles.dangerBtnText}>Clear all orders</Text></Pressable>
        </View>
      </Card>

      <View style={styles.saveRow}>
        {saved && (
          <View style={styles.savedTag}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.savedText}>Saved</Text>
          </View>
        )}
        <Pressable style={styles.saveBtn} onPress={save}>
          <Text style={styles.saveBtnText}>Save changes</Text>
        </Pressable>
      </View>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text, marginBottom: spacing.md },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: spacing.md },
  toggleBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  toggleLabel: { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  dangerSub: { fontSize: fontSize.sm, color: colors.textSecondary, marginBottom: spacing.md },
  dangerRow: { flexDirection: "row", gap: spacing.md, flexWrap: "wrap" },
  dangerBtn: { borderWidth: 1.5, borderColor: colors.sale, paddingHorizontal: spacing.lg, paddingVertical: 10, borderRadius: radius.md },
  dangerBtnText: { color: colors.sale, fontWeight: "800", fontSize: fontSize.sm },
  saveRow: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: spacing.lg },
  savedTag: { flexDirection: "row", alignItems: "center", gap: 6 },
  savedText: { color: colors.primary, fontWeight: "800", fontSize: fontSize.sm },
  saveBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xxl, paddingVertical: 13, borderRadius: radius.md },
  saveBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },
});
