# Apex Store Performance Budget & Core Web Vitals Standards

This document establishes the strict performance budget and Core Web Vitals thresholds for the Apex Store storefront. Every deployment is audited against these standards to prevent performance regressions.

---

## 1. Core Web Vitals & Performance Budget

| Metric | Target Budget | Monitored Routes | Measurement Strategy | Status |
| :--- | :--- | :--- | :--- | :--- |
| **LCP (Mobile)** | **< 2.5s** | `/`, `/product/*`, `/category/*`, `/search` | Lighthouse (Mobile throttled) | Enforced |
| **LCP (Desktop)** | **< 1.5s** | `/`, `/product/*`, `/category/*`, `/search` | Lighthouse (Desktop) | Enforced |
| **INP (Interaction to Next Paint)** | **< 200ms** | All storefront pages | Real-user / Lighthouse TBT proxy | Enforced |
| **CLS (Cumulative Layout Shift)** | **< 0.1** (target `< 0.01`) | All storefront pages | Lighthouse / Layout Instability API | Enforced |
| **TTFB (Time to First Byte)** | **< 800ms** | Cloudflare Edge worker | Edge CDN / Origin timing | Enforced |
| **Total Blocking Time (TBT)** | **< 200ms** | Mobile throttled | Lighthouse CPU throttling | Enforced |
| **Initial JS Payload (Homepage)** | **< 200 KB** (compressed) | `/` | Brotli/Gzip transfer size | Enforced |
| **Initial CSS Payload** | **< 50 KB** (compressed) | All pages | Tailwind compiled CSS | Enforced |
| **Total Image Payload** | **< 1.0 MB** | Critical above-the-fold | AVIF / WebP edge delivery | Enforced |
| **Initial Critical Requests** | **< 30 requests** | Initial page load | Network inspector | Enforced |

---

## 2. Architectural Guidelines to Maintain Budget

### A. Image Prioritization & LCP Discovery
1. **Elevate LCP Candidates**:
   - The primary above-the-fold image (Hero image on `/`, Category banner on `/category/*`, featured photo on `/product/*`, first product thumbnail on `/search`) must always have:
     - `priority={true}`
     - `fetchPriority="high"`
     - An explicit `<link rel="preload" as="image" href="..." fetchPriority="high">` hoisted into the document `<head>`.
2. **Deprioritize Non-Critical Content**:
   - All below-the-fold product cards and category thumbnails must retain `loading="lazy"` and `decoding="async"`.
3. **Right-Sized Dimensions**:
   - Mobile viewports should never receive images larger than 1000px width.
   - Use `sizes` attribute specifying `(max-width: 768px) 100vw, ...`.

### B. Network & Client Island Scheduling
1. **Zero Render-Blocking Initial Fetches**:
   - Do not call data-fetching APIs (like `/api/cart`) immediately during critical LCP hydration.
   - Defer secondary synchronization until browser idle (`requestIdleCallback`) or on-demand user interaction.
2. **Optimistic UI with Background Synchronization**:
   - Mutate UI state synchronously (`< 5ms`) on client actions (Add to Cart, Quantity, Remove).
   - Dispatch background network requests non-blockingly without display spinners.
   - Revert snapshot state gracefully upon network rejection.

### C. Caching Strategy
1. **Edge ISR**: Storefront pages (`/`, `/product/*`, `/category/*`) are cached at the edge with `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`.
2. **Immutable Assets**: Static JS, CSS, and media have `public, max-age=31536000, immutable`.
3. **Strict Private Bypass**: User-sensitive endpoints (`/cart`, `/checkout`, `/admin/*`) enforce `no-store` headers.

---

## 3. How to Run Audits & Automated Monitoring

### A. Run Lighthouse Audit Script
Run the automated multi-page audit suite across mobile and desktop:
```bash
node scratch/run-stage9-lighthouse.js
```
Then parse and display the performance summary table:
```bash
node scratch/parse-stage9-audits.js
```

### B. Run Perceived Latency & Core Web Vitals Benchmark
Verify that perceived latency remains below `< 100ms` and API response times comply with budget:
```bash
node scratch/verify-optimistic-flow.js
```

### C. CI/CD Enforcement
GitHub Actions automatically builds, bundles, and deploys changes to Cloudflare Workers upon every push to the `main` branch.
