/**
 * Generates api/_data.js — a self-contained, runnable bundle of @demo/data.
 *
 * Why: the Vercel serverless function (api/[...path].ts → api/_store.ts) needs
 * the catalog at RUNTIME. @demo/data ships only TypeScript source
 * ("main": "src/index.ts"), which Node can't execute, and Vercel does not
 * reliably bundle the symlinked workspace package into the deployed function.
 * That caused FUNCTION_INVOCATION_FAILED (HTTP 500) on the hosted /api.
 *
 * We esbuild-bundle @demo/data into a plain ESM .js file inside api/ so the
 * function imports runnable JS with no workspace-path dependency. The catalog
 * stays single-source-of-truth in packages/data — this file is generated.
 *
 * Runs automatically in `npm run vercel-build` (see scripts/vercel-build.mjs).
 * Re-run manually after editing the catalog: `node scripts/gen-api-data.mjs`.
 */
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const entry = resolve(root, "packages/data/src/index.ts");
const out = resolve(root, "api/_data.js");

console.log("[gen-api-data] bundling @demo/data → api/_data.js…");
execSync(
  `npx --yes esbuild "${entry}" --bundle --platform=node --format=esm --outfile="${out}"`,
  { cwd: root, stdio: "inherit" },
);
console.log("[gen-api-data] done → api/_data.js");
