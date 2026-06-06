import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useCart } from "../store/cart";
import { useOrders } from "../store/orders";
import { submitCheckout, computeTotals } from "../lib/api";
import { colors, spacing, radius, fontSize, shadow, isWeb, FORM_WIDTH, formatPrice } from "../theme";

const SLOTS = ["ASAP · 25–35 min", "Today · 6–7 PM", "Today · 8–9 PM", "Tomorrow · 9–10 AM"];
const ADDRESSES = [
  { id: "home", label: "Home", line: "12, MG Road, Indiranagar, Bengaluru 560038", icon: "home" as const },
  { id: "work", label: "Work", line: "5th Floor, Prestige Tech Park, Bengaluru 560103", icon: "briefcase" as const },
];
const PAYMENTS = [
  { id: "upi", label: "UPI · you@okaxis", icon: "phone-portrait" as const },
  { id: "card", label: "Card •••• 4242", icon: "card" as const },
  { id: "cod", label: "Cash on delivery", icon: "cash" as const },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const totals = useMemo(() => computeTotals(lines), [lines]);
  const clear = useCart((s) => s.clear);
  const addOrder = useOrders((s) => s.add);

  const [address, setAddress] = useState(ADDRESSES[0]);
  const [slot, setSlot] = useState(SLOTS[0]);
  const [payment, setPayment] = useState(PAYMENTS[0]);
  const [placing, setPlacing] = useState(false);

  async function placeOrder() {
    if (placing || lines.length === 0) return;
    setPlacing(true);
    if (!isWeb) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      const order = await submitCheckout({
        lines: lines.map((l) => ({
          productId: l.productId,
          name: l.name,
          qty: l.qty,
          price: l.price,
          imageKey: l.imageKey,
        })),
        address: `${address.label} · ${address.line}`,
        paymentMethod: payment.label,
      });
      addOrder(order);
      clear();
      router.replace(`/order/${order.id}`);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <View style={styles.root}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={[styles.headerInner, { maxWidth: FORM_WIDTH }]}>
          <Pressable style={styles.backBtn} onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.center, { maxWidth: FORM_WIDTH }]}>
          {/* Address */}
          <Text style={styles.sectionTitle}>Delivery address</Text>
          {ADDRESSES.map((a) => (
            <SelectRow
              key={a.id}
              icon={a.icon}
              title={a.label}
              sub={a.line}
              selected={address.id === a.id}
              onPress={() => setAddress(a)}
            />
          ))}

          {/* Time slot */}
          <Text style={styles.sectionTitle}>Delivery time</Text>
          <View style={styles.slotWrap}>
            {SLOTS.map((s) => (
              <Pressable
                key={s}
                style={[styles.slot, slot === s && styles.slotActive]}
                onPress={() => setSlot(s)}
              >
                <Text style={[styles.slotText, slot === s && styles.slotTextActive]}>{s}</Text>
              </Pressable>
            ))}
          </View>

          {/* Payment */}
          <Text style={styles.sectionTitle}>Payment method</Text>
          {PAYMENTS.map((p) => (
            <SelectRow
              key={p.id}
              icon={p.icon}
              title={p.label}
              selected={payment.id === p.id}
              onPress={() => setPayment(p)}
            />
          ))}

          {/* Order summary */}
          <Text style={styles.sectionTitle}>Order summary</Text>
          <View style={styles.summary}>
            {lines.map((l) => (
              <View key={l.productId} style={styles.summaryItem}>
                <Text style={styles.summaryItemQty}>{l.qty}×</Text>
                <Text style={styles.summaryItemName} numberOfLines={1}>
                  {l.name}
                </Text>
                <Text style={styles.summaryItemPrice}>{formatPrice(l.price * l.qty)}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <Row label="Subtotal" value={formatPrice(totals.subtotal)} />
            <Row
              label="Delivery"
              value={totals.deliveryFee === 0 ? "FREE" : formatPrice(totals.deliveryFee)}
            />
            <Row label="Tax (5%)" value={formatPrice(totals.tax)} />
            <View style={styles.divider} />
            <Row label="Total" value={formatPrice(totals.total)} bold />
          </View>
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.ctaBar}>
        <View style={[styles.ctaInner, { maxWidth: FORM_WIDTH }]}>
          <Pressable
            style={[styles.placeBtn, placing && { opacity: 0.7 }]}
            onPress={placeOrder}
            disabled={placing}
          >
            {placing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.placeBtnText}>Place order · {formatPrice(totals.total)}</Text>
                <Ionicons name="lock-closed" size={16} color={colors.white} />
              </>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function SelectRow({
  icon,
  title,
  sub,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  sub?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.selectRow, selected && styles.selectRowActive]} onPress={onPress}>
      <View style={[styles.selectIcon, selected && { backgroundColor: colors.primary }]}>
        <Ionicons name={icon} size={18} color={selected ? colors.white : colors.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.selectTitle}>{title}</Text>
        {sub && <Text style={styles.selectSub}>{sub}</Text>}
      </View>
      <Ionicons
        name={selected ? "radio-button-on" : "radio-button-off"}
        size={22}
        color={selected ? colors.primary : colors.border}
      />
    </Pressable>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.rowBold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.rowBold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  headerSafe: { backgroundColor: colors.surface, ...shadow.soft, zIndex: 2 },
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
  headerTitle: { fontSize: fontSize.lg, fontWeight: "800", color: colors.text },

  scroll: { paddingVertical: spacing.lg, alignItems: "center", paddingBottom: 40 },
  center: { width: "100%", alignSelf: "center", paddingHorizontal: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },

  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  selectRowActive: { borderColor: colors.primary, backgroundColor: colors.primarySurface },
  selectIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  selectTitle: { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  selectSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },

  slotWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  slot: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  slotActive: { borderColor: colors.primary, backgroundColor: colors.primarySurface },
  slotText: { fontSize: fontSize.sm, fontWeight: "700", color: colors.textSecondary },
  slotTextActive: { color: colors.primary },

  summary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  summaryItem: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  summaryItemQty: { fontSize: fontSize.sm, fontWeight: "800", color: colors.primary, width: 28 },
  summaryItemName: { flex: 1, fontSize: fontSize.sm, color: colors.text, fontWeight: "600" },
  summaryItemPrice: { fontSize: fontSize.sm, fontWeight: "700", color: colors.text },
  divider: { height: 1, backgroundColor: colors.borderLight, marginVertical: spacing.xs },
  row: { flexDirection: "row", justifyContent: "space-between" },
  rowLabel: { fontSize: fontSize.md, color: colors.textSecondary, fontWeight: "600" },
  rowValue: { fontSize: fontSize.md, color: colors.text, fontWeight: "700" },
  rowBold: { fontSize: fontSize.lg, fontWeight: "900", color: colors.text },

  ctaBar: { backgroundColor: colors.surface, ...shadow.floating },
  ctaInner: { width: "100%", alignSelf: "center", padding: spacing.md },
  placeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.full,
  },
  placeBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },
});
