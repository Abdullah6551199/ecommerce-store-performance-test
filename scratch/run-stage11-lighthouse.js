const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const baseUrl = process.env.TEST_URL || 'https://ecommerce-store-perf-test.zia291930.workers.dev';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const audits = [
  {
    name: 'Homepage Mobile',
    url: `${baseUrl}/`,
    formFactor: 'mobile',
    outputFile: path.join(__dirname, 'lh-stage11-home-mobile.json')
  },
  {
    name: 'Homepage Desktop',
    url: `${baseUrl}/`,
    formFactor: 'desktop',
    outputFile: path.join(__dirname, 'lh-stage11-home-desktop.json')
  },
  {
    name: 'Product Page Mobile',
    url: `${baseUrl}/product/apex-velocity-runner-x1`,
    formFactor: 'mobile',
    outputFile: path.join(__dirname, 'lh-stage11-product-mobile.json')
  },
  {
    name: 'Product Page Desktop',
    url: `${baseUrl}/product/apex-velocity-runner-x1`,
    formFactor: 'desktop',
    outputFile: path.join(__dirname, 'lh-stage11-product-desktop.json')
  },
  {
    name: 'Category Page Mobile',
    url: `${baseUrl}/category/footwear`,
    formFactor: 'mobile',
    outputFile: path.join(__dirname, 'lh-stage11-category-mobile.json')
  },
  {
    name: 'Category Page Desktop',
    url: `${baseUrl}/category/footwear`,
    formFactor: 'desktop',
    outputFile: path.join(__dirname, 'lh-stage11-category-desktop.json')
  },
  {
    name: 'Search Page Mobile',
    url: `${baseUrl}/search?q=runner`,
    formFactor: 'mobile',
    outputFile: path.join(__dirname, 'lh-stage11-search-mobile.json')
  },
  {
    name: 'Search Page Desktop',
    url: `${baseUrl}/search?q=runner`,
    formFactor: 'desktop',
    outputFile: path.join(__dirname, 'lh-stage11-search-desktop.json')
  }
];

const results = [];

async function runAll() {
  console.log('================================================================================');
  console.log('  STAGE 11 LIGHTHOUSE AUDIT SUITE');
  console.log(`  Base URL: ${baseUrl}`);
  console.log('================================================================================\n');

  // Warm up the routes first
  console.log('Warming up routes...');
  for (const audit of audits) {
    try {
      await fetch(audit.url);
    } catch (e) {}
  }
  console.log('Warm up complete.\n');

  for (const audit of audits) {
    console.log(`>>> Running Lighthouse: ${audit.name} (${audit.formFactor})...`);
    const preset = audit.formFactor === 'desktop' ? '--preset=desktop' : '';
    const cmd = `npx.cmd -y lighthouse "${audit.url}" --output=json --output-path="${audit.outputFile}" --chrome-flags="--headless=new --no-sandbox" ${preset} --only-categories=performance,accessibility,best-practices,seo --quiet`;

    try {
      execSync(cmd, {
        env: { ...process.env, CHROME_PATH: chromePath },
        stdio: 'inherit',
        timeout: 90000
      });
      console.log(`✓ ${audit.name} audit complete.`);
    } catch (err) {
      if (fs.existsSync(audit.outputFile)) {
        console.log(`✓ ${audit.name} output file written.`);
      } else {
        console.error(`✗ Error on ${audit.name}:`, err.message);
      }
    }

    if (fs.existsSync(audit.outputFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(audit.outputFile, 'utf8'));
        const cats = data.categories || {};
        const auditsObj = data.audits || {};

        const perf = Math.round((cats.performance?.score || 0) * 100);
        const a11y = Math.round((cats.accessibility?.score || 0) * 100);
        const bp = Math.round((cats['best-practices']?.score || 0) * 100);
        const seo = Math.round((cats.seo?.score || 0) * 100);

        const lcp = auditsObj['largest-contentful-paint']?.displayValue || 'N/A';
        const fcp = auditsObj['first-contentful-paint']?.displayValue || 'N/A';
        const tbt = auditsObj['total-blocking-time']?.displayValue || 'N/A';
        const cls = auditsObj['cumulative-layout-shift']?.displayValue || '0';

        const row = {
          name: audit.name,
          formFactor: audit.formFactor,
          performance: perf,
          accessibility: a11y,
          bestPractices: bp,
          seo,
          lcp,
          fcp,
          tbt,
          cls
        };
        results.push(row);

        console.log(`   📊 ${audit.name}:`);
        console.log(`      Performance: ${perf} | Accessibility: ${a11y} | Best Practices: ${bp} | SEO: ${seo}`);
        console.log(`      LCP: ${lcp} | FCP: ${fcp} | TBT: ${tbt} | CLS: ${cls}\n`);
      } catch (e) {
        console.error(`Could not parse ${audit.name}:`, e.message);
      }
    }
  }

  const summaryFile = path.join(__dirname, 'stage11-lighthouse-summary.json');
  fs.writeFileSync(summaryFile, JSON.stringify(results, null, 2));
  console.log(`Saved summary to ${summaryFile}`);
}

runAll().catch(console.error);
