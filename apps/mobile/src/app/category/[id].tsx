import { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ProductGrid } from "../../components/ProductGrid";
import { Chip, EmptyState } from "../../components/ui";
import { useCategory, useProducts } from "../../lib/hooks";
import { colors, spacing, radius, fontSize, shadow, MAX_CONTENT_WIDTH, useLayout } from "../../theme";

const SORTS = [
  { key: undefined, label: "Popular" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Top rated" },
] as const;

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const layout = useLayout();
  const [sort, setSort] = useState<string | undefined>(undefined);

  const category = useCategory(id);
  const products = useProducts({ category: id, sort });

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={[styles.headerInner, { maxWidth: MAX_CONTENT_WIDTH, paddingHorizontal: layout.gutter }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {category.data?.name ?? "Category"}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: "center" }}>
        <View style={[styles.content, { maxWidth: MAX_CONTENT_WIDTH, paddingHorizontal: layout.gutter }]}>
          {/* Category banner */}
          {category.data && (
            <LinearGradient
              colors={[category.data.color, colors.ink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.banner}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerName}>{category.data.name}</Text>
                <Text style={styles.bannerSub}>{products.data?.length ?? 0} fresh items</Text>
              </View>
              <Text style={styles.bannerEmoji}>{category.data.emoji}</Text>
            </LinearGradient>
          )}

          {/* Sort chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sortRow}
          >
            {SORTS.map((s) => (
              <Chip key={s.label} label={s.label} active={sort === s.key} onPress={() => setSort(s.key)} />
            ))}
          </ScrollView>

          {(products.data?.length ?? 0) === 0 && !products.isLoading ? (
            <EmptyState icon="basket-outline" title="Nothing here yet" subtitle="Check back soon." />
          ) : (
            <ProductGrid
              products={products.data}
              loading={products.isLoading}
              cols={layout.gridColumns}
              gap={spacing.lg}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { width: "100%", alignSelf: "center", paddingTop: spacing.lg },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.xl,
    padding: spacing.xl,
    overflow: "hidden",
    marginBottom: spacing.lg,
  },
  bannerName: { color: colors.white, fontSize: fontSize.xxl, fontWeight: "900", letterSpacing: -0.5 },
  bannerSub: { color: "rgba(255,255,255,0.9)", fontSize: fontSize.sm, fontWeight: "600", marginTop: 4 },
  bannerEmoji: { fontSize: 64 },
  headerSafe: { backgroundColor: colors.surface, ...shadow.nav, zIndex: 2 },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    width: "100%",
    alignSelf: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text, flex: 1, textAlign: "center" },
  sortRow: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: spacing.lg,
    width: "100%",
    alignSelf: "center",
  },
  listContent: { padding: spacing.lg },
  column: { justifyContent: "space-between", marginBottom: spacing.md },
  count: { fontSize: fontSize.sm, fontWeight: "700", color: colors.textSecondary, marginBottom: spacing.md },
});
