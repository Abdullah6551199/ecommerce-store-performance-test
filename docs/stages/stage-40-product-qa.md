# Stage 40 — Product Q&A Modular App

## 1. Overview & Objectives
Stage 40 introduces the **Product Q&A** modular app (`apps/product-qa/`). Customers and guests can ask questions directly on product pages; store administrators can answer, accept, pin, hide, or delete questions; and the community can upvote helpful questions and answers with duplicate vote prevention. All records are stored directly in Cloudflare D1 (`ecommerce-perf-db`) with zero external API dependencies.

- **App ID**: `product-qa`
- **Name**: Product Q&A
- **Version**: `1.0.0`
- **Category**: Engagement & Customer Support
- **Database Tables**: `product_questions`, `product_answers`, `product_qa_upvotes` (Migration `0024_stage_40_product_qa.sql`)
- **Permissions**: `read:products`, `read:customers`, `write:settings`
- **Extension Points**:
  - `storefront.product.below`: Renders `ProductQASection` with paginated questions, answers, and modal/inline `AskQuestionForm`
  - `admin.dashboard.widget`: Renders `QADashboardWidget` with pending question count, monthly stats, and top-upvoted questions
  - `admin.product.form.below`: Renders contextual product Q&A management tab in product editing modal

---

## 2. Architecture & File Structure

```
apps/product-qa/
├── manifest.json                  # App metadata, settings schema, permissions, extension points
├── icon.svg                       # Emerald Nasrify Q&A badge icon
├── shared/
│   └── types.ts                   # TypeScript interfaces (ProductQuestion, ProductAnswer, ProductQASettings, etc.)
├── lib/
│   ├── questions.ts               # Question CRUD, filtering, pagination, React.cache(), 20s TTL micro-cache
│   ├── answers.ts                 # Answer CRUD, acceptance toggling, React.cache()
│   └── upvotes.ts                 # Atomic toggle for question and answer upvotes with duplicate prevention
├── admin/
│   ├── ProductQAManager.tsx       # Tabbed admin interface (Pending, Published, Hidden, All) with moderation actions
│   ├── QADashboardWidget.tsx      # Admin dashboard widget showing pending count & top upvoted items
│   └── api/
│       ├── list/route.ts          # Admin questions query with filtering & pagination
│       ├── answer/route.ts        # Admin response posting & answer deletion
│       ├── update-status/route.ts # Status updates (published, hidden, pending) and pin/unpin toggles
│       ├── delete/route.ts        # Cascade question and answers deletion
│       └── stats/route.ts         # High-level Q&A aggregate metrics
└── storefront/
    ├── ProductQASection.tsx       # Main Q&A product page component with pagination & upvoting
    ├── AskQuestionForm.tsx        # Customer/guest question submission modal with validation
    ├── QuestionItem.tsx           # Individual question card with threaded answers and upvote button
    └── api/
        ├── questions/route.ts     # Public questions endpoint for product page
        ├── ask/route.ts           # Customer & guest question submission handler
        └── upvote/route.ts        # Question/answer upvoting endpoint
```

---

## 3. Database Schema (Migration 0024)

Created in `drizzle/migrations/0024_stage_40_product_qa.sql` and applied to both remote and local Cloudflare D1:

- **`product_questions`**:
  - `id`: TEXT PRIMARY KEY
  - `product_id`: TEXT NOT NULL
  - `customer_id`: TEXT (nullable for guest)
  - `customer_name`: TEXT NOT NULL
  - `customer_email`: TEXT NOT NULL
  - `question`: TEXT NOT NULL
  - `status`: TEXT DEFAULT 'pending' (`pending` | `published` | `hidden`)
  - `answer_count`: INTEGER DEFAULT 0
  - `upvote_count`: INTEGER DEFAULT 0
  - `is_pinned`: INTEGER DEFAULT 0
  - `created_at`: INTEGER
  - `updated_at`: INTEGER

- **`product_answers`**:
  - `id`: TEXT PRIMARY KEY
  - `question_id`: TEXT NOT NULL
  - `author_type`: TEXT NOT NULL (`admin` | `customer` | `nasrify_team`)
  - `author_id`: TEXT
  - `author_name`: TEXT NOT NULL
  - `answer`: TEXT NOT NULL
  - `status`: TEXT DEFAULT 'published' (`published` | `hidden`)
  - `upvote_count`: INTEGER DEFAULT 0
  - `is_accepted`: INTEGER DEFAULT 0
  - `created_at`: INTEGER
  - `updated_at`: INTEGER

- **`product_qa_upvotes`**:
  - `id`: TEXT PRIMARY KEY
  - `target_type`: TEXT NOT NULL (`question` | `answer`)
  - `target_id`: TEXT NOT NULL
  - `customer_id`: TEXT
  - `customer_email`: TEXT
  - `created_at`: INTEGER
  - UNIQUE(`target_type`, `target_id`, `customer_email`)

- **Performance Indexes**:
  - `idx_qa_questions_product_id` on `product_questions(product_id)`
  - `idx_qa_questions_status` on `product_questions(status)`
  - `idx_qa_answers_question_id` on `product_answers(question_id)`
  - `idx_qa_upvotes_target` on `product_qa_upvotes(target_type, target_id)`

---

## 4. Settings Schema & Configurable Constraints

Configured in `manifest.json` and editable via `/admin/apps/product-qa`:
- **`enabled`** (boolean, default: `true`): Toggles public Q&A display on storefront.
- **`requireLogin`** (boolean, default: `false`): When `true`, blocks unauthenticated guest submissions with 401.
- **`autoPublish`** (boolean, default: `false`): When `true`, questions skip moderation and publish immediately.
- **`allowGuestQuestions`** (boolean, default: `true`): Permissive guest question posting.
- **`showUpvotes`** (boolean, default: `true`): Controls display of community upvoting buttons.
- **`maxQuestionsPerProduct`** (number, default: `50`, min: `5`, max: `500`): Rate-limiting ceiling per product.
- **`questionsPerPage`** (number, default: `10`, min: `5`, max: `50`): Pagination chunk size.
- **`notifyAdminOnNewQuestion`** (boolean, default: `true`): Triggers notification event stub.

---

## 5. SEO Rich Results Integration

Implemented in `lib/seo.ts` and `nasrify-store/app/product/[slug]/page.tsx`:
- Generates JSON-LD schema with `@type: "QAPage"` and an array of `@type: "Question"` with nested `@type: "Answer"`.
- Published questions and accepted/top answers are rendered in `<script type="application/ld+json">`.
- Complies with Google Rich Results for FAQ and Q&A page specifications to boost organic search rankings.

---

## 6. Data Safety & App Lifecycle

- **Uninstall**: Invoking `POST /api/admin/apps/uninstall` disables the app and sets `enabled = 0`. The database tables `product_questions`, `product_answers`, and `product_qa_upvotes` are **strictly preserved**.
- **Storefront Gate**: When disabled, storefront endpoints return `{ disabled: true }` and the UI cleanly omits the section.
- **Reinstall**: Reinstalling via `POST /api/admin/apps/install` immediately reactivates the app with all questions, answers, and upvote tallies intact.

---

## 7. Edge Deployment & Verification Summary

### Workers Deployed
- **`nasrify-admin`**: `0543cff1-61ac-404e-9a01-4f5b8163b59f` (Upload: 11609.12 KiB / gzip: 2021.27 KiB)
- **`nasrify-store`**: `149c330c-e0b5-4b76-afe0-1a8407a32ba5` (Upload: 10675.55 KiB / gzip: 1964.70 KiB)
- **`nasrify-apps`**: `cb734245-3595-4290-ba6f-ee99ebafaa22` (Upload: 6537.00 KiB / gzip: 1302.46 KiB)

### Live Test Suite Results (`scripts/verify-stage-40.ts`)
```
Total Checks: 19
Passed:       19
Failed:       0

🎉 ALL 19 CHECKS PASSED LIVE ON EDGE!
```
- [x] App appears in `/admin/apps` registry
- [x] Install → Enabled
- [x] Settings form renders with schema validation
- [x] Customer/guest posts question (status: pending/published)
- [x] Admin views question in `/admin/product-qa`
- [x] Admin answers question with official badge
- [x] Customer upvotes question (count increments)
- [x] Customer upvotes answer (count increments)
- [x] Pin question to top of list
- [x] Hide question (disappears from storefront)
- [x] Delete question removes question and answers
- [x] Guest question submission allowed when configured
- [x] `requireLogin = true` blocks guests (401)
- [x] JSON-LD schema present in storefront product HTML
- [x] Uninstall app → storefront gates output
- [x] Reinstall app → all questions and answers restored
- [x] Data safety confirmed across D1 tables
