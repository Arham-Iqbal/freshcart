# Deploying the FreshCart demo

Two deliverables for clients: a **web link** (Vercel) and an **Android APK** (Expo
EAS). No database — data is in-memory and resets, which is fine for demos.

---

## A. Web link (Vercel)

The whole demo deploys as **one Vercel project**: the storefront + admin (static
site) plus the mock API (serverless functions in [`/api`](api/)). The hosted site
calls its own `/api`, so the admin console and live product/order sync work online.

### One-time setup
1. Create a free account at https://vercel.com (sign in with GitHub is easiest).
2. Push this project to a GitHub repo (or use the Vercel CLI — below).

### Option 1 — deploy from GitHub (recommended)
1. Push the repo to GitHub.
2. In Vercel: **Add New → Project → import the repo**.
3. Leave the build settings as detected — [`vercel.json`](vercel.json) already sets:
   - Build command: `npm run vercel-build`
   - Output: `apps/mobile/dist`
   - API routes + SPA rewrites
4. Click **Deploy**. You get a URL like `https://freshcart-demo.vercel.app`.
   - Storefront: `/`
   - Admin console: `/admin`

### Option 2 — deploy from your machine (Vercel CLI)
```powershell
npm install -g vercel
cd "C:\Users\iarha\OneDrive\Desktop\demo ecommerce app"
vercel            # first run: link/create the project, accept defaults
vercel --prod     # production deploy → prints the live URL
```

### What works on the hosted site
- Full storefront: browse, search, cart, checkout, order tracking, login, account.
- Admin at `/admin`: dashboard, products (add/edit/delete), orders (status), offers,
  delivery, staff, customers, analytics, settings.
- **Note:** serverless state (orders placed, admin edits) can reset between cold
  starts. The storefront keeps cart/orders in the browser, so shopping always works.

---

## B. Android APK (Expo EAS — no Android SDK needed)

### One-time setup
1. Create a free account at https://expo.dev.
2. Log in:
   ```powershell
   npm install -g eas-cli
   eas login
   ```

### Build
```powershell
cd "C:\Users\iarha\OneDrive\Desktop\demo ecommerce app\apps\mobile"
eas build:configure          # accept creating the EAS project (first time only)
eas build --platform android --profile preview
```
EAS compiles in the cloud and prints a **download link for the `.apk`** — send that
to the client or install it on a phone.

### APK data behaviour
The installed APK has **no server**, so it uses the bundled catalog (offline-safe):
the full store, cart, checkout, and order tracking work standalone. The admin
console is web-only and not included in the APK (by design).

> Optional: to demo the APK against the **live** Vercel API, set
> `EXPO_PUBLIC_API_URL=https://your-demo.vercel.app` in `apps/mobile/.env` before
> building. For a clean standalone APK to hand off, leave it as-is.

---

## Talking points for clients (since there's no DB)
- "It's a working prototype — fully clickable, real flows."
- "Data is sample data and resets periodically; production would use a real database."
- "Payments, delivery, and notifications are simulated."
- "Customer accounts are per-device for the demo (any email logs you in)."
