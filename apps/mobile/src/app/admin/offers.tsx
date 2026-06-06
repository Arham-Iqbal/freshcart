import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AdminShell } from "../../components/admin/AdminShell";
import { Card, TonePill, PrimaryButton, AdminModal, Field, Input, Toggle } from "../../components/admin/ui";
import { colors, spacing, radius, fontSize } from "../../theme";

interface Offer {
  id: string;
  code: string;
  type: "percent" | "flat" | "freeship";
  value: string;
  status: "Active" | "Scheduled" | "Expired";
  used: number;
}

const SEED: Offer[] = [
  { id: "1", code: "FRESH10", type: "percent", value: "10% off", status: "Active", used: 248 },
  { id: "2", code: "FREESHIP", type: "freeship", value: "Free delivery", status: "Active", used: 1032 },
  { id: "3", code: "WEEKEND20", type: "percent", value: "20% off", status: "Scheduled", used: 0 },
  { id: "4", code: "NEW50", type: "flat", value: "₹50 off", status: "Active", used: 512 },
  { id: "5", code: "DIWALI25", type: "percent", value: "25% off", status: "Expired", used: 3401 },
];

const STATUS_TONE = { Active: "green", Scheduled: "amber", Expired: "gray" } as const;
const TYPE_LABEL = { percent: "Percentage", flat: "Flat amount", freeship: "Free delivery" };

export default function AdminOffers() {
  const [offers, setOffers] = useState<Offer[]>(SEED);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [type, setType] = useState<Offer["type"]>("percent");
  const [value, setValue] = useState("");
  const [active, setActive] = useState(true);

  function create() {
    if (!code.trim()) return;
    setOffers((o) => [
      {
        id: Date.now().toString(),
        code: code.toUpperCase().trim(),
        type,
        value: value.trim() || (type === "freeship" ? "Free delivery" : type === "percent" ? "10% off" : "₹50 off"),
        status: active ? "Active" : "Scheduled",
        used: 0,
      },
      ...o,
    ]);
    setCode(""); setValue(""); setType("percent"); setActive(true); setOpen(false);
  }

  const activeCount = offers.filter((o) => o.status === "Active").length;
  const totalRedemptions = offers.reduce((s, o) => s + o.used, 0);

  return (
    <AdminShell title="Offers & Discounts">
      <View style={styles.statRow}>
        <MiniStat icon="pricetag" label="Active offers" value={String(activeCount)} tint={colors.primary} />
        <MiniStat icon="people" label="Total redemptions" value={totalRedemptions.toLocaleString("en-IN")} tint={colors.accent} />
        <MiniStat icon="trending-up" label="Avg. cart uplift" value="+18%" tint="#7C3AED" />
      </View>

      <Card>
        <View style={styles.head}>
          <Text style={styles.title}>Promo codes</Text>
          <PrimaryButton label="Create offer" icon="add" onPress={() => setOpen(true)} />
        </View>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.th, { flex: 2 }]}>Code</Text>
          <Text style={[styles.th, { flex: 2 }]}>Reward</Text>
          <Text style={[styles.th, { flex: 1.5 }]}>Status</Text>
          <Text style={[styles.th, { flex: 1 }]}>Used</Text>
        </View>
        {offers.map((o) => (
          <View key={o.id} style={styles.row}>
            <View style={{ flex: 2, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
              <View style={styles.codeChip}>
                <Text style={styles.codeText}>{o.code}</Text>
              </View>
            </View>
            <View style={{ flex: 2 }}>
              <Text style={styles.reward}>{o.value}</Text>
              <Text style={styles.rewardType}>{TYPE_LABEL[o.type]}</Text>
            </View>
            <View style={{ flex: 1.5 }}>
              <TonePill label={o.status} tone={STATUS_TONE[o.status]} />
            </View>
            <Text style={[styles.used, { flex: 1 }]}>{o.used.toLocaleString("en-IN")}</Text>
          </View>
        ))}
      </Card>

      {open && (
        <AdminModal
          title="Create offer"
          onClose={() => setOpen(false)}
          footer={
            <>
              <Pressable onPress={() => setOpen(false)} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></Pressable>
              <PrimaryButton label="Create offer" onPress={create} />
            </>
          }
        >
          <Field label="Promo code"><Input value={code} onChangeText={setCode} placeholder="e.g. SUMMER15" autoCapitalize="characters" /></Field>
          <Field label="Discount type">
            <View style={styles.typeRow}>
              {(["percent", "flat", "freeship"] as const).map((t) => (
                <Pressable key={t} style={[styles.typeChip, type === t && styles.typeChipActive]} onPress={() => setType(t)}>
                  <Text style={[styles.typeChipText, type === t && styles.typeChipTextActive]}>{TYPE_LABEL[t]}</Text>
                </Pressable>
              ))}
            </View>
          </Field>
          {type !== "freeship" && (
            <Field label={type === "percent" ? "Percentage / label" : "Amount / label"}>
              <Input value={value} onChangeText={setValue} placeholder={type === "percent" ? "15% off" : "₹50 off"} />
            </Field>
          )}
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Activate immediately</Text>
            <Toggle value={active} onValueChange={setActive} />
          </View>
        </AdminModal>
      )}
    </AdminShell>
  );
}

function MiniStat({ icon, label, value, tint }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tint: string }) {
  return (
    <Card style={{ flex: 1, minWidth: 180 }}>
      <View style={[styles.miniIcon, { backgroundColor: tint + "18" }]}><Ionicons name={icon} size={20} color={tint} /></View>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  statRow: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" },
  miniIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  miniValue: { fontSize: fontSize.xxl, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  miniLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600" },

  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  title: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerRow: { borderBottomWidth: 1, borderBottomColor: colors.border },
  th: { fontSize: fontSize.xs, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.3, textTransform: "uppercase" },
  codeChip: { backgroundColor: colors.primarySurface, paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.primaryLight, borderStyle: "dashed" },
  codeText: { fontSize: fontSize.sm, fontWeight: "900", color: colors.primaryDark, letterSpacing: 0.5 },
  reward: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  rewardType: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  used: { fontSize: fontSize.sm, fontWeight: "700", color: colors.textSecondary },

  cancel: { paddingHorizontal: spacing.lg, paddingVertical: 11 },
  cancelText: { fontSize: fontSize.md, fontWeight: "700", color: colors.textSecondary },
  typeRow: { flexDirection: "row", gap: spacing.sm },
  typeChip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  typeChipActive: { backgroundColor: colors.primarySurface, borderColor: colors.primary },
  typeChipText: { fontSize: fontSize.xs, fontWeight: "700", color: colors.textSecondary },
  typeChipTextActive: { color: colors.primaryDark },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  toggleLabel: { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
});
