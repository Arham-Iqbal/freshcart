/**
 * npm workspaces hoists `expo` and `@expo/cli` to the repo-root node_modules,
 * but `expo-router` (version-pinned in apps/mobile) stays in the app's
 * node_modules. The hoisted CLI then can't `require("expo-router/...")` and
 * `expo start` / `expo export` crash with MODULE_NOT_FOUND.
 *
 * This postinstall makes the app-level Expo packages resolvable from the root by
 * junctioning (Windows) / symlinking (POSIX) them into root node_modules.
 */
import { existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appModules = join(root, "apps", "mobile", "node_modules");
const rootModules = join(root, "node_modules");

// Packages the hoisted @expo/cli expects to require but that live app-local.
const pkgs = ["expo-router"];

for (const pkg of pkgs) {
  const src = join(appModules, pkg);
  const dest = join(rootModules, pkg);
  if (!existsSync(src)) continue; // app dep not installed yet
  if (existsSync(dest)) continue; // already hoisted or linked

  try {
    mkdirSync(dirname(dest), { recursive: true });
    // "junction" works on Windows without admin; ignored on POSIX (uses dir symlink).
    symlinkSync(src, dest, process.platform === "win32" ? "junction" : "dir");
    console.log(`[fix-expo-hoisting] linked ${pkg} -> root node_modules`);
  } catch (err) {
    console.warn(`[fix-expo-hoisting] could not link ${pkg}:`, err.message);
  }
}
