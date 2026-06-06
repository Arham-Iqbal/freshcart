import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SmartImage } from "../../components/SmartImage";
import { Badge, Price, StarRating, Skeleton } from "../../components/ui";
import { QtyStepper } from "../../components/QtyStepper";
import { useProduct } from "../../lib/hooks";
import { useCart } from "../../store/cart";
import { useAuth } from "../../store/auth";
import {
  colors,
  spacing,
  radius,
  fontSize,
  shadow,
  isWeb,
  MAX_CONTENT_WIDTH,
  formatPrice,
  useLayout,
} from "../../theme";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const layout = useLayout();
  const { data: product, isLoading } = useProduct(id);

  const cartQty = useCart((s) => s.lines.find((l) => l.productId === id)?.qty ?? 0);
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const isFav = useAuth((s) => s.favourites.includes(id));
  const toggleFavourite = useAuth((s) => s.toggleFavourite);
  const [qty, setLocalQty] = useState(1);
  const [nutritionOpen, setNutritionOpen] = useState(false);

  const twoCol = !layout.isMobile;

  if (isLoading || !product) {
    return (
      <View style={styles.root}>
        <View style={{ padding: spacing.xl, gap: spacing.md, width: "100%", maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" }}>
          <Skeleton style={{ width: "100%", height: 320, borderRadius: radius.xl }} />
          <Skeleton style={{ width: "70%", height: 24 }} />
          <Skeleton style={{ width: "40%", height: 18 }} />
        </View>
      </View>
    );
  }

  function onAdd() {
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    add(product!, qty);
    setLocalQty(1);
  }

  const nutritionEntries = Object.entries(product.nutrition ?? {});

  const ImageBlock = (
    <View style={[styles.imageCard, twoCol && styles.imageCardDesktop]}>
      <SmartImage source={product} style={styles.image} contentFit="cover" />
      {!twoCol && (
        <SafeAreaView edges={["top"]} style={styles.imageOverlay}>
          <Pressable style={styles.circleBtn} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Pressable style={styles.circleBtn} hitSlop={8} onPress={() => toggleFavourite(id)}>
            <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? colors.sale : colors.text} />
          </Pressable>
        </SafeAreaView>
      )}
      {product.badges && product.badges.length > 0 && (
        <View style={styles.badgeRow}>
          {product.badges.map((b) => (
            <Badge key={b} type={b} />
          ))}
        </View>
      )}
    </View>
  );

  const Details = (
    <View style={twoCol ? styles.detailsDesktop : styles.body}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.unit}>{product.unitSize}</Text>
        </View>
        {twoCol && (
          <Pressable style={styles.favBtn} hitSlop={8} onPress={() => toggleFavourite(id)}>
            <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? colors.sale : colors.textSecondary} />
          </Pressable>
        )}
        <StarRating rating={product.rating} reviewCount={product.reviewCount} size={15} />
      </View>

      <Price value={product.price} compareAt={product.compareAtPrice} size={fontSize.xxl} />
      {product.compareAtPrice && (
        <Text style={styles.savings}>You save {formatPrice(product.compareAtPrice - product.price)}</Text>
      )}

      <View style={styles.stockRow}>
        <View style={[styles.stockDot, { backgroundColor: product.inStock ? colors.primary : colors.sale }]} />
        <Text style={styles.stockText}>{product.inStock ? "In stock" : "Out of stock"}</Text>
      </View>

      <Text style={styles.sectionLabel}>Description</Text>
      <Text style={styles.description}>{product.description}</Text>

      {nutritionEntries.length > 0 && (
        <View style={styles.nutrition}>
          <Pressable style={styles.nutritionHeader} onPress={() => setNutritionOpen((o) => !o)}>
            <Text style={styles.sectionLabel}>Nutrition (per 100g)</Text>
            <Ionicons name={nutritionOpen ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
          </Pressable>
          {nutritionOpen && (
            <View style={styles.nutritionBody}>
              {nutritionEntries.map(([k, v]) => (
                <View key={k} style={styles.nutritionRow}>
                  <Text style={styles.nutritionKey}>{k.replace(/_/g, " ")}</Text>
                  <Text style={styles.nutritionVal}>{v}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {cartQty > 0 && (
        <View style={styles.inCart}>
          <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
          <Text style={styles.inCartText}>{cartQty} in your cart</Text>
          <Pressable onPress={() => router.push("/cart")}>
            <Text style={styles.viewCart}>View cart</Text>
          </Pressable>
        </View>
      )}

      {/* Desktop inline add-to-cart */}
      {twoCol && (
        <View style={styles.desktopCta}>
          <QtyStepper qty={qty} size="lg" onChange={(n) => setLocalQty(Math.max(1, n))} />
          <Pressable style={styles.addBtn} onPress={onAdd}>
            <Ionicons name="cart" size={20} color={colors.white} />
            <Text style={styles.addBtnText}>Add to cart · {formatPrice(product.price * qty)}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: "center" }}>
        {twoCol ? (
          <View style={[styles.desktopWrap, { maxWidth: MAX_CONTENT_WIDTH, paddingHorizontal: layout.gutter }]}>
            <Pressable style={styles.desktopBack} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={18} color={colors.text} />
              <Text style={styles.desktopBackText}>Back</Text>
            </Pressable>
            <View style={styles.desktopRow}>
              <View style={{ flex: 1 }}>{ImageBlock}</View>
              <View style={{ flex: 1 }}>{Details}</View>
            </View>
          </View>
        ) : (
          <>
            {ImageBlock}
            {Details}
          </>
        )}
      </ScrollView>

      {/* Mobile sticky add-to-cart bar */}
      {layout.isMobile && (
        <SafeAreaView edges={["bottom"]} style={styles.ctaBar}>
          <View style={styles.ctaInner}>
            <QtyStepper qty={qty} size="lg" onChange={(n) => setLocalQty(Math.max(1, n))} />
            <Pressable style={styles.addBtn} onPress={onAdd}>
              <Ionicons name="cart" size={20} color={colors.white} />
              <Text style={styles.addBtnText}>Add · {formatPrice(product.price * qty)}</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },

  // Desktop two-column
  desktopWrap: { width: "100%", alignSelf: "center", paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  desktopBack: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: spacing.md },
  desktopBackText: { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  desktopRow: { flexDirection: "row", gap: spacing.xxl, alignItems: "flex-start" },
  detailsDesktop: { gap: spacing.sm, paddingTop: spacing.sm },
  desktopCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },

  imageCard: {
    backgroundColor: colors.surfaceAlt,
    alignSelf: "center",
    width: "100%",
    maxWidth: MAX_CONTENT_WIDTH,
    height: 360,
  },
  imageCardDesktop: {
    height: 440,
    borderRadius: radius.xl,
    overflow: "hidden",
    maxWidth: undefined,
    ...shadow.card,
  },
  image: { width: "100%", height: "100%" },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
  badgeRow: { position: "absolute", bottom: spacing.md, left: spacing.lg, flexDirection: "row", gap: spacing.sm },

  body: {
    width: "100%",
    alignSelf: "center",
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: 120,
  },
  titleRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  favBtn: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.surfaceAlt, alignItems: "center", justifyContent: "center" },
  name: { fontSize: fontSize.xxl, fontWeight: "900", color: colors.text, lineHeight: 30 },
  unit: { fontSize: fontSize.md, color: colors.textMuted, marginTop: 2, fontWeight: "500" },
  savings: { color: colors.sale, fontWeight: "800", fontSize: fontSize.sm },

  stockRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: spacing.xs },
  stockDot: { width: 8, height: 8, borderRadius: 4 },
  stockText: { fontSize: fontSize.sm, fontWeight: "700", color: colors.textSecondary },

  sectionLabel: { fontSize: fontSize.md, fontWeight: "800", color: colors.text, marginTop: spacing.md },
  description: { fontSize: fontSize.md, color: colors.textSecondary, lineHeight: 23 },

  nutrition: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.lg,
    overflow: "hidden",
  },
  nutritionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
  },
  nutritionBody: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.xs },
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  nutritionKey: { fontSize: fontSize.sm, color: colors.textSecondary, textTransform: "capitalize" },
  nutritionVal: { fontSize: fontSize.sm, fontWeight: "700", color: colors.text },

  inCart: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primarySurface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  inCartText: { flex: 1, fontSize: fontSize.sm, fontWeight: "700", color: colors.primaryDark },
  viewCart: { fontSize: fontSize.sm, fontWeight: "800", color: colors.primary },

  ctaBar: { backgroundColor: colors.surface, ...shadow.floating, position: "absolute", bottom: 0, left: 0, right: 0 },
  ctaInner: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  addBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.full,
  },
  addBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },
});
