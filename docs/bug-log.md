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

