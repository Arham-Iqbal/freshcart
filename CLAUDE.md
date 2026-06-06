# FreshCart — project guide for Claude

A polished **grocery / food-delivery demo** built to show clients. It must feel like
a real, premium product — not a template. **No real database** (in-memory + browser
storage); data resets are acceptable for demos.

## What it is

One **Expo (SDK 56) codebase** produces BOTH:
- an installable **Android APK** (via EAS cloud build — no local Android SDK), and
- a **website** (Expo web static export), plus a **web-only admin console**.

Backed by a lightweight **mock API** that runs two ways: locally as an Express server
(`mock-api/`) and in production as **Vercel serverless functions** (`api/`).

Currency is **₹ (INR)** everywhere. Locale/theme is India-flavoured (Bengaluru
addresses, UPI, etc.).

## Monorepo layout (npm workspaces)

```
apps/mobile/        Expo app → APK + web + admin (all screens)
packages/data/      @demo/data — shared catalog + types (SINGLE SOURCE OF TRUTH)
mock-api/           Express mock API for LOCAL dev (`npm run api`)
api/                Vercel serverless mirror of the API (production)
scripts/            vercel-build.mjs, fix-expo-hoisting.mjs
vercel.json         one-project deploy: static site + /api functions + SPA rewrites
DEPLOY.md           deploy steps (Vercel web + EAS APK)
```

## App structure (`apps/mobile/src`)

- `app/(tabs)/` — storefront tabs: `index` (Home), `search`, `cart`, `profile`
- `app/product/[id]`, `app/category/[id]`, `app/checkout`, `app/order/[id]`
- `app/auth.tsx` — login / signup (demo: any email; "Continue as guest")
- `app/account/` — addresses, payments, favourites, notifications, help, edit
- `app/admin/` — web-only console: dashboard (`index`), orders, products, offers,
  notifications, banners, delivery, inventory, staff, customers, analytics, settings
- `components/` — ProductCard, ProductGrid, BannerCarousel, FeatureBanner, TopNav
  (desktop nav + bell), NotificationsHost (toast + poller), SmartImage, QtyStepper,
  ui.tsx (shared primitives), admin/AdminShell + admin/ui.tsx
- `store/` — zustand + AsyncStorage: `auth`, `cart`, `orders`, `notifications`
- `lib/` — `config.ts` (API base resolution), `api.ts` (storefront client w/ offline
  fallback), `admin.ts` (admin client), `hooks.ts` (react-query), `images.ts`, `query.ts`
- `theme/index.ts` — design tokens + `useLayout()` responsive helper

## Key architecture decisions

- **`packages/data` is the single source of truth.** The catalog (8 categories, ~48
  products) lives here; both the API (seed) and the app's offline fallback import it.
- **Offline-safe storefront.** `lib/api.ts` tries the network, then falls back to the
  bundled `@demo/data`. So the standalone APK is a complete working store with no server.
- **Cart/orders/auth/notifications are client-side** (zustand, persisted) — the shopping
  flow never depends on the server being up.
- **Admin writes are live.** Product/price/stock edits and order-status changes go to
  the API and reflect in the storefront. Admin is web-only (shows a "desktop-only"
  notice on mobile) and has NO offline fallback (it does writes).
- **Push notifications (in-app, no Firebase).** Admin composes + sends-now/schedules;
  the API stores them and only returns ones whose `scheduledFor` has passed. The app
  polls every ~5s (NotificationsHost) → toast banner + bell unread count + inbox.
- **Responsive from one codebase.** `useLayout()` returns `{ isMobile, isTablet,
  isDesktop, topNav, gridColumns, gutter }`. Desktop shows a top navbar; mobile shows
  bottom tabs. Home has a rotating BannerCarousel + in-feed FeatureBanners.

## Conventions (match these)

- Import tokens from `theme`: `colors, spacing, radius, fontSize, shadow, formatPrice,
  useLayout, MAX_CONTENT_WIDTH, FORM_WIDTH, isWeb`. **Never hardcode colors/URLs.**
- Money: always `formatPrice(n)` → `₹120`. Never `$` or `.toFixed(2)` for currency.
- **No hardcoded API URLs.** The base comes only from `lib/config.ts` (which reads
  `EXPO_PUBLIC_API_URL`). Local dev = `http://localhost:4000`; production/web = empty
  (same-origin `/api`); APK = empty (offline). Set in `apps/mobile/.env` + `eas.json`.
- **Zustand selectors must never return a freshly-allocated object/array** (infinite
  render). Select primitives/arrays; derive with `useMemo`. (Bug we already hit + fixed.)
- New screens auto-register via Expo Router file paths, but ALSO add a `<Stack.Screen>`
  in `app/_layout.tsx` (and admin nav entries in `components/admin/AdminShell.tsx`).
- When adding API routes, update BOTH `mock-api/src/server.ts` (Express) AND
  `api/[...path].ts` + `api/_store.ts` (Vercel), and types in `packages/data/src/types.ts`.

## Run locally (Windows / PowerShell)

```powershell
npm install              # root; postinstall links expo-router for the monorepo
npm run api              # terminal 1 → http://localhost:4000 (Express mock API)
npm run web              # terminal 2 → Expo web dev server
```
Admin console: open `/admin` in the browser (web-only).

If port 4000 is busy (`EADDRINUSE`), a copy is already running. To free it:
`Get-NetTCPConnection -LocalPort 4000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`

## Build / deploy

- **Web (Vercel):** one project — `npm run vercel-build` exports the static site with
  the API base cleared (same-origin), `api/` deploys as serverless. See DEPLOY.md.
- **APK (EAS, Mode 1 standalone):** `eas build --platform android --profile preview`.
  `eas.json` forces `EXPO_PUBLIC_API_URL=""` so the APK uses bundled offline data.
- Always verify with `npx expo export -p web` (must end "Exported: dist", exit 0).

## Known gotchas (this environment)

- **Project is inside OneDrive on Windows** — file locks / sync can interfere with
  `node_modules`. Some `rm` calls warn "device busy"; usually harmless.
- **Monorepo hoisting:** `@expo/cli` hoists to root but `expo-router` stays in the app;
  `scripts/fix-expo-hoisting.mjs` (root `postinstall`) symlinks it so `expo start/export`
  work. Re-run `npm install` if Expo throws MODULE_NOT_FOUND for an `expo-router` path.
- **Do NOT run `npx expo install`** — the CLI's install util is partially corrupted here.
  Use `npx expo install` only to resolve versions, then plain `npm install`. Prefer
  react-native built-ins (Switch, Modal) + existing deps over adding new ones.
- **Web export uses `output: "single"` (SPA).** Plain `npx serve dist` 404s on deep
  links (no SPA rewrite) — use `npm run web` locally; Vercel/Netlify rewrite in prod.
- `apps/mobile` had an embedded `.git` from create-expo-app (caused a submodule commit
  issue) — it has been removed; `apps/mobile` is a normal folder tracked by the root repo.

## Demo talking points (no DB)

Working prototype; data is sample data and resets periodically; payments/delivery/
notifications are simulated; customer accounts are per-device (any email logs in).
