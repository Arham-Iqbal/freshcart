/**
 * Vercel build: export the Expo web app with the API base UNSET so the hosted
 * site uses same-origin /api (the serverless functions in /api). The local
 * apps/mobile/.env points at localhost:4000 for dev — we must not bake that into
 * the production bundle, so we clear it for this build only.
 */
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appDir = resolve(root, "apps/mobile");

const env = { ...process.env, EXPO_PUBLIC_API_URL: "" };

console.log("[vercel-build] exporting Expo web with same-origin API…");
execSync("npx expo export -p web", { cwd: appDir, stdio: "inherit", env });
console.log("[vercel-build] done → apps/mobile/dist");
