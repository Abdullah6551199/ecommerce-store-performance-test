-- Migration: 0031_stage_42_6_advanced_editor.sql
-- Description: Advanced Theme Editor app schema and presets (Stage 42.6)

CREATE TABLE IF NOT EXISTS advanced_editor_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  enabled INTEGER DEFAULT 1,
  enable_custom_css INTEGER DEFAULT 1,
  enable_animations INTEGER DEFAULT 1,
  enable_responsive INTEGER DEFAULT 1,
  enable_breakpoints INTEGER DEFAULT 1,
  breakpoints TEXT DEFAULT '[{"name":"tablet","width":1024},{"name":"mobile","width":767}]',
  updated_at INTEGER
);

CREATE TABLE IF NOT EXISTS advanced_editor_presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- typography | button | shadow | animation | spacing
  preset_json TEXT NOT NULL,
  is_global INTEGER DEFAULT 0,
  created_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_advanced_presets_type ON advanced_editor_presets (type);

-- Seed default settings row
INSERT OR IGNORE INTO advanced_editor_settings (
  id, enabled, enable_custom_css, enable_animations, enable_responsive, enable_breakpoints, breakpoints, updated_at
) VALUES (
  'default', 1, 1, 1, 1, 1, '[{"name":"tablet","width":1024},{"name":"mobile","width":767}]', 1789870000000
);

-- Seed marketplace entry for Advanced Theme Editor
INSERT OR REPLACE INTO app_marketplace_listings (
  id, app_id, version, name, description, author, author_url, icon_url, category, pricing, price, status, submitted_by, submitted_at, approved_by, approved_at, rejection_reason, download_url, manifest_json, changelog, created_at, updated_at
) VALUES (
  'listing_advanced_theme_editor', 'advanced-theme-editor', '1.0.0', 'Advanced Theme Editor', 'Elementor-like visual theme customization with custom CSS, animations, and responsive controls.', 'Nasrify', 'https://nasrify.com', '/icons/advanced-theme-editor.svg', 'design', 'paid', 500, 'approved', 'system@nasrify.com', 1789870000000, 'admin@apexstore.com', 1789870000000, NULL, NULL, '{"id":"advanced-theme-editor","name":"Advanced Theme Editor","version":"1.0.0","description":"Elementor-like visual theme customization with custom CSS, animations, and responsive controls.","author":"Nasrify","authorUrl":"https://nasrify.com","icon":"icon.svg","pricing":"paid","price":500,"category":"design","permissions":["read:settings","write:settings"],"extensionPoints":["admin.theme-editor.advanced"],"databaseTables":["advanced_editor_settings","advanced_editor_presets"],"workerScope":{"admin":["admin/"],"storefront":[],"shared":["manifest.json","icon.svg","lib/","shared/"]},"settingsSchema":{"enabled":{"type":"boolean","default":true,"label":"Enable Advanced Editor"},"enableCustomCSS":{"type":"boolean","default":true,"label":"Enable Custom CSS"},"enableAnimations":{"type":"boolean","default":true,"label":"Enable Motion Effects & Animations"},"enableResponsive":{"type":"boolean","default":true,"label":"Enable Responsive Per-Breakpoint Controls"}}}', '1.0.0 — Initial release', 1789870000000, 1789870000000
);

INSERT OR REPLACE INTO app_marketplace_versions (
  id, listing_id, version, submitted_at, manifest_json, download_url, status, notes
) VALUES (
  'version_advanced_theme_editor_1_0_0', 'listing_advanced_theme_editor', '1.0.0', 1789870000000, '{"id":"advanced-theme-editor","name":"Advanced Theme Editor","version":"1.0.0","description":"Elementor-like visual theme customization with custom CSS, animations, and responsive controls.","author":"Nasrify","authorUrl":"https://nasrify.com","icon":"icon.svg","pricing":"paid","price":500,"category":"design","permissions":["read:settings","write:settings"],"extensionPoints":["admin.theme-editor.advanced"],"databaseTables":["advanced_editor_settings","advanced_editor_presets"],"workerScope":{"admin":["admin/"],"storefront":[],"shared":["manifest.json","icon.svg","lib/","shared/"]}}', NULL, 'approved', 'Initial verified release'
);

-- Seed pre-installed status
INSERT OR REPLACE INTO installed_apps (
  id, version, enabled, installed_at, updated_at
) VALUES (
  'advanced-theme-editor', '1.0.0', 1, 1789870000000, 1789870000000
);

-- Seed global style presets
INSERT OR REPLACE INTO advanced_editor_presets (id, name, type, preset_json, is_global, created_at)
VALUES
  ('preset_typo_heading', 'Modern Heading', 'typography', '{"fontFamily":"Inter","fontWeight":"700","letterSpacing":"-0.02em","lineHeight":"1.2","textTransform":"none"}', 1, 1789870000000),
  ('preset_typo_serif', 'Editorial Serif', 'typography', '{"fontFamily":"Playfair Display","fontWeight":"400","letterSpacing":"0.01em","lineHeight":"1.4","textTransform":"none"}', 1, 1789870000000),
  ('preset_typo_impact', 'Impact Display', 'typography', '{"fontFamily":"Bebas Neue","fontWeight":"400","letterSpacing":"0.05em","lineHeight":"1.0","textTransform":"uppercase"}', 1, 1789870000000),
  ('preset_btn_primary', 'Primary Solid', 'button', '{"backgroundColor":"#2563EB","textColor":"#FFFFFF","borderRadius":"8px","padding":"12px 24px","fontWeight":"600","boxShadow":"0 2px 4px rgba(0,0,0,0.1)"}', 1, 1789870000000),
  ('preset_btn_ghost', 'Outline Ghost', 'button', '{"backgroundColor":"transparent","textColor":"#2563EB","borderWidth":"2px","borderColor":"#2563EB","borderRadius":"8px","padding":"10px 22px","fontWeight":"600"}', 1, 1789870000000),
  ('preset_btn_pill', 'Pill Rounded', 'button', '{"backgroundColor":"#111827","textColor":"#FFFFFF","borderRadius":"9999px","padding":"12px 28px","fontWeight":"600"}', 1, 1789870000000),
  ('preset_btn_shadow', 'Shadow Button', 'button', '{"backgroundColor":"#4F46E5","textColor":"#FFFFFF","borderRadius":"10px","padding":"14px 28px","boxShadow":"0 10px 25px -5px rgba(79, 70, 229, 0.4)","fontWeight":"700"}', 1, 1789870000000),
  ('preset_shadow_soft', 'Soft', 'shadow', '{"boxShadow":"0 4px 12px rgba(0, 0, 0, 0.08)"}', 1, 1789870000000),
  ('preset_shadow_medium', 'Medium', 'shadow', '{"boxShadow":"0 8px 24px rgba(0, 0, 0, 0.12)"}', 1, 1789870000000),
  ('preset_shadow_bold', 'Bold', 'shadow', '{"boxShadow":"0 12px 32px rgba(0, 0, 0, 0.18)"}', 1, 1789870000000);
