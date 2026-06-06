import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { colors, radius, fontSize } from "../theme";
import { isWeb } from "../theme";

function tap() {
  if (!isWeb) Haptics.selectionAsync();
}

export function QtyStepper({
  qty,
  onChange,
  size = "md",
}: {
  qty: number;
  onChange: (next: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const dim = size === "lg" ? 40 : size === "sm" ? 28 : 34;
  const icon = size === "lg" ? 22 : size === "sm" ? 16 : 18;
  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.btn, { width: dim, height: dim }]}
        onPress={() => {
          tap();
          onChange(qty - 1);
        }}
        hitSlop={8}
      >
        <Ionicons name="remove" size={icon} color={colors.primary} />
      </Pressable>
      <Text style={[styles.qty, { fontSize: size === "lg" ? fontSize.lg : fontSize.md }]}>
        {qty}
      </Text>
      <Pressable
        style={[styles.btn, styles.btnFilled, { width: dim, height: dim }]}
        onPress={() => {
          tap();
          onChange(qty + 1);
        }}
        hitSlop={8}
      >
        <Ionicons name="add" size={icon} color={colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  btn: {
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySurface,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  btnFilled: { backgroundColor: colors.primary, borderColor: colors.primary },
  qty: { fontWeight: "800", color: colors.text, minWidth: 22, textAlign: "center" },
});
