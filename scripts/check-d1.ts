import { execSync } from "child_process";

async function main() {
  const output = execSync(
    `npx.cmd wrangler d1 execute ecommerce-perf-db --remote --command="SELECT draft_json FROM theme_drafts WHERE id='active-draft';" --json`,
    { encoding: "utf-8" }
  );
  const data = JSON.parse(output);
  const draftJsonStr = data[0]?.results?.[0]?.draft_json;
  if (!draftJsonStr) {
    console.log("No draft_json found");
    return;
  }
  const draft = JSON.parse(draftJsonStr);
  console.log("Draft Theme Name:", draft.name);
  console.log("Draft Sections count:", draft.sections?.length);
  draft.sections?.forEach((s: any, idx: number) => {
    console.log(`[${idx}] id=${s.id} type=${s.type} settingsKeys=${Object.keys(s.settings || {}).join(",")}`);
  });

  const activeOutput = execSync(
    `npx.cmd wrangler d1 execute ecommerce-perf-db --remote --command="SELECT theme_json FROM active_theme WHERE id='default';" --json`,
    { encoding: "utf-8" }
  );
  const activeData = JSON.parse(activeOutput);
  const activeThemeStr = activeData[0]?.results?.[0]?.theme_json;
  if (activeThemeStr) {
    const active = JSON.parse(activeThemeStr);
    console.log("\nActive Theme Name:", active.name);
    console.log("Active Sections count:", active.sections?.length);
    active.sections?.forEach((s: any, idx: number) => {
      console.log(`[${idx}] id=${s.id} type=${s.type} settingsKeys=${Object.keys(s.settings || {}).join(",")}`);
    });
    console.log("\nDraft Hero Settings:\n", JSON.stringify(draft.sections?.find((s: any) => s.type === "hero")?.settings, null, 2));
    console.log("\nActive Hero Settings:\n", JSON.stringify(active.sections?.find((s: any) => s.type === "hero")?.settings, null, 2));
    console.log("\nDraft Announcement Settings:\n", JSON.stringify(draft.sections?.find((s: any) => s.type.includes("announcement"))?.settings, null, 2));
    console.log("\nActive Announcement Settings:\n", JSON.stringify(active.sections?.find((s: any) => s.type.includes("announcement"))?.settings, null, 2));
  }
}

main().catch(console.error);
