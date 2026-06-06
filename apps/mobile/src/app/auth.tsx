import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth } from "../store/auth";
import { colors, spacing, radius, fontSize, shadow } from "../theme";

const FORM_MAX = 420;

export default function AuthScreen() {
  const router = useRouter();
  const login = useAuth((s) => s.login);
  const signup = useAuth((s) => s.signup);

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [touched, setTouched] = useState(false);

  const isSignup = mode === "signup";
  const emailValid = /\S+@\S+\.\S+/.test(email.trim());
  const nameValid = !isSignup || name.trim().length >= 2;
  const canSubmit = emailValid && nameValid;

  function submit() {
    setTouched(true);
    if (!canSubmit) return;
    const finalName =
      isSignup && name.trim()
        ? name.trim()
        : email.trim().split("@")[0].replace(/\b\w/g, (c) => c.toUpperCase());
    const phoneVal = phone.trim() || undefined;
    if (isSignup) signup(finalName, email.trim(), phoneVal);
    else login(finalName, email.trim(), phoneVal);
    router.replace("/");
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView edges={["top"]} style={styles.center}>
            <View style={[styles.inner, { maxWidth: FORM_MAX }]}>
              {/* Brand */}
              <LinearGradient
                colors={[colors.primary, colors.primaryDarker]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logo}
              >
                <Ionicons name="leaf" size={34} color={colors.white} />
              </LinearGradient>
              <Text style={styles.brand}>FreshCart</Text>
              <Text style={styles.tagline}>
                {isSignup
                  ? "Create your account — groceries in 25 minutes."
                  : "Welcome back. Fresh groceries, delivered fast."}
              </Text>

              {/* Mode toggle */}
              <View style={styles.toggle}>
                <Pressable
                  style={[styles.toggleBtn, !isSignup && styles.toggleBtnActive]}
                  onPress={() => setMode("login")}
                >
                  <Text style={[styles.toggleText, !isSignup && styles.toggleTextActive]}>
                    Log in
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.toggleBtn, isSignup && styles.toggleBtnActive]}
                  onPress={() => setMode("signup")}
                >
                  <Text style={[styles.toggleText, isSignup && styles.toggleTextActive]}>
                    Sign up
                  </Text>
                </Pressable>
              </View>

              {/* Fields */}
              <View style={styles.form}>
                {isSignup && (
                  <Field
                    icon="person-outline"
                    placeholder="Full name"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    error={touched && !nameValid ? "Enter your name" : undefined}
                  />
                )}
                <Field
                  icon="mail-outline"
                  placeholder="Email address"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={touched && !emailValid ? "Enter a valid email" : undefined}
                />
                <Field
                  icon="call-outline"
                  placeholder="Phone (optional)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Submit */}
              <Pressable
                style={({ pressed }) => [styles.submit, pressed && styles.pressed]}
                onPress={submit}
              >
                <Text style={styles.submitText}>
                  {isSignup ? "Create account" : "Log in"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              </Pressable>

              <Text style={styles.demoNote}>
                Demo mode — no password required. Use any email to continue.
              </Text>

              <View style={styles.dividerRow}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.divider} />
              </View>

              <Pressable
                style={({ pressed }) => [styles.guest, pressed && styles.pressed]}
                onPress={() => router.replace("/")}
              >
                <Text style={styles.guestText}>Continue as guest</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  icon,
  error,
  ...input
}: {
  icon: keyof typeof Ionicons.glyphMap;
  error?: string;
} & React.ComponentProps<typeof TextInput>) {
  return (
    <View>
      <View style={[styles.fieldRow, error && styles.fieldRowError]}>
        <Ionicons name={icon} size={20} color={colors.textMuted} />
        <TextInput
          style={styles.fieldInput}
          placeholderTextColor={colors.textMuted}
          {...input}
        />
      </View>
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, alignItems: "center", paddingBottom: spacing.xxl },
  center: { width: "100%", alignItems: "center", paddingHorizontal: spacing.lg },
  inner: {
    width: "100%",
    alignItems: "center",
    paddingTop: spacing.xxxl,
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  brand: {
    fontSize: fontSize.xxxl,
    fontWeight: "900",
    color: colors.text,
    marginTop: spacing.lg,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: spacing.xs,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },

  toggle: {
    flexDirection: "row",
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    padding: 4,
    marginTop: spacing.xl,
    width: "100%",
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    alignItems: "center",
  },
  toggleBtnActive: { backgroundColor: colors.surface, ...shadow.soft },
  toggleText: { fontSize: fontSize.md, fontWeight: "800", color: colors.textMuted },
  toggleTextActive: { color: colors.primary },

  form: { width: "100%", gap: spacing.md, marginTop: spacing.xl },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    height: 56,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  fieldRowError: { borderColor: colors.sale },
  fieldInput: { flex: 1, fontSize: fontSize.md, color: colors.text, fontWeight: "600", height: "100%" },
  fieldError: { fontSize: fontSize.xs, color: colors.sale, fontWeight: "700", marginTop: 4, marginLeft: spacing.sm },

  submit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    width: "100%",
    paddingVertical: 17,
    borderRadius: radius.full,
    marginTop: spacing.xl,
    ...shadow.card,
  },
  submitText: { color: colors.white, fontWeight: "800", fontSize: fontSize.lg },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },

  demoNote: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
    fontWeight: "600",
  },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    width: "100%",
    marginTop: spacing.xl,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: "700" },

  guest: {
    width: "100%",
    paddingVertical: 15,
    borderRadius: radius.full,
    alignItems: "center",
    marginTop: spacing.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  guestText: { color: colors.text, fontWeight: "800", fontSize: fontSize.md },
});
