import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { colors, spacing, radius, fontSize, shadow } from "../theme";

export interface Banner {
  id: string;
  eyebrow: string;
  title: string;
  cta: string;
  emoji: string;
  colors: [string, string];
  route: string;
}

export const HOME_BANNERS: Banner[] = [
  {
    id: "produce",
    eyebrow: "FRESH DEALS · TODAY ONLY",
    title: "Up to 30% off\nfarm-fresh produce",
    cta: "Shop now",
    emoji: "🥑",
    colors: [colors.primary, colors.primaryDarker],
    route: "/category/fruit-veg",
  },
  {
    id: "bakery",
    eyebrow: "BAKED THIS MORNING",
    title: "Warm bakery,\ndelivered to you",
    cta: "Explore bakery",
    emoji: "🥐",
    colors: ["#D97706", "#7C2D12"],
    route: "/category/bakery",
  },
  {
    id: "express",
    eyebrow: "LIGHTNING FAST",
    title: "Groceries in\n25 minutes",
    cta: "Order now",
    emoji: "⚡",
    colors: ["#7C3AED", "#4C1D95"],
    route: "/search",
  },
];

/** Premium auto-rotating, swipeable banner carousel with dots. Responsive: the
 *  slide width tracks the container so it looks right on phone and desktop. */
export function BannerCarousel({ banners = HOME_BANNERS, width }: { banners?: Banner[]; width: number }) {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);
  const { width: winW } = useWindowDimensions();
  const slideW = Math.max(1, width);

  // Auto-advance every 4.5s.
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      setIndex((cur) => {
        const next = (cur + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * slideW, animated: true });
        return next;
      });
    }, 4500);
    return () => clearInterval(t);
  }, [banners.length, slideW]);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const i = Math.round(e.nativeEvent.contentOffset.x / slideW);
    if (i !== index) setIndex(i);
  }

  function goTo(i: number) {
    setIndex(i);
    scrollRef.current?.scrollTo({ x: i * slideW, animated: true });
  }

  return (
    <View>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {banners.map((b) => (
          <Pressable key={b.id} style={{ width: slideW }} onPress={() => router.push(b.route as any)}>
            <LinearGradient
              colors={b.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.slide}
            >
              {/* decorative circles for depth */}
              <View style={styles.circleA} />
              <View style={styles.circleB} />
              <View style={styles.text}>
                <Text style={styles.eyebrow}>{b.eyebrow}</Text>
                <Text style={styles.title}>{b.title}</Text>
                <View style={styles.btn}>
                  <Text style={styles.btnText}>{b.cta}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.text} />
                </View>
              </View>
              <Text style={styles.emoji}>{b.emoji}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>

      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <Pressable key={i} onPress={() => goTo(i)} hitSlop={8}>
              <View style={[styles.dot, i === index && styles.dotActive]} />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    minHeight: 190,
    borderRadius: radius.xl,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
    ...shadow.card,
  },
  circleA: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -60,
    right: -30,
  },
  circleB: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.06)",
    bottom: -40,
    right: 80,
  },
  text: { flex: 1, gap: 10, zIndex: 1 },
  eyebrow: { color: "rgba(255,255,255,0.9)", fontWeight: "800", fontSize: 11, letterSpacing: 1 },
  title: { color: colors.white, fontSize: fontSize.xxl, fontWeight: "900", lineHeight: 32, letterSpacing: -0.5 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.white,
    alignSelf: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.full,
    marginTop: 4,
  },
  btnText: { color: colors.text, fontWeight: "800", fontSize: fontSize.sm },
  emoji: { fontSize: 96, marginLeft: spacing.md, zIndex: 1 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 7, marginTop: spacing.md },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border },
  dotActive: { width: 22, backgroundColor: colors.primary },
});
