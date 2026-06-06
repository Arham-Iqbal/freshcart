import { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { SmartImage } from "../../components/SmartImage";
import { QtyStepper } from "../../components/QtyStepper";
import { EmptyState } from "../../components/ui";
import { useCart, type CartLine } from "../../store/cart";
import { computeTotals } from "../../lib/api";
import { colors, spacing, radius, fontSize, shadow, MAX_CONTENT_WIDTH, formatPrice, useLayout } from "../../theme";
import { FREE_DELIVERY_THRESHOLD } from "@demo/data";

export default function CartScreen() {
  const router = useRouter();
  const layout = useLayout();
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const totals = useMemo(() => computeTotals(lines), [lines]);
  const twoCol = !layout.isMobile;

  if (lines.length === 0) {
    return (
      <View style={styles.root}>
        <SafeAreaView edges={["top"]} style={styles.headerSafe}>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </SafeAreaView>
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="cart-outline"
            title="Your cart is empty"
            subtitle="Browse fresh groceries and add your favourites to get started."
          >
            <Pressable style={styles.shopBtn} onPress={() => router.push("/")}>
              <Text style={styles.shopBtnText}>Start shopping</Text>
            </Pressable>
          </EmptyState>
        </View>
      </View>
    );
  }

  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - totals.subtotal);
  const progress = Math.min(1, totals.subtotal / FREE_DELIVERY_THRESHOLD);

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <Text style={styles.headerTitle}>Your Cart</Text>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.center,
            { maxWidth: MAX_CONTENT_WIDTH, paddingHorizontal: layout.gutter },
            twoCol && styles.twoColWrap,
          ]}
        >
          {/* Left column: items */}
          <View style={twoCol ? styles.itemsCol : undefined}>
            {/* Free delivery progress */}
            <View style={styles.freeDelivery}>
              {remaining > 0 ? (
                <Text style={styles.freeDeliveryText}>
                  Add <Text style={{ fontWeight: "800" }}>{formatPrice(remaining)}</Text> more for free
                  delivery 🚲
                </Text>
              ) : (
                <Text style={styles.freeDeliveryText}>🎉 You've unlocked free delivery!</Text>
              )}
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            </View>

            {lines.map((line) => (
              <CartRow
                key={line.productId}
                line={line}
                onQty={(n) => setQty(line.productId, n)}
                onRemove={() => remove(line.productId)}
                onOpen={() => router.push(`/product/${line.productId}`)}
              />
            ))}
          </View>

          {/* Right column: summary (sticky-ish on desktop) */}
          <View style={twoCol ? styles.summaryCol : undefined}>
            <View style={styles.summary}>
              <Text style={styles.summaryHeading}>Order summary</Text>
              <SummaryRow label="Subtotal" value={formatPrice(totals.subtotal)} />
              <SummaryRow
                label="Delivery fee"
                value={totals.deliveryFee === 0 ? "FREE" : formatPrice(totals.deliveryFee)}
                highlight={totals.deliveryFee === 0}
              />
              <SummaryRow label="Tax (5%)" value={formatPrice(totals.tax)} />
              <View style={styles.divider} />
              <SummaryRow label="Total" value={formatPrice(totals.total)} bold />

              {twoCol && (
                <Pressable style={styles.summaryCheckout} onPress={() => router.push("/checkout")}>
                  <Text style={styles.checkoutBtnText}>Proceed to checkout</Text>
                  <Ionicons name="arrow-forward" size={18} color={colors.white} />
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky checkout bar (mobile only) */}
      {layout.isMobile && (
        <SafeAreaView edges={["bottom"]} style={styles.ctaBar}>
          <View style={styles.ctaInner}>
            <View>
              <Text style={styles.ctaLabel}>Total</Text>
              <Text style={styles.ctaTotal}>{formatPrice(totals.total)}</Text>
            </View>
            <Pressable style={styles.checkoutBtn} onPress={() => router.push("/checkout")}>
              <Text style={styles.checkoutBtnText}>Checkout</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </Pressable>
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}

function CartRow({
  line,
  onQty,
  onRemove,
  onOpen,
}: {
  line: CartLine;
  onQty: (n: number) => void;
  onRemove: () => void;
  onOpen: () => void;
}) {
  return (
    <View style={styles.row}>
      <Pressable onPress={onOpen}>
        <SmartImage source={line} style={styles.rowImage} />
      </Pressable>
      <View style={styles.rowBody}>
        <Pressable onPress={onOpen}>
          <Text style={styles.rowName} numberOfLines={1}>
            {line.name}
          </Text>
        </Pressable>
        <Text style={styles.rowUnit}>{line.unitSize}</Text>
        <Text style={styles.rowPrice}>{formatPrice(line.price * line.qty)}</Text>
      </View>
      <View style={styles.rowRight}>
        <Pressable onPress={onRemove} hitSlop={8} style={styles.removeBtn}>
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </Pressable>
        <QtyStepper qty={line.qty} size="sm" onChange={onQty} />
      </View>
    </View>
  );
}

function SummaryRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, bold && styles.summaryBold]}>{label}</Text>
      <Text
        style={[
          styles.summaryValue,
          bold && styles.summaryBold,
          highlight && { color: colors.primary },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  headerSafe: { backgroundColor: colors.surface, ...shadow.soft, zIndex: 2 },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: "900",
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emptyWrap: { flex: 1, justifyContent: "center" },
  shopBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  shopBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },

  scroll: { paddingVertical: spacing.xl, alignItems: "center", paddingBottom: 40 },
  center: { width: "100%", alignSelf: "center", gap: spacing.md },
  twoColWrap: { flexDirection: "row", alignItems: "flex-start", gap: spacing.xl },
  itemsCol: { flex: 1, gap: spacing.md },
  summaryCol: { width: 340 },

  freeDelivery: {
    backgroundColor: colors.primarySurface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  freeDeliveryText: { color: colors.primaryDark, fontSize: fontSize.sm, fontWeight: "600" },
  progressTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: radius.full, backgroundColor: colors.primary },

  row: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  rowImage: { width: 70, height: 70, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
  rowBody: { flex: 1, justifyContent: "center", gap: 2 },
  rowName: { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  rowUnit: { fontSize: fontSize.xs, color: colors.textMuted },
  rowPrice: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text, marginTop: 2 },
  rowRight: { justifyContent: "space-between", alignItems: "flex-end" },
  removeBtn: { padding: 4 },

  summary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  summaryHeading: {
    fontSize: fontSize.lg,
    fontWeight: "900",
    color: colors.text,
    marginBottom: spacing.xs,
  },
  summaryCheckout: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryLabel: { fontSize: fontSize.md, color: colors.textSecondary, fontWeight: "600" },
  summaryValue: { fontSize: fontSize.md, color: colors.text, fontWeight: "700" },
  summaryBold: { fontSize: fontSize.lg, fontWeight: "900", color: colors.text },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.xs },

  ctaBar: { backgroundColor: colors.surface, ...shadow.floating },
  ctaInner: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  ctaLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: "700" },
  ctaTotal: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text },
  checkoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.full,
  },
  checkoutBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },
});
