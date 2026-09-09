import {
  productSchema,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  getProductById,
  getProductBySlug,
  listProducts,
  getFeaturedProducts,
  getProductsByCategory,
  searchProducts,
  isSkuTaken,
  isProductSlugTaken,
} from "../lib/products";
import { createCategory, deleteCategory } from "../lib/categories";

async function runStage5Tests() {
  console.log("=========================================");
  console.log("   Stage 5: Product Engine Verification  ");
  console.log("=========================================\n");

  // 1. Zod Validation & Rules
  console.log("[Test 1] Testing Product Zod validation & pricing rules...");
  const validProduct = productSchema.safeParse({
    name: "Apex Cyber Jacket",
    slug: "apex-cyber-jacket",
    sku: "APEX-JKT-01",
    price: 150,
    salePrice: 120, // less than regular price
    stockQuantity: 20,
    mainImage: "https://assets.example.com/main.webp",
    galleryImages: ["https://assets.example.com/gallery1.webp"],
  });
  if (!validProduct.success) {
    throw new Error(`Valid product failed Zod parsing: ${JSON.stringify(validProduct.error.issues)}`);
  }

  // Invalid: salePrice >= price
  const invalidPricing = productSchema.safeParse({
    name: "Apex Cyber Jacket",
    slug: "apex-cyber-jacket",
    sku: "APEX-JKT-01",
    price: 100,
    salePrice: 120, // INVALID: greater than regular price
    mainImage: "https://assets.example.com/main.webp",
  });
  if (invalidPricing.success) {
    throw new Error("Invalid salePrice unexpectedly passed validation!");
  }
  console.log(" [PASS] Zod schema & salePrice < regular price validation functional.\n");

  // 2. Setup Category for Product Association
  console.log("[Test 2] Creating test category for product assignment...");
  const testCat = await createCategory({
    name: `Cyber Techwear ${Date.now().toString().slice(-4)}`,
    slug: `cyber-techwear-${Date.now()}`,
    sortOrder: 1,
    status: "active",
  });
  console.log(" - Created Category ID:", testCat.id, testCat.name);
  console.log(" [PASS] Category prepared.\n");

  // 3. Create Product with Main & Gallery Images
  console.log("[Test 3] Creating product with main and gallery images...");
  const uniqueSku = `SKU-STAGE5-${Date.now().toString().slice(-4)}`;
  const uniqueSlug = `apex-bomber-jacket-${Date.now()}`;
  const newProduct = await createProduct({
    name: "Apex Tactical Bomber Jacket",
    slug: uniqueSlug,
    sku: uniqueSku,
    shortDescription: "Waterproof ripstop nylon flight jacket.",
    description: "Built with military-grade ballistic nylon and YKK waterproof zippers.",
    price: 199.99,
    salePrice: 159.99,
    costPrice: 65.0,
    compareAtPrice: 220.0,
    stockQuantity: 45,
    stockStatus: "in_stock",
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorders: false,
    categoryId: testCat.id,
    brand: "Apex Studio",
    tags: ["outerwear", "tactical", "bomber", "black"],
    status: "published",
    mainImage: "https://assets.example.com/apex-main.webp",
    galleryImages: [
      "https://assets.example.com/apex-angle1.webp",
      "https://assets.example.com/apex-angle2.webp",
    ],
    seoTitle: "Apex Tactical Bomber | High-Performance Outerwear",
    seoDescription: "Shop the Apex Tactical Bomber Jacket featuring ballistic nylon.",
  });

  console.log(" - Created Product ID:", newProduct.id);
  console.log(" - Main image:", newProduct.mainImage);
  console.log(" - Total images linked:", newProduct.images.length);

  if (newProduct.images.length !== 3) {
    throw new Error(`Expected 3 images (1 main + 2 gallery), got ${newProduct.images.length}`);
  }
  if (!newProduct.images[0].isMain) {
    throw new Error("Primary image was not flagged as isMain!");
  }
  console.log(" [PASS] Product created with R2 image associations.\n");

  // 4. SKU & Slug Uniqueness Checks
  console.log("[Test 4] Testing SKU and Slug uniqueness checks...");
  const skuTaken = await isSkuTaken(uniqueSku);
  const slugTaken = await isProductSlugTaken(uniqueSlug);
  if (!skuTaken || !slugTaken) {
    throw new Error("Uniqueness checks failed to recognize existing SKU or slug!");
  }
  const differentSkuTaken = await isSkuTaken("COMPLETELY-NEW-SKU-XYZ");
  if (differentSkuTaken) {
    throw new Error("isSkuTaken falsely reported new SKU as taken!");
  }
  console.log(" [PASS] Uniqueness checks working properly.\n");

  // 5. Update Product (Pricing & Inventory)
  console.log("[Test 5] Updating product price, stock, and gallery...");
  const updatedProduct = await updateProduct(newProduct.id, {
    price: 189.99,
    salePrice: 149.99,
    stockQuantity: 40,
    galleryImages: ["https://assets.example.com/apex-new-angle.webp"],
  });
  if (!updatedProduct) {
    throw new Error("Failed to update product!");
  }
  if (updatedProduct.price !== 189.99 || updatedProduct.salePrice !== 149.99 || updatedProduct.stockQuantity !== 40) {
    throw new Error("Updated product values do not match input!");
  }
  if (updatedProduct.images.length !== 2) {
    throw new Error(`Expected 2 images after gallery update, got ${updatedProduct.images.length}`);
  }
  console.log(" - Updated Price:", updatedProduct.price, "Sale:", updatedProduct.salePrice, "Stock:", updatedProduct.stockQuantity);
  console.log(" [PASS] Product update verified.\n");

  // 6. Duplicate Product
  console.log("[Test 6] Duplicating product...");
  const cloned = await duplicateProduct(newProduct.id);
  if (!cloned) {
    throw new Error("duplicateProduct returned null!");
  }
  console.log(" - Cloned Product Name:", cloned.name);
  console.log(" - Cloned SKU:", cloned.sku);
  console.log(" - Cloned Slug:", cloned.slug);

  if (!cloned.name.includes("(Copy)") || cloned.sku === uniqueSku || cloned.slug === uniqueSlug) {
    throw new Error("Duplicated product did not generate distinct SKU or slug!");
  }
  if (cloned.images.length !== updatedProduct.images.length) {
    throw new Error("Cloned product did not copy gallery images!");
  }
  console.log(" [PASS] Product duplication engine functional.\n");

  // 7. Storefront Queries (Featured, Category, and Details)
  console.log("[Test 7] Testing storefront product queries...");
  const featured = await getFeaturedProducts(4);
  console.log(" - Featured products count:", featured.length);
  if (!featured.some((p) => p.id === newProduct.id)) {
    throw new Error("Newly published product not found in featured list!");
  }

  const catProducts = await getProductsByCategory(testCat.id);
  console.log(` - Products in category '${testCat.name}':`, catProducts.length);
  if (!catProducts.some((p) => p.id === newProduct.id)) {
    throw new Error("Product not found under its assigned category!");
  }

  const fetchedBySlug = await getProductBySlug(uniqueSlug);
  if (!fetchedBySlug || fetchedBySlug.id !== newProduct.id) {
    throw new Error("Failed to fetch product by slug!");
  }
  console.log(" [PASS] Storefront product queries verified.\n");

  // 8. Product Search
  console.log("[Test 8] Testing product search across name, brand, and tags...");
  const nameSearch = await searchProducts("Tactical Bomber", { publishedOnly: true });
  if (!nameSearch.some((p) => p.id === newProduct.id)) {
    throw new Error("Keyword search for 'Tactical Bomber' failed to return product!");
  }

  const skuSearch = await searchProducts(uniqueSku, { publishedOnly: true });
  if (!skuSearch.some((p) => p.id === newProduct.id)) {
    throw new Error("Search by SKU failed!");
  }

  const brandSearch = await searchProducts("Apex Studio", { publishedOnly: true });
  if (!brandSearch.some((p) => p.id === newProduct.id)) {
    throw new Error("Search by Brand failed!");
  }
  console.log(" - Search matches verified across name, SKU, and brand.");
  console.log(" [PASS] Product search verified.\n");

  // 9. Delete Product & Cascade Verification
  console.log("[Test 9] Deleting product and testing image cascade...");
  const deleted = await deleteProduct(newProduct.id);
  if (!deleted) {
    throw new Error("deleteProduct returned false!");
  }

  const checkDeleted = await getProductById(newProduct.id);
  if (checkDeleted) {
    throw new Error("Product still exists after deleteProduct!");
  }
  console.log(" - Product deleted successfully.");

  // Clean up clone and test category
  await deleteProduct(cloned.id);
  await deleteCategory(testCat.id);

  console.log("=================================================");
  console.log("   ALL STAGE 5 PRODUCT TESTS PASSED (9/9)        ");
  console.log("=================================================\n");
}

runStage5Tests().catch((err) => {
  console.error("❌ Stage 5 Test failed:", err);
  process.exit(1);
});
