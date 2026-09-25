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

---

## Stage 39 (Coupons App Conversion)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-39-01 | Module Resolution | Route forwarders in `apps/coupons/admin/api/*` and `storefront/api/*` used relative path `../../lib/coupons`, resolving to `apps/coupons/admin/lib/coupons` instead of `apps/coupons/lib/coupons`. | Updated all route handlers to import from `@/apps/coupons/lib/coupons`. | Complete |
| BUG-39-02 | TypeScript / Types | Turbopack strict type checking caught `body` as `unknown` in `apps/coupons/admin/api/delete/route.ts`, `update/route.ts`, and `app/api/admin/coupons/[id]/route.ts`. | Explicitly cast `body` as `Record<string, any>` after `req.json().catch()`. | Complete |
| BUG-39-03 | TypeScript / Generics | `CouponsDashboardWidget.tsx` called `fetchWithClientCache<{ success: boolean; data?: CouponStats }>`, causing `data.data` to be nested and incompatible with `SetStateAction<CouponStats | null>`. | Changed generic parameter to `fetchWithClientCache<CouponStats>` so `data` resolves directly to `CouponStats`. | Complete |

---

## Stage 40 (Product Q&A App)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-40-01 | Module Resolution | Route handlers in `apps/product-qa/admin/api/list/route.ts` used `../../../lib/questions` which traversed above app folder in worker build. | Changed import path to `@/apps/product-qa/lib/questions`. | Complete |
| BUG-40-02 | Edge Cache Invalidation | Setting changes (e.g. `requireLogin`) had 60-second in-memory cache delay in worker `installed.ts`. | Added direct D1 query reflection for `product-qa` in `isAppEnabled` and `getAppSettings`. | Complete |
| BUG-40-03 | HTTP Method | `nasrify-admin/app/api/admin/apps/[appId]/settings/route.ts` originally only exported `PUT`. | Exported `export const POST = PUT;` so both POST and PUT update settings identically. | Complete |

---

## Stage 41 (AI Review Generator App)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-41-01 | Manifest Validation | `manifest.json` omitted required `"pricing": "free"` and used `"write:reviews"` which wasn't in `APP_PERMISSIONS`. | Added `"pricing": "free"` to manifest and registered `"write:reviews"` in `APP_PERMISSIONS`. | Complete |
| BUG-41-02 | TypeScript / Turbopack | `ReviewsManager.tsx` and `ProductModal.tsx` had union type checking mismatch with new `"ai_reviews"` tab. | Extended `activeTab` type union with `\| "ai_reviews"` and cleaned JSX hierarchy. | Complete |
| BUG-41-03 | Review Schema Expansion | Adding `isAiGenerated` and `aiGenerationId` columns to Drizzle schema required updating mock memory arrays and createReview payload in `apps/reviews/lib/reviews.ts`. | Added default values `isAiGenerated: 0, aiGenerationId: null` across all ReviewRecord constructions. | Complete |

---

## Stage 42.5 (Basic Visual Theme Editor)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-42.5-01 | TypeScript / Turbopack | Strict Turbopack build caught `rawBody` and `res.json()` responses typed as `unknown` in `draft/route.ts`, `publish/route.ts`, and `ThemeEditorShell.tsx`. | Added explicit type casts `(await req.json()) as any` across theme editor routes and client fetchers. | Complete |
| BUG-42.5-02 | Module Resolution | Section setting components (`ProductGridSettings`, `TestimonialsSettings`, etc.) were exported as default while imported as named imports in `SectionSettings.tsx`. | Unified imports and added both default and named exports across section setting modules. | Complete |
| BUG-42.5-03 | Missing Module | `nasrify-admin/lib/themes/theme-editor-service.ts` imported `DEFAULT_THEME` from `./default-theme`, which only existed in `nasrify-store`. | Replicated `default-theme.ts` in `nasrify-admin/lib/themes/` so both workers share standard fallback schema. | Complete |

---

## Stage 42.7 (Font System & Typography)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-42.7-01 | React / TSX | `layout.tsx` `<link crossOrigin={p.crossOrigin} />` triggered TypeScript TS2322: `Type 'string' is not assignable to type 'CrossOrigin'`. | Fixed by typing `crossOrigin: "anonymous" as const` in `fonts.ts` and literal `crossOrigin="anonymous"` in `layout.tsx`. | Complete |
| BUG-42.7-02 | Zod Schema | `CurateSchema` in `/api/admin/fonts/curate` strictly validated `isCurated: z.boolean()`, rejecting numeric `1` / `0` payloads. | Updated to `z.union([z.boolean(), z.number()]).transform(val => Boolean(val))` for resilient compatibility. | Complete |

---

## Stage 42.8b (Default Theme Design & 13 New Page Sections)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-42.8b-01 | Database / D1 File Upload | Wrangler D1 cached file uploads with the same filename even if the file content was modified on disk (`File already uploaded. Processing.`), preventing execution of the revised SQL statement. | Fixed by generating uniquely named SQL migration scripts (`update_theme_42_8b_v2.sql`) when uploading. | Complete |
| BUG-42.8b-02 | D1 Table Schema | Schema in `themes` table uses column name `theme_json` rather than `config`. | Corrected SQL column name to `theme_json` across theme updater scripts. | Complete |

---

## Stage 42.8c (Storefront Theme Wiring & Complete Color Unification)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-42.8c-01 | CLI / PowerShell Escaping | Updating JSON strings in D1 via `wrangler d1 execute --command` in PowerShell can result in doubly-escaped backslashes (`{\\colors\\...`), causing `JSON.parse` failures at edge runtime. | Use `--file=<script.sql>` with clean JSON serialization instead of inline `--command` strings in PowerShell. | Complete |
| BUG-42.8c-02 | Theme Style Ingestion | Legacy `apex-theme-vars` `<style>` tag in `app/layout.tsx` was reading pre-framework theme settings containing `#960DF2`. | Updated `DEFAULT_THEME_SETTINGS` and remote D1 `settings.theme_settings` to WhatsApp Green (`#25D366`) and neutral darks (`#18181B`). | Complete |
| BUG-42.8c-03 | Apps Storefront Sync | Editing synced files directly inside `nasrify-store/apps/` is undone during prebuild by `sync-apps.ts`. | Edit source app files in root `apps/<app>/storefront/` prior to building storefront worker. | Complete |

---

## Stage 42.8d (Admin Panel Rebrand: Purple to Green/Black/White)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-42.8d-01 | CSS / Tailwind Syntax | Regex replacement of `shadow-purple-500/20` resulted in `.shadow-[#25D366]/20` utility class in `globals.css`, causing CSS parser syntax warning. | Replaced arbitrary color utility class with dedicated CSS classes `.shadow-green-soft` and `.shadow-green-card`. | Complete |
| BUG-42.8d-02 | App Admin Prebuild Sync | `sync-apps.ts --target=admin` copies `apps/<app>/admin/` to `nasrify-admin/apps/<app>/admin/` on prebuild, overwriting uncommitted target edits. | Rebranded root `apps/<app>/admin/` source files alongside `nasrify-admin/` components, then re-ran `sync-apps.ts`. | Complete |

---

## Stage 42.6 (Advanced Theme Editor App — Elementor-like Visual Controls)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-42.6-01 | TypeScript Schema Import | Drizzle ORM `idx_advanced_presets_type` index declaration required `index` imported explicitly from `drizzle-orm/sqlite-core`. | Added `index` to imports across root, admin, and storefront `schema.ts`. | Complete |
| BUG-42.6-02 | CSS Generator Resilience | `generateSectionCSS` in `css-generator.ts` expected nested `{ style, advanced }` structure; flat payloads caused declarations to be skipped. | Enhanced generator to support both nested and flat structures, with string/responsive font size and spacing parsing. | Complete |
| BUG-42.6-03 | Storefront CSS Caching | In `nasrify-store/lib/themes/engine.tsx`, static cache key `${themeId}_${sections.length}` caused unchanged keys when modifying existing section `_advanced` styles. | Updated cache key to fingerprint based on section `_advanced` payloads and exported `invalidateThemeAdvancedCSSCache()` hook. | Complete |

---

## Stage 42.5b (Basic Theme Editor Upgrade — Shopify Parity + Beyond)

| ID | Category | Description | Impact | Target Phase |
|---|---|---|---|---|
| BUG-42.5b-01 | Inline Editing on Touch | Double-click text editing on mobile viewports can trigger unintended zoom or keyboard layout shifts. | Disabled inline editing on touch devices (`ontouchstart` + screen width <= 768px) per rules. | Complete |
| BUG-42.5b-02 | Component Named vs Default Export | `ImageUploadField.tsx` was initially exported as `export default function`, causing named import `{ ImageUploadField }` to fail Next.js Turbopack build. | Exported both as named `export function ImageUploadField` and `export default ImageUploadField`. | Complete |
| BUG-42.5b-03 | Rich Text XSS Risk | Custom rich text editor inputs could allow malicious script injections if rendered directly. | Sanitized all HTML using DOMParser / strict regex tag stripping allowing only safe tags (`<b>`, `<strong>`, `<i>`, `<em>`, `<u>`, `<a>`, `<ul>`, `<ol>`, `<li>`, `<p>`, `<br>`). | Complete |


