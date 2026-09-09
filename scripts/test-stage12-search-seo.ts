import { searchProductsAdvanced, createProduct, deleteProduct } from "../lib/products";
import sitemap from "../app/sitemap";
import robots from "../app/robots";
import { generateProductJsonLd, generateCategoryJsonLd, generateBreadcrumbJsonLd } from "../lib/seo";

async function runTests() {
  console.log("=== STARTING STAGE 12 COMPREHENSIVE TESTS ===");

  // Create sample test products to rigorously test filtering, facets, and sorting
  console.log("\n[Setup] Creating sample test products...");
  const p1 = await createProduct({
    name: "Apex Ultra Sneaker Pro",
    slug: `apex-ultra-sneaker-pro-${Date.now()}`,
    sku: `SKU-TEST-1-${Date.now()}`,
    price: 150,
    salePrice: 120,
    brand: "ApexGear",
    tags: ["shoes", "running", "athletic"],
    stockQuantity: 25,
    stockStatus: "in_stock",
    status: "published",
    mainImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    description: "High performance running shoes designed for ultimate speed.",
    seoTitle: "Apex Ultra Sneaker Pro - Best Running Shoes",
    seoDescription: "Buy Apex Ultra Sneaker Pro with free shipping.",
  });

  const p2 = await createProduct({
    name: "Apex Cyber Backpack",
    slug: `apex-cyber-backpack-${Date.now()}`,
    sku: `SKU-TEST-2-${Date.now()}`,
    price: 80,
    brand: "ApexGear",
    tags: ["bags", "travel", "accessories"],
    stockQuantity: 10,
    stockStatus: "in_stock",
    status: "published",
    mainImage: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    description: "Waterproof commuter backpack with laptop sleeve.",
  });

  const p3 = await createProduct({
    name: "Apex Vintage Sunglasses",
    slug: `apex-vintage-sunglasses-${Date.now()}`,
    sku: `SKU-TEST-3-${Date.now()}`,
    price: 220,
    brand: "SunCraft",
    tags: ["eyewear", "accessories", "summer"],
    stockQuantity: 0,
    stockStatus: "out_of_stock",
    status: "published",
    mainImage: "https://images.unsplash.com/photo-1511499767150-a48a237f0083",
    description: "Polarized luxury sunglasses with UV400 protection.",
  });

  const createdIds = [p1.id, p2.id, p3.id];
  console.log(`- Created 3 test products: ${createdIds.join(", ")}`);

  try {
    // 1. Test searchProductsAdvanced with all published products & facets
    console.log("\n[Test 1] Testing basic searchProductsAdvanced without query (catalog facets)...");
    const allResults = await searchProductsAdvanced({ publishedOnly: true });
    console.log(`- Total products returned: ${allResults.products.length}`);
    console.log(`- Total count: ${allResults.total}`);
    console.log(`- Facet Brands:`, allResults.facets.brands);
    console.log(`- Facet Tags count: ${allResults.facets.tags.length}`);
    console.log(`- Facet Price Range: $${allResults.facets.priceRange.min} to $${allResults.facets.priceRange.max}`);

    if (allResults.total < 3) {
      throw new Error(`Expected at least 3 products, got ${allResults.total}`);
    }

    // Check brand facets
    const apexGearFacet = allResults.facets.brands.find((b) => b.name === "ApexGear");
    if (!apexGearFacet || apexGearFacet.count < 2) {
      throw new Error("Brand facets missing or incorrect count for ApexGear");
    }

    // 2. Test text search query
    console.log("\n[Test 2] Testing text search query for 'backpack'...");
    const textSearch = await searchProductsAdvanced({ query: "backpack", publishedOnly: true });
    console.log(`- Found ${textSearch.products.length} products matching 'backpack'`);
    if (!textSearch.products.some((p) => p.id === p2.id)) {
      throw new Error("Text search failed to find Apex Cyber Backpack");
    }

    // 3. Test brand filtering
    console.log("\n[Test 3] Testing brand filter 'SunCraft'...");
    const brandSearch = await searchProductsAdvanced({ brand: "SunCraft", publishedOnly: true });
    console.log(`- Found ${brandSearch.products.length} products matching brand 'SunCraft'`);
    if (!brandSearch.products.some((p) => p.id === p3.id) || brandSearch.products.some((p) => p.id === p1.id)) {
      throw new Error("Brand filter failed");
    }

    // 4. Test price range filtering
    console.log("\n[Test 4] Testing price range filtering [70, 100]...");
    const priceSearch = await searchProductsAdvanced({ minPrice: 70, maxPrice: 100, publishedOnly: true });
    console.log(`- Found ${priceSearch.products.length} products between $70 and $100`);
    if (!priceSearch.products.some((p) => p.id === p2.id) || priceSearch.products.some((p) => p.id === p3.id)) {
      throw new Error("Price range filter failed");
    }

    // 5. Test tags filtering
    console.log("\n[Test 5] Testing tags filtering ['running']...");
    const tagSearch = await searchProductsAdvanced({ tags: ["running"], publishedOnly: true });
    console.log(`- Found ${tagSearch.products.length} products with tag 'running'`);
    if (!tagSearch.products.some((p) => p.id === p1.id) || tagSearch.products.some((p) => p.id === p2.id)) {
      throw new Error("Tag filter failed");
    }

    // 6. Test inStock filter
    console.log("\n[Test 6] Testing inStock filter...");
    const stockSearch = await searchProductsAdvanced({ inStock: true, publishedOnly: true });
    console.log(`- Found ${stockSearch.products.length} in-stock products`);
    if (stockSearch.products.some((p) => p.id === p3.id)) {
      throw new Error("Out-of-stock product p3 found when inStock is true");
    }
    if (!stockSearch.products.some((p) => p.id === p1.id)) {
      throw new Error("In-stock product p1 not found");
    }

    // 7. Test sorting
    console.log("\n[Test 7] Testing sorting price_asc and price_desc...");
    const ascSearch = await searchProductsAdvanced({ sort: "price_asc", publishedOnly: true });
    const descSearch = await searchProductsAdvanced({ sort: "price_desc", publishedOnly: true });
    const p1Price = p1.salePrice || p1.price; // 120
    const p2Price = p2.salePrice || p2.price; // 80
    const p3Price = p3.salePrice || p3.price; // 220

    const idxAscP2 = ascSearch.products.findIndex((p) => p.id === p2.id);
    const idxAscP1 = ascSearch.products.findIndex((p) => p.id === p1.id);
    const idxAscP3 = ascSearch.products.findIndex((p) => p.id === p3.id);
    if (idxAscP2 > idxAscP1 || idxAscP1 > idxAscP3) {
      throw new Error(`price_asc sorting order failed: p2 ($80) at ${idxAscP2}, p1 ($120) at ${idxAscP1}, p3 ($220) at ${idxAscP3}`);
    }

    const idxDescP3 = descSearch.products.findIndex((p) => p.id === p3.id);
    const idxDescP1 = descSearch.products.findIndex((p) => p.id === p1.id);
    const idxDescP2 = descSearch.products.findIndex((p) => p.id === p2.id);
    if (idxDescP3 > idxDescP1 || idxDescP1 > idxDescP2) {
      throw new Error(`price_desc sorting order failed: p3 ($220) at ${idxDescP3}, p1 ($120) at ${idxDescP1}, p2 ($80) at ${idxDescP2}`);
    }
    console.log("- Sorting tests passed successfully!");

    // 8. Test dynamic Sitemap
    console.log("\n[Test 8] Testing sitemap()...");
    const sitemapEntries = await sitemap();
    console.log(`- Sitemap returned ${sitemapEntries.length} entries`);
    if (!sitemapEntries.some((e) => e.url.includes(p1.slug))) {
      throw new Error(`Sitemap missing product ${p1.slug}`);
    }

    // 9. Test dynamic Robots
    console.log("\n[Test 9] Testing robots()...");
    const r = robots();
    console.log("- Robots sitemap:", r.sitemap);
    console.log("- Robots rules:", JSON.stringify(r.rules));
    if (!r.sitemap?.includes("sitemap.xml")) {
      throw new Error("Robots missing sitemap.xml");
    }

    // 10. Test Schema.org JSON-LD
    console.log("\n[Test 10] Testing Schema.org JSON-LD generators...");
    const prodLd = generateProductJsonLd(p1);
    console.log("- Product JSON-LD name:", prodLd.name);
    console.log("- Product JSON-LD price:", prodLd.offers?.price);
    console.log("- Product JSON-LD availability:", prodLd.offers?.availability);
    if (prodLd.offers?.price !== "120.00") {
      throw new Error(`Expected price 120.00 in JSON-LD, got ${prodLd.offers?.price}`);
    }

    const catLd = generateCategoryJsonLd(
      {
        id: "cat-1",
        name: "Footwear",
        slug: "footwear",
        description: "Best shoes",
        parentId: null,
        imageUrl: null,
        sortOrder: 0,
        status: "active",
        seoTitle: null,
        seoDescription: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      [p1]
    );
    console.log("- Category JSON-LD name:", catLd.name);
    console.log("- Category JSON-LD items:", catLd.mainEntity?.itemListElement?.length);

    console.log("\n>>> ALL STAGE 12 COMPREHENSIVE TESTS PASSED! <<<");
  } finally {
    // Clean up test products
    console.log("\n[Cleanup] Cleaning up test products...");
    for (const id of createdIds) {
      await deleteProduct(id);
    }
    console.log("- Cleanup complete.");
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
