import { GET as getProductsHandler, POST as createProductHandler } from "../app/api/admin/products/route";
import {
  GET as getProductByIdHandler,
  PUT as updateProductHandler,
  DELETE as deleteProductHandler,
} from "../app/api/admin/products/[id]/route";
import { POST as duplicateProductHandler } from "../app/api/admin/products/[id]/duplicate/route";
import { GET as searchProductsHandler } from "../app/api/products/search/route";
import { createSession } from "../lib/auth";
import { NextRequest } from "next/server";

async function runStage5ApiTests() {
  console.log("=========================================");
  console.log(" Stage 5 API Route Handlers Integration  ");
  console.log("=========================================\n");

  // Generate Admin session
  const adminToken = await createSession("admin-stage5-tester");
  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: `admin_session=${adminToken}`,
  };

  // Test 1: Unauthenticated POST returns 401
  console.log("[Test 1] Testing unauthenticated POST /api/admin/products...");
  const unauthReq = new NextRequest("http://localhost:3000/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Unauth Item", price: 50, sku: "TEST-01" }),
  });
  const unauthRes = await createProductHandler(unauthReq);
  if (unauthRes.status !== 401) {
    throw new Error(`Expected status 401, got ${unauthRes.status}`);
  }
  console.log(" [PASS] 401 Unauthorized returned for unauthenticated request.\n");

  // Test 2: Authenticated POST creates product with R2 images
  console.log("[Test 2] Creating Product via POST /api/admin/products...");
  const testSku = `API-PROD-${Date.now().toString().slice(-4)}`;
  const testSlug = `api-test-sneaker-${Date.now()}`;
  const createReq = new NextRequest("http://localhost:3000/api/admin/products", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Apex Velocity Runner",
      slug: testSlug,
      sku: testSku,
      shortDescription: "Ultra-responsive foam running shoes.",
      description: "Features responsive nitrogen-infused foam and breathable knit mesh.",
      price: 160.0,
      salePrice: 129.99,
      costPrice: 45.0,
      compareAtPrice: 180.0,
      stockQuantity: 50,
      stockStatus: "in_stock",
      lowStockThreshold: 5,
      trackInventory: true,
      allowBackorders: false,
      brand: "Apex Athletic",
      tags: ["footwear", "running", "marathon"],
      status: "published",
      mainImage: "https://assets.example.com/velocity-main.webp",
      galleryImages: [
        "https://assets.example.com/velocity-sole.webp",
        "https://assets.example.com/velocity-top.webp",
      ],
      seoTitle: "Apex Velocity Runner | High-Performance Shoes",
      seoDescription: "Engineered for maximum energy return and marathon durability.",
    }),
  });
  const createRes = await createProductHandler(createReq);
  const createData = (await createRes.json()) as any;
  if (createRes.status !== 201 || !createData.success) {
    throw new Error(`Failed to create product: ${JSON.stringify(createData)}`);
  }
  const productId = createData.data.id;
  console.log(" - Created Product ID:", productId, "SKU:", createData.data.sku);
  console.log(" [PASS] Product created with status 201.\n");

  // Test 3: Duplicate SKU rejection
  console.log("[Test 3] Testing duplicate SKU rejection...");
  const dupSkuReq = new NextRequest("http://localhost:3000/api/admin/products", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Second Sneaker",
      slug: `second-sneaker-${Date.now()}`,
      sku: testSku, // duplicate
      price: 100,
      mainImage: "https://assets.example.com/img.webp",
    }),
  });
  const dupSkuRes = await createProductHandler(dupSkuReq);
  const dupSkuData = (await dupSkuRes.json()) as any;
  if (dupSkuRes.status !== 400 || dupSkuData.success) {
    throw new Error(`Expected status 400 for duplicate SKU, got ${dupSkuRes.status}`);
  }
  console.log(" - Error message:", dupSkuData.error);
  console.log(" [PASS] Duplicate SKU rejected with 400.\n");

  // Test 4: List Products via GET /api/admin/products
  console.log("[Test 4] Testing GET /api/admin/products...");
  const listReq = new NextRequest("http://localhost:3000/api/admin/products", {
    method: "GET",
    headers: authHeaders,
  });
  const listRes = await getProductsHandler(listReq);
  const listData = (await listRes.json()) as any;
  if (listRes.status !== 200 || !listData.success) {
    throw new Error(`Failed to list products: ${JSON.stringify(listData)}`);
  }
  console.log(" - Total Products in DB:", listData.data.length);
  if (!listData.data.some((p: any) => p.id === productId)) {
    throw new Error("Created product not in list!");
  }
  console.log(" [PASS] List products endpoint verified.\n");

  // Test 5: Get Single Product via GET /api/admin/products/[id]
  console.log("[Test 5] Testing GET /api/admin/products/[id]...");
  const getReq = new NextRequest(`http://localhost:3000/api/admin/products/${productId}`, {
    method: "GET",
    headers: authHeaders,
  });
  const getRes = await getProductByIdHandler(getReq, {
    params: Promise.resolve({ id: productId }),
  });
  const getData = (await getRes.json()) as any;
  if (getRes.status !== 200 || !getData.success || getData.data.id !== productId) {
    throw new Error(`Failed to get product: ${JSON.stringify(getData)}`);
  }
  console.log(" - Retrieved Product:", getData.data.name, "Images:", getData.data.images.length);
  console.log(" [PASS] Get product by ID verified.\n");

  // Test 6: Update Product via PUT /api/admin/products/[id]
  console.log("[Test 6] Testing PUT /api/admin/products/[id]...");
  const updateReq = new NextRequest(`http://localhost:3000/api/admin/products/${productId}`, {
    method: "PUT",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Apex Velocity Pro Runner",
      slug: testSlug,
      sku: testSku,
      price: 175.0,
      salePrice: 139.99,
      stockQuantity: 42,
      mainImage: "https://assets.example.com/velocity-main-v2.webp",
      galleryImages: ["https://assets.example.com/velocity-sole.webp"],
    }),
  });
  const updateRes = await updateProductHandler(updateReq, {
    params: Promise.resolve({ id: productId }),
  });
  const updateData = (await updateRes.json()) as any;
  if (updateRes.status !== 200 || !updateData.success || updateData.data.price !== 175.0) {
    throw new Error(`Failed to update product: ${JSON.stringify(updateData)}`);
  }
  console.log(" - Updated Name:", updateData.data.name, "New Price:", updateData.data.price);
  console.log(" [PASS] Product updated via PUT.\n");

  // Test 7: Duplicate Product via POST /api/admin/products/[id]/duplicate
  console.log("[Test 7] Testing POST /api/admin/products/[id]/duplicate...");
  const dupReq = new NextRequest(`http://localhost:3000/api/admin/products/${productId}/duplicate`, {
    method: "POST",
    headers: authHeaders,
  });
  const dupRes = await duplicateProductHandler(dupReq, {
    params: Promise.resolve({ id: productId }),
  });
  const dupData = (await dupRes.json()) as any;
  if (dupRes.status !== 201 || !dupData.success) {
    throw new Error(`Failed to duplicate product: ${JSON.stringify(dupData)}`);
  }
  const duplicatedId = dupData.data.id;
  console.log(" - Duplicated Product ID:", duplicatedId, "SKU:", dupData.data.sku);
  console.log(" [PASS] Product cloned via duplicate endpoint.\n");

  // Test 8: Public Search Endpoint GET /api/products/search?q=...
  console.log("[Test 8] Testing GET /api/products/search?q=Velocity...");
  const searchReq = new NextRequest("http://localhost:3000/api/products/search?q=Velocity");
  const searchRes = await searchProductsHandler(searchReq);
  const searchData = (await searchRes.json()) as any;
  if (searchRes.status !== 200 || !searchData.success || searchData.count === 0) {
    throw new Error(`Public search failed: ${JSON.stringify(searchData)}`);
  }
  console.log(" - Search matches count:", searchData.count);
  console.log(" [PASS] Public search endpoint functional.\n");

  // Test 9: Delete Product via DELETE /api/admin/products/[id]
  console.log("[Test 9] Deleting product via DELETE...");
  const deleteReq = new NextRequest(`http://localhost:3000/api/admin/products/${productId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  const deleteRes = await deleteProductHandler(deleteReq, {
    params: Promise.resolve({ id: productId }),
  });
  const deleteData = (await deleteRes.json()) as any;
  if (deleteRes.status !== 200 || !deleteData.success) {
    throw new Error(`Failed to delete product: ${JSON.stringify(deleteData)}`);
  }
  console.log(" - Deletion message:", deleteData.message);

  // Clean up duplicated product
  const deleteDupReq = new NextRequest(`http://localhost:3000/api/admin/products/${duplicatedId}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  await deleteProductHandler(deleteDupReq, {
    params: Promise.resolve({ id: duplicatedId }),
  });
  console.log(" [PASS] Product deleted via DELETE.\n");

  console.log("=================================================");
  console.log("   ALL STAGE 5 API TESTS PASSED (9/9)            ");
  console.log("=================================================\n");
}

runStage5ApiTests().catch((err) => {
  console.error("❌ Stage 5 API Test failed:", err);
  process.exit(1);
});
