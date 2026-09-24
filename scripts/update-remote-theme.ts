import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

async function main() {
  const defaultTheme = JSON.parse(readFileSync("themes/default/theme.json", "utf-8"));

  // Fetch current active theme from remote D1
  const out = execSync(
    'npx.cmd wrangler d1 execute ecommerce-perf-db --remote --command="SELECT theme_json FROM active_theme WHERE id=\'default\';" --json',
    { encoding: "utf-8" }
  );

  const parsed = JSON.parse(out);
  const currentJsonStr = parsed[0]?.results[0]?.theme_json;
  let activeThemeObj = defaultTheme;

  if (currentJsonStr) {
    const currentTheme = JSON.parse(currentJsonStr);
    activeThemeObj = {
      ...currentTheme,
      settings: {
        ...currentTheme.settings,
        colors: defaultTheme.settings.colors,
        fonts: defaultTheme.settings.fonts,
        layout: defaultTheme.settings.layout,
        logo: defaultTheme.settings.logo,
      },
      page_defaults: defaultTheme.page_defaults,
    };
  }

  const updatedActiveJson = JSON.stringify(activeThemeObj).replace(/'/g, "''");
  const updatedDefaultJson = JSON.stringify(defaultTheme).replace(/'/g, "''");

  const sql = `
    UPDATE themes SET theme_json = '${updatedDefaultJson}' WHERE id = 'theme-default';
    UPDATE active_theme SET theme_json = '${updatedActiveJson}' WHERE id = 'default';
  `;

  // Write temporary SQL file
  const tmpSqlPath = `backups/update_theme_42_8c.sql`;
  writeFileSync(tmpSqlPath, sql, "utf-8");

  console.log("Executing remote theme update...");
  execSync(`npx.cmd wrangler d1 execute ecommerce-perf-db --remote --file=${tmpSqlPath}`, {
    stdio: "inherit",
  });
  console.log("Remote theme successfully updated!");
}

main().catch((err) => {
  console.error("Failed to update remote theme:", err);
  process.exit(1);
});
