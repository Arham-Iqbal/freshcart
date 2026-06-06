import { View, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { colors, spacing, radius, fontSize, shadow } from "../theme";

/**
 * A wide in-feed promotional banner placed between content sections. Two visual
 * variants keep the page from feeling repetitive: "gradient" (bold) and "soft"
 * (light tinted card with an accent bar).
 */
export function FeatureBanner({
  variant = "gradient",
  eyebrow,
  title,
  sub,
  cta,
  emoji,
  gradient = [colors.primary, colors.primaryDarker],
  tint = colors.primarySurface,
  accent = colors.primary,
  route,
}: {
  variant?: "gradient" | "soft";
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  emoji: string;
  gradient?: [string, string];
  tint?: string;
  accent?: string;
  route: string;
}) {
  const router = useRouter();

  if (variant === "soft") {
    return (
      <Pressable style={[styles.soft, { backgroundColor: tint }]} onPress={() => router.push(route as any)}>
        <View style={[styles.accentBar, { backgroundColor: accent }]} />
        <View style={styles.softText}>
          <Text style={[styles.softEyebrow, { color: accent }]}>{eyebrow}</Text>
          <Text style={styles.softTitle}>{title}</Text>
          <Text style={styles.softSub}>{sub}</Text>
          <View style={styles.softCtaRow}>
            <Text style={[styles.softCta, { color: accent }]}>{cta}</Text>
            <Ionicons name="arrow-forward" size={14} color={accent} />
          </View>
        </View>
        <Text style={styles.softEmoji}>{emoji}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable onPress={() => router.push(route as any)}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.grad}>
        <View style={styles.gradCircle} />
        <View style={styles.gradText}>
          <Text style={styles.gradEyebrow}>{eyebrow}</Text>
          <Text style={styles.gradTitle}>{title}</Text>
          <Text style={styles.gradSub}>{sub}</Text>
        </View>
        <View style={styles.gradRight}>
          <Text style={styles.gradEmoji}>{emoji}</Text>
          <View style={styles.gradBtn}>
            <Text style={styles.gradBtnText}>{cta}</Text>
            <Ionicons name="arrow-forward" size={14} color={colors.text} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // soft variant
  soft: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: "hidden",
    ...shadow.soft,
  },
  accentBar: { position: "absolute", left: 0, top: 0, bottom: 0, width: 5 },
  softText: { flex: 1, gap: 3, paddingLeft: spacing.sm },
  softEyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 0.6 },
  softTitle: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text, letterSpacing: -0.4 },
  softSub: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600" },
  softCtaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 },
  softCta: { fontSize: fontSize.sm, fontWeight: "800" },
  softEmoji: { fontSize: 56, marginLeft: spacing.md },

  // gradient variant
  grad: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: "hidden",
    ...shadow.card,
  },
  gradCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -70,
    left: "40%",
  },
  gradText: { flex: 1, gap: 6, zIndex: 1 },
  gradEyebrow: { color: "rgba(255,255,255,0.9)", fontWeight: "800", fontSize: 11, letterSpacing: 1 },
  gradTitle: { color: colors.white, fontSize: fontSize.xl, fontWeight: "900", letterSpacing: -0.4 },
  gradSub: { color: "rgba(255,255,255,0.92)", fontSize: fontSize.sm, fontWeight: "600" },
  gradRight: { alignItems: "center", gap: spacing.sm, zIndex: 1 },
  gradEmoji: { fontSize: 56 },
  gradBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: 9,
    borderRadius: radius.full,
  },
  gradBtnText: { color: colors.text, fontWeight: "800", fontSize: fontSize.sm },
});
