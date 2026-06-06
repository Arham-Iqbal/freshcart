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

// Clear the API base (use same-origin /api). EXPO_PUBLIC_ADMIN_PASSWORD (and any
// other EXPO_PUBLIC_* vars set in Vercel) pass through to the export unchanged.
const env = { ...process.env, EXPO_PUBLIC_API_URL: "" };

if (!process.env.EXPO_PUBLIC_ADMIN_PASSWORD) {
  console.warn(
    "[vercel-build] ⚠ EXPO_PUBLIC_ADMIN_PASSWORD not set — admin uses the default password.\n" +
      "   Set it in Vercel → Project → Settings → Environment Variables to secure /admin.",
  );
}

// Generate api/_data.js so the serverless function has a runnable, self-contained
// copy of the catalog (Vercel doesn't reliably bundle the @demo/data workspace
// symlink into the function — see scripts/gen-api-data.mjs).
console.log("[vercel-build] generating self-contained api/_data.js…");
execSync("node scripts/gen-api-data.mjs", { cwd: root, stdio: "inherit", env });

console.log("[vercel-build] exporting Expo web with same-origin API…");
execSync("npx expo export -p web", { cwd: appDir, stdio: "inherit", env });
console.log("[vercel-build] done → apps/mobile/dist");
