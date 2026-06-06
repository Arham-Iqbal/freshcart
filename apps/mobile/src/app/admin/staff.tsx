import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { AdminShell } from "../../components/admin/AdminShell";
import { Card, TonePill, PrimaryButton, AdminModal, Field, Input } from "../../components/admin/ui";
import { colors, spacing, radius, fontSize } from "../../theme";

interface Staff { id: string; name: string; role: string; email: string; status: "Active" | "Invited"; last: string; }

const SEED: Staff[] = [
  { id: "1", name: "Aarav Sharma", role: "Owner", email: "aarav.sharma@email.com", status: "Active", last: "Online now" },
  { id: "2", name: "Meera Iyer", role: "Manager", email: "meera@freshcart.app", status: "Active", last: "12 min ago" },
  { id: "3", name: "Rohit Verma", role: "Picker", email: "rohit@freshcart.app", status: "Active", last: "1 hr ago" },
  { id: "4", name: "Imran Khan", role: "Rider", email: "imran@freshcart.app", status: "Active", last: "On delivery" },
  { id: "5", name: "Sneha Reddy", role: "Picker", email: "sneha@freshcart.app", status: "Invited", last: "Pending" },
];

const ROLE_TONE: Record<string, "purple" | "blue" | "green" | "amber"> = {
  Owner: "purple", Manager: "blue", Picker: "green", Rider: "amber",
};
const ROLES = ["Manager", "Picker", "Rider"];

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[]>(SEED);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Picker");

  function invite() {
    if (!name.trim() || !email.trim()) return;
    setStaff((s) => [...s, { id: Date.now().toString(), name: name.trim(), role, email: email.trim(), status: "Invited", last: "Pending" }]);
    setName(""); setEmail(""); setRole("Picker"); setOpen(false);
  }

  return (
    <AdminShell title="Staff">
      <Card>
        <View style={styles.head}>
          <View>
            <Text style={styles.title}>Team members</Text>
            <Text style={styles.sub}>{staff.filter((s) => s.status === "Active").length} active · {staff.filter((s) => s.status === "Invited").length} invited</Text>
          </View>
          <PrimaryButton label="Invite staff" icon="person-add" onPress={() => setOpen(true)} />
        </View>
        <View style={[styles.row, styles.headerRow]}>
          <Text style={[styles.th, { flex: 2 }]}>Name</Text>
          <Text style={[styles.th, { flex: 1.3 }]}>Role</Text>
          <Text style={[styles.th, { flex: 1.3 }]}>Status</Text>
          <Text style={[styles.th, { flex: 1.4 }]}>Last active</Text>
        </View>
        {staff.map((s) => (
          <View key={s.id} style={styles.row}>
            <View style={{ flex: 2, flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{s.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</Text></View>
              <View>
                <Text style={styles.name}>{s.name}</Text>
                <Text style={styles.email}>{s.email}</Text>
              </View>
            </View>
            <View style={{ flex: 1.3 }}><TonePill label={s.role} tone={ROLE_TONE[s.role] ?? "gray"} /></View>
            <View style={{ flex: 1.3 }}><TonePill label={s.status} tone={s.status === "Active" ? "green" : "amber"} /></View>
            <Text style={[styles.last, { flex: 1.4 }]}>{s.last}</Text>
          </View>
        ))}
      </Card>

      {open && (
        <AdminModal
          title="Invite staff"
          onClose={() => setOpen(false)}
          footer={
            <>
              <Pressable onPress={() => setOpen(false)} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></Pressable>
              <PrimaryButton label="Send invite" onPress={invite} />
            </>
          }
        >
          <Field label="Full name"><Input value={name} onChangeText={setName} placeholder="e.g. Priya Nair" /></Field>
          <Field label="Email"><Input value={email} onChangeText={setEmail} placeholder="name@freshcart.app" autoCapitalize="none" /></Field>
          <Field label="Role">
            <View style={styles.roleRow}>
              {ROLES.map((r) => (
                <Pressable key={r} style={[styles.roleChip, role === r && styles.roleChipActive]} onPress={() => setRole(r)}>
                  <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </Field>
        </AdminModal>
      )}
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.md },
  title: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: "600", marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  headerRow: { borderBottomColor: colors.border },
  th: { fontSize: fontSize.xs, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.3, textTransform: "uppercase" },
  avatar: { width: 38, height: 38, borderRadius: radius.full, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: fontSize.xs, fontWeight: "900", color: colors.primary },
  name: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  email: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  last: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600" },
  cancel: { paddingHorizontal: spacing.lg, paddingVertical: 11 },
  cancelText: { fontSize: fontSize.md, fontWeight: "700", color: colors.textSecondary },
  roleRow: { flexDirection: "row", gap: spacing.sm },
  roleChip: { paddingHorizontal: spacing.lg, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  roleChipActive: { backgroundColor: colors.primarySurface, borderColor: colors.primary },
  roleChipText: { fontSize: fontSize.sm, fontWeight: "700", color: colors.textSecondary },
  roleChipTextActive: { color: colors.primaryDark },
});
