import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Modal } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth, type PaymentMethod } from "../../store/auth";
import { AccountHeader } from "../../components/AccountHeader";
import { colors, spacing, radius, fontSize, shadow, FORM_WIDTH } from "../../theme";

const ICON: Record<PaymentMethod["type"], keyof typeof Ionicons.glyphMap> = {
  upi: "phone-portrait",
  card: "card",
  cod: "cash",
};

export default function PaymentsScreen() {
  const router = useRouter();
  const payments = useAuth((s) => s.payments);
  const addPayment = useAuth((s) => s.addPayment);
  const removePayment = useAuth((s) => s.removePayment);
  const setDefaultPayment = useAuth((s) => s.setDefaultPayment);

  const [open, setOpen] = useState(false);
  const [card, setCard] = useState("");

  function addCard() {
    const digits = card.replace(/\D/g, "");
    if (digits.length < 4) return;
    const last4 = digits.slice(-4);
    addPayment({ type: "card", label: "New Card", last4 });
    setCard("");
    setOpen(false);
  }

  return (
    <View style={styles.root}>
      <AccountHeader title="Payment methods" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.center, { maxWidth: FORM_WIDTH }]}>
          {payments.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.icon}>
                <Ionicons name={ICON[p.type]} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>
                    {p.label}
                    {p.last4 ? ` •••• ${p.last4}` : ""}
                  </Text>
                  {p.isDefault && (
                    <View style={styles.defaultPill}>
                      <Text style={styles.defaultText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sub}>{p.type.toUpperCase()}</Text>
                <View style={styles.actions}>
                  {!p.isDefault && (
                    <Pressable onPress={() => setDefaultPayment(p.id)} hitSlop={6}>
                      <Text style={styles.actionLink}>Set as default</Text>
                    </Pressable>
                  )}
                  {p.type !== "cod" && (
                    <Pressable onPress={() => removePayment(p.id)} hitSlop={6}>
                      <Text style={[styles.actionLink, { color: colors.sale }]}>Remove</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          ))}

          <Pressable style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]} onPress={() => setOpen(true)}>
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={styles.addBtnText}>Add a card</Text>
          </Pressable>

          <View style={styles.secure}>
            <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
            <Text style={styles.secureText}>Payments are encrypted and secure. This is a demo — no real charges.</Text>
          </View>
        </View>
      </ScrollView>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Add a card</Text>
            <Text style={styles.fieldLabel}>Card number</Text>
            <TextInput
              style={styles.input}
              value={card}
              onChangeText={setCard}
              placeholder="4242 4242 4242 4242"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
            />
            <Pressable
              style={({ pressed }) => [styles.saveBtn, card.replace(/\D/g, "").length < 4 && { opacity: 0.5 }, pressed && styles.pressed]}
              onPress={addCard}
            >
              <Text style={styles.saveBtnText}>Add card</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { paddingVertical: spacing.lg, alignItems: "center", paddingBottom: 40 },
  center: { width: "100%", alignSelf: "center", paddingHorizontal: spacing.lg },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  icon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center" },
  labelRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  label: { fontSize: fontSize.md, fontWeight: "800", color: colors.text },
  defaultPill: { backgroundColor: colors.primarySurface, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  defaultText: { fontSize: 9, fontWeight: "800", color: colors.primary, letterSpacing: 0.4 },
  sub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, fontWeight: "700" },
  actions: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.md },
  actionLink: { fontSize: fontSize.sm, fontWeight: "800", color: colors.primary },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    borderStyle: "dashed",
    backgroundColor: colors.primarySurface,
  },
  addBtnText: { fontSize: fontSize.md, fontWeight: "800", color: colors.primary },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  secure: { flexDirection: "row", gap: spacing.sm, alignItems: "center", marginTop: spacing.lg, paddingHorizontal: spacing.xs },
  secureText: { flex: 1, fontSize: fontSize.xs, color: colors.textMuted, fontWeight: "600", lineHeight: 17 },

  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, padding: spacing.xl, paddingBottom: spacing.xxxl, width: "100%", maxWidth: FORM_WIDTH, alignSelf: "center" },
  sheetHandle: { width: 44, height: 5, borderRadius: radius.full, backgroundColor: colors.border, alignSelf: "center", marginBottom: spacing.lg },
  sheetTitle: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text, marginBottom: spacing.lg },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: "800", color: colors.textSecondary, marginBottom: spacing.sm },
  input: { backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.lg, fontSize: fontSize.md, color: colors.text, fontWeight: "600", borderWidth: 1.5, borderColor: colors.border },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: radius.full, alignItems: "center", marginTop: spacing.xl, ...shadow.card },
  saveBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },
});
