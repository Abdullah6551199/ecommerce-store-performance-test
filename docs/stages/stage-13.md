# Stage 13: Analytics Dashboard + Smart Pattern Insights + Dark/Light Mode

## Overview
Stage 13 introduces a production-grade analytics intelligence dashboard into the administrator control panel for `ecommerce-store-perf-test` (https://ecommerce-store-perf-test.zia291930.workers.dev). It equips store operators with real-time telemetry, historical trends, customer lifetime metrics, and automated pattern recognition insights, paired with full dark and light mode storefront theme support.

---

## 1. What Was Built in Stage 13

1. **Executive KPI Suite**:
   - Total Gross Revenue with percentage delta versus prior period.
   - Total Orders count with completed checkout telemetry.
   - Average Order Value (AOV) basket health metrics.
   - Estimated Storefront Conversion Rate.
   - Time-range selector supporting: Today, Last 7 Days, Last 30 Days, Last 90 Days, Last 12 Months, and All Time.

2. **Interactive Visual Charts**:
   - **Sales Trend Area Chart**: Time-series revenue chart with interactive hover tooltips, SVG gradients, and dynamic axis scaling.
   - **Order Status Distribution Chart**: Visual breakdown of order states (Pending, Confirmed, Processing, Shipped, Delivered, Cancelled).
   - **Category Revenue Bar Chart**: Horizontal bar visualization showing revenue distribution and percentage contribution across catalog categories.

3. **Catalog & Customer Analytics Tables**:
   - Top 5 best-selling products ranked by units sold and revenue contribution.
   - Recent customer transactions table with fulfillment statuses.

4. **Automated Smart Pattern Insights**:
   - Heuristic evaluation of historical sales velocity and order distribution.
   - Day-of-week behavioral analysis (e.g. weekend shopping surges).
   - Inventory velocity alert triggers for fast-depleting SKUs.
   - Actionable recommendations with clear urgency badges.

5. **Storefront & Admin Dark / Light Mode System**:
   - Theme toggle component with smooth transition states.
   - LocalStorage theme preference persistence with system preference fallback.
   - High-contrast Tailwind color tokens across both light (`bg-white`, `text-zinc-900`) and dark (`bg-[#0c140f]`, `text-white`) modes.

---

## 2. The 8 Analytics API Endpoints

All analytics endpoints are protected by administrator session verification (`getCurrentAdmin`), return JSON payloads, and enforce private no-store cache headers.

| Endpoint | Method | Query Parameters | Description |
|---|---|---|---|
| `/api/admin/analytics/kpis` | GET | `period` (`today`, `last_7_days`, `last_30_days`, `last_90_days`, `last_12_months`, `all`) | Computes revenue, orders, AOV, and conversion rate for selected period with prior-period comparison deltas. |
| `/api/admin/analytics/sales-trend` | GET | `period` | Aggregates daily/hourly sales timestamps into chronological buckets for time-series charting. |
| `/api/admin/analytics/categories` | GET | `period` | Calculates revenue and unit volume grouped by product category. |
| `/api/admin/analytics/top-products` | GET | `limit` (default: 5) | Ranks products by sales volume, units sold, and stock availability status. |
| `/api/admin/analytics/insights/today` | GET | None | Runs real-time rule engine on current day data to generate prioritized operational alerts. |
| `/api/admin/analytics/patterns/weekly` | GET | None | Analyzes order frequency and revenue across Monday through Sunday. |
| `/api/admin/analytics/patterns/monthly` | GET | None | Evaluates month-by-month seasonality and revenue trends. |
| `/api/admin/analytics/patterns/yearly` | GET | None | Long-term annual revenue comparison and trajectory analysis. |

---

## 3. Smart Pattern Insights Logic

The smart pattern engine (`lib/analytics.ts`) implements rule-based heuristic analyzers that run against D1 order data:

1. **Peak Purchasing Windows**:
   - Computes order frequency by day of week.
   - Identifies the highest-performing day (e.g. "Saturday Peak") and generates tailored promotional scheduling tips.

2. **Average Order Value Deviations**:
   - Compares the active period's AOV against the 90-day moving baseline.
   - Triggers basket-size insights when customer cart values increase or drop beyond standard deviations.

3. **Stock Depletion Acceleration**:
   - Cross-references unit sales momentum in the last 7 days against remaining inventory stock levels.
   - Issues warnings for catalog items likely to stock out within 48-72 hours.

4. **Order Status Bottleneck Alerts**:
   - Flags abnormal ratios of orders remaining in `pending` or `processing` states for over 24 hours without advancing to `shipped`.

---

## 4. Dark/Light Mode Implementation

### Architecture
1. **Document Class Management**:
   - Theme toggle component toggles the `dark` class on `document.documentElement`.
   - Theme state persists in `localStorage.theme` (`"dark"` | `"light"`).
   - Automatically respects the user's OS preference (`prefers-color-scheme: dark`) when no stored preference exists.

2. **High-Contrast Design System**:
   - **Backgrounds**: `bg-white dark:bg-[#0c140f]` (surfaces: `bg-zinc-50 dark:bg-white/5`).
   - **Borders**: `border-zinc-200 dark:border-white/10`.
   - **Typography**: Primary `text-zinc-900 dark:text-white`, secondary `text-zinc-600 dark:text-white/70`, muted `text-zinc-500 dark:text-white/50`.
   - **Form Controls**: Inputs, selects, and textareas use `bg-white dark:bg-black/40 text-zinc-900 dark:text-white border-zinc-300 dark:border-white/15`.
   - **Charts**: SVGs dynamically adapt grid line opacities, axis labels, and tooltip styling according to the active theme.

---

## 5. Issues Encountered and Resolutions

1. **Invisible Text in Light Mode**:
   - *Issue*: Elements with hardcoded `text-white` or dark backgrounds rendered as white-on-white when `dark` class was absent in light mode.
   - *Resolution*: Audited all storefront and admin components, replacing single-color classes with paired Tailwind utility classes (`text-zinc-900 dark:text-white`).

2. **Donut Chart Label Overflow**:
   - *Issue*: In the Order Status Distribution donut chart, long status names (`Processing`, `Delivered`) overflowed their SVG boundaries on smaller viewport widths.
   - *Resolution*: Truncated label text (e.g., `Proc.`, `Deliv.`), added SVG hover tooltips displaying exact counts and percentages, and enclosed legends in responsive CSS flex grids.

3. **Server Component Latency in Admin Navigation**:
   - *Issue*: Page transitions between admin modules incurred full server roundtrips.
   - *Resolution*: Converted all 10 admin pages under `app/admin/(dashboard)/*` to Client-Side Rendering (`"use client"`), fetching cached JSON APIs with responsive skeleton loaders.
