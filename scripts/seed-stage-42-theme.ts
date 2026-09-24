import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const themeJsonRaw = fs.readFileSync(
  path.join(__dirname, "../themes/default/theme.json"),
  "utf-8"
);
const themeObj = JSON.parse(themeJsonRaw);
const themeJsonClean = JSON.stringify(themeObj);
const now = Date.now();

// Escape single quotes for SQL
const escapedJson = themeJsonClean.replace(/'/g, "''");

const sqlStatements = `
INSERT INTO themes (
  id, slug, name, version, description, author, author_url,
  preview_url, screenshot_urls, category, theme_json, is_built_in,
  status, created_at, updated_at
) VALUES (
  'theme-default',
  'default',
  'Nasrify Default',
  '1.0.0',
  'Clean and simple — perfect starting point',
  'Nasrify',
  'https://nasrify.com',
  '/themes/previews/default.jpg',
  '["/themes/previews/default.jpg"]',
  'minimal',
  '${escapedJson}',
  1,
  'published',
  ${now},
  ${now}
) ON CONFLICT(id) DO UPDATE SET
  theme_json = excluded.theme_json,
  updated_at = ${now};

INSERT INTO active_theme (
  id, theme_id, theme_json, activated_at, activated_by
) VALUES (
  'default',
  'theme-default',
  '${escapedJson}',
  ${now},
  'system'
) ON CONFLICT(id) DO UPDATE SET
  theme_id = excluded.theme_id,
  theme_json = excluded.theme_json,
  activated_at = excluded.activated_at,
  activated_by = excluded.activated_by;
`;

const tempSqlFile = path.join(__dirname, "temp-seed-theme.sql");
fs.writeFileSync(tempSqlFile, sqlStatements, "utf-8");

console.log("Seeding default theme locally...");
try {
  execSync(`npx wrangler d1 execute ecommerce-perf-db --local --file="${tempSqlFile}"`, {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });
  console.log("✓ Seeded locally successfully!");
} catch (e: any) {
  console.error("Local seed failed:", e.message);
}

console.log("Seeding default theme remotely...");
try {
  execSync(`npx wrangler d1 execute ecommerce-perf-db --remote --file="${tempSqlFile}"`, {
    stdio: "inherit",
    cwd: path.join(__dirname, ".."),
  });
  console.log("✓ Seeded remotely successfully!");
} catch (e: any) {
  console.error("Remote seed failed:", e.message);
}

if (fs.existsSync(tempSqlFile)) {
  fs.unlinkSync(tempSqlFile);
}
