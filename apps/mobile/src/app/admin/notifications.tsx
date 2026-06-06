import { useState } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, Platform } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { PushNotification } from "@demo/data";
import { AdminShell } from "../../components/admin/AdminShell";
import { Card, TonePill, Field, Input } from "../../components/admin/ui";
import { adminApi } from "../../lib/admin";
import { colors, spacing, radius, fontSize, shadow } from "../../theme";

const CATEGORIES: { key: PushNotification["category"]; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "promo", label: "Promotion", icon: "pricetag" },
  { key: "order", label: "Order update", icon: "bag-handle" },
  { key: "system", label: "System", icon: "information-circle" },
];

const AUDIENCES: { key: PushNotification["audience"]; label: string; reach: string }[] = [
  { key: "all", label: "All customers", reach: "8,420" },
  { key: "active", label: "Active (30d)", reach: "5,712" },
  { key: "lapsed", label: "Lapsed", reach: "2,708" },
];

const CAT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  promo: "pricetag",
  order: "bag-handle",
  system: "information-circle",
};

function localDatetimeValue(offsetMin = 10) {
  const d = new Date(Date.now() + offsetMin * 60000);
  // yyyy-MM-ddTHH:mm for <input type=datetime-local>
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminNotifications() {
  const qc = useQueryClient();
  const list = useQuery({ queryKey: ["admin", "notifications"], queryFn: adminApi.notifications, refetchInterval: 4000 });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<PushNotification["category"]>("promo");
  const [audience, setAudience] = useState<PushNotification["audience"]>("all");
  const [mode, setMode] = useState<"now" | "schedule">("now");
  const [when, setWhen] = useState(localDatetimeValue());

  const send = useMutation({
    mutationFn: () =>
      adminApi.createNotification({
        title,
        body,
        category,
        audience,
        scheduledFor: mode === "schedule" && when ? new Date(when).toISOString() : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
      setTitle("");
      setBody("");
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => adminApi.deleteNotification(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "notifications"] }),
  });

  const items = list.data ?? [];
  const sent = items.filter((n) => n.status === "sent").length;
  const scheduled = items.filter((n) => n.status === "scheduled").length;
  const reach = AUDIENCES.find((a) => a.key === audience)?.reach ?? "—";
  const canSend = title.trim().length > 0;

  return (
    <AdminShell title="Push Notifications">
      <View style={styles.statRow}>
        <MiniStat icon="paper-plane" label="Sent" value={String(sent)} tint={colors.primary} />
        <MiniStat icon="time" label="Scheduled" value={String(scheduled)} tint={colors.accent} />
        <MiniStat icon="people" label="Reachable devices" value="8,420" tint="#7C3AED" />
        <MiniStat icon="trending-up" label="Avg. open rate" value="42%" tint={colors.sale} />
      </View>

      <View style={styles.cols}>
        {/* Composer */}
        <Card style={{ flex: 1.3, minWidth: 360 }}>
          <Text style={styles.cardTitle}>Compose notification</Text>

          <Field label="Title" style={{ marginTop: spacing.md }}>
            <Input value={title} onChangeText={setTitle} placeholder="e.g. Flat 20% off all fruits today!" />
          </Field>
          <Field label="Message" style={{ marginTop: spacing.md }}>
            <Input value={body} onChangeText={setBody} placeholder="Short body text shown under the title…" multiline style={{ minHeight: 64, textAlignVertical: "top" }} />
          </Field>

          <Field label="Category" style={{ marginTop: spacing.md }}>
            <View style={styles.chipRow}>
              {CATEGORIES.map((c) => (
                <Pressable key={c.key} style={[styles.chip, category === c.key && styles.chipActive]} onPress={() => setCategory(c.key)}>
                  <Ionicons name={c.icon} size={14} color={category === c.key ? colors.primaryDark : colors.textSecondary} />
                  <Text style={[styles.chipText, category === c.key && styles.chipTextActive]}>{c.label}</Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Audience" style={{ marginTop: spacing.md }}>
            <View style={styles.chipRow}>
              {AUDIENCES.map((a) => (
                <Pressable key={a.key} style={[styles.chip, audience === a.key && styles.chipActive]} onPress={() => setAudience(a.key)}>
                  <Text style={[styles.chipText, audience === a.key && styles.chipTextActive]}>{a.label}</Text>
                </Pressable>
              ))}
            </View>
          </Field>

          <Field label="Delivery" style={{ marginTop: spacing.md }}>
            <View style={styles.chipRow}>
              <Pressable style={[styles.chip, mode === "now" && styles.chipActive]} onPress={() => setMode("now")}>
                <Ionicons name="flash" size={14} color={mode === "now" ? colors.primaryDark : colors.textSecondary} />
                <Text style={[styles.chipText, mode === "now" && styles.chipTextActive]}>Send now</Text>
              </Pressable>
              <Pressable style={[styles.chip, mode === "schedule" && styles.chipActive]} onPress={() => setMode("schedule")}>
                <Ionicons name="calendar" size={14} color={mode === "schedule" ? colors.primaryDark : colors.textSecondary} />
                <Text style={[styles.chipText, mode === "schedule" && styles.chipTextActive]}>Schedule</Text>
              </Pressable>
            </View>
          </Field>

          {mode === "schedule" && (
            <Field label="Send at" style={{ marginTop: spacing.md }}>
              {Platform.OS === "web" ? (
                // Native HTML datetime picker on web.
                <input
                  type="datetime-local"
                  value={when}
                  onChange={(e: any) => setWhen(e.target.value)}
                  style={webInput as any}
                />
              ) : (
                <Input value={when} onChangeText={setWhen} placeholder="YYYY-MM-DDTHH:mm" />
              )}
              <Text style={styles.hint}>Tip: set it a minute from now to watch it fire in the app.</Text>
            </Field>
          )}

          {send.isError && <Text style={styles.error}>{(send.error as Error).message}</Text>}

          <Pressable
            style={[styles.sendBtn, !canSend && { opacity: 0.5 }]}
            onPress={() => canSend && send.mutate()}
            disabled={!canSend || send.isPending}
          >
            <Ionicons name={mode === "now" ? "paper-plane" : "calendar"} size={18} color={colors.white} />
            <Text style={styles.sendBtnText}>
              {send.isPending ? "Sending…" : mode === "now" ? `Send to ${reach} devices` : `Schedule for ${reach} devices`}
            </Text>
          </Pressable>
        </Card>

        {/* Live preview */}
        <Card style={{ flex: 1, minWidth: 280 }}>
          <Text style={styles.cardTitle}>Preview</Text>
          <View style={styles.previewPhone}>
            <View style={styles.previewToast}>
              <View style={styles.previewIcon}>
                <Ionicons name={CAT_ICON[category]} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewApp}>FreshCart · now</Text>
                <Text style={styles.previewTitle} numberOfLines={1}>{title || "Your title appears here"}</Text>
                {!!body && <Text style={styles.previewBody} numberOfLines={2}>{body}</Text>}
              </View>
            </View>
            <Text style={styles.previewNote}>How it appears on a customer's device.</Text>
          </View>
        </Card>
      </View>

      {/* History */}
      <Card>
        <Text style={styles.cardTitle}>History</Text>
        {items.length === 0 ? (
          <Text style={styles.empty}>No notifications yet. Compose one above.</Text>
        ) : (
          <View style={{ marginTop: spacing.sm }}>
            {items.map((n) => (
              <View key={n.id} style={styles.histRow}>
                <View style={styles.histIcon}>
                  <Ionicons name={CAT_ICON[n.category]} size={18} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histTitle} numberOfLines={1}>{n.title}</Text>
                  <Text style={styles.histMeta}>
                    {n.audience === "all" ? "All customers" : n.audience === "active" ? "Active (30d)" : "Lapsed"} ·{" "}
                    {n.status === "scheduled"
                      ? `scheduled ${new Date(n.scheduledFor).toLocaleString()}`
                      : `sent ${new Date(n.scheduledFor).toLocaleString()}`}
                  </Text>
                </View>
                <TonePill label={n.status === "scheduled" ? "Scheduled" : "Sent"} tone={n.status === "scheduled" ? "amber" : "green"} />
                <Pressable hitSlop={8} onPress={() => del.mutate(n.id)} style={styles.histDelete}>
                  <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </Card>
    </AdminShell>
  );
}

function MiniStat({ icon, label, value, tint }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tint: string }) {
  return (
    <Card style={{ flex: 1, minWidth: 170 }}>
      <View style={[styles.miniIcon, { backgroundColor: tint + "18" }]}><Ionicons name={icon} size={20} color={tint} /></View>
      <Text style={styles.miniValue}>{value}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </Card>
  );
}

const webInput: any = {
  backgroundColor: "#F2F5F4",
  borderRadius: 12,
  padding: 11,
  fontSize: 15,
  color: "#101828",
  border: "1px solid #E4E7EC",
  outline: "none",
  fontFamily: "inherit",
};

const styles = StyleSheet.create({
  statRow: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" },
  cols: { flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" },
  miniIcon: { width: 40, height: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center", marginBottom: spacing.sm },
  miniValue: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  miniLabel: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600" },

  cardTitle: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text },
  chipRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primarySurface, borderColor: colors.primary },
  chipText: { fontSize: fontSize.xs, fontWeight: "700", color: colors.textSecondary },
  chipTextActive: { color: colors.primaryDark },
  hint: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 4 },
  error: { color: colors.sale, fontSize: fontSize.sm, fontWeight: "600", marginTop: spacing.md },

  sendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: radius.md, marginTop: spacing.lg },
  sendBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },

  previewPhone: { marginTop: spacing.md, backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  previewToast: { flexDirection: "row", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, ...shadow.soft },
  previewIcon: { width: 38, height: 38, borderRadius: radius.sm, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center" },
  previewApp: { fontSize: fontSize.xs, fontWeight: "800", color: colors.textSecondary },
  previewTitle: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text, marginTop: 1 },
  previewBody: { fontSize: fontSize.xs, color: colors.textSecondary, marginTop: 1, lineHeight: 16 },
  previewNote: { fontSize: fontSize.xs, color: colors.textMuted, textAlign: "center" },

  empty: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.md },
  histRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  histIcon: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center" },
  histTitle: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  histMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  histDelete: { padding: 4 },
});
