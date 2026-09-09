import {
  generateSlug,
  categorySchema,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryById,
  getCategoryBySlug,
  listCategories,
  getActiveCategories,
  buildCategoryTree,
  flattenCategoryHierarchy,
  getDescendantIds,
} from "../lib/categories";

async function runStage4Tests() {
  console.log("=========================================");
  console.log("  Stage 4: Categories CRUD Verification  ");
  console.log("=========================================\n");

  // 1. Slug Generator & Validation
  console.log("[Test 1] Testing slug generation and Zod validation...");
  const sampleName = "Urban Streetwear & Winter Hoodies!";
  const generatedSlug = generateSlug(sampleName);
  if (generatedSlug !== "urban-streetwear-winter-hoodies") {
    throw new Error(`Unexpected generated slug: ${generatedSlug}`);
  }
  console.log(" - Generated slug:", generatedSlug);

  const validParsed = categorySchema.safeParse({
    name: "Streetwear",
    slug: "streetwear",
    sortOrder: 1,
    status: "active",
  });
  if (!validParsed.success) {
    throw new Error("Valid category input failed Zod schema!");
  }

  const invalidParsed = categorySchema.safeParse({
    name: "",
    slug: "INVALID SLUG WITH SPACES",
  });
  if (invalidParsed.success) {
    throw new Error("Invalid category input unexpectedly passed Zod schema!");
  }
  console.log(" [PASS] Slug generation & Zod validation functional.\n");

  // 2. Create Root Category
  console.log("[Test 2] Creating Root Category (Apparel)...");
  const uniqueRootSlug = `apparel-${Date.now()}`;
  const rootCategory = await createCategory({
    name: "Apparel Collection",
    slug: uniqueRootSlug,
    description: "Premium curated apparel and essentials.",
    sortOrder: 1,
    status: "active",
    seoTitle: "Shop Apparel - Modern Edge Store",
    seoDescription: "Browse our latest high-grade apparel collection.",
  });
  console.log(" - Created Root Category:", rootCategory.id, rootCategory.name, `/${rootCategory.slug}`);
  if (!rootCategory.id || rootCategory.name !== "Apparel Collection") {
    throw new Error("Failed to create root category properly!");
  }
  console.log(" [PASS] Root Category created successfully.\n");

  // 3. Create Child Category (Nesting / Hierarchy)
  console.log("[Test 3] Creating Child Category (Jackets) with parentId...");
  const uniqueChildSlug = `jackets-${Date.now()}`;
  const childCategory = await createCategory({
    name: "Outerwear & Jackets",
    slug: uniqueChildSlug,
    description: "Technical windbreakers, bombers, and parkas.",
    parentId: rootCategory.id,
    imageUrl: "https://assets.example.com/jackets-hero.webp",
    sortOrder: 2,
    status: "active",
  });
  console.log(" - Created Child Category:", childCategory.id, childCategory.name, `parentId: ${childCategory.parentId}`);
  if (childCategory.parentId !== rootCategory.id) {
    throw new Error("Child category did not record parentId properly!");
  }
  console.log(" [PASS] Child Category created successfully.\n");

  // 4. Create Grandchild Category (Multi-level nesting)
  console.log("[Test 4] Creating Grandchild Category (Bomber Jackets)...");
  const uniqueGrandchildSlug = `bombers-${Date.now()}`;
  const grandchildCategory = await createCategory({
    name: "Bomber Jackets",
    slug: uniqueGrandchildSlug,
    description: "Flight satin and insulated bombers.",
    parentId: childCategory.id,
    sortOrder: 1,
    status: "active",
  });
  console.log(" - Created Grandchild Category:", grandchildCategory.id, grandchildCategory.name, `parentId: ${grandchildCategory.parentId}`);
  console.log(" [PASS] Multi-level hierarchy created.\n");

  // 5. Test Tree Building and Flattened Depth
  console.log("[Test 5] Testing hierarchy tree builder and depth calculation...");
  const allCategories = await listCategories();
  const tree = buildCategoryTree(allCategories);
  const flattened = flattenCategoryHierarchy(tree);

  const flatRoot = flattened.find((c) => c.id === rootCategory.id);
  const flatChild = flattened.find((c) => c.id === childCategory.id);
  const flatGrandchild = flattened.find((c) => c.id === grandchildCategory.id);

  console.log(` - Root '${flatRoot?.name}' depth:`, flatRoot?.depth);
  console.log(` - Child '${flatChild?.name}' depth:`, flatChild?.depth);
  console.log(` - Grandchild '${flatGrandchild?.name}' depth:`, flatGrandchild?.depth);

  if (flatRoot?.depth !== 0 || flatChild?.depth !== 1 || flatGrandchild?.depth !== 2) {
    throw new Error(`Incorrect depth calculations! Got: root=${flatRoot?.depth}, child=${flatChild?.depth}, grandchild=${flatGrandchild?.depth}`);
  }
  console.log(" [PASS] Tree builder and depth calculations verified.\n");

  // 6. Test Circular Reference Detection
  console.log("[Test 6] Testing circular parent assignment prevention...");
  const rootDescendants = getDescendantIds(allCategories, rootCategory.id);
  console.log(" - Root category descendants count:", rootDescendants.size);
  if (!rootDescendants.has(childCategory.id) || !rootDescendants.has(grandchildCategory.id)) {
    throw new Error("Descendant detection failed to identify child and grandchild!");
  }
  console.log(" [PASS] Circular reference protection detected all descendants.\n");

  // 7. Update Category
  console.log("[Test 7] Updating category attributes...");
  const updatedChild = await updateCategory(childCategory.id, {
    name: "Premium Outerwear & Parkas",
    description: "Updated luxury parkas and insulated jackets.",
    imageUrl: "https://assets.example.com/updated-parkas.webp",
  });
  if (
    !updatedChild ||
    updatedChild.name !== "Premium Outerwear & Parkas" ||
    updatedChild.imageUrl !== "https://assets.example.com/updated-parkas.webp"
  ) {
    throw new Error("Failed to update category attributes!");
  }
  console.log(" - Category successfully updated:", updatedChild.name);
  console.log(" [PASS] Category update verified.\n");

  // 8. Storefront Queries (Active categories & slug fetching)
  console.log("[Test 8] Testing storefront queries (by slug & active filter)...");
  const fetchedBySlug = await getCategoryBySlug(uniqueChildSlug);
  if (!fetchedBySlug || fetchedBySlug.id !== childCategory.id) {
    throw new Error(`Failed to retrieve category by slug: ${uniqueChildSlug}`);
  }

  const activeStoreCategories = await getActiveCategories();
  const hasRoot = activeStoreCategories.some((c) => c.id === rootCategory.id);
  const hasChild = activeStoreCategories.some((c) => c.id === childCategory.id);
  if (!hasRoot || !hasChild) {
    throw new Error("Active categories list did not contain newly created categories!");
  }
  console.log(` - Storefront active categories count: ${activeStoreCategories.length}`);
  console.log(" [PASS] Storefront queries working correctly.\n");

  // 9. Delete Category and Verify Child Unlinking
  console.log("[Test 9] Deleting Child Category and checking child unlinking...");
  const deleted = await deleteCategory(childCategory.id);
  if (!deleted) {
    throw new Error("deleteCategory returned false!");
  }

  const checkDeleted = await getCategoryById(childCategory.id);
  if (checkDeleted) {
    throw new Error("Deleted category still exists in database!");
  }

  // The grandchild should now have parentId = null
  const checkGrandchild = await getCategoryById(grandchildCategory.id);
  console.log(" - Grandchild parentId after parent deletion:", checkGrandchild?.parentId);
  if (checkGrandchild && checkGrandchild.parentId !== null) {
    throw new Error("Child category was not safely unlinked upon parent deletion!");
  }
  console.log(" [PASS] Category deletion and cascade unlinking verified.\n");

  // Clean up remaining test categories
  await deleteCategory(rootCategory.id);
  await deleteCategory(grandchildCategory.id);

  console.log("=================================================");
  console.log("  ALL STAGE 4 CATEGORIES TESTS PASSED (9/9)       ");
  console.log("=================================================\n");
}

runStage4Tests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
