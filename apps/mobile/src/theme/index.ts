/**
 * FreshCart design tokens. A refined grocery-green system with an ink-dark text
 * scale, soft elevated surfaces, and a responsive layout helper so the same
 * codebase reads as a polished mobile app AND a premium desktop site.
 */
import { Platform, useWindowDimensions, type ViewStyle } from "react-native";

export const colors = {
  primary: "#15924E",
  primaryDark: "#0F7A40",
  primaryDarker: "#0A5C30",
  primaryLight: "#D6F4E1",
  primarySurface: "#F1FBF5",

  accent: "#F59E0B",
  accentSurface: "#FFF7E8",
  sale: "#E11D48",
  saleSurface: "#FFF1F3",

  ink: "#0B1220",
  text: "#101828",
  textSecondary: "#475467",
  textMuted: "#98A2B3",

  background: "#F6F8F7",
  surface: "#FFFFFF",
  surfaceAlt: "#F2F5F4",
  border: "#E4E7EC",
  borderLight: "#EEF1F0",

  star: "#FBBF24",
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(11, 18, 32, 0.55)",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 28,
  full: 999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 34,
} as const;

export const shadow = {
  card: {
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 4,
  } as ViewStyle,
  soft: {
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  } as ViewStyle,
  floating: {
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  } as ViewStyle,
  nav: {
    shadowColor: "#0B1220",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  } as ViewStyle,
};

// ── Responsive ───────────────────────────────────────────────────────────
export const breakpoints = { tablet: 768, desktop: 1100 };

/** Max width for the centered content column. Wider on desktop than the old 720. */
export const MAX_CONTENT_WIDTH = 1180;

/** Narrower cap for form / reading-style screens (checkout, order confirmation). */
export const FORM_WIDTH = 640;

export type Layout = {
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  /** Use a top navbar (desktop/tablet) instead of a bottom tab bar (mobile). */
  topNav: boolean;
  /** Sensible column count for product grids. */
  gridColumns: number;
  /** Horizontal page padding. */
  gutter: number;
};

export function useLayout(): Layout {
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
  const isMobile = width < breakpoints.tablet;
  return {
    width,
    isMobile,
    isTablet,
    isDesktop,
    topNav: !isMobile,
    gridColumns: isDesktop ? 4 : isTablet ? 3 : 2,
    gutter: isMobile ? spacing.lg : spacing.xl,
  };
}

export const isWeb = Platform.OS === "web";

/** Format a rupee amount with the ₹ symbol and Indian digit grouping, no decimals. */
export function formatPrice(value: number): string {
  return "₹" + Math.round(value).toLocaleString("en-IN");
}
