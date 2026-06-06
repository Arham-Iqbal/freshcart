import { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  type ViewStyle,
  type TextStyle,
  type StyleProp,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing, radius, fontSize, formatPrice } from "../theme";
import type { Badge as BadgeType } from "@demo/data";

// ── Badge ───────────────────────────────────────────────────────────────
const BADGE_META: Record<BadgeType, { label: string; bg: string; fg: string }> = {
  sale: { label: "SALE", bg: colors.sale, fg: colors.white },
  organic: { label: "ORGANIC", bg: colors.primary, fg: colors.white },
  new: { label: "NEW", bg: colors.accent, fg: colors.white },
  bestseller: { label: "BESTSELLER", bg: "#7C3AED", fg: colors.white },
};

export function Badge({ type, small }: { type: BadgeType; small?: boolean }) {
  const meta = BADGE_META[type];
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg }, small && styles.badgeSmall]}>
      <Text style={[styles.badgeText, small && { fontSize: 8 }]}>{meta.label}</Text>
    </View>
  );
}

// ── Price ───────────────────────────────────────────────────────────────
export function Price({
  value,
  compareAt,
  size = fontSize.lg,
}: {
  value: number;
  compareAt?: number;
  size?: number;
}) {
  const onSale = compareAt != null && compareAt > value;
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.price, { fontSize: size, color: onSale ? colors.sale : colors.text }]}>
        {formatPrice(value)}
      </Text>
      {onSale && (
        <Text style={[styles.compareAt, { fontSize: size - 4 }]}>{formatPrice(compareAt!)}</Text>
      )}
    </View>
  );
}

// ── Star rating ─────────────────────────────────────────────────────────
export function StarRating({
  rating,
  reviewCount,
  size = 13,
}: {
  rating: number;
  reviewCount?: number;
  size?: number;
}) {
  return (
    <View style={styles.starRow}>
      <Ionicons name="star" size={size} color={colors.star} />
      <Text style={[styles.ratingText, { fontSize: size }]}>{rating.toFixed(1)}</Text>
      {reviewCount != null && (
        <Text style={[styles.reviewCount, { fontSize: size - 1 }]}>({reviewCount})</Text>
      )}
    </View>
  );
}

// ── Skeleton (shimmer) ──────────────────────────────────────────────────
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.5,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.View style={[styles.skeleton, style, { opacity }]} />;
}

// ── Empty state ─────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  subtitle,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={40} color={colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {subtitle && <Text style={styles.emptySubtitle}>{subtitle}</Text>}
      {children}
    </View>
  );
}

// ── Section header ──────────────────────────────────────────────────────
export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && (
        <Text style={styles.sectionAction} onPress={onAction}>
          {actionLabel}
        </Text>
      )}
    </View>
  );
}

// ── Pill button / chip ──────────────────────────────────────────────────
export function Chip({
  label,
  active,
  onPress,
  style,
  textStyle,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}) {
  return (
    <Text
      onPress={onPress}
      style={[
        styles.chip,
        active ? styles.chipActive : styles.chipInactive,
        style,
        active ? styles.chipTextActive : styles.chipTextInactive,
        textStyle,
      ]}
    >
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  badgeSmall: { paddingHorizontal: 5, paddingVertical: 1 },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: "800", letterSpacing: 0.4 },

  priceRow: { flexDirection: "row", alignItems: "baseline", gap: spacing.sm },
  price: { fontWeight: "800" },
  compareAt: { color: colors.textMuted, textDecorationLine: "line-through", fontWeight: "600" },

  starRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  ratingText: { fontWeight: "700", color: colors.text },
  reviewCount: { color: colors.textMuted, fontWeight: "500" },

  skeleton: { backgroundColor: colors.borderLight, borderRadius: radius.md },

  empty: { alignItems: "center", justifyContent: "center", padding: spacing.xxl, gap: spacing.md },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: "800", color: colors.text, textAlign: "center" },
  emptySubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: fontSize.xl, fontWeight: "800", color: colors.text },
  sectionAction: { fontSize: fontSize.sm, fontWeight: "700", color: colors.primary },

  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    fontSize: fontSize.sm,
    fontWeight: "700",
    overflow: "hidden",
  },
  chipActive: { backgroundColor: colors.primary },
  chipInactive: { backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  chipTextActive: { color: colors.white },
  chipTextInactive: { color: colors.textSecondary },
});
