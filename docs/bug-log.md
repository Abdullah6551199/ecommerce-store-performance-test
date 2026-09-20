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

---

## Stage 35+36 (Trust Badges & Cookie Consent Apps)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-35-01 | Build Tooling | Cross-worker isolation: `nasrify-admin` strictly excludes `storefront/` folders from app directories during build synchronization. Admin components attempting to directly import storefront rows fail compilation. | Self-contained preview components and shared utilities in `shared/` resolve this cleanly. | Pre-Launch Polish |
| BUG-35-02 | UI/Cosmetic | In `TrustBadgesRow.tsx`, when `badgeSize` is set to `sm` on ultra-wide desktop viewports (>1920px), the horizontal spacing between badge cards appears slightly sparse without a max-width container wrapper. | Purely cosmetic on extra large monitors. | Pre-Launch Polish |
| BUG-36-01 | UI/Cosmetic | In `CookieCustomizeModal.tsx`, toggle switch thumb CSS transition on Firefox can appear slightly abrupt when rapidly toggling multiple categories in sequence. | Minor visual animation glitch; state persists accurately. | Pre-Launch Polish |
| BUG-36-02 | Analytics / DB | In `api/cookie-consent`, server-side visitor consent logging currently stores records in in-memory buffer without scheduled periodic batching to a dedicated D1 table. | Harmless; client-side localStorage and cookies are the primary source of truth for zero-overhead consent gating. | Pre-Launch / Apps Hub |

---

## Stage 29.6 (WhatsApp Order Tracking, Source Badge, & Fast Settings Cache)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-29-01 | Database / Foreign Keys | `order_items` table defines `FOREIGN KEY (product_id) REFERENCES products(id)`. When client payloads provide product slugs or non-matching IDs, SQLite throws `SQLITE_CONSTRAINT_FOREIGNKEY`. Fixed by adding catalog ID resolution and fallback mapping in `/api/whatsapp-order/save-order`. | Handled gracefully with database product lookup before batch insertion. | Complete |
| BUG-29-02 | CLI Tooling | Windows PowerShell default argument parsing strips unescaped quotes in curl JSON strings passed with `-d`. | Harmless CLI behavior; tests conducted via Node.js/tsx fetch scripts to ensure exact JSON serialization. | Complete |
| BUG-29-03 | Build Tooling | `nasrify-admin` and `nasrify-store` builds log a warning: `The "middleware" file convention is deprecated. Please use "proxy" instead.` | Next.js 16 deprecation warning; proxy codemod will be applied in upcoming framework update. | Post-MVP / Framework Polish |

---

## Stage 37A (Apps Hub Worker, Marketplace & Developer Portal)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-37-01 | Build Tooling | Next.js Turbopack build panic when traversing Windows directory junction `apps` pointing to `..\apps` (`FileSystemPath("").join("../apps") leaves the filesystem root`). | Resolved by copying local standalone JSON manifest folders into `nasrify-apps/apps/`. | Complete |
| BUG-37-02 | Auth / D1 Seed | The historical hash in `scripts/seed-admin.sql` did not match `admin123`. | Re-seeded remote D1 with verified bcrypt hash `$2b$10$bZa/sfWqu9TFmGB2nvZWkuvXagKX2Zwv/jsIb3YP7v2Z8B3Og/SH2` and cleared failed attempts. | Complete |
| BUG-37-03 | Build Tooling | OpenNext on Windows outputs a non-blocking warning: `OpenNext is not fully compatible with Windows. While OpenNext may function on Windows, it could encounter unpredictable failures during runtime.` | Informational warning only; the worker compiled, bundled, and deployed cleanly to Cloudflare edge in 15 seconds. | Complete |

---

## Stage 37B (Themes Hub Worker, Themes Marketplace & Developer Portal)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-37B-01 | TypeScript / Build | Route `/api/themes/[themeId]` attempted to import non-exported alias `getThemeVersions` from `versions.ts`. | Added export alias `export const getThemeVersions = getVersionsForTheme;` in `lib/themes/versions.ts`. | Complete |
| BUG-37B-02 | TypeScript / API | Route `/api/themes/install` passed separate arguments `(theme.id, storeId)` instead of the expected object `{ listingId, storeId }` to `recordThemeInstall`. | Fixed argument signature to `{ listingId: theme.id, storeId }`. | Complete |
| BUG-37B-03 | TypeScript / State | `ThemeDeveloperPortalClient.tsx` test live preview modal omitted `authorUrl` in the temporary state payload. | Added `authorUrl: authorUrl || null` to satisfy `ThemeMarketplaceListing` type. | Complete |

---

## Stage 38 (Digital Products App)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-38-01 | Module Resolution | Route forwarders in `apps/digital-products/admin/api/*` and `storefront/api/*` attempted relative import `../../lib/*` which resolved to `admin/` instead of app root. | Fixed all imports to use root alias `@/apps/digital-products/lib/*`. | Complete |
| BUG-38-02 | TypeScript / Imports | `apps/digital-products/lib/downloads.ts` omitted `digitalProducts` from `@/lib/db` imports during KPI aggregation. | Added `digitalProducts` to import list. | Complete |
| BUG-38-03 | Database Schema Sync | `nasrify-store/lib/db/schema.ts` lacked tables 48-50 (`digital_products`, `digital_downloads`, `digital_licenses`). | Appended schemas to `nasrify-store/lib/db/schema.ts` to ensure build-time export resolution. | Complete |
| BUG-38-04 | App Validation | Manifest validation threw error for unrecognized extension point `admin.product.form.below`. | Added `admin.product.form.below` to `APP_EXTENSION_POINTS` in `types/apps.ts` across all workers. | Complete |
| BUG-38-05 | TypeScript / Types | Nullable D1 integer fields (`downloadLimit`, `expiryDays`, `licenseEnabled`) were rejected by strict non-nullable interface. | Added null-coalescing fallbacks in Drizzle query mappings and adjusted `createdAt`/`updatedAt` type to `number \| null`. | Complete |


