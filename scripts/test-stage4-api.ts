import { GET as getCategoriesHandler, POST as createCategoryHandler } from "../app/api/admin/categories/route";
import {
  GET as getCategoryByIdHandler,
  PUT as updateCategoryHandler,
  DELETE as deleteCategoryHandler,
} from "../app/api/admin/categories/[id]/route";
import { GET as publicCategoriesHandler } from "../app/api/categories/route";
import { createSession } from "../lib/auth";
import { NextRequest } from "next/server";

async function runApiTests() {
  console.log("=========================================");
  console.log(" Stage 4 API Route Handlers Integration  ");
  console.log("=========================================\n");

  // 1. Generate an admin session
  const adminToken = await createSession("admin-test-id");
  console.log(" - Generated Admin Session Token:", adminToken);

  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: `admin_session=${adminToken}`,
  };

  // Test 1: Unauthenticated POST should fail with 401
  console.log("[Test 1] Testing unauthenticated POST /api/admin/categories...");
  const unauthReq = new NextRequest("http://localhost:3000/api/admin/categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Unauth Test", slug: "unauth-test" }),
  });
  const unauthRes = await createCategoryHandler(unauthReq);
  if (unauthRes.status !== 401) {
    throw new Error(`Expected status 401, got ${unauthRes.status}`);
  }
  console.log(" [PASS] 401 Unauthorized returned for unauthenticated request.\n");

  // Test 2: Create Parent Category via POST
  console.log("[Test 2] Creating Parent Category via POST /api/admin/categories...");
  const parentSlug = `footwear-${Date.now()}`;
  const createParentReq = new NextRequest("http://localhost:3000/api/admin/categories", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Footwear & Kicks",
      slug: parentSlug,
      description: "Performance running and lifestyle sneakers.",
      sortOrder: 1,
      status: "active",
      seoTitle: "Best Footwear Collection",
      seoDescription: "Explore high-tech running shoes and sneakers.",
    }),
  });
  const createParentRes = await createCategoryHandler(createParentReq);
  const parentData = (await createParentRes.json()) as any;
  if (createParentRes.status !== 201 || !parentData.success) {
    throw new Error(`Failed to create parent category: ${JSON.stringify(parentData)}`);
  }
  const parentId = parentData.data.id;
  console.log(" - Created Parent ID:", parentId, "Slug:", parentData.data.slug);
  console.log(" [PASS] Parent Category created with status 201.\n");

  // Test 3: Duplicate Slug should fail with 400
  console.log("[Test 3] Testing duplicate slug rejection...");
  const dupSlugReq = new NextRequest("http://localhost:3000/api/admin/categories", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Duplicate Footwear",
      slug: parentSlug, // identical slug
    }),
  });
  const dupSlugRes = await createCategoryHandler(dupSlugReq);
  const dupSlugData = (await dupSlugRes.json()) as any;
  if (dupSlugRes.status !== 400 || dupSlugData.success) {
    throw new Error(`Expected status 400 for duplicate slug, got ${dupSlugRes.status}`);
  }
  console.log(" - Rejection error message:", dupSlugData.error);
  console.log(" [PASS] Duplicate slug rejected with 400.\n");

  // Test 4: Create Child Category via POST
  console.log("[Test 4] Creating Child Category with parentId...");
  const childSlug = `sneakers-${Date.now()}`;
  const createChildReq = new NextRequest("http://localhost:3000/api/admin/categories", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Sneakers",
      slug: childSlug,
      description: "Low top and high top court sneakers.",
      parentId: parentId,
      sortOrder: 2,
      status: "active",
      imageUrl: "https://assets.example.com/sneakers.jpg",
    }),
  });
  const createChildRes = await createCategoryHandler(createChildReq);
  const childData = (await createChildRes.json()) as any;
  if (createChildRes.status !== 201 || !childData.success) {
    throw new Error(`Failed to create child category: ${JSON.stringify(childData)}`);
  }
  const childId = childData.data.id;
  console.log(" - Created Child ID:", childId, "Parent:", childData.data.parentId);
  console.log(" [PASS] Child category created.\n");

  // Test 5: Circular Dependency Rejection in PUT (Parent setting self as parent)
  console.log("[Test 5] Testing circular dependency rejection (category as its own parent)...");
  const selfParentReq = new NextRequest(`http://localhost:3000/api/admin/categories/${parentId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Footwear & Kicks",
      slug: parentSlug,
      parentId: parentId, // Self as parent!
    }),
  });
  const selfParentRes = await updateCategoryHandler(selfParentReq, {
    params: Promise.resolve({ id: parentId }),
  });
  const selfParentData = (await selfParentRes.json()) as any;
  if (selfParentRes.status !== 400 || selfParentData.success) {
    throw new Error(`Expected status 400 for self-parenting, got ${selfParentRes.status}`);
  }
  console.log(" - Rejection message:", selfParentData.error);
  console.log(" [PASS] Self-parent circular dependency prevented.\n");

  // Test 6: Circular Dependency Rejection (Setting child as parent of parent)
  console.log("[Test 6] Testing descendant circular dependency rejection...");
  const childAsParentReq = new NextRequest(`http://localhost:3000/api/admin/categories/${parentId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Footwear & Kicks",
      slug: parentSlug,
      parentId: childId, // Child as parent of parent!
    }),
  });
  const childAsParentRes = await updateCategoryHandler(childAsParentReq, {
    params: Promise.resolve({ id: parentId }),
  });
  const childAsParentData = (await childAsParentRes.json()) as any;
  if (childAsParentRes.status !== 400 || childAsParentData.success) {
    throw new Error(`Expected status 400 for descendant-as-parent, got ${childAsParentRes.status}`);
  }
  console.log(" - Rejection message:", childAsParentData.error);
  console.log(" [PASS] Descendant circular dependency prevented.\n");

  // Test 7: Update Category via PUT
  console.log("[Test 7] Updating child category via PUT...");
  const updateReq = new NextRequest(`http://localhost:3000/api/admin/categories/${childId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Retro Sneakers & Runners",
      slug: childSlug,
      description: "Updated description for retro runners.",
      parentId: parentId,
      imageUrl: "https://assets.example.com/retro-sneakers.jpg",
      sortOrder: 5,
      status: "active",
    }),
  });
  const updateRes = await updateCategoryHandler(updateReq, {
    params: Promise.resolve({ id: childId }),
  });
  const updateData = (await updateRes.json()) as any;
  if (updateRes.status !== 200 || !updateData.success) {
    throw new Error(`Failed to update category: ${JSON.stringify(updateData)}`);
  }
  console.log(" - Updated Name:", updateData.data.name, "Sort:", updateData.data.sortOrder);
  console.log(" [PASS] Category updated successfully.\n");

  // Test 8: Public GET /api/categories
  console.log("[Test 8] Testing public GET /api/categories...");
  const publicRes = await publicCategoriesHandler();
  const publicData = (await publicRes.json()) as any;
  if (publicRes.status !== 200 || !publicData.success) {
    throw new Error(`Failed public categories fetch: ${JSON.stringify(publicData)}`);
  }
  console.log(" - Active Categories Count:", publicData.data.categories.length);
  console.log(" - Active Category Tree Roots:", publicData.data.tree.length);
  console.log(" [PASS] Public storefront categories endpoint functional.\n");

  // Test 9: Delete Category via DELETE
  console.log("[Test 9] Deleting parent category via DELETE...");
  const deleteReq = new NextRequest(`http://localhost:3000/api/admin/categories/${parentId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  const deleteRes = await deleteCategoryHandler(deleteReq, {
    params: Promise.resolve({ id: parentId }),
  });
  const deleteData = (await deleteRes.json()) as any;
  if (deleteRes.status !== 200 || !deleteData.success) {
    throw new Error(`Failed to delete category: ${JSON.stringify(deleteData)}`);
  }
  console.log(" - Delete message:", deleteData.message);

  // Clean up child category
  const deleteChildReq = new NextRequest(`http://localhost:3000/api/admin/categories/${childId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  await deleteCategoryHandler(deleteChildReq, {
    params: Promise.resolve({ id: childId }),
  });
  console.log(" [PASS] Category deleted successfully.\n");

  console.log("=================================================");
  console.log(" ALL STAGE 4 API ROUTE TESTS PASSED (9/9)        ");
  console.log("=================================================\n");
}

runApiTests().catch((err) => {
  console.error("❌ API Test failed:", err);
  process.exit(1);
});
