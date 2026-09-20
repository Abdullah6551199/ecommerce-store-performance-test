# Stage 37C — Marketplace Reviews & Nasrify Team Branding

## 1. Overview & Objectives
Stage 37C delivers the unified **Marketplace Reviews & Ratings System** across both **Nasrify Apps Hub** (`nasrify-apps`) and **Nasrify Themes Hub** (`nasrify-themes`), accompanied by the rebranding and rename of all super-administrative references to **Nasrify Team**.

- **Apps Hub URL**: `https://nasrify-apps.zia291930.workers.dev`
  - **Deployed Version ID**: `de06fe0d-169a-4b88-9759-8084393fc713`
- **Themes Hub URL**: `https://nasrify-themes.zia291930.workers.dev`
  - **Deployed Version ID**: `8dcfa780-2389-468d-9bc0-208eff2c5d87`
- **Edge Runtime**: Cloudflare Workers with `nodejs_compat` + OpenNext + Next.js 16.3.4
- **Shared Infrastructure**: D1 Database (`ecommerce-perf-db`, ID: `3a60804b-1009-4451-972b-87cec6d46bcb`), R2 Bucket (`ecommerce-perf-assets`).

---

## 2. Database Migration (0023_stage_37c_reviews.sql)
Applied to Cloudflare D1 database `ecommerce-perf-db`:

### Tables
1. **`marketplace_reviews`**:
   - `id`: TEXT PRIMARY KEY NOT NULL
   - `listing_type`: TEXT NOT NULL ('app' | 'theme')
   - `listing_id`: TEXT NOT NULL (e.g., `listing_whatsapp-order`, `listing_minimal_noir`)
   - `user_id`: TEXT
   - `user_email`: TEXT
   - `user_name`: TEXT
   - `rating`: INTEGER NOT NULL (1 to 5)
   - `title`: TEXT
   - `body`: TEXT
   - `helpful_count`: INTEGER DEFAULT 0 NOT NULL
   - `status`: TEXT DEFAULT 'published' NOT NULL ('published' | 'hidden' | 'flagged')
   - `team_response`: TEXT
   - `team_response_at`: INTEGER
   - `created_at`: INTEGER NOT NULL
   - `updated_at`: INTEGER NOT NULL

2. **`marketplace_review_votes`**:
   - `id`: TEXT PRIMARY KEY NOT NULL
   - `review_id`: TEXT NOT NULL
   - `user_id`: TEXT NOT NULL
   - `vote_type`: TEXT NOT NULL ('helpful' | 'not_helpful')
   - `created_at`: INTEGER NOT NULL

### Indexes & Constraints
- `idx_reviews_listing`: ON `marketplace_reviews (listing_type, listing_id)`
- `idx_reviews_status`: ON `marketplace_reviews (status)`
- `idx_reviews_user`: ON `marketplace_reviews (user_id)`
- `idx_review_votes_review`: ON `marketplace_review_votes (review_id)`
- `uq_reviews_listing_user`: UNIQUE ON `marketplace_reviews (listing_type, listing_id, user_id)`
- `uq_review_votes_user`: UNIQUE ON `marketplace_review_votes (review_id, user_id)`

---

## 3. Implemented Routes & Capabilities

### Review & Rating API Endpoints
Both `nasrify-apps` and `nasrify-themes` implement identical, robust marketplace review endpoints:

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/marketplace/reviews` | GET | Public / Opt. User | Fetches paginated published reviews with verified install badges and current user vote status. |
| `/api/marketplace/reviews` | POST | Customer / User | Submits a 1-5 star review. Strictly enforces 1 review per user per listing constraint. |
| `/api/marketplace/reviews/summary` | GET | Public | Returns aggregated average rating, total count, and 1-5 star distribution with 20s edge micro-cache. |
| `/api/marketplace/reviews/[id]` | PUT | Owner | Allows author to update rating, title, and review body. |
| `/api/marketplace/reviews/[id]` | DELETE | Owner / Team | Deletes review and associated votes. Team admins can delete any review. |
| `/api/marketplace/reviews/[id]/helpful` | POST | Authenticated | Toggles helpful vote, atomically updating `helpful_count` and vote history. |
| `/api/marketplace/reviews/[id]/respond` | POST | Nasrify Team | Posts an official Nasrify Team response to the review. |
| `/api/marketplace/reviews/[id]/hide` | POST | Nasrify Team | Moderation action to toggle review status between published and hidden. |

### Client Components
- `RatingSummary.tsx`: Displays average rating score, star meter, total reviews, and visual distribution bars.
- `ReviewForm.tsx`: Interactive 5-star rating selector, title/body inputs, validation, and editing mode.
- `ReviewsList.tsx`: Paginated review cards featuring Verified Install badges, time-ago timestamps, helpful voting counters, edit/delete actions, and official Nasrify Team response callouts.
- `ReviewsSection.tsx`: Orchestrates summary, list, and form with real-time optimistic updates and micro-cache invalidation.

### Branding Overhaul: "Nasrify Team"
All instances of generic "Super Admin" text have been rebranded to **Nasrify Team**:
- Developer portal badges: `Reviewed by Nasrify Team`
- Approval queue (`/super/pending`): `Nasrify Team Approval Queue`
- Review responses: `Official response from Nasrify Team`
- Submission logs and UI cards: `Nasrify Team`

---

## 4. Live Verification Results

Verification suite executed against production workers with 100% pass rate:

```text
================================================================================
             STAGE 37C: MARKETPLACE REVIEWS & BRANDING VERIFICATION             
 Apps Hub:   https://nasrify-apps.zia291930.workers.dev
 Themes Hub: https://nasrify-themes.zia291930.workers.dev
================================================================================

--- 0. Pre-test Cleanup ---
Cleanup completed successfully.

--- 1. Apps Hub UI & Detail Page Checks ---
✓ PASS - Apps Hub: Detail page HTTP 200 (Status: 200)
✓ PASS - Apps Hub: Detail page renders Reviews section anchor (Found reviews section in HTML)
✓ PASS - Apps Hub: No visible 'Super Admin' text in detail page UI (Checked clean UI text)

--- 2. Apps Hub: Review Summary API ---
✓ PASS - Apps Hub: Summary endpoint HTTP 200
✓ PASS - Apps Hub: Summary schema valid (Avg: 0, Count: 0)

--- 3. Customer Login & Review Creation on Apps Hub ---
✓ PASS - Apps Hub: Customer login successful (User: Verified Merchant (customer@example.com))
✓ PASS - Apps Hub: customer_session cookie issued (Cookie present)
✓ PASS - Apps Hub: Customer posted 5-star review (Review ID: 32b786e5-f241-431e-a82b-ab896ec97841)

--- 4. Verify Reviews List & Verified Install Badge ---
✓ PASS - Apps Hub: Posted review appears in listing (Reviews count: 1)
✓ PASS - Apps Hub: Review has Verified Install badge (isVerified: true)

--- 5. Verify Summary Update & Micro-cache ---
✓ PASS - Apps Hub: Summary updated after review creation (Total: 1, Avg: 5)

--- 6. Helpful Vote Toggle ---
✓ PASS - Apps Hub: Helpful vote toggled (incremented) (Helpful count: 1, User voted: true)

--- 7. Rate Limiting / Duplicate Check ---
✓ PASS - Apps Hub: Rejects duplicate review from same user (Status: 409, Error: You have already submitted a review for this listing. You can edit your existing review.)

--- 8. Edit Own Review ---
✓ PASS - Apps Hub: Customer edited own review (Success: true)

--- 9. Nasrify Team Login & Response ---
✓ PASS - Apps Hub: Nasrify Team login successful (User: admin@example.com, isTeam: true)
✓ PASS - Apps Hub: Nasrify Team replied to review (Success: true)

--- 10. Branding Check: 'Nasrify Team' in UI ---
✓ PASS - Apps Hub: /super/pending shows 'Nasrify Team' (Found 'Nasrify Team' header)
✓ PASS - Apps Hub: /super/pending does NOT show 'Super Admin' in UI (No Super Admin branding in visible HTML)

--- 11. Delete Own Review ---
✓ PASS - Apps Hub: Customer deleted own review (Deleted ID: 32b786e5-f241-431e-a82b-ab896ec97841)

--- 12. Themes Hub Marketplace Reviews Full Cycle ---
✓ PASS - Themes Hub: Customer login successful (User: customer@example.com)
✓ PASS - Themes Hub: Customer posted 5-star review for theme (Theme Review ID: 46ceae5c-9920-4618-9298-39909d4fe2d6)
✓ PASS - Themes Hub: Posted review appears with Verified Install (Verified: true)
✓ PASS - Themes Hub: Nasrify Team reply recorded (Success: true)
✓ PASS - Themes Hub: /super/pending shows 'Nasrify Team' (Found 'Nasrify Team' header in Themes Hub)
✓ PASS - Themes Hub: /super/pending does NOT show 'Super Admin' in UI (No Super Admin branding in visible HTML)

--- 13. Data Safety Check ---
✓ PASS - Data Safety: Reviews are persistent and independent of installs (Review ID 46ceae5c-9920-4618-9298-39909d4fe2d6 remains intact in database)

================================================================================
 VERIFICATION RESULTS: 26/26 PASSED (0 FAILED)
================================================================================
```

---

## 5. Data Safety & Persistence
Reviews are modeled independently in `marketplace_reviews`. During testing, apps/themes install status changes or uninstalls never cascade delete review content, ratings, or helpful votes. Reviews remain preserved with full historical integrity.
