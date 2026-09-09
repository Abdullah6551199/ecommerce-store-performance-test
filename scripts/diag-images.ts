async function runDiag() {
  const base = "https://ecommerce-store.zia291930.workers.dev";
  console.log("Fetching /api/products/search?q=new from live worker...");
  const res = await fetch(base + "/api/products/search?q=new");
  console.log("Status:", res.status);
  const json = (await res.json()) as any;
  if (json.data) {
    console.log("Total products returned:", json.data.length);
    json.data.forEach((p: any) => {
      console.log(`\nProduct ID: ${p.id} | Name: "${p.name}" | Slug: "${p.slug}"`);
      console.log(` - mainImage: ${p.mainImage}`);
      console.log(` - images count: ${p.images?.length || 0}`);
      p.images?.forEach((img: any) => console.log(`    img [${img.id}]: ${img.imageUrl} (isMain: ${img.isMain})`));
      console.log(` - variants count: ${p.variants?.length || 0}`);
      p.variants?.forEach((v: any) => console.log(`    var [${v.sku}]: ${v.imageUrl} (isDefault: ${v.isDefault})`));
    });
  }
}
runDiag();
