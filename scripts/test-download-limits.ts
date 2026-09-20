const STORE_URL = process.env.STORE_URL || "https://nasrify-store.zia291930.workers.dev";

async function testLimits() {
  console.log("Testing download limits & tampering...");

  // 1. Invalid / tampered token
  const invalidRes = await fetch(`${STORE_URL}/api/apps/digital-products/download?token=tampered_invalid_token`);
  console.log(`Tampered token status: ${invalidRes.status} (expected 400 or 403)`);

  // 2. Missing token
  const missingRes = await fetch(`${STORE_URL}/api/apps/digital-products/download`);
  console.log(`Missing token status: ${missingRes.status} (expected 400)`);

  if (invalidRes.status >= 400 && missingRes.status === 400) {
    console.log("✅ Security and validation gates working as expected!");
  } else {
    console.error("❌ Gate check failed");
    process.exit(1);
  }
}

testLimits();
