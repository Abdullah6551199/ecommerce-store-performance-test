import { POST as loginHandler } from "../app/api/admin/login/route";
import { POST as changePasswordHandler } from "../app/api/admin/change-password/route";
import { NextRequest } from "next/server";

async function runApiTests() {
  console.log("=========================================");
  console.log("  Stage 3 API Routes Integration Tests");
  console.log("=========================================\n");

  const testEmail = "api-ratelimit-test-" + Date.now() + "@example.com";

  // Attempt 1: Wrong password
  console.log("[API Test 1] Attempt 1 with invalid credentials...");
  let req = new NextRequest("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "wrong-password-1" }),
  });
  let res = await loginHandler(req);
  console.log(" - Status:", res.status);
  if (res.status !== 401) throw new Error("Expected status 401 on attempt 1, got " + res.status);

  // Attempt 2: Wrong password
  console.log("[API Test 2] Attempt 2 with invalid credentials...");
  req = new NextRequest("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "wrong-password-2" }),
  });
  res = await loginHandler(req);
  console.log(" - Status:", res.status);
  if (res.status !== 401) throw new Error("Expected status 401 on attempt 2, got " + res.status);

  // Attempt 3: Wrong password -> Rate limit triggered!
  console.log("[API Test 3] Attempt 3 with invalid credentials (Triggering Lockout)...");
  req = new NextRequest("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "wrong-password-3" }),
  });
  res = await loginHandler(req);
  const data3 = await res.json();
  console.log(" - Status:", res.status);
  console.log(" - Response body:", data3);
  if (res.status !== 429) {
    throw new Error("Expected status 429 (Rate limited) on attempt 3, got " + res.status);
  }
  if (!data3.error?.includes("Too many failed attempts")) {
    throw new Error("Expected rate limit error message, got: " + data3.error);
  }
  console.log(" [PASS] 3 failed attempts triggered 429 Too Many Requests lockout!\n");

  // Test 4: Attempt 4 while locked
  console.log("[API Test 4] Attempt 4 while locked...");
  req = new NextRequest("http://localhost:3000/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail, password: "wrong-password-4" }),
  });
  res = await loginHandler(req);
  const data4 = await res.json();
  console.log(" - Status:", res.status);
  console.log(" - Remaining seconds:", data4.remainingSeconds);
  if (res.status !== 429) {
    throw new Error("Expected status 429 while locked, got " + res.status);
  }
  console.log(" [PASS] Subsequent attempt properly blocked with 429.\n");

  // Test 5: Change password unauthenticated check
  console.log("[API Test 5] Change password unauthenticated rejection...");
  req = new NextRequest("http://localhost:3000/api/admin/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword: "foo", newPassword: "bar" }),
  });
  res = await changePasswordHandler(req);
  console.log(" - Status:", res.status);
  if (res.status !== 401) {
    throw new Error("Expected 401 Unauthorized for unauthenticated change-password request, got " + res.status);
  }
  console.log(" [PASS] /api/admin/change-password correctly rejects unauthenticated requests with 401.\n");

  console.log("=========================================");
  console.log("  ALL API INTEGRATION TESTS PASSED!      ");
  console.log("=========================================");
}

runApiTests().catch((err) => {
  console.error("API test error:", err);
  process.exit(1);
});
