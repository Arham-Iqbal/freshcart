import { View, Text, Pressable, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, usePathname } from "expo-router";
import { useCart } from "../store/cart";
import { useNotifications } from "../store/notifications";
import { colors, spacing, radius, fontSize, shadow, MAX_CONTENT_WIDTH, useLayout } from "../theme";

const LINKS: { label: string; path: string; match: string }[] = [
  { label: "Home", path: "/", match: "/" },
  { label: "Search", path: "/search", match: "/search" },
  { label: "Orders", path: "/profile", match: "/profile" },
];

/** Desktop / tablet top navigation bar. Rendered above tab screens; the bottom
 *  tab bar is hidden at these widths (see (tabs)/_layout). */
export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDesktop } = useLayout();
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const notifItems = useNotifications((s) => s.items);
  const readIds = useNotifications((s) => s.readIds);
  const unread = notifItems.filter((i) => !readIds.includes(i.id)).length;

  return (
    <View style={styles.bar}>
      <View style={[styles.inner, { maxWidth: MAX_CONTENT_WIDTH }]}>
        <Pressable style={styles.brand} onPress={() => router.push("/")}>
          <View style={styles.logo}>
            <Ionicons name="leaf" size={18} color={colors.white} />
          </View>
          <Text style={styles.brandText}>
            Fresh<Text style={{ color: colors.primary }}>Cart</Text>
          </Text>
        </Pressable>

        {/* Location pill (desktop only) */}
        {isDesktop && (
          <Pressable style={styles.location}>
            <Ionicons name="location" size={15} color={colors.primary} />
            <Text style={styles.locationText} numberOfLines={1}>
              Deliver to <Text style={{ fontWeight: "800", color: colors.text }}>Home · 560001</Text>
            </Text>
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
          </Pressable>
        )}

        <View style={styles.links}>
          {LINKS.map((l) => {
            const active = pathname === l.match;
            return (
              <Pressable key={l.path} onPress={() => router.push(l.path as any)} style={styles.link}>
                <Text style={[styles.linkText, active && styles.linkActive]}>{l.label}</Text>
              </Pressable>
            );
          })}

          <Pressable style={styles.bellBtn} onPress={() => router.push("/account/notifications")}>
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
            {unread > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeText}>{unread > 9 ? "9+" : unread}</Text>
              </View>
            )}
          </Pressable>

          <Pressable style={styles.cartBtn} onPress={() => router.push("/cart")}>
            <Ionicons name="cart" size={18} color={colors.white} />
            <Text style={styles.cartBtnText}>Cart</Text>
            {count > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{count}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { backgroundColor: colors.surface, ...shadow.nav, zIndex: 50 },
  inner: {
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  logo: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },

  location: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    maxWidth: 280,
    marginLeft: spacing.md,
  },
  locationText: { fontSize: fontSize.sm, color: colors.textSecondary, fontWeight: "600", flexShrink: 1 },

  links: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginLeft: "auto" },
  link: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full },
  linkText: { fontSize: fontSize.md, fontWeight: "700", color: colors.textSecondary },
  linkActive: { color: colors.primary },

  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.xs,
  },
  bellBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: radius.full,
    backgroundColor: colors.sale,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  bellBadgeText: { color: colors.white, fontSize: 9, fontWeight: "900" },
  cartBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.full,
    marginLeft: spacing.sm,
  },
  cartBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.sm },
  cartBadge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
  },
  cartBadgeText: { color: colors.primary, fontSize: 11, fontWeight: "900" },
});
