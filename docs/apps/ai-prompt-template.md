# Nasrify Apps Framework — AI Prompt Template

Copy and paste the template below into ChatGPT, Claude, Gemini, or Antigravity to generate fully compliant, ready-to-deploy Nasrify apps.

---

```markdown
I am building a modular app for the Nasrify e-commerce platform called "<APP_NAME>".

### Technical Environment & Rules:
- Stack: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- Platform: Dual Cloudflare Worker architecture (nasrify-admin and nasrify-store) with D1 database
- App Root: `apps/<app-id>/`
- Architectural Separation:
  - Admin code goes in `admin/` (and `admin/api/` for admin endpoints)
  - Storefront code goes in `storefront/` (and `storefront/api/` for public endpoints)
  - Shared code goes in `shared/` and `lib/`
  - `lib/` must NEVER import `@/lib/auth` (admin auth belongs exclusively in `admin/api/`)
  - All interactive UI components must start with `"use client";`

### Available Permissions:
`read:products`, `write:products`, `read:orders`, `write:orders`, `read:customers`, `write:customers`, `read:settings`, `write:settings`, `read:media`, `write:media`, `read:analytics`

### Available Extension Points:
- `admin.dashboard.widget`
- `admin.sidebar`
- `admin.route`
- `storefront.header`
- `storefront.footer`
- `storefront.homepage.section`
- `storefront.product.below`
- `storefront.cart.below`
- `storefront.checkout.below`

### Manifest Schema Requirements:
Every app requires `apps/<app-id>/manifest.json` containing:
- `id`: Unique kebab-case ID
- `name`: Display name
- `version`: SemVer string (e.g. "1.0.0")
- `description`: 1-2 sentence overview
- `author`: Author or organization name
- `icon`: Relative path to SVG (e.g. "icon.svg")
- `pricing`: "free" or "paid" (with `price` if paid)
- `category`: "sales", "marketing", "tools", etc.
- `permissions`: Array of required permissions
- `extensionPoints`: Array of target extension points
- `workerScope`: { "admin": ["admin/"], "storefront": ["storefront/"], "shared": ["manifest.json", "icon.svg", "lib/", "shared/"] }
- `settingsSchema`: Optional JSON schema defining configurable settings (boolean, string, number, select)

### What the App Should Do:
<DESCRIBE YOUR APP REQUIREMENTS HERE>

### Instructions for AI:
Provide the full code for every file needed in the `apps/<app-id>/` directory:
1. `apps/<app-id>/manifest.json`
2. `apps/<app-id>/icon.svg` (Lucide-style vector icon with currentColor)
3. UI components (`admin/` and/or `storefront/`)
4. Data logic (`lib/`) and types (`shared/`)
Include full file path headers for every code block.
```
