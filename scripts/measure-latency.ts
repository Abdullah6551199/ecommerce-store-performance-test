async function run() {
  const storeUrl = "https://nasrify-store.zia291930.workers.dev/";
  const times: number[] = [];
  for (let i = 0; i < 5; i++) {
    const t0 = Date.now();
    const res = await fetch(storeUrl);
    const text = await res.text();
    times.push(Date.now() - t0);
  }
  const avg = times.reduce((a, b) => a + b, 0) / times.length;
  console.log(`Latencies: ${times.join(", ")} ms`);
  console.log(`Average Latency: ${avg.toFixed(1)} ms`);
}

run();
