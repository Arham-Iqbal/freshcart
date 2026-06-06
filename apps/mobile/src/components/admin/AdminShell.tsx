import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter, usePathname } from "expo-router";
import { colors, spacing, radius, fontSize, shadow, useLayout } from "../../theme";
import { useAdminAuth } from "../../store/adminAuth";
import { AdminLogin } from "./AdminLogin";

type NavItem = { label: string; path: string; icon: keyof typeof Ionicons.glyphMap };
type NavGroup = { group: string; items: NavItem[] };

const NAV: NavGroup[] = [
  {
    group: "Main",
    items: [
      { label: "Dashboard", path: "/admin", icon: "grid-outline" },
      { label: "Orders", path: "/admin/orders", icon: "receipt-outline" },
      { label: "Products", path: "/admin/products", icon: "pricetags-outline" },
    ],
  },
  {
    group: "Marketing",
    items: [
      { label: "Offers & Discounts", path: "/admin/offers", icon: "pricetag-outline" },
      { label: "Push Notifications", path: "/admin/notifications", icon: "notifications-outline" },
      { label: "Banners", path: "/admin/banners", icon: "image-outline" },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "Delivery", path: "/admin/delivery", icon: "bicycle-outline" },
      { label: "Inventory", path: "/admin/inventory", icon: "cube-outline" },
    ],
  },
  {
    group: "People",
    items: [
      { label: "Staff", path: "/admin/staff", icon: "people-outline" },
      { label: "Customers", path: "/admin/customers", icon: "person-outline" },
    ],
  },
  {
    group: "System",
    items: [
      { label: "Analytics", path: "/admin/analytics", icon: "bar-chart-outline" },
      { label: "Settings", path: "/admin/settings", icon: "settings-outline" },
    ],
  },
];

/** Web-only admin chrome: fixed sidebar + scrollable content. On mobile it
 *  shows a "open on desktop" notice (admin is a desktop tool). */
export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useLayout();
  const unlocked = useAdminAuth((s) => s.unlocked);
  const lock = useAdminAuth((s) => s.lock);

  // Password gate — every admin page wraps in AdminShell, so this protects all of them.
  if (!unlocked) return <AdminLogin />;

  if (isMobile) {
    return (
      <View style={styles.mobileBlock}>
        <View style={styles.mobileIcon}>
          <Ionicons name="desktop-outline" size={34} color={colors.primary} />
        </View>
        <Text style={styles.mobileTitle}>Admin is desktop-only</Text>
        <Text style={styles.mobileSub}>
          The FreshCart admin dashboard is designed for a larger screen. Open this URL on a
          computer to manage products and orders.
        </Text>
        <Pressable style={styles.mobileBtn} onPress={() => router.replace("/")}>
          <Ionicons name="storefront-outline" size={18} color={colors.white} />
          <Text style={styles.mobileBtnText}>Go to store</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <View style={styles.brand}>
          <View style={styles.logo}>
            <Ionicons name="leaf" size={18} color={colors.white} />
          </View>
          <View>
            <Text style={styles.brandText}>FreshCart</Text>
            <Text style={styles.brandSub}>Admin Console</Text>
          </View>
        </View>

        <ScrollView style={styles.navScroll} contentContainerStyle={styles.nav} showsVerticalScrollIndicator={false}>
          {NAV.map((grp) => (
            <View key={grp.group} style={styles.navGroup}>
              <Text style={styles.navGroupLabel}>{grp.group}</Text>
              {grp.items.map((item) => {
                const active = pathname === item.path;
                return (
                  <Pressable
                    key={item.path}
                    style={[styles.navItem, active && styles.navItemActive]}
                    onPress={() => router.push(item.path as any)}
                  >
                    <Ionicons
                      name={item.icon}
                      size={19}
                      color={active ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <Pressable style={styles.storeLink} onPress={() => router.replace("/")}>
          <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.storeLinkText}>View storefront</Text>
        </Pressable>
        <View style={styles.adminUser}>
          <View style={styles.adminAvatar}>
            <Text style={styles.adminAvatarText}>AS</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.adminName}>Aarav Sharma</Text>
            <Text style={styles.adminRole}>Store owner</Text>
          </View>
          <Pressable
            hitSlop={8}
            style={styles.lockBtn}
            onPress={() => {
              lock();
              router.replace("/");
            }}
          >
            <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View style={styles.main}>
        <View style={styles.topbar}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.topbarRight}>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const SIDEBAR_W = 248;

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: "row", backgroundColor: colors.background },

  sidebar: {
    width: SIDEBAR_W,
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xxl },
  logo: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { fontSize: fontSize.lg, fontWeight: "900", color: colors.text, letterSpacing: -0.4 },
  brandSub: { fontSize: 11, fontWeight: "700", color: colors.textMuted, letterSpacing: 0.3 },

  navScroll: { flex: 1, marginHorizontal: -spacing.lg },
  nav: { gap: spacing.lg, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  navGroup: { gap: 2 },
  navGroupLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.textMuted,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    paddingHorizontal: spacing.md,
    marginBottom: 4,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderRadius: radius.md,
  },
  navItemActive: { backgroundColor: colors.primarySurface },
  navLabel: { fontSize: fontSize.md, fontWeight: "700", color: colors.textSecondary },
  navLabelActive: { color: colors.primary },

  storeLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  storeLinkText: { fontSize: fontSize.sm, fontWeight: "700", color: colors.textSecondary },
  adminUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  adminAvatar: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
  },
  adminAvatarText: { color: colors.primary, fontWeight: "900", fontSize: fontSize.sm },
  adminName: { fontSize: fontSize.sm, fontWeight: "800", color: colors.text },
  adminRole: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
  lockBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },

  main: { flex: 1 },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: fontSize.xxl, fontWeight: "900", color: colors.text, letterSpacing: -0.5 },
  topbarRight: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primarySurface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  liveText: { fontSize: fontSize.xs, fontWeight: "800", color: colors.primaryDark },

  content: { padding: spacing.xxl, gap: spacing.xl, maxWidth: 1100 },

  // Mobile fallback
  mobileBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
    gap: spacing.md,
    backgroundColor: colors.background,
  },
  mobileIcon: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    backgroundColor: colors.primarySurface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  mobileTitle: { fontSize: fontSize.xl, fontWeight: "900", color: colors.text, textAlign: "center" },
  mobileSub: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 320,
  },
  mobileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    marginTop: spacing.sm,
  },
  mobileBtnText: { color: colors.white, fontWeight: "800", fontSize: fontSize.md },
});
