import { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AdminShell } from "../../components/admin/AdminShell";
import { Card, Toggle, PrimaryButton } from "../../components/admin/ui";
import { colors, spacing, radius, fontSize } from "../../theme";

const SEED = [
  { id: "1", title: "Up to 30% off fresh produce", sub: "Hero · Home", emoji: "🥑", from: colors.primary, to: colors.primaryDarker, on: true },
  { id: "2", title: "Free delivery weekend", sub: "Strip · Home", emoji: "🚲", from: "#F59E0B", to: "#B45309", on: true },
  { id: "3", title: "Fresh bakery, every morning", sub: "Category · Bakery", emoji: "🥐", from: "#D97706", to: "#92400E", on: false },
  { id: "4", title: "Diwali grocery hampers", sub: "Hero · Seasonal", emoji: "🪔", from: "#7C3AED", to: "#4C1D95", on: false },
];

export default function AdminBanners() {
  const [banners, setBanners] = useState(SEED);

  return (
    <AdminShell title="Banners">
      <Card>
        <View style={styles.head}>
          <View>
            <Text style={styles.title}>Promotional banners</Text>
            <Text style={styles.sub}>{banners.filter((b) => b.on).length} live · drag to reorder (demo)</Text>
          </View>
          <PrimaryButton label="New banner" icon="add" />
        </View>

        <View style={styles.grid}>
          {banners.map((b, i) => (
            <View key={b.id} style={styles.bannerCard}>
              <LinearGradient colors={[b.from, b.to]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.preview}>
                <Text style={styles.previewText} numberOfLines={2}>{b.title}</Text>
                <Text style={styles.previewEmoji}>{b.emoji}</Text>
              </LinearGradient>
              <View style={styles.bannerFoot}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerTitle} numberOfLines={1}>{b.title}</Text>
                  <Text style={styles.bannerSub}>{b.sub}</Text>
                </View>
                <Toggle value={b.on} onValueChange={(v) => setBanners((s) => s.map((x, j) => (j === i ? { ...x, on: v } : x)))} />
              </View>
            </View>
          ))}
        </View>
      </Card>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg },
  title: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text },
  sub: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: "600", marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.lg },
  bannerCard: { width: 300, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderLight, overflow: "hidden", backgroundColor: colors.surface },
  preview: { height: 120, padding: spacing.lg, flexDirection: "row", alignItems: "center" },
  previewText: { flex: 1, color: colors.white, fontWeight: "900", fontSize: fontSize.lg, lineHeight: 22 },
  previewEmoji: { fontSize: 48 },
  bannerFoot: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md },
  bannerTitle: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  bannerSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
});
