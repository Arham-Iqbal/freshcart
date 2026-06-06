import { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAdminAuth } from "../../store/adminAuth";
import { colors, spacing, radius, fontSize, shadow } from "../../theme";

/** Password gate shown when the admin console is locked. */
export function AdminLogin() {
  const router = useRouter();
  const unlock = useAdminAuth((s) => s.unlock);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);

  function submit() {
    const ok = unlock(password);
    if (!ok) {
      setError(true);
      setPassword("");
    }
  }

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <View style={styles.logo}>
          <Ionicons name="lock-closed" size={26} color={colors.white} />
        </View>
        <Text style={styles.title}>Admin Console</Text>
        <Text style={styles.sub}>Enter the password to manage the store.</Text>

        <View style={[styles.inputWrap, error && styles.inputError]}>
          <Ionicons name="key-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={password}
            onChangeText={(t) => {
              setPassword(t);
              if (error) setError(false);
            }}
            placeholder="Admin password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!show}
            style={styles.input as any}
            onSubmitEditing={submit}
            autoFocus
          />
          <Pressable hitSlop={8} onPress={() => setShow((s) => !s)}>
            <Ionicons name={show ? "eye-off-outline" : "eye-outline"} size={18} color={colors.textMuted} />
          </Pressable>
        </View>

        {error && <Text style={styles.errorText}>Incorrect password. Please try again.</Text>}

        <Pressable style={styles.btn} onPress={submit}>
          <Text style={styles.btnText}>Unlock console</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.white} />
        </Pressable>

        <Pressable style={styles.back} onPress={() => router.replace("/")}>
          <Ionicons name="storefront-outline" size={15} color={colors.textSecondary} />
          <Text style={styles.backText}>Back to store</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.card,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.lg,
  },
  title: { fontSize: fontSize.xxl, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  sub: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 4, marginBottom: spacing.xl, textAlign: "center" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  inputError: { borderColor: colors.sale },
  input: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: "600", outlineStyle: "none" },
  errorText: { color: colors.sale, fontSize: fontSize.sm, fontWeight: "600", marginTop: spacing.sm, alignSelf: "flex-start" },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    width: "100%",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.md,
    marginTop: spacing.lg,
  },
  btnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },
  back: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.lg },
  backText: { fontSize: fontSize.sm, fontWeight: "700", color: colors.textSecondary },
});
