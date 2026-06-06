/**
 * Image registry. Maps a stable `imageKey` to a local bundled asset so the APK
 * renders photos offline. When a key has no bundled asset yet, the resolver
 * falls back to the product's remote URL (great on web / when online).
 *
 * To make the APK fully offline-proof, drop optimized photos into
 * `assets/products/<key>.jpg` and add `"<key>": require("../../assets/products/<key>.jpg")`
 * to the map below. The data layer already carries matching `imageKey`s.
 */
import type { ImageSourcePropType } from "react-native";

const bundled: Record<string, ImageSourcePropType> = {
  // Example (uncomment once assets exist):
  // "p-banana": require("../../assets/products/p-banana.jpg"),
};

export type ImageInput =
  | { imageKey?: string; image?: string }
  | string
  | undefined;

/** Resolve an expo-image `source` from an imageKey (bundled) or remote URL. */
export function resolveImage(input: ImageInput): ImageSourcePropType | string | undefined {
  if (!input) return undefined;
  if (typeof input === "string") return input;
  if (input.imageKey && bundled[input.imageKey]) return bundled[input.imageKey];
  return input.image;
}

/** Blurhash placeholder for smooth image loads (premium feel). */
export const BLURHASH = "L6PZfSi_.AyE_3t7t7R**0o#DgR4";
