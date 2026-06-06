import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth, type Address, type AddressLabel } from "../../store/auth";
import { colors, spacing, radius, fontSize, shadow, FORM_WIDTH } from "../../theme";
import { AccountHeader } from "../../components/AccountHeader";

const LABELS: { value: AddressLabel; icon: keyof typeof Ionicons.glyphMap }[] = [
  { value: "Home", icon: "home" },
  { value: "Work", icon: "briefcase" },
  { value: "Other", icon: "location" },
];

const ICON_FOR: Record<AddressLabel, keyof typeof Ionicons.glyphMap> = {
  Home: "home",
  Work: "briefcase",
  Other: "location",
};

export default function AddressesScreen() {
  const router = useRouter();
  const addresses = useAuth((s) => s.addresses);
  const addAddress = useAuth((s) => s.addAddress);
  const updateAddress = useAuth((s) => s.updateAddress);
  const removeAddress = useAuth((s) => s.removeAddress);
  const setDefaultAddress = useAuth((s) => s.setDefaultAddress);

  const [editing, setEditing] = useState<Address | null>(null);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState<AddressLabel>("Home");
  const [line, setLine] = useState("");

  function openAdd() {
    setEditing(null);
    setLabel("Home");
    setLine("");
    setOpen(true);
  }

  function openEdit(a: Address) {
    setEditing(a);
    setLabel(a.label);
    setLine(a.line);
    setOpen(true);
  }

  function save() {
    if (line.trim().length < 5) return;
    if (editing) updateAddress(editing.id, { label, line: line.trim() });
    else addAddress({ label, line: line.trim() });
    setOpen(false);
  }

  return (
    <View style={styles.root}>
      <AccountHeader title="Delivery addresses" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.center, { maxWidth: FORM_WIDTH }]}>
          {addresses.length === 0 && (
            <View style={styles.empty}>
              <Ionicons name="location-outline" size={28} color={colors.textMuted} />
              <Text style={styles.emptyText}>No saved addresses yet.</Text>
            </View>
          )}

          {addresses.map((a) => (
            <View key={a.id} style={styles.card}>
              <View style={styles.cardIcon}>
                <Ionicons name={ICON_FOR[a.label]} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>{a.label}</Text>
                  {a.isDefault && (
                    <View style={styles.defaultPill}>
                      <Text style={styles.defaultText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.line}>{a.line}</Text>
                <View style={styles.actions}>
                  {!a.isDefault && (
                    <Pressable onPress={() => setDefaultAddress(a.id)} hitSlop={6}>
                      <Text style={styles.actionLink}>Set as default</Text>
                    </Pressable>
                  )}
                  <Pressable onPress={() => openEdit(a)} hitSlop={6}>
                    <Text style={styles.actionLink}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => removeAddress(a.id)} hitSlop={6}>
                    <Text style={[styles.actionLink, { color: colors.sale }]}>Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressed]}
            onPress={openAdd}
          >
            <Ionicons name="add" size={20} color={colors.primary} />
            <Text style={styles.addBtnText}>Add new address</Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{editing ? "Edit address" : "New address"}</Text>

            <Text style={styles.fieldLabel}>Label</Text>
            <View style={styles.labelChips}>
              {LABELS.map((l) => (
                <Pressable
                  key={l.value}
                  style={[styles.chip, label === l.value && styles.chipActive]}
                  onPress={() => setLabel(l.value)}
                >
                  <Ionicons
                    name={l.icon}
                    size={15}
                    color={label === l.value ? colors.white : colors.textSecondary}
                  />
                  <Text style={[styles.chipText, label === l.value && styles.chipTextActive]}>
                    {l.value}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Full address</Text>
            <TextInput
              style={styles.input}
              value={line}
              onChangeText={setLine}
              placeholder="Flat / building, street, area, city, PIN"
              placeholderTextColor={colors.textMuted}
              multiline
            />

            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                line.trim().length < 5 && { opacity: 0.5 },
                pressed && styles.pressed,
              ]}
              onPress={save}
            >
              <Text style={styles.saveBtnText}>{editing ? "Save changes" : "Add address"}</Text>
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

  empty: { alignItems: "center", gap: spacing.sm, padding: spacing.xxl },
  emptyText: { color: colors.textMuted, fontSize: fontSize.sm },

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
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
  },
  labelRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  label: { fontSize: fontSize.md, fontWeight: "800", color: colors.text },
  defaultPill: {
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  defaultText: { fontSize: 9, fontWeight: "800", color: colors.primary, letterSpacing: 0.4 },
  line: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2, lineHeight: 20 },
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
    marginTop: spacing.xs,
  },
  addBtnText: { fontSize: fontSize.md, fontWeight: "800", color: colors.primary },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
    width: "100%",
    maxWidth: FORM_WIDTH,
    alignSelf: "center",
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginBottom: spacing.lg,
  },
  sheetTitle: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text, marginBottom: spacing.lg },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: "800",
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  labelChips: { flexDirection: "row", gap: spacing.sm },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, fontWeight: "800", color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.lg,
    padding: spacing.lg,
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: "600",
    minHeight: 80,
    textAlignVertical: "top",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.full,
    alignItems: "center",
    marginTop: spacing.xl,
    ...shadow.card,
  },
  saveBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },
});
