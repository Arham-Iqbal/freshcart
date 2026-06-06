import { useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import type { Product } from "@demo/data";
import { SmartImage } from "./SmartImage";
import { Badge, StarRating } from "./ui";
import { QtyStepper } from "./QtyStepper";
import { useCart } from "../store/cart";
import { colors, spacing, radius, fontSize, shadow, isWeb, formatPrice } from "../theme";

export function ProductCard({ product, width }: { product: Product; width?: number }) {
  const router = useRouter();
  const qty = useCart((s) => s.lines.find((l) => l.productId === product.id)?.qty ?? 0);
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const scale = useRef(new Animated.Value(1)).current;

  const topBadge = product.badges?.[0];
  const onSale = product.compareAtPrice != null && product.compareAtPrice > product.price;
  const discount = onSale
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  function onAdd() {
    if (!isWeb) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    add(product, 1);
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.12, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
  }

  return (
    <Pressable
      style={[styles.card, width != null && { width }]}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <View style={styles.imageWrap}>
        <SmartImage source={product} style={styles.image} />
        <View style={styles.badgeRow}>
          {topBadge && <Badge type={topBadge} small />}
          {discount > 0 && (
            <View style={styles.discount}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.unit}>{product.unitSize}</Text>
        <View style={styles.ratingRow}>
          <StarRating rating={product.rating} reviewCount={product.reviewCount} size={12} />
        </View>

        <View style={styles.footer}>
          <View style={styles.priceCol}>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
            {onSale && <Text style={styles.compareAt}>{formatPrice(product.compareAtPrice!)}</Text>}
          </View>
          {qty === 0 ? (
            <Animated.View style={{ transform: [{ scale }] }}>
              <Pressable style={styles.addBtn} onPress={onAdd} hitSlop={6}>
                <Ionicons name="add" size={20} color={colors.white} />
              </Pressable>
            </Animated.View>
          ) : (
            <QtyStepper qty={qty} size="sm" onChange={(n) => setQty(product.id, n)} />
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  imageWrap: {
    backgroundColor: colors.surfaceAlt,
    aspectRatio: 1,
    width: "100%",
    padding: spacing.sm,
  },
  image: { width: "100%", height: "100%", borderRadius: radius.md },
  badgeRow: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    flexDirection: "row",
    gap: 5,
  },
  discount: {
    backgroundColor: colors.sale,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  discountText: { color: colors.white, fontSize: 9, fontWeight: "900", letterSpacing: 0.3 },

  body: { padding: spacing.md, gap: 3 },
  name: { fontSize: fontSize.md, fontWeight: "800", color: colors.text, letterSpacing: -0.2 },
  unit: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: "600" },
  ratingRow: { marginTop: 2 },
  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  priceCol: { gap: 0 },
  price: { fontSize: fontSize.lg, fontWeight: "900", color: colors.text, letterSpacing: -0.3 },
  compareAt: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textDecorationLine: "line-through",
    fontWeight: "600",
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.soft,
  },
});
