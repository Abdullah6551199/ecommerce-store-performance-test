import { NextRequest } from "next/server";
import { createSession } from "../lib/auth";
import { createProduct, getProductById, getProductBySlug, duplicateProduct } from "../lib/products";
import {
  GET as getVariantsHandler,
  POST as saveVariantsHandler,
} from "../app/api/admin/products/[id]/variants/route";
import { DELETE as deleteVariantHandler } from "../app/api/admin/variants/[variantId]/route";
import {
  GET as listAttributesHandler,
  POST as createAttributeHandler,
} from "../app/api/admin/attributes/route";
import { listAttributes, createOrUpdateAttribute } from "../lib/variants";

async function runStage6Tests() {
  console.log("==========================================");
  console.log(" Stage 6: Product Variants Automated Tests");
  console.log("==========================================\n");

  // Generate Admin session
  const adminToken = await createSession("admin-stage6-tester");
  const authHeaders = {
    "Content-Type": "application/json",
    Cookie: `admin_session=${adminToken}`,
  };

  // Test 1: Unauthenticated requests return 401
  console.log("[Test 1] Testing authentication security on variant endpoints...");
  const dummyContext = { params: Promise.resolve({ id: "dummy-id" }) };

  const unauthGetReq = new NextRequest("http://localhost:3000/api/admin/products/dummy-id/variants");
  const unauthGetRes = await getVariantsHandler(unauthGetReq, dummyContext);
  if (unauthGetRes.status !== 401) {
    throw new Error(`Expected status 401 for GET /variants, got ${unauthGetRes.status}`);
  }

  const unauthPostReq = new NextRequest("http://localhost:3000/api/admin/products/dummy-id/variants", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variants: [] }),
  });
  const unauthPostRes = await saveVariantsHandler(unauthPostReq, dummyContext);
  if (unauthPostRes.status !== 401) {
    throw new Error(`Expected status 401 for POST /variants, got ${unauthPostRes.status}`);
  }

  const unauthDelContext = { params: Promise.resolve({ variantId: "dummy-var-id" }) };
  const unauthDelReq = new NextRequest("http://localhost:3000/api/admin/variants/dummy-var-id", {
    method: "DELETE",
  });
  const unauthDelRes = await deleteVariantHandler(unauthDelReq, unauthDelContext);
  if (unauthDelRes.status !== 401) {
    throw new Error(`Expected status 401 for DELETE /variants, got ${unauthDelRes.status}`);
  }
  console.log(" [PASS] 401 Unauthorized enforced on all variant endpoints.\n");

  // Test 2: Attributes management
  console.log("[Test 2] Testing custom attributes and values management...");
  const colorAttrReq = new NextRequest("http://localhost:3000/api/admin/attributes", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Color",
      values: ["Black", "White", "Volt Green"],
    }),
  });
  const colorAttrRes = await createAttributeHandler(colorAttrReq);
  if (!colorAttrRes.ok) {
    throw new Error(`Failed to create Color attribute: ${colorAttrRes.status}`);
  }

  const sizeAttrReq = new NextRequest("http://localhost:3000/api/admin/attributes", {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({
      name: "Size",
      values: ["US 9", "US 10", "US 11"],
    }),
  });
  const sizeAttrRes = await createAttributeHandler(sizeAttrReq);
  if (!sizeAttrRes.ok) {
    throw new Error(`Failed to create Size attribute: ${sizeAttrRes.status}`);
  }

  const listAttrsReq = new NextRequest("http://localhost:3000/api/admin/attributes", {
    headers: authHeaders,
  });
  const listAttrsRes = await listAttributesHandler(listAttrsReq);
  const listAttrsData = (await listAttrsRes.json()) as any;
  if (!listAttrsData.success || !listAttrsData.data || listAttrsData.data.length < 2) {
    throw new Error("Attributes list did not return expected created attributes.");
  }
  console.log(` [PASS] Successfully registered and retrieved attributes (Count: ${listAttrsData.data.length}).\n`);

  // Test 3: Create base product in catalog
  console.log("[Test 3] Creating base product for variant testing...");
  const timestamp = Date.now().toString().slice(-4);
  const baseSku = `APEX-VRT-${timestamp}`;
  const baseSlug = `apex-trail-runner-${Date.now()}`;

  const createdProduct = await createProduct({
    name: "Apex Trail Runner Pro",
    slug: baseSlug,
    sku: baseSku,
    shortDescription: "All-terrain modular running shoe with customizable variants.",
    description: "Engineered with Vibram outsole and adaptable upper construction.",
    price: 180.0,
    salePrice: 159.99,
    stockQuantity: 40,
    stockStatus: "in_stock",
    status: "published",
    mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    galleryImages: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5",
    ],
  });
  console.log(` [PASS] Base product created with ID: ${createdProduct.id}, SKU: ${createdProduct.sku}\n`);

  // Test 4: Bulk save variants via POST /api/admin/products/[id]/variants
  console.log("[Test 4] Bulk creating product variants (2 Colors x 2 Sizes = 4 Variants)...");
  const variantsContext = { params: Promise.resolve({ id: createdProduct.id }) };
  const variantPayload = [
    {
      sku: `${baseSku}-BLK-9`,
      price: 180.0,
      salePrice: 159.99,
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      options: { Color: "Black", Size: "US 9" },
      weight: 0.75,
      dimensions: { length: 30, width: 20, height: 12, unit: "cm" },
      isDefault: true,
    },
    {
      sku: `${baseSku}-BLK-10`,
      price: 180.0,
      salePrice: 159.99,
      stock: 10,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
      options: { Color: "Black", Size: "US 10" },
      weight: 0.8,
      dimensions: { length: 31, width: 20, height: 12, unit: "cm" },
      isDefault: false,
    },
    {
      sku: `${baseSku}-WHT-9`,
      price: 190.0,
      salePrice: null,
      stock: 0, // out of stock variant
      imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5",
      options: { Color: "White", Size: "US 9" },
      weight: 0.75,
      dimensions: { length: 30, width: 20, height: 12, unit: "cm" },
      isDefault: false,
    },
    {
      sku: `${baseSku}-WHT-10`,
      price: 190.0,
      salePrice: 179.99,
      stock: 12,
      imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5",
      options: { Color: "White", Size: "US 10" },
      weight: 0.8,
      dimensions: { length: 31, width: 20, height: 12, unit: "cm" },
      isDefault: false,
    },
  ];

  const saveVarReq = new NextRequest(`http://localhost:3000/api/admin/products/${createdProduct.id}/variants`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ variants: variantPayload }),
  });
  const saveVarRes = await saveVariantsHandler(saveVarReq, variantsContext);
  const saveVarData = (await saveVarRes.json()) as any;

  if (!saveVarRes.ok || !saveVarData.success) {
    throw new Error(`Failed to save variants: ${saveVarData.error || saveVarRes.status}`);
  }
  if (!saveVarData.data || saveVarData.data.length !== 4) {
    throw new Error(`Expected 4 saved variants, received ${saveVarData.data?.length}`);
  }
  console.log(` [PASS] Successfully saved ${saveVarData.data.length} variants via API.\n`);

  // Test 5: Retrieve variants via GET /api/admin/products/[id]/variants
  console.log("[Test 5] Fetching variants via GET /api/admin/products/[id]/variants...");
  const getVarReq = new NextRequest(`http://localhost:3000/api/admin/products/${createdProduct.id}/variants`, {
    headers: authHeaders,
  });
  const getVarRes = await getVariantsHandler(getVarReq, variantsContext);
  const getVarData = (await getVarRes.json()) as any;

  if (!getVarRes.ok || !getVarData.success || getVarData.data.length !== 4) {
    throw new Error("Failed to retrieve product variants.");
  }
  const defaultVar = getVarData.data[0];
  if (!defaultVar.isDefault || defaultVar.sku !== `${baseSku}-BLK-9`) {
    throw new Error("Default variant was not ordered first or marked as default.");
  }
  console.log(` [PASS] Default variant verified: ${defaultVar.sku} with options ${JSON.stringify(defaultVar.options)}.\n`);

  // Test 6: Storefront integration - query product by slug
  console.log("[Test 6] Testing storefront query getProductBySlug()...");
  const storefrontProduct = await getProductBySlug(baseSlug);
  if (!storefrontProduct) {
    throw new Error("Product could not be retrieved by slug.");
  }
  if (!storefrontProduct.variants || storefrontProduct.variants.length !== 4) {
    throw new Error(`Expected 4 variants on storefront product, got ${storefrontProduct.variants?.length}`);
  }
  console.log(` [PASS] Storefront product resolved with ${storefrontProduct.variants.length} attached variants.\n`);

  // Test 7: Delete variant via DELETE /api/admin/variants/[variantId]
  console.log("[Test 7] Testing variant deletion via DELETE /api/admin/variants/[variantId]...");
  const variantToDelete = getVarData.data[3]; // WHT-10
  const deleteContext = { params: Promise.resolve({ variantId: variantToDelete.id }) };
  const delReq = new NextRequest(`http://localhost:3000/api/admin/variants/${variantToDelete.id}`, {
    method: "DELETE",
    headers: authHeaders,
  });
  const delRes = await deleteVariantHandler(delReq, deleteContext);
  const delData = (await delRes.json()) as any;

  if (!delRes.ok || !delData.success) {
    throw new Error(`Failed to delete variant: ${delData.error}`);
  }

  // Verify deletion count
  const updatedVarRes = await getVariantsHandler(getVarReq, variantsContext);
  const updatedVarData = (await updatedVarRes.json()) as any;
  if (updatedVarData.data.length !== 3) {
    throw new Error(`Expected 3 variants after deletion, found ${updatedVarData.data.length}`);
  }
  console.log(` [PASS] Variant ${variantToDelete.sku} deleted successfully (Remaining: ${updatedVarData.data.length}).\n`);

  // Test 8: Duplicate product also clones its variants
  console.log("[Test 8] Testing product duplication with attached variants...");
  const cloned = await duplicateProduct(createdProduct.id);
  if (!cloned) {
    throw new Error("Failed to duplicate product.");
  }
  if (!cloned.variants || cloned.variants.length !== 3) {
    throw new Error(`Expected cloned product to have 3 variants, found ${cloned.variants?.length}`);
  }
  const clonedFirstSku = cloned.variants[0].sku;
  if (!clonedFirstSku.includes("COPY")) {
    throw new Error(`Expected cloned variant SKU to contain COPY, got ${clonedFirstSku}`);
  }
  console.log(` [PASS] Product cloned successfully with ${cloned.variants.length} unique variant copies (e.g. ${clonedFirstSku}).\n`);

  console.log("==========================================");
  console.log(" ALL STAGE 6 TESTS COMPLETED SUCCESSFULLY! ");
  console.log("==========================================");
}

runStage6Tests().catch((err) => {
  console.error("\n❌ Stage 6 Test Failure:", err);
  process.exit(1);
});
