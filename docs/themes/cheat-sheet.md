# Nasrify Themes Framework — Quick Reference Cheat Sheet

## CLI Commands

### Run Migrations
```bash
# Local
npx wrangler d1 execute ecommerce-perf-db --local --file="drizzle/migrations/0027_stage_42_themes_framework.sql"

# Remote
npx wrangler d1 execute ecommerce-perf-db --remote --file="drizzle/migrations/0027_stage_42_themes_framework.sql"
```

### Seed Default Theme
```bash
npx tsx scripts/seed-stage-42-theme.ts
```

### Run Live Verification
```bash
npx tsx scripts/verify-stage-42-live.ts
```

---

## API Endpoints

### Storefront APIs
| Endpoint | Method | Cache | Description |
|---|---|---|---|
| `/api/themes/active` | GET | `public, max-age=60` | Returns currently active theme configuration & metadata |
| `/api/cache/invalidate` | POST | Dynamic (Auth required) | Purges edge HTML cache & resets isolate memory cache |

### Admin APIs
| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/admin/themes` | GET | Admin Cookie | List all themes (`filter=all\|builtin\|custom`) |
| `/api/admin/themes/[id]` | GET | Admin Cookie | Fetch theme details, settings, and audit log |
| `/api/admin/themes/[id]/duplicate` | POST | Admin Cookie | Clones theme to a new customizable draft |
| `/api/admin/themes/activate` | POST | Admin Cookie | Sets active theme and triggers storefront invalidation |
| `/api/admin/themes/[id]` | DELETE | Admin Cookie | Deletes custom theme (built-in themes protected) |

---

## Theme JSON Structure
```json
{
  "schema_version": "1.0",
  "name": "My Theme",
  "version": "1.0.0",
  "description": "Theme summary",
  "category": "minimal",
  "is_built_in": 0,
  "settings": {
    "colors": { "primary": "#18181B", "secondary": "#52525B", "accent": "#2563EB", "background": "#FFFFFF", "surface": "#F4F4F5", "text": "#18181B", "text_muted": "#71717A", "border": "#E4E4E7" },
    "fonts": { "heading": "Inter", "body": "Inter" },
    "layout": { "container_width": "1280px", "section_spacing": "64px", "border_radius": "8px" }
  },
  "sections": [
    { "id": "sec-hero", "type": "hero", "variant": "full_image", "enabled": true, "settings": { ... } }
  ]
}
```

---

## CSS Variables Injected
- `--theme-primary`
- `--theme-secondary`
- `--theme-accent`
- `--theme-background`
- `--theme-surface`
- `--theme-text`
- `--theme-text-muted`
- `--theme-border`
- `--theme-font-heading`
- `--theme-font-body`
- `--theme-container-width`
- `--theme-section-spacing`
- `--theme-border-radius`
