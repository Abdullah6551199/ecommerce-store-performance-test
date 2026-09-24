/**
 * Setup Fonts Script (Stage 42.7)
 * Downloads curated fonts from Google Fonts / Fontsource,
 * uploads woff2 files to Cloudflare R2 (ecommerce-perf-assets/fonts/...),
 * and registers metadata in D1 table `fonts`.
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

interface CuratedFontDef {
  family: string;
  slug: string;
  category: "sans" | "serif" | "display" | "handwriting" | "mono";
  weights: number[];
  googleFamilyName: string;
}

const CURATED_FONTS: CuratedFontDef[] = [
  // Sans (11 fonts)
  { family: "Inter", slug: "inter", category: "sans", weights: [400, 700], googleFamilyName: "Inter" },
  { family: "Poppins", slug: "poppins", category: "sans", weights: [400, 700], googleFamilyName: "Poppins" },
  { family: "Roboto", slug: "roboto", category: "sans", weights: [400, 700], googleFamilyName: "Roboto" },
  { family: "Open Sans", slug: "open-sans", category: "sans", weights: [400, 700], googleFamilyName: "Open+Sans" },
  { family: "Lato", slug: "lato", category: "sans", weights: [400, 700], googleFamilyName: "Lato" },
  { family: "Montserrat", slug: "montserrat", category: "sans", weights: [400, 700], googleFamilyName: "Montserrat" },
  { family: "Raleway", slug: "raleway", category: "sans", weights: [400, 700], googleFamilyName: "Raleway" },
  { family: "DM Sans", slug: "dm-sans", category: "sans", weights: [400, 700], googleFamilyName: "DM+Sans" },
  { family: "Manrope", slug: "manrope", category: "sans", weights: [400, 700], googleFamilyName: "Manrope" },
  { family: "Plus Jakarta Sans", slug: "plus-jakarta-sans", category: "sans", weights: [400, 700], googleFamilyName: "Plus+Jakarta+Sans" },
  { family: "Outfit", slug: "outfit", category: "sans", weights: [400, 700], googleFamilyName: "Outfit" },
  // Serif (5 fonts)
  { family: "Playfair Display", slug: "playfair-display", category: "serif", weights: [400, 700], googleFamilyName: "Playfair+Display" },
  { family: "Merriweather", slug: "merriweather", category: "serif", weights: [400, 700], googleFamilyName: "Merriweather" },
  { family: "Lora", slug: "lora", category: "serif", weights: [400, 700], googleFamilyName: "Lora" },
  { family: "Cormorant Garamond", slug: "cormorant-garamond", category: "serif", weights: [400, 700], googleFamilyName: "Cormorant+Garamond" },
  { family: "Libre Baskerville", slug: "libre-baskerville", category: "serif", weights: [400, 700], googleFamilyName: "Libre+Baskerville" },
  // Display (2 fonts)
  { family: "Bebas Neue", slug: "bebas-neue", category: "display", weights: [400], googleFamilyName: "Bebas+Neue" },
  { family: "Anton", slug: "anton", category: "display", weights: [400], googleFamilyName: "Anton" },
  // Handwriting (2 fonts)
  { family: "Caveat", slug: "caveat", category: "handwriting", weights: [400, 700], googleFamilyName: "Caveat" },
  { family: "Pacifico", slug: "pacifico", category: "handwriting", weights: [400], googleFamilyName: "Pacifico" },
  // Mono (1 font)
  { family: "JetBrains Mono", slug: "jetbrains-mono", category: "mono", weights: [400, 700], googleFamilyName: "JetBrains+Mono" },
];

const CACHE_DIR = path.resolve(process.cwd(), ".fonts-cache");

interface ParsedFontFace {
  subset: string;
  weight: number;
  style: string;
  url: string;
}

function parseGoogleCss(css: string): ParsedFontFace[] {
  const faces: ParsedFontFace[] = [];
  const blocks = css.split("@font-face");

  for (const block of blocks) {
    if (!block.includes("src:")) continue;

    // Detect subset comment right before or in block, e.g. /* latin */ or /* arabic */
    let subset = "latin";
    const subsetMatch = block.match(/\/\*\s*([a-z0-9-]+)\s*\*\//i);
    if (subsetMatch) {
      subset = subsetMatch[1].toLowerCase();
    }

    const weightMatch = block.match(/font-weight:\s*(\d+)/i);
    const weight = weightMatch ? parseInt(weightMatch[1], 10) : 400;

    const styleMatch = block.match(/font-style:\s*([a-z]+)/i);
    const style = styleMatch ? styleMatch[1].toLowerCase() : "normal";

    const urlMatch = block.match(/url\((https:\/\/[^)]+?\.woff2)\)/i);
    if (urlMatch) {
      faces.push({
        subset,
        weight,
        style,
        url: urlMatch[1],
      });
    }
  }

  return faces;
}

async function main() {
  console.log("==================================================");
  console.log("   Stage 42.7: Curated Fonts Download & Upload    ");
  console.log("==================================================");

  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }

  const sqlStatements: string[] = [];
  let totalUploadedFiles = 0;
  let totalBytes = 0;

  for (const font of CURATED_FONTS) {
    console.log(`\n▶ Processing font: ${font.family} (${font.slug})...`);
    const fontDir = path.join(CACHE_DIR, font.slug);
    if (!fs.existsSync(fontDir)) {
      fs.mkdirSync(fontDir, { recursive: true });
    }

    const wghtParam = font.weights.length === 1 ? `wght@${font.weights[0]}` : `wght@${font.weights.join(";")}`;
    const cssUrl = `https://fonts.googleapis.com/css2?family=${font.googleFamilyName}:${wghtParam}&display=swap`;

    let css = "";
    try {
      const res = await fetch(cssUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (!res.ok) {
        throw new Error(`Google Fonts API returned ${res.status}`);
      }
      css = await res.text();
    } catch (err: any) {
      console.error(`  ❌ Failed to fetch CSS for ${font.family}:`, err.message);
      continue;
    }

    const faces = parseGoogleCss(css);
    // Keep only latin (and arabic if available for Urdu support)
    const targetFaces = faces.filter(
      (f) => (f.subset === "latin" || f.subset === "arabic") && font.weights.includes(f.weight)
    );

    const fileUrls: Record<string, string> = {};
    let fontTotalSize = 0;
    const recordedSubsets = new Set<string>();

    for (const face of targetFaces) {
      const key = `${face.weight}-${face.style}-${face.subset}`;
      const fileName = `${key}.woff2`;
      const localFilePath = path.join(fontDir, fileName);
      const r2Key = `fonts/${font.slug}/${fileName}`;

      // Download woff2 file
      try {
        if (!fs.existsSync(localFilePath)) {
          const woffRes = await fetch(face.url);
          if (!woffRes.ok) throw new Error(`Status ${woffRes.status}`);
          const buffer = Buffer.from(await woffRes.arrayBuffer());
          fs.writeFileSync(localFilePath, buffer);
        }

        const stats = fs.statSync(localFilePath);
        fontTotalSize += stats.size;
        totalBytes += stats.size;
        recordedSubsets.add(face.subset);
        fileUrls[key] = r2Key;

        // Upload to Cloudflare R2
        console.log(`  ☁️  Uploading to R2: ${r2Key} (${(stats.size / 1024).toFixed(1)} KB)...`);
        execSync(
          `npx.cmd wrangler r2 object put ecommerce-perf-assets/${r2Key} --file="${localFilePath}" --content-type="font/woff2" --remote`,
          { stdio: "pipe" }
        );
        totalUploadedFiles++;
      } catch (err: any) {
        console.error(`  ❌ Error uploading ${r2Key}:`, err.message);
      }
    }

    const fontKb = Math.round(fontTotalSize / 1024);
    const subsetsArr = recordedSubsets.size > 0 ? Array.from(recordedSubsets) : ["latin"];

    // Prepare SQL insert statement for D1
    const fontId = `font-${font.slug}`;
    const variantsJson = JSON.stringify(font.weights);
    const stylesJson = JSON.stringify(["normal"]);
    const subsetsJson = JSON.stringify(subsetsArr);
    const fileUrlsJson = JSON.stringify(fileUrls);
    const now = Date.now();

    const insertSql = `INSERT OR REPLACE INTO fonts (
      id, slug, family, category, variants, styles, subsets,
      license, source, is_curated, is_active, preview_url,
      file_urls, total_size_kb, created_at, updated_at
    ) VALUES (
      '${fontId}',
      '${font.slug}',
      '${font.family.replace(/'/g, "''")}',
      '${font.category}',
      '${variantsJson.replace(/'/g, "''")}',
      '${stylesJson.replace(/'/g, "''")}',
      '${subsetsJson.replace(/'/g, "''")}',
      'OFL',
      'google',
      1,
      1,
      NULL,
      '${fileUrlsJson.replace(/'/g, "''")}',
      ${fontKb},
      ${now},
      ${now}
    );`;

    sqlStatements.push(insertSql);
    console.log(`  ✅ Configured ${font.family}: ${Object.keys(fileUrls).length} variants, ${fontKb} KB`);
  }

  // Add default font_settings
  const now = Date.now();
  sqlStatements.push(`INSERT OR REPLACE INTO font_settings (
    id, default_heading_font, default_body_font, preload_fonts,
    enable_local_hosting, font_display, updated_at
  ) VALUES (
    'default',
    'inter',
    'inter',
    '["inter"]',
    1,
    'swap',
    ${now}
  );`);

  // Write SQL seed file and apply to D1
  const seedSqlFile = path.resolve(process.cwd(), "scripts/fonts/seed-fonts.sql");
  fs.writeFileSync(seedSqlFile, sqlStatements.join("\n\n"));
  console.log(`\n💾 Saved SQL to ${seedSqlFile}`);

  console.log("\n📦 Applying font seed to Local D1...");
  execSync(`npx.cmd wrangler d1 execute ecommerce-perf-db --local --file="${seedSqlFile}"`, {
    stdio: "inherit",
  });

  console.log("\n🌐 Applying font seed to Remote D1...");
  execSync(`npx.cmd wrangler d1 execute ecommerce-perf-db --remote --file="${seedSqlFile}"`, {
    stdio: "inherit",
  });

  console.log("\n==================================================");
  console.log(`Setup complete!`);
  console.log(`Total fonts: ${CURATED_FONTS.length}`);
  console.log(`Total R2 files uploaded: ${totalUploadedFiles}`);
  console.log(`Total size: ${(totalBytes / 1024).toFixed(1)} KB`);
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Fatal error running setup-fonts:", err);
  process.exit(1);
});
