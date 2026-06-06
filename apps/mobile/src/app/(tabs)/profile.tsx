import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useOrders } from "../../store/orders";
import { useAuth } from "../../store/auth";
import { colors, spacing, radius, fontSize, shadow, MAX_CONTENT_WIDTH, formatPrice } from "../../theme";

const STATUS_LABEL: Record<string, string> = {
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
};

function initials(name?: string) {
  if (!name) return "U";
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

export default function ProfileScreen() {
  const router = useRouter();
  const orders = useOrders((s) => s.orders);
  const user = useAuth((s) => s.user);
  const addresses = useAuth((s) => s.addresses);
  const payments = useAuth((s) => s.payments);
  const favourites = useAuth((s) => s.favourites);
  const notify = useAuth((s) => s.notify);
  const logout = useAuth((s) => s.logout);

  const defaultPayment = payments.find((p) => p.isDefault);
  const menu: { icon: keyof typeof Ionicons.glyphMap; label: string; sub: string; route: string }[] = [
    {
      icon: "location-outline",
      label: "Delivery addresses",
      sub: addresses.length ? addresses.map((a) => a.label).join(", ") : "Add an address",
      route: "/account/addresses",
    },
    {
      icon: "card-outline",
      label: "Payment methods",
      sub: defaultPayment ? defaultPayment.label + (defaultPayment.last4 ? ` •••• ${defaultPayment.last4}` : "") : "Add a method",
      route: "/account/payments",
    },
    {
      icon: "heart-outline",
      label: "Favourites",
      sub: `${favourites.length} saved item${favourites.length === 1 ? "" : "s"}`,
      route: "/account/favourites",
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      sub: notify.orders ? "Order updates on" : "Order updates off",
      route: "/account/notifications",
    },
    { icon: "help-circle-outline", label: "Help & support", sub: "FAQs, contact us", route: "/account/help" },
  ];

  function signOut() {
    logout();
    router.replace("/auth");
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <SafeAreaView edges={["top"]} style={styles.headerWrap}>
          <View style={[styles.profileCard, { maxWidth: MAX_CONTENT_WIDTH }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(user?.name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{user?.name ?? "Guest"}</Text>
              <Text style={styles.email}>{user?.email ?? "Not signed in"}</Text>
            </View>
            <Pressable style={styles.editBtn} onPress={() => router.push("/account/edit")}>
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </Pressable>
          </View>
        </SafeAreaView>

        <View style={[styles.center, { maxWidth: MAX_CONTENT_WIDTH }]}>
          {/* Stats */}
          <View style={styles.stats}>
            <Stat label="Orders" value={String(orders.length)} />
            <View style={styles.statDivider} />
            <Stat label="Saved" value={String(favourites.length)} />
            <View style={styles.statDivider} />
            <Stat label="Points" value="340" />
          </View>

          {/* Order history */}
          <Text style={styles.sectionTitle}>Recent orders</Text>
          {orders.length === 0 ? (
            <View style={styles.noOrders}>
              <Ionicons name="receipt-outline" size={28} color={colors.textMuted} />
              <Text style={styles.noOrdersText}>No orders yet. Your past orders will appear here.</Text>
            </View>
          ) : (
            orders.map((order) => (
              <Pressable
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push(`/order/${order.id}`)}
              >
                <View style={styles.orderIcon}>
                  <Ionicons name="bag-handle" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderMeta}>
                    {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text style={styles.orderTotal}>{formatPrice(order.total)}</Text>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusText}>{STATUS_LABEL[order.status]}</Text>
                  </View>
                </View>
              </Pressable>
            ))
          )}

          {/* Menu */}
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menu}>
            {menu.map((item, i) => (
              <Pressable
                key={item.label}
                style={({ pressed }) => [
                  styles.menuRow,
                  i < menu.length - 1 && styles.menuRowBorder,
                  pressed && { backgroundColor: colors.surfaceAlt },
                ]}
                onPress={() => router.push(item.route as any)}
              >
                <View style={styles.menuIcon}>
                  <Ionicons name={item.icon} size={20} color={colors.text} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>

          <Pressable style={({ pressed }) => [styles.signOut, pressed && { opacity: 0.7 }]} onPress={signOut}>
            <Ionicons name="log-out-outline" size={18} color={colors.sale} />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>

          <Text style={styles.version}>FreshCart v1.0.0 · Demo build</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  scroll: { paddingBottom: spacing.xxl, alignItems: "center" },
  headerWrap: { backgroundColor: colors.primary, width: "100%", alignItems: "center" },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    width: "100%",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: fontSize.xl, fontWeight: "900", color: colors.primary },
  name: { fontSize: fontSize.xl, fontWeight: "900", color: colors.white },
  email: { fontSize: fontSize.sm, color: "rgba(255,255,255,0.85)", fontWeight: "500" },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

  center: { width: "100%", alignSelf: "center", paddingHorizontal: spacing.lg },
  stats: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    marginTop: -spacing.lg,
    ...shadow.card,
  },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text },
  statLabel: { fontSize: fontSize.xs, color: colors.textMuted, fontWeight: "700" },
  statDivider: { width: 1, backgroundColor: colors.borderLight },

  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: "800",
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  noOrders: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  noOrdersText: { fontSize: fontSize.sm, color: colors.textMuted, textAlign: "center" },

  orderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.soft,
  },
  orderIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
  },
  orderId: { fontSize: fontSize.md, fontWeight: "800", color: colors.text },
  orderMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  orderTotal: { fontSize: fontSize.md, fontWeight: "800", color: colors.text },
  statusPill: {
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  statusText: { fontSize: 10, fontWeight: "800", color: colors.primary },

  menu: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: "hidden",
  },
  menuRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  menuLabel: { fontSize: fontSize.md, fontWeight: "700", color: colors.text },
  menuSub: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },

  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  signOutText: { color: colors.sale, fontWeight: "800", fontSize: fontSize.md },
  version: { textAlign: "center", color: colors.textMuted, fontSize: fontSize.xs, marginTop: spacing.sm },
});
