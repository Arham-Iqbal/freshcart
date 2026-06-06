import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, Easing } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useOrders } from "../../store/orders";
import { EmptyState } from "../../components/ui";
import { colors, spacing, radius, fontSize, shadow, FORM_WIDTH, formatPrice } from "../../theme";

const STEPS = [
  { key: "confirmed", label: "Order confirmed", icon: "checkmark-circle" as const },
  { key: "preparing", label: "Preparing your order", icon: "fast-food" as const },
  { key: "out_for_delivery", label: "Out for delivery", icon: "bicycle" as const },
  { key: "delivered", label: "Delivered", icon: "home" as const },
];

export default function OrderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));

  const scale = useRef(new Animated.Value(0)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5, tension: 80 }),
      Animated.timing(fade, { toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  }, [scale, fade]);

  if (!order) {
    return (
      <View style={styles.root}>
        <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
          <EmptyState icon="receipt-outline" title="Order not found">
            <Pressable style={styles.homeBtn} onPress={() => router.replace("/")}>
              <Text style={styles.homeBtnText}>Back to home</Text>
            </Pressable>
          </EmptyState>
        </SafeAreaView>
      </View>
    );
  }

  const currentStep = 0; // freshly placed → first step active

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={["top"]} style={{ width: "100%", alignItems: "center" }}>
          <View style={[styles.center, { maxWidth: FORM_WIDTH }]}>
            {/* Success hero */}
            <Animated.View style={[styles.successCircle, { transform: [{ scale }] }]}>
              <Ionicons name="checkmark" size={56} color={colors.white} />
            </Animated.View>
            <Animated.View style={{ opacity: fade, alignItems: "center", gap: 6 }}>
              <Text style={styles.successTitle}>Order placed!</Text>
              <Text style={styles.successSub}>
                Thank you — your groceries are on the way 🎉
              </Text>
            </Animated.View>

            {/* ETA card */}
            <View style={styles.etaCard}>
              <View style={styles.etaIcon}>
                <Ionicons name="time" size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.etaLabel}>Estimated delivery</Text>
                <Text style={styles.etaValue}>{order.eta}</Text>
              </View>
              <View>
                <Text style={styles.orderIdLabel}>Order</Text>
                <Text style={styles.orderId}>{order.id}</Text>
              </View>
            </View>

            {/* Tracker timeline */}
            <View style={styles.tracker}>
              {STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <View key={step.key} style={styles.trackStep}>
                    <View style={styles.trackLeft}>
                      <View
                        style={[
                          styles.trackDot,
                          done && styles.trackDotDone,
                          active && styles.trackDotActive,
                        ]}
                      >
                        <Ionicons
                          name={step.icon}
                          size={16}
                          color={done ? colors.white : colors.textMuted}
                        />
                      </View>
                      {i < STEPS.length - 1 && (
                        <View style={[styles.trackLine, done && styles.trackLineDone]} />
                      )}
                    </View>
                    <View style={styles.trackBody}>
                      <Text style={[styles.trackLabel, active && { color: colors.primary }]}>
                        {step.label}
                      </Text>
                      {active && <Text style={styles.trackNow}>In progress…</Text>}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Items */}
            <Text style={styles.sectionTitle}>
              {order.items.length} item{order.items.length === 1 ? "" : "s"}
            </Text>
            <View style={styles.itemsCard}>
              {order.items.map((it) => (
                <View key={it.productId} style={styles.itemRow}>
                  <Text style={styles.itemQty}>{it.qty}×</Text>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {it.name}
                  </Text>
                  <Text style={styles.itemPrice}>{formatPrice(it.price * it.qty)}</Text>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total paid</Text>
                <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
              </View>
              <Text style={styles.paidWith}>{order.paymentMethod}</Text>
            </View>

            <View style={styles.addressCard}>
              <Ionicons name="location" size={18} color={colors.primary} />
              <Text style={styles.addressText}>{order.address}</Text>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.ctaBar}>
        <View style={[styles.ctaInner, { maxWidth: FORM_WIDTH }]}>
          <Pressable style={styles.homeBtn} onPress={() => router.replace("/")}>
            <Text style={styles.homeBtnText}>Continue shopping</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { alignItems: "center", paddingBottom: 40 },
  center: { width: "100%", alignSelf: "center", paddingHorizontal: spacing.lg, alignItems: "center" },

  successCircle: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxl,
    ...shadow.card,
  },
  successTitle: { fontSize: fontSize.xxl, fontWeight: "900", color: colors.text, marginTop: spacing.lg },
  successSub: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: "center" },

  etaCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginTop: spacing.xl,
    width: "100%",
    ...shadow.card,
  },
  etaIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
  },
  etaLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: "700" },
  etaValue: { fontSize: fontSize.lg, fontWeight: "900", color: colors.text },
  orderIdLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: "700", textAlign: "right" },
  orderId: { fontSize: fontSize.sm, fontWeight: "800", color: colors.primary },

  tracker: { width: "100%", marginTop: spacing.xl, paddingLeft: spacing.xs },
  trackStep: { flexDirection: "row", gap: spacing.md },
  trackLeft: { alignItems: "center" },
  trackDot: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  trackDotDone: { backgroundColor: colors.primary, borderColor: colors.primary },
  trackDotActive: { backgroundColor: colors.primary, borderColor: colors.primaryLight },
  trackLine: { width: 2, flex: 1, minHeight: 28, backgroundColor: colors.border, marginVertical: 2 },
  trackLineDone: { backgroundColor: colors.primary },
  trackBody: { flex: 1, paddingTop: 8, paddingBottom: spacing.md },
  trackLabel: { fontSize: fontSize.md, fontWeight: "700", color: colors.textSecondary },
  trackNow: { fontSize: fontSize.xs, color: colors.primary, fontWeight: "600", marginTop: 2 },

  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: fontSize.md,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  itemsCard: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  itemQty: { fontSize: fontSize.sm, fontWeight: "800", color: colors.primary, width: 28 },
  itemName: { flex: 1, fontSize: fontSize.sm, color: colors.text, fontWeight: "600" },
  itemPrice: { fontSize: fontSize.sm, fontWeight: "700", color: colors.text },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.xs },
  totalRow: { flexDirection: "row", justifyContent: "space-between" },
  totalLabel: { fontSize: fontSize.lg, fontWeight: "900", color: colors.text },
  totalValue: { fontSize: fontSize.lg, fontWeight: "900", color: colors.text },
  paidWith: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: "600" },

  addressCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
    width: "100%",
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  addressText: { flex: 1, fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600" },

  ctaBar: { backgroundColor: colors.surface, ...shadow.floating },
  ctaInner: { width: "100%", alignSelf: "center", padding: spacing.md },
  homeBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.full,
    alignItems: "center",
  },
  homeBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },
});
