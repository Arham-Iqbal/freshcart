import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import { queryClient } from "../lib/query";
import { NotificationsHost } from "../components/NotificationsHost";
import { colors } from "../theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  useEffect(() => {
    const t = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="product/[id]" options={{ presentation: "card" }} />
            <Stack.Screen name="category/[id]" />
            <Stack.Screen name="checkout" />
            <Stack.Screen name="order/[id]" options={{ gestureEnabled: false }} />
            <Stack.Screen name="auth" options={{ animation: "fade" }} />
            <Stack.Screen name="account/addresses" />
            <Stack.Screen name="account/payments" />
            <Stack.Screen name="account/favourites" />
            <Stack.Screen name="account/notifications" />
            <Stack.Screen name="account/help" />
            <Stack.Screen name="account/edit" />
            <Stack.Screen name="admin" options={{ animation: "fade" }} />
          </Stack>
          <NotificationsHost />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
