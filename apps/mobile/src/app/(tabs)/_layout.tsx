import { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Platform } from "react-native";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useCart } from "../../store/cart";
import { TopNav } from "../../components/TopNav";
import { colors, radius, useLayout } from "../../theme";

function CartIcon({ color, size, focused }: { color: string; size: number; focused: boolean }) {
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 40 }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40 }),
      ]).start();
    }
  }, [count, scale]);

  return (
    <View>
      <Ionicons name={focused ? "cart" : "cart-outline"} size={size} color={color} />
      {count > 0 && (
        <Animated.View style={[styles.badge, { transform: [{ scale }] }]}>
          <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
        </Animated.View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  const { topNav } = useLayout();

  return (
    <Tabs
      // On desktop/tablet show the top navbar and hide the bottom tab bar.
      tabBar={topNav ? () => <TopNav /> : undefined}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.borderLight,
          height: Platform.select({ ios: 88, android: 64, default: 64 }),
          paddingTop: 6,
          paddingBottom: Platform.select({ ios: 28, android: 8, default: 8 }),
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        // The custom tabBar (TopNav) sits at the TOP, so flip the bar position there.
        tabBarPosition: topNav ? "top" : "bottom",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "search" : "search-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color, size, focused }) => (
            <CartIcon color={color} size={size} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: radius.full,
    backgroundColor: colors.sale,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: "800" },
});
