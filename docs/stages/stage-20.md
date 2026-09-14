# Stage 20: Tax Management + Shipping Zones

## Overview
Stage 20 delivers an end-to-end, high-performance **Tax Management** and **Shipping Zones** engine for the `ecommerce-store-perf-test` production platform. 
The system combines manual store owner controls with automated Cloudflare visitor IP detection, dynamic inclusive/exclusive tax calculations, tax-on-shipping policies, reorderable multi-region shipping zones, delivery time window estimations, and live checkout recalculation.

---

## 1. Scope & Environment Parameters
- **Target Environment**: `ecommerce-store-perf-test` (Cloudflare Worker)
- **Live Worker URL**: `https://ecommerce-store-perf-test.zia291930.workers.dev`
- **Repository**: `Abdullah6551199/ecommerce-store-performance-test`
- **D1 Database**: `ecommerce-perf-db`
- **Design System**: Chronicles Purple System (`#960DF2`, `#AB3DF5`, `#3C0561`, `#EACFFC`), adhering strictly to the Zero Green Policy across all admin and customer storefront interfaces.

---

## 2. PART A: Tax Management Architecture

### 2.1 Database Schema (`0012_stage20_tax_shipping.sql`)
```sql
CREATE TABLE IF NOT EXISTS tax_rates (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  country TEXT NOT NULL,          -- ISO-3166 2-letter country code
  state TEXT,                      -- State/Province code (optional)
  city TEXT,                       -- City (optional for local tax)
  rate REAL NOT NULL,              -- Tax percentage
  label TEXT,                      -- e.g. "GST", "VAT", "Sales Tax"
  tax_type TEXT DEFAULT 'exclusive', -- 'inclusive' or 'exclusive'
  is_active INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(country, state, city)
);

CREATE TABLE IF NOT EXISTS tax_settings (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  is_enabled INTEGER DEFAULT 1,
  default_rate REAL DEFAULT 0,
  default_label TEXT DEFAULT 'Tax',
  default_tax_type TEXT DEFAULT 'exclusive',
  apply_to_shipping INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 2.2 Cloudflare Visitor IP-Based Location Detection (`lib/tax.ts`)
- Utilizes native Cloudflare Worker `request.cf` object (`cf.country`, `cf.region`, `cf.city`) with fallback to Cloudflare edge proxy headers (`cf-ipcountry`, `cf-region`, `cf-ipcity`).
- Public detection endpoint `/api/tax/detect` enables the browser client to automatically discover visitor location on checkout initial mount and pre-select destination country.

### 2.3 Tax Rate Resolution Hierarchy
When resolving the applicable tax rate for a customer, `detectTaxRate(country, state, city)` follows a strict priority chain:
1. **Exact Match**: `country + state + city`
2. **State Match**: `country + state` (with city NULL/empty)
3. **Country Match**: `country` (with state and city NULL/empty)
4. **Default Settings Fallback**: If global tax is enabled, applies store `default_rate`, `default_label`, and `default_tax_type`.

### 2.4 Inclusive vs Exclusive Tax Mathematics
- **Exclusive Tax** (e.g. Pakistan GST 17%, US Sales Tax 7.25%):
  $$\text{Tax Amount} = \text{Taxable Base} \times \left(\frac{\text{Rate}}{100}\right)$$
  $$\text{Total Due} = \text{Taxable Base} + \text{Tax Amount} + \text{Shipping}$$
- **Inclusive Tax** (e.g. UK VAT 20%):
  $$\text{Net Amount} = \frac{\text{Taxable Base}}{1 + \frac{\text{Rate}}{100}}$$
  $$\text{Tax Amount} = \text{Taxable Base} - \text{Net Amount}$$
  The tax is clearly itemized in the checkout summary as `Tax Included (VAT 20%): $X.XX`.
- **Tax on Shipping**: When `apply_to_shipping` is enabled in `tax_settings`, the shipping cost is added to the taxable base prior to computing exclusive or inclusive taxes.

### 2.5 Pre-seeded Official Tax Rates
| ID | Country | State | City | Rate (%) | Label | Tax Type | Status |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `tax_pk_default` | **PK** | NULL | NULL | 17.00 | GST | Exclusive | Active |
| `tax_in_default` | **IN** | NULL | NULL | 18.00 | GST | Exclusive | Active |
| `tax_us_ca` | **US** | CA | NULL | 7.25 | Sales Tax | Exclusive | Active |
| `tax_us_ny` | **US** | NY | NULL | 4.00 | Sales Tax | Exclusive | Active |
| `tax_us_tx` | **US** | TX | NULL | 6.25 | Sales Tax | Exclusive | Active |
| `tax_us_default` | **US** | NULL | NULL | 0.00 | Sales Tax | Exclusive | Active |
| `tax_gb_default` | **GB** | NULL | NULL | 20.00 | VAT | Inclusive | Active |
| `tax_ae_default` | **AE** | NULL | NULL | 5.00 | VAT | Exclusive | Active |
| `tax_sa_default` | **SA** | NULL | NULL | 15.00 | VAT | Exclusive | Active |
| `tax_bd_default` | **BD** | NULL | NULL | 15.00 | VAT | Exclusive | Active |

---

## 3. PART B: Shipping Zones System

### 3.1 Database Schema
```sql
CREATE TABLE IF NOT EXISTS shipping_zones (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  name TEXT NOT NULL,
  countries TEXT NOT NULL,         -- JSON array of country codes (e.g. '["PK"]')
  states TEXT,                     -- JSON array of state codes (optional)
  rate_type TEXT DEFAULT 'flat',   -- 'flat', 'percentage', 'free'
  rate REAL DEFAULT 0,
  free_shipping_threshold REAL,   -- Free shipping if order >= threshold
  min_order_value REAL,           -- Minimum subtotal required for zone
  delivery_time_min INTEGER,      -- Min delivery days
  delivery_time_max INTEGER,      -- Max delivery days
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 3.2 Pre-seeded Shipping Zones
1. **Pakistan Domestic**: `["PK"]`, $5.00 Flat rate, Free over $100, 2-3 business days.
2. **South Asia**: `["IN","BD","LK","NP"]`, $15.00 Flat rate, Free over $150, 4-7 business days.
3. **Middle East**: `["AE","SA","QA","KW","BH","OM"]`, $20.00 Flat rate, Free over $200, 3-5 business days.
4. **North America**: `["US","CA","MX"]`, $25.00 Flat rate, Free over $250, 5-10 business days.
5. **Europe**: `["GB","DE","FR","IT","ES","NL","BE","SE"]`, $25.00 Flat rate, Free over $250, 5-8 business days.
6. **Rest of World**: `["*"]`, $35.00 Flat rate, 7-14 business days.

### 3.3 Zone Calculation & Unserviceable Fallback
1. Evaluates active zones according to `sort_order` ASC.
2. Matches exact country + state, then country, then wildcard `*`.
3. Checks free shipping thresholds and coupon free-shipping overrides.
4. If a destination is outside all defined zones, returns `shippingAvailable: false`. Checkout disables order placement and displays `Shipping not available to this location`.

---

## 4. PART C: API Reference

### 4.1 Admin Tax Endpoints (Protected)
- `GET /api/admin/tax/rates`: List all tax rates with search, active/inactive filters, and sorting.
- `POST /api/admin/tax/rates`: Create custom tax rate with country, state, rate, and type.
- `PUT /api/admin/tax/rates/[id]`: Update existing rate.
- `DELETE /api/admin/tax/rates/[id]`: Remove rate.
- `GET /api/admin/tax/settings`: Get store-wide tax configuration.
- `PUT /api/admin/tax/settings`: Update store-wide tax toggle, default rate, label, and shipping tax policy.
- `POST /api/admin/tax/presets/[country]`: One-click preset loader for PK, IN, US, GB, AE, SA, BD.

### 4.2 Public Tax Endpoints
- `GET /api/tax/detect?country=PK&state=SD&city=Karachi`: Detects visitor location and returns matching tax rate.
- `POST /api/tax/calculate`: Computes authoritative cart tax breakdown given amount, shipping, and location.

### 4.3 Admin Shipping Zones Endpoints (Protected)
- `GET /api/admin/shipping-zones`: List all configured zones ordered by priority.
- `POST /api/admin/shipping-zones`: Create new zone with targeted countries/states, rate type, and delivery window.
- `PUT /api/admin/shipping-zones/[id]`: Update zone parameters.
- `DELETE /api/admin/shipping-zones/[id]`: Delete zone.
- `PUT /api/admin/shipping-zones/reorder`: Persist updated drag/arrow sort orders.
- `POST /api/admin/shipping-zones/presets`: Bulk reload standard international zones.

### 4.4 Public Shipping Endpoints
- `GET /api/shipping/zones`: Retrieve active delivery zones.
- `POST /api/shipping/calculate`: Calculate shipping cost, delivery time window, and free shipping eligibility.

---

## 5. PART D: Admin & Checkout UI Integration

### 5.1 Admin Tax Page (`/admin/settings/tax`)
- Built with `<TaxManager />` utilizing the Chronicles Purple system.
- Global Tax Settings card with toggle, fallback rate, and tax-on-shipping settings.
- Quick preset buttons for instant loading of official national rates.
- Searchable, sortable, and filterable table with active/inactive badges.
- Add / Edit modal with conditional state pickers and responsive layout.

### 5.2 Admin Shipping Zones Page (`/admin/settings/shipping-zones`)
- Built with `<ShippingZonesManager />`.
- Reorderable zone list with up/down arrows.
- Country tags / chips with fast selector buttons and custom ISO code input.
- Flat, percentage, and free rate configuration with delivery time windows.

### 5.3 Checkout Page (`/checkout`)
- Added Country and State dropdowns to Delivery Details.
- Auto-detects visitor country via Cloudflare on page load.
- Re-calculates shipping and tax in real time when destination changes.
- Displays delivery time estimate (e.g. `2-3 days`) and green `FREE` highlight on threshold qualification.
- Itemizes tax line clearly: `Tax (GST 17%): $26.35` or `Tax Included (VAT 20%): $20.00`.
- Blocks order placement if customer address has no matching shipping zone.

---

## 6. PART E: Test & Verification Results

### 6.1 Automated Test Suite (`scripts/test-stage20.ts`)
Run: `npx tsx scripts/test-stage20.ts`

| Test Category | Description | Status |
|---|---|:---:|
| **Visitor Location** | Cloudflare `request.cf` extraction (PK, SD, Karachi) | ✅ PASS |
| **Visitor Location** | Cloudflare fallback headers (`cf-ipcountry`, `cf-region`) | ✅ PASS |
| **Tax Detection** | Country-only match (Pakistan GST 17% exclusive) | ✅ PASS |
| **Tax Detection** | State-specific match (US CA 7.25% Sales Tax) | ✅ PASS |
| **Tax Detection** | State-specific match (US NY 4.0% Sales Tax) | ✅ PASS |
| **Tax Detection** | US default fallback (0.0%) | ✅ PASS |
| **Tax Detection** | Inclusive VAT match (UK 20.0% VAT inclusive) | ✅ PASS |
| **Tax Detection** | UAE 5.0% VAT match | ✅ PASS |
| **Tax Calculation** | Exclusive calculation ($100 at 17% -> $17.00 tax, $100.00 net) | ✅ PASS |
| **Tax Calculation** | Inclusive calculation ($120 at 20% -> $20.00 tax, $100.00 net) | ✅ PASS |
| **Tax Presets** | Preset existence for PK, IN, US, GB, AE, SA, BD | ✅ PASS |
| **Shipping Zones** | Pakistan Domestic under $100 ($5.00 flat, 2-3 days) | ✅ PASS |
| **Shipping Zones** | Pakistan Domestic over $100 (FREE shipping threshold) | ✅ PASS |
| **Shipping Zones** | South Asia Zone ($15.00 flat, 4-7 days) | ✅ PASS |
| **Shipping Zones** | North America Zone ($25.00 flat, 5-10 days) | ✅ PASS |
| **Shipping Zones** | Rest of World wildcard match ($35.00 flat, 7-14 days) | ✅ PASS |
| **Order Schema** | `createOrderSchema` parses country and state | ✅ PASS |
| **Total Tests** | **45 / 45 Automated Tests Passed (100%)** | ✅ **ALL PASS** |

### 6.2 Regression Verification (`scripts/test-stage16.ts`)
- All 44/44 Stage 16 tests passed (100% success rate).
- OpenNext worker build succeeded (`npm run build:worker`).
