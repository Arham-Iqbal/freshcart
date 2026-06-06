import { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useAuth } from "../../store/auth";
import { useProducts } from "../../lib/hooks";
import { ProductGrid } from "../../components/ProductGrid";
import { AccountHeader } from "../../components/AccountHeader";
import { colors, spacing, radius, fontSize, FORM_WIDTH, useLayout } from "../../theme";

export default function FavouritesScreen() {
  const router = useRouter();
  const layout = useLayout();
  const favourites = useAuth((s) => s.favourites);
  const all = useProducts();

  const favProducts = useMemo(
    () => (all.data ?? []).filter((p) => favourites.includes(p.id)),
    [all.data, favourites],
  );

  return (
    <View style={styles.root}>
      <AccountHeader title="Favourites" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.center, { maxWidth: FORM_WIDTH, paddingHorizontal: layout.gutter }]}>
          {favProducts.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <Ionicons name="heart-outline" size={36} color={colors.primary} />
              </View>
              <Text style={styles.emptyTitle}>No favourites yet</Text>
              <Text style={styles.emptySub}>Tap the heart on any product to save it here for quick reordering.</Text>
              <Pressable style={styles.browseBtn} onPress={() => router.push("/")}>
                <Text style={styles.browseBtnText}>Browse products</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.count}>{favProducts.length} saved item{favProducts.length === 1 ? "" : "s"}</Text>
              <ProductGrid products={favProducts} loading={all.isLoading} cols={layout.isMobile ? 2 : 3} gap={spacing.lg} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingVertical: spacing.lg, alignItems: "center", paddingBottom: 40 },
  center: { width: "100%", alignSelf: "center" },
  count: { fontSize: fontSize.sm, fontWeight: "700", color: colors.textSecondary, marginBottom: spacing.md },
  empty: { alignItems: "center", gap: spacing.md, padding: spacing.xxl },
  emptyIcon: { width: 80, height: 80, borderRadius: radius.full, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text },
  emptySub: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: "center", maxWidth: 300, lineHeight: 22 },
  browseBtn: { backgroundColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.full, marginTop: spacing.sm },
  browseBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },
});
