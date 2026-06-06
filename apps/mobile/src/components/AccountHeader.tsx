import { View, Text, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing, radius, fontSize, shadow, FORM_WIDTH } from "../theme";

/** Shared header for account / settings sub-screens: back button + title,
 *  centered to the form width so it reads well on web too. */
export function AccountHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: React.ReactNode;
}) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safe}>
      <View style={[styles.inner, { maxWidth: FORM_WIDTH }]}>
        <Pressable style={styles.backBtn} onPress={onBack} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.right}>{right}</View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.surface, ...shadow.nav, zIndex: 2 },
  inner: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { flex: 1, fontSize: fontSize.lg, fontWeight: "800", color: colors.text },
  right: { minWidth: 40, alignItems: "flex-end" },
});
