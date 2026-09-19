# Nasrify Bug & Pre-Launch Observations Log

This document logs non-blocking, cosmetic, or environmental observations noted during feature implementation stages to be addressed in the pre-launch polish pass.

---

## Stage 31+32 (Product Compare & Product Bundles Apps)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-31-01 | Build Tooling | Next.js logs warning: `Found multiple lockfiles in workspace (package-lock.json and ../package-lock.json)`. This happens because `nasrify-admin` and `nasrify-store` reside inside subfolders with their own package.json files while root also contains a lockfile. | Harmless warning; build and deployment succeed 100%. Can be unified into a formal npm/pnpm workspace configuration. | Pre-Launch / Post-MVP |
| BUG-31-02 | Build Tooling | Next.js Turbopack build logs a warning: `Custom Cache-Control headers were configured for static chunks under /_next/static/`. | Harmless warning; Cloudflare Workers serve static chunks with immutable cache control headers correctly. | Pre-Launch |
| BUG-32-01 | UI/Cosmetic | Admin `BundlesManager.tsx` multi-product picker items have a slight horizontal overflow on viewport widths below 380px. | Minor cosmetic formatting on narrow mobile viewports in admin; fully responsive on desktop and tablet. | Pre-Launch Polish |
| BUG-32-02 | UI/Cosmetic | `CompareTable.tsx` empty state button ("Browse Products") uses browser default focus ring instead of Nasrify design token ring on Safari mobile. | Minor styling inconsistency on iOS WebKit browsers. | Pre-Launch Polish |

---

## Stage 33+34 (Order Tracking & Broadcast Notifications Apps)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-33-01 | Build Tooling | Next.js 16 logs deprecation warning during production build: `The "middleware" file convention is deprecated. Please use "proxy" instead.` | Harmless framework notification; middleware operates normally. Can migrate via codemod in upcoming framework update. | Pre-Launch |
| BUG-33-02 | UI/Cosmetic | Public `TrackOrderPage.tsx` search input on narrow mobile screens (<340px) shows tight padding when a courier waybill code exceeds 24 characters. | Minor visual formatting edge case; does not affect tracking lookup functionality. | Pre-Launch Polish |
| BUG-34-01 | UI/Cosmetic | Admin `BroadcastManager.tsx` live preview panel displays a 1px subpixel border shift when toggling between "top" and "bottom" positions in Chrome Windows. | Minor cosmetic layout shift in admin preview previewer only. | Pre-Launch Polish |
| BUG-34-02 | UI/Cosmetic | `BroadcastPopup.tsx` close button icon has a slightly delayed hover transition when rendered over dark image hero backgrounds. | Subtle visual quirk on custom themes; fully functional. | Pre-Launch Polish |

