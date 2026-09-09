import {
  hashPassword,
  verifyPassword,
  checkRateLimit,
  recordLoginAttempt,
  clearFailedAttempts,
  createSession,
  validateSession,
  destroySession,
} from "../lib/auth";

async function runTests() {
  console.log("=========================================");
  console.log("  Stage 3 Auth & Admin System Tests");
  console.log("=========================================\n");

  // Test 1: Password hashing and validation
  console.log("[Test 1] Hashing and verifying password...");
  const rawPassword = "admin123";
  const hashed = await hashPassword(rawPassword);
  console.log(" - Generated hash:", hashed.substring(0, 20) + "...");
  
  const isValidCorrect = await verifyPassword(rawPassword, hashed);
  if (!isValidCorrect) {
    throw new Error("Password verification failed for correct password!");
  }
  const isValidWrong = await verifyPassword("wrongPass", hashed);
  if (isValidWrong) {
    throw new Error("Password verification falsely succeeded for wrong password!");
  }
  console.log(" [PASS] Password hashing & verification working correctly.\n");

  // Test 2: Rate limiting logic
  console.log("[Test 2] Testing Rate Limiting (3 attempts -> 5-min lockout)...");
  const testEmail = "test-rate-limit-" + Date.now() + "@example.com";

  // Initially should not be locked
  let limit = await checkRateLimit(testEmail);
  if (limit.locked) throw new Error("Expected account to be initially unlocked!");
  console.log(" - Attempt 0: Locked =", limit.locked);

  // Attempt 1: Failed
  await recordLoginAttempt(testEmail, false, "127.0.0.1");
  limit = await checkRateLimit(testEmail);
  if (limit.locked) throw new Error("Account locked prematurely on 1st attempt!");
  console.log(" - Attempt 1: Failed, Locked =", limit.locked);

  // Attempt 2: Failed
  await recordLoginAttempt(testEmail, false, "127.0.0.1");
  limit = await checkRateLimit(testEmail);
  if (limit.locked) throw new Error("Account locked prematurely on 2nd attempt!");
  console.log(" - Attempt 2: Failed, Locked =", limit.locked);

  // Attempt 3: Failed -> MUST BE LOCKED
  await recordLoginAttempt(testEmail, false, "127.0.0.1");
  limit = await checkRateLimit(testEmail);
  if (!limit.locked) throw new Error("Account was NOT locked after 3 failed attempts!");
  console.log(" - Attempt 3: Failed, Locked =", limit.locked, "Remaining seconds =", limit.remainingSeconds);
  if (!limit.remainingSeconds || limit.remainingSeconds <= 0) {
    throw new Error("Invalid remaining lockout seconds!");
  }
  console.log(" [PASS] Rate limiting locked account successfully after 3 failed attempts.\n");

  // Test 3: Clear failed attempts on successful login
  console.log("[Test 3] Testing clearing failed attempts...");
  await clearFailedAttempts(testEmail);
  limit = await checkRateLimit(testEmail);
  if (limit.locked) throw new Error("Account remained locked after clearing failed attempts!");
  console.log(" [PASS] Failed attempts cleared successfully, account unlocked.\n");

  // Test 4: Session lifecycle
  console.log("[Test 4] Testing Session Creation, Validation, and Destruction...");
  const dummyUserId = "admin-test-user-id";
  const sessionToken = await createSession(dummyUserId);
  console.log(" - Created session token:", sessionToken.substring(0, 15) + "...");
  
  const sessionUser = await validateSession(sessionToken);
  if (!sessionUser) throw new Error("Failed to validate created session token!");
  console.log(" - Validated session user:", sessionUser.email, "role:", sessionUser.role);

  await destroySession(sessionToken);
  const destroyedUser = await validateSession(sessionToken);
  if (destroyedUser) throw new Error("Session remained valid after destruction!");
  console.log(" [PASS] Session lifecycle (create -> validate -> destroy) verified.\n");

  console.log("=========================================");
  console.log("  ALL STAGE 3 TESTS PASSED SUCCESSFULLY! ");
  console.log("=========================================");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
