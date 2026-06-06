/**
 * Single source of truth for runtime config. No URLs are hardcoded anywhere in
 * the app — the API base comes only from EXPO_PUBLIC_API_URL (set in
 * apps/mobile/.env for local dev, and left empty for production/Vercel and the
 * standalone APK).
 *
 * Resolution:
 * - EXPO_PUBLIC_API_URL set        → use it verbatim (local dev).
 * - empty, on WEB                  → same-origin relative ("" + "/api/..").
 * - empty, on native (APK)         → no server; callers use the offline catalog.
 */
import Constants from "expo-constants";
import { Platform } from "react-native";

const isWeb = Platform.OS === "web";

const RAW =
  process.env.EXPO_PUBLIC_API_URL ||
  ((Constants.expoConfig?.extra as any)?.apiUrl as string | undefined) ||
  "";

// A standalone APK can never reach the dev machine's localhost, but .env sets
// EXPO_PUBLIC_API_URL=http://localhost:4000 for local web dev and that value is
// inlined into every build. On native, ignore localhost URLs so the APK falls
// back to the bundled offline catalog. On web, localhost is valid (dev browser).
const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(RAW);
const EXPLICIT = !isWeb && isLocalhost ? "" : RAW;

/** Base to prefix before "/api/...". Empty string = same-origin on web. */
export const API_BASE = EXPLICIT;

/** Whether network calls should be attempted at all (storefront). */
export const NETWORK_ENABLED = !!EXPLICIT || isWeb;
