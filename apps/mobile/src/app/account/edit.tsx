import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import { AccountHeader } from "../../components/AccountHeader";
import { colors, spacing, radius, fontSize, shadow, FORM_WIDTH } from "../../theme";

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const updateProfile = useAuth((s) => s.updateProfile);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");

  function save() {
    updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    router.back();
  }

  return (
    <View style={styles.root}>
      <AccountHeader title="Edit profile" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.center, { maxWidth: FORM_WIDTH }]}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(name)}</Text>
            </View>
          </View>

          <Field label="Full name" value={name} onChange={setName} placeholder="Your name" />
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@email.com" keyboard="email-address" />
          <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91 …" keyboard="phone-pad" />

          <Pressable style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.9 }]} onPress={save}>
            <Text style={styles.saveBtnText}>Save changes</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  keyboard,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboard?: "email-address" | "phone-pad";
}) {
  return (
    <View style={{ gap: 6, marginBottom: spacing.lg }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboard}
        autoCapitalize={keyboard === "email-address" ? "none" : "words"}
      />
    </View>
  );
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { paddingVertical: spacing.xl, alignItems: "center" },
  center: { width: "100%", alignSelf: "center", paddingHorizontal: spacing.lg },
  avatarWrap: { alignItems: "center", marginBottom: spacing.xl },
  avatar: { width: 84, height: 84, borderRadius: radius.full, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", ...shadow.card },
  avatarText: { fontSize: fontSize.xxl, fontWeight: "900", color: colors.white },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: "800", color: colors.textSecondary },
  input: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: 14, fontSize: fontSize.md, color: colors.text, fontWeight: "600", borderWidth: 1.5, borderColor: colors.border },
  saveBtn: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: radius.full, alignItems: "center", marginTop: spacing.sm, ...shadow.card },
  saveBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },
});
