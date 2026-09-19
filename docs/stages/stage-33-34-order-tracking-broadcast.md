# Stage 33+34 Documentation: Modular Order Tracking & Broadcast Notifications Apps Conversion

## 1. Overview & Objective
Converted the core Nasrify **Order Tracking** and **Broadcast Notifications** features into modular, installable, and configurable applications under the Nasrify Apps Framework at `apps/order-tracking/` and `apps/broadcast/`.

Both applications implement worker scope isolation (`nasrify-admin` vs `nasrify-store`), wire into platform extension points, maintain 100% backward compatibility via root re-exports, guarantee data safety across uninstall/reinstall lifecycles, adhere to permanent performance rules (React.cache, date-bounding, strict LIMIT, no SELECT *, SQL aggregations, 20s micro-cache, cross-worker invalidation), and introduce zero new npm dependencies.

---

## 2. File Inventory: Before vs After

### Part A: Order Tracking App Inventory
#### 1. Pre-Stage 33 Inventory
- `lib/orders.ts`: Core order status transition handling, courier information, tracking number assignment, and customer notification dispatch.
- `components/OrderStatusTimeline.tsx`: Storefront visual 6-stage order progression timeline.
- `app/track-order/page.tsx`: Storefront customer-facing order tracking portal with query string resolution.
- `app/account/orders/[id]/page.tsx` & `app/account/layout.tsx`: Customer account order details and navigation menu linking to tracking.
- `components/admin/OrdersManager.tsx`: Administrative order status updating, courier assignment, and waybill recording.
- `Database Tables/Columns`: `orders` table with `status`, `courierName`, `trackingNumber`, `estimatedDelivery`, `statusNotes`, `updatedAt`.

#### 2. Files Created (`apps/order-tracking/`)
- `apps/order-tracking/manifest.json`: App metadata, permissions (`read:orders`, `write:orders`, `read:customers`, `send:notifications`), extension points (`storefront.account.menu`, `admin.order.detail.below`), empty `databaseTables` (leverages existing orders table), and settings schema (`enablePublicTracking`, `enableAutoNotifications`, `showCourierField`, `showTimeline`, `timelineStages`, `estimatedDeliveryDays`).
- `apps/order-tracking/icon.svg`: Vector icon representing delivery truck and package tracking.
- `apps/order-tracking/shared/types.ts`: Strongly typed interfaces (`OrderTrackingAppSettings`, `TrackedOrder`, `TrackedOrderItem`, `TimelineStepDef`).
- `apps/order-tracking/lib/order-tracking.ts`: Micro-cached order tracking queries, React.cache(), date-bounding, strict LIMIT, no SELECT *, non-blocking customer notifications, and cross-worker cache invalidation.
- `apps/order-tracking/admin/OrderTrackingSettings.tsx`: Dedicated admin configuration interface for Order Tracking settings.
- `apps/order-tracking/admin/api/update-status/route.ts`: Secure admin API route for updating order tracking status, courier info, and waybill number.
- `apps/order-tracking/storefront/OrderTimeline.tsx`: Configurable 6-stage visual timeline component with timestamps, icons, and active state highlights.
- `apps/order-tracking/storefront/TrackOrderPage.tsx`: Public CSR tracking search interface accepting either Order ID or Courier Tracking Number without requiring authentication.
- `apps/order-tracking/storefront/api/track/route.ts`: Public tracking API route with 20s micro-cache.

#### 3. Root Re-Exports & Compatibility Wrappers
- `lib/orders.ts`: Re-exports tracking functions (`trackOrder`, `updateOrderTrackingStatus`, `getOrderTrackingSettings`, `invalidateTrackingCache`) from `@/apps/order-tracking/lib/order-tracking`.
- `components/OrderStatusTimeline.tsx`: Re-exports from `@/apps/order-tracking/storefront/OrderTimeline`.
- `app/track-order/page.tsx`: Re-exports `@/apps/order-tracking/storefront/TrackOrderPage`.
- `app/api/order-tracking/track/route.ts`: Delegates public tracking requests to app storefront handler.
- `app/api/admin/order-tracking/update-status/route.ts`: Delegates admin updates to app admin handler.
- `app/account/layout.tsx`: Gated navigation link for Track Order respecting app active state.

---

### Part B: Broadcast App Inventory
#### 1. Pre-Stage 34 Inventory
- `lib/broadcasts.ts`: Broadcasts database operations, views tracking, active campaign queries, and metrics aggregation.
- `components/admin/BroadcastManager.tsx`: Administrative campaign creator, editor, activation toggles, live mockup preview, and performance stats table.
- `components/BroadcastPopup.tsx`: Storefront floating banner/modal overlay displaying active announcements to visitors.
- `app/admin/(dashboard)/broadcasts/page.tsx`: Admin dashboard broadcast management view.
- `app/api/admin/broadcasts/route.ts`, `app/api/admin/broadcasts/[id]/route.ts`, `app/api/admin/broadcasts/stats/route.ts`: Admin broadcast management endpoints.
- `app/api/broadcasts/active/route.ts`, `app/api/broadcasts/mark-viewed/route.ts`: Storefront active campaign and view impression endpoints.
- `Database Tables`: `broadcasts`, `broadcast_views`.

#### 2. Files Created (`apps/broadcast/`)
- `apps/broadcast/manifest.json`: App metadata, permissions (`read:customers`, `read:settings`), extension points (`storefront.floating`, `admin.dashboard.widget`), database tables declaration (`broadcasts`, `broadcast_views`), and settings schema (`enablePopup`, `popupPosition`, `popupDelaySeconds`, `showOncePerCustomer`, `enableExpiryDate`, `maxActiveBroadcasts`).
- `apps/broadcast/icon.svg`: Vector icon representing a megaphone broadcast announcement.
- `apps/broadcast/shared/types.ts`: Strongly typed interfaces (`BroadcastAppSettings`, `BroadcastItem`, `BroadcastAdminItem`, `BroadcastStorefrontData`, `CreateBroadcastInput`).
- `apps/broadcast/lib/broadcasts.ts`: Micro-cached broadcast operations, SQL aggregations (`count(*)`, `sum(case when is_dismissed then 1 else 0 end)`), auto-expiry validation against UTC `now()`, cross-worker cache invalidation, and strict column projection.
- `apps/broadcast/admin/BroadcastManager.tsx`: Interactive administrative management suite with campaign status indicators, impression metrics, and visual banner preview.
- `apps/broadcast/admin/api/list/route.ts`: Administrative listing endpoint with aggregation metrics.
- `apps/broadcast/admin/api/create/route.ts`: Campaign creation endpoint with automatic cross-worker invalidation.
- `apps/broadcast/admin/api/update/route.ts`: Campaign update endpoint.
- `apps/broadcast/admin/api/delete/route.ts`: Campaign deletion endpoint.
- `apps/broadcast/admin/api/stats/route.ts`: Aggregate performance metrics endpoint.
- `apps/broadcast/storefront/BroadcastPopup.tsx`: Responsive floating announcement popup respecting delay, position (`top` | `center` | `bottom`), and one-time display preferences.
- `apps/broadcast/storefront/api/active/route.ts`: Public storefront endpoint returning the prioritized active broadcast campaign.
- `apps/broadcast/storefront/api/mark-viewed/route.ts`: Impression recording endpoint tracking views and dismissals.

#### 3. Root Re-Exports & Compatibility Wrappers
- `lib/broadcasts.ts`: Re-exports all broadcast operations from `@/apps/broadcast/lib/broadcasts`.
- `components/admin/BroadcastManager.tsx`: Re-exports from `@/apps/broadcast/admin/BroadcastManager`.
- `components/BroadcastPopup.tsx`: Re-exports from `@/apps/broadcast/storefront/BroadcastPopup`.
- `app/admin/(dashboard)/broadcasts/page.tsx`: Renders `@/apps/broadcast/admin/BroadcastManager`.
- `app/api/admin/broadcasts/*`: Re-exports and delegates to app admin API handlers.
- `app/api/broadcasts/*`: Re-exports and delegates to app storefront API handlers.
- `components/apps/StorefrontFloatingClient.tsx`: Mounts `BroadcastPopup` on `storefront.floating` only when Broadcast app is installed and active.
- `components/StorefrontOverlays.tsx`: Unconditional hardcoded `BroadcastPopup` removed in favor of extension point gating.

---

## 3. Platform Extension Points & Registration

| App ID | Extension Point | Component Loaded | Gating & Visibility |
| :--- | :--- | :--- | :--- |
| `order-tracking` | `storefront.account.menu` | Track Order Link | Rendered in customer account navigation when app enabled. |
| `order-tracking` | `admin.order.detail.below` | OrderTrackingSettings | Rendered beneath order details in admin console. |
| `broadcast` | `storefront.floating` | BroadcastPopup | Dynamically mounted in `StorefrontFloatingClient` with delay & position rules. |
| `broadcast` | `admin.dashboard.widget` | BroadcastManager | Rendered in admin operations dashboard and dedicated `/admin/broadcasts`. |

---

## 4. Settings Schemas

### Order Tracking Settings (`order-tracking`)
- `enablePublicTracking`: Boolean (default: `true`) — Enables public `/track-order` lookup without customer login.
- `enableAutoNotifications`: Boolean (default: `true`) — Dispatches non-blocking customer notifications on status changes.
- `showCourierField`: Boolean (default: `true`) — Displays courier name in tracking details.
- `showTimeline`: Boolean (default: `true`) — Displays the graphical 6-stage timeline.
- `timelineStages`: String (default: `"Pending,Confirmed,Packed,Shipped,Out for Delivery,Delivered"`) — Comma-separated list of milestone stages.
- `estimatedDeliveryDays`: Number (default: `5`, min: 1, max: 30) — Default turnaround window calculation.

### Broadcast Settings (`broadcast`)
- `enablePopup`: Boolean (default: `true`) — Master switch for storefront popup displays.
- `popupPosition`: Select (`"top"` | `"center"` | `"bottom"`, default: `"top"`) — Screen positioning for announcement overlay.
- `popupDelaySeconds`: Number (default: `3`, min: 0, max: 30) — Delay before popup appears to visitor.
- `showOncePerCustomer`: Boolean (default: `true`) — Suppresses reappearance within the same browsing session once dismissed.
- `enableExpiryDate`: Boolean (default: `true`) — Automatically hides expired broadcasts.
- `maxActiveBroadcasts`: Number (default: `1`, min: 1, max: 5) — Maximum concurrent active campaigns displayed.

---

## 5. Permanent Rules & Architectural Adherence

1. **Authentication & Authorization**:
   - Explicit session token extraction and pass-through to `getCurrentAdmin(sessionToken)` across all admin routes.
   - Public tracking endpoint `/api/order-tracking/track` requires no authentication, allowing customers to look up orders securely by order ID or courier waybill.
2. **Micro-Caching & Invalidation**:
   - 20-second in-memory micro-cache on public tracking queries and active broadcast endpoints.
   - Cross-worker invalidation triggered immediately on order status updates or broadcast campaign changes.
3. **Database Performance & Aggregations**:
   - No `SELECT *`; all queries project explicit column sets.
   - Date-bounding (`datetime('now')`) and strict `LIMIT 1` / `LIMIT 20` clauses.
   - Broadcast statistics computed via SQL aggregation (`count(*)`, `sum(case when is_dismissed then 1 else 0 end)`) rather than in-memory loops.
4. **Data Safety & Migration Integrity**:
   - Neither the `orders` table nor the `broadcasts` / `broadcast_views` tables are dropped or modified upon uninstallation.
   - Uninstallation cleanly decouples the components from extension points (`data: null`).
   - Reinstallation immediately restores access to all historical order tracking records and broadcast campaigns.
5. **Zero Dependencies & Clean Code**:
   - Zero new npm packages added.
   - Production builds contain zero `console.log` statements.
