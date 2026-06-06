import { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import type { Category, Product } from "@demo/data";
import { ProductGrid } from "../../components/ProductGrid";
import { BannerCarousel } from "../../components/BannerCarousel";
import { FeatureBanner } from "../../components/FeatureBanner";
import { SectionHeader, Skeleton } from "../../components/ui";
import { useCategories, useFeatured, useProducts } from "../../lib/hooks";
import {
  colors,
  spacing,
  radius,
  fontSize,
  shadow,
  MAX_CONTENT_WIDTH,
  useLayout,
} from "../../theme";

export default function HomeScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const layout = useLayout();

  const categories = useCategories();
  const featured = useFeatured();
  const onSale = useProducts({ badge: "sale" });

  const onRefresh = useCallback(() => qc.invalidateQueries(), [qc]);

  const { width: winW } = useWindowDimensions();
  const gap = spacing.lg;
  const cols = layout.gridColumns;
  // Width of the centered content area (minus page gutters) → carousel slide width.
  const contentW = Math.min(winW, MAX_CONTENT_WIDTH) - layout.gutter * 2;

  return (
    <View style={styles.root}>
      {/* Mobile-only sticky header (desktop uses the TopNav) */}
      {layout.isMobile && (
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <View style={styles.headerInner}>
            <View>
              <Text style={styles.deliverTo}>DELIVER TO</Text>
              <Pressable style={styles.locationRow}>
                <Ionicons name="location" size={16} color={colors.primary} />
                <Text style={styles.location}>Home · 560001</Text>
                <Ionicons name="chevron-down" size={16} color={colors.text} />
              </Pressable>
            </View>
            <Pressable style={styles.avatar} onPress={() => router.push("/profile")}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </SafeAreaView>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View style={[styles.content, { maxWidth: MAX_CONTENT_WIDTH, paddingHorizontal: layout.gutter }]}>
          {/* Search entry */}
          <Pressable style={styles.searchBar} onPress={() => router.push("/search")}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <Text style={styles.searchPlaceholder}>Search for "milk", "bananas", "bread"…</Text>
          </Pressable>

          {/* Rotating banner carousel (the hero) */}
          <View style={styles.heroWrap}>
            <BannerCarousel width={contentW} />
          </View>

          {/* Quick-perk promo tiles — row of 3, responsive */}
          <View style={styles.perkRow}>
            <PromoTile emoji="🚲" title="Free delivery" sub="Over ₹499" bg={colors.accentSurface} onPress={() => router.push("/search")} />
            <PromoTile emoji="⚡" title="Express" sub="In 25 min" bg={colors.primarySurface} onPress={() => router.push("/category/bakery")} />
            {!layout.isMobile && (
              <PromoTile emoji="🛡️" title="Quality promise" sub="Fresh or refunded" bg="#F4F0FE" onPress={() => router.push("/account/help")} />
            )}
          </View>

          {/* Categories */}
          <SectionHeader title="Shop by category" />
          {categories.isLoading ? (
            <View style={styles.catGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} style={{ width: 92, height: 110, borderRadius: radius.lg }} />
              ))}
            </View>
          ) : (
            <View style={styles.catGrid}>
              {categories.data?.map((cat) => (
                <CategoryTile key={cat.id} category={cat} />
              ))}
            </View>
          )}

          {/* In-feed spotlight banner */}
          <View style={{ marginTop: spacing.xl }}>
            <FeatureBanner
              variant="gradient"
              eyebrow="WEEKEND SPECIAL"
              title="Flat 25% off your first order"
              sub="Use code FRESH25 at checkout"
              cta="Grab it"
              emoji="🎁"
              gradient={["#15924E", "#0A5C30"]}
              route="/search"
            />
          </View>

          {/* Featured grid */}
          <View style={{ marginTop: spacing.xxl }}>
            <SectionHeader title="Bestsellers & new" actionLabel="See all" onAction={() => router.push("/search")} />
            <ProductGrid products={featured.data} loading={featured.isLoading} cols={cols} gap={gap} />
          </View>

          {/* Two soft banners side-by-side (stack on mobile) */}
          <View style={[styles.bannerPair, layout.isMobile && { flexDirection: "column" }]}>
            <View style={{ flex: 1 }}>
              <FeatureBanner
                variant="soft"
                eyebrow="ORGANIC RANGE"
                title="100% organic picks"
                sub="Hand-selected, farm-certified"
                cta="Browse organic"
                emoji="🥬"
                tint={colors.primarySurface}
                accent={colors.primary}
                route="/category/fruit-veg"
              />
            </View>
            <View style={{ flex: 1 }}>
              <FeatureBanner
                variant="soft"
                eyebrow="STOCK UP & SAVE"
                title="Pantry essentials"
                sub="Big packs, bigger savings"
                cta="Shop pantry"
                emoji="🫙"
                tint={colors.accentSurface}
                accent="#B45309"
                route="/category/pantry"
              />
            </View>
          </View>

          {/* On sale grid */}
          <View style={{ marginTop: spacing.xxl }}>
            <SectionHeader title="Deals of the day 🔥" />
            <ProductGrid products={onSale.data} loading={onSale.isLoading} cols={cols} gap={gap} />
          </View>

          {/* Closing CTA banner */}
          <View style={{ marginTop: spacing.lg, marginBottom: spacing.xxl }}>
            <FeatureBanner
              variant="gradient"
              eyebrow="NEVER RUN OUT"
              title="Get it delivered in 25 minutes"
              sub="Fresh groceries, at your door, fast"
              cta="Start shopping"
              emoji="🛵"
              gradient={["#7C3AED", "#4C1D95"]}
              route="/"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PromoTile({
  emoji,
  title,
  sub,
  bg,
  onPress,
}: {
  emoji: string;
  title: string;
  sub: string;
  bg: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.promo, { backgroundColor: bg }]} onPress={onPress}>
      <Text style={styles.promoEmoji}>{emoji}</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.promoTitle} numberOfLines={1}>{title}</Text>
        <Text style={styles.promoSub} numberOfLines={1}>{sub}</Text>
      </View>
    </Pressable>
  );
}

function CategoryTile({ category }: { category: Category }) {
  const router = useRouter();
  return (
    <Pressable style={styles.catItem} onPress={() => router.push(`/category/${category.id}`)}>
      <View style={[styles.catCircle, { backgroundColor: category.color + "16" }]}>
        <Text style={styles.catEmoji}>{category.emoji}</Text>
      </View>
      <Text style={styles.catName} numberOfLines={2}>
        {category.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerSafe: { backgroundColor: colors.surface, ...shadow.nav, zIndex: 2 },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  deliverTo: { fontSize: 10, fontWeight: "800", color: colors.textMuted, letterSpacing: 0.6 },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  location: { fontSize: fontSize.md, fontWeight: "800", color: colors.text },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
  },

  scroll: { alignItems: "center", paddingTop: spacing.xl },
  content: { width: "100%", alignSelf: "center" },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.soft,
  },
  searchPlaceholder: { flex: 1, color: colors.textMuted, fontSize: fontSize.md, fontWeight: "500" },

  heroWrap: { marginTop: spacing.xl },

  perkRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  promo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  promoEmoji: { fontSize: 26 },
  promoTitle: { fontSize: fontSize.sm, fontWeight: "900", color: colors.text },
  promoSub: { fontSize: fontSize.xs, color: colors.textSecondary, fontWeight: "600", marginTop: 1 },

  bannerPair: { flexDirection: "row", gap: spacing.lg, marginTop: spacing.xl },

  catGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  catItem: { alignItems: "center", width: 92 },
  catCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  catEmoji: { fontSize: 34 },
  catName: { fontSize: 12, fontWeight: "700", color: colors.text, textAlign: "center", marginTop: 8 },

  grid: { flexDirection: "row", flexWrap: "wrap" },
});
