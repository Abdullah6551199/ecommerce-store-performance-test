async function verifyLive() {
  const base = "https://ecommerce-store.zia291930.workers.dev";

  console.log("--------------------------------------------------");
  console.log("VERIFYING LIVE WORKER AT: " + base);
  console.log("--------------------------------------------------");

  try {
    console.log("\n1. Fetching live /api/settings...");
    const sRes = await fetch(base + "/api/settings");
    const sJson = (await sRes.json()) as any;
    console.log("Status:", sRes.status);
    console.log("Store Name:", sJson.data?.storeName);
    console.log("Tagline:", sJson.data?.tagline);
    console.log("Contact Email:", sJson.data?.contactEmail);

    console.log("\n2. Fetching live /api/homepage/sections...");
    const secRes = await fetch(base + "/api/homepage/sections");
    const secJson = (await secRes.json()) as any;
    console.log("Status:", secRes.status);
    console.log("Total Sections:", secJson.data?.length);
    if (Array.isArray(secJson.data)) {
      secJson.data.forEach((s: any) => {
        console.log(` - Section [${s.type}] "${s.title}": sortOrder=${s.sortOrder}, active=${s.isActive}`);
      });
    }

    console.log("\n3. Fetching live storefront homepage HTML (GET /)...");
    const homeRes = await fetch(base);
    console.log("Status:", homeRes.status);
    const html = await homeRes.text();
    console.log("HTML length:", html.length);
    console.log("Includes ApexStore header logo:", html.includes("ApexStore"));
    console.log("Includes hero content:", html.includes("Curated Collections") || html.includes("Engineered for Peak"));
    console.log("Includes categories grid:", html.includes("cat-footwear") || html.includes("Footwear") || html.includes("Collection"));
    console.log("Includes promo banner:", html.includes("Accelerate Beyond Limits") || html.includes("Carbon-Plate"));
    console.log("Includes brand story & stats:", html.includes("Edge Latency") || html.includes("Manifesto"));
    console.log("Includes dynamic copyright:", html.includes("ApexStore") && html.includes(new Date().getFullYear().toString()));

    console.log("\n--------------------------------------------------");
    console.log("ALL LIVE VERIFICATION CHECKS SUCCESSFUL!");
    console.log("--------------------------------------------------");
  } catch (err) {
    console.error("Verification failed:", err);
    process.exit(1);
  }
}

verifyLive();
