/**
 * Shared admin UI primitives — Pill, Card, SectionTitle, Modal, Toggle, Field.
 * Keeps the new admin pages visually consistent with the existing dashboard.
 */
import { View, Text, Pressable, StyleSheet, Modal, Switch, TextInput } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing, radius, fontSize, shadow } from "../../theme";

export function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionTitle({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <View style={styles.sectionHead}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {sub ? <Text style={styles.sectionSub}>{sub}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function Pill({ label, color, surface }: { label: string; color: string; surface: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: surface }]}>
      <View style={[styles.pillDot, { backgroundColor: color }]} />
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

/** Map a status string to a pill color pair. */
export const PILL_TONES: Record<string, { color: string; surface: string }> = {
  green: { color: colors.primaryDark, surface: colors.primarySurface },
  amber: { color: "#B45309", surface: colors.accentSurface },
  red: { color: colors.sale, surface: colors.saleSurface },
  purple: { color: "#6D28D9", surface: "#F4F0FE" },
  blue: { color: "#1D4ED8", surface: "#EFF4FF" },
  gray: { color: colors.textSecondary, surface: colors.surfaceAlt },
};

export function TonePill({ label, tone }: { label: string; tone: keyof typeof PILL_TONES }) {
  const t = PILL_TONES[tone] ?? PILL_TONES.gray;
  return <Pill label={label} color={t.color} surface={t.surface} />;
}

export function PrimaryButton({
  label,
  icon,
  onPress,
  style,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  style?: any;
}) {
  return (
    <Pressable style={[styles.primaryBtn, style]} onPress={onPress}>
      {icon ? <Ionicons name={icon} size={18} color={colors.white} /> : null}
      <Text style={styles.primaryBtnText}>{label}</Text>
    </Pressable>
  );
}

export function Toggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: colors.border, true: colors.primary }}
      thumbColor={colors.white}
    />
  );
}

export function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ gap: 6 }, style]}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

export function Input(props: React.ComponentProps<typeof TextInput>) {
  return <TextInput placeholderTextColor={colors.textMuted} {...props} style={[styles.input, props.style]} />;
}

export function AdminModal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>
          <View style={styles.modalBody}>{children}</View>
          {footer ? <View style={styles.modalFooter}>{footer}</View> : null}
        </View>
      </View>
    </Modal>
  );
}

/** Simple vertical bar chart from Views. */
export function BarChart({
  data,
  height = 140,
  color = colors.primary,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <View style={[styles.chart, { height }]}>
      {data.map((d, i) => (
        <View key={i} style={styles.chartCol}>
          <View style={styles.chartBarTrack}>
            <View
              style={[styles.chartBar, { height: `${(d.value / max) * 100}%`, backgroundColor: color }]}
            />
          </View>
          <Text style={styles.chartLabel}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text },
  sectionSub: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: "600", marginTop: 2 },

  pill: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  pillText: { fontSize: 11, fontWeight: "800" },

  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 11,
    borderRadius: radius.md,
  },
  primaryBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.sm },

  fieldLabel: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    outlineStyle: "none",
  } as any,

  overlay: { flex: 1, backgroundColor: colors.overlay, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  modal: { width: "100%", maxWidth: 520, maxHeight: "90%", backgroundColor: colors.surface, borderRadius: radius.xl, overflow: "hidden", ...shadow.floating },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  modalTitle: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text },
  modalBody: { padding: spacing.lg, gap: spacing.lg },
  modalFooter: { flexDirection: "row", justifyContent: "flex-end", gap: spacing.md, padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderLight },

  chart: { flexDirection: "row", alignItems: "flex-end", gap: spacing.sm },
  chartCol: { flex: 1, alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" },
  chartBarTrack: { width: "100%", flex: 1, justifyContent: "flex-end", alignItems: "center" },
  chartBar: { width: "62%", minHeight: 4, borderRadius: radius.sm },
  chartLabel: { fontSize: 10, color: colors.textMuted, fontWeight: "700" },
});
