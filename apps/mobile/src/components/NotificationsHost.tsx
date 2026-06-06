import { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useNotifications } from "../store/notifications";
import { colors, spacing, radius, fontSize, shadow, MAX_CONTENT_WIDTH } from "../theme";

const CAT_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  promo: "pricetag",
  order: "bag-handle",
  system: "information-circle",
};

/**
 * Mounts once at the app root. Polls the notifications API and renders an
 * in-app toast banner when a new push arrives. Tapping it opens the inbox.
 */
export function NotificationsHost() {
  const router = useRouter();
  const refresh = useNotifications((s) => s.refresh);
  const toast = useNotifications((s) => s.toast);
  const dismissToast = useNotifications((s) => s.dismissToast);
  const markRead = useNotifications((s) => s.markRead);

  // Poll every 5s (and once on mount) so scheduled notifications appear on time.
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [refresh]);

  const slide = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (toast) {
      Animated.spring(slide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 8 }).start();
      const auto = setTimeout(() => hide(), 6000);
      return () => clearTimeout(auto);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

  function hide() {
    Animated.timing(slide, { toValue: -160, duration: 250, useNativeDriver: true }).start(() => dismissToast());
  }

  if (!toast) return null;

  return (
    <SafeAreaView edges={["top"]} style={styles.host} pointerEvents="box-none">
      <Animated.View style={[styles.wrap, { transform: [{ translateY: slide }], maxWidth: MAX_CONTENT_WIDTH }]}>
        <Pressable
          style={styles.toast}
          onPress={() => {
            markRead(toast.id);
            hide();
            router.push("/account/notifications");
          }}
        >
          <View style={styles.icon}>
            <Ionicons name={CAT_ICON[toast.category] ?? "notifications"} size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.appRow}>
              <Text style={styles.appName}>FreshCart</Text>
              <Text style={styles.now}>  now</Text>
            </Text>
            <Text style={styles.title} numberOfLines={1}>{toast.title}</Text>
            {!!toast.body && <Text style={styles.body} numberOfLines={2}>{toast.body}</Text>}
          </View>
          <Pressable hitSlop={8} onPress={hide} style={styles.close}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  host: { position: "absolute", top: 0, left: 0, right: 0, alignItems: "center", zIndex: 1000 },
  wrap: { width: "100%", paddingHorizontal: spacing.md, paddingTop: Platform.select({ web: spacing.md, default: spacing.xs }) },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.floating,
  },
  icon: { width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.primarySurface, alignItems: "center", justifyContent: "center" },
  appRow: { flexDirection: "row", alignItems: "center" },
  appName: { fontSize: fontSize.xs, fontWeight: "800", color: colors.textSecondary, letterSpacing: 0.2 },
  now: { fontSize: fontSize.xs, color: colors.textMuted },
  title: { fontSize: fontSize.md, fontWeight: "800", color: colors.text, marginTop: 1 },
  body: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 1, lineHeight: 18 },
  close: { padding: 4 },
});
