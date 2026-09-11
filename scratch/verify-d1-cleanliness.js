/**
 * D1 Remote Database Cleanliness Audit
 * Queries settings, homepage_sections, products, categories
 * Checks for: cloudflare, d1, r2, opennext, workers, next.js, edge delivery, edge commerce
 */

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || 'ab9b528badc7cbd3e583a9ff7935a07f';
const token = process.env.CLOUDFLARE_API_TOKEN || '';
const dbId = process.env.CLOUDFLARE_D1_DATABASE_ID || '3a60804b-1009-4451-972b-87cec6d46bcb';

async function queryD1(sql) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ sql })
  });
  const data = await res.json();
  if (!data.success) throw new Error(JSON.stringify(data.errors));
  return data.result?.[0]?.results || [];
}

const forbiddenRegex = /\b(cloudflare|d1|r2|opennext|workers|next\.js|edge\s*delivery|edge\s*commerce)\b/i;

async function checkD1() {
  console.log('================================================================================');
  console.log('  VERIFYING D1 DATABASE CLEANLINESS');
  console.log(`  Target DB: ${dbId}`);
  console.log('================================================================================\n');

  let violations = 0;

  // 1. Settings
  console.log('1. Checking `settings` table...');
  const settings = await queryD1('SELECT key, value FROM settings;');
  for (const s of settings) {
    if (forbiddenRegex.test(s.value)) {
      console.error(`   ❌ Violation in settings key "${s.key}":`, s.value.substring(0, 150));
      violations++;
    } else {
      console.log(`   ✅ settings [${s.key}]: Clean`);
    }
  }

  // 2. Homepage Sections
  console.log('\n2. Checking `homepage_sections` table...');
  const sections = await queryD1('SELECT id, title, content FROM homepage_sections;');
  for (const sec of sections) {
    const text = `${sec.title} ${sec.content || ''}`;
    if (forbiddenRegex.test(text)) {
      console.error(`   ❌ Violation in homepage section "${sec.id}":`, text);
      violations++;
    } else {
      console.log(`   ✅ homepage_sections [${sec.id}]: Clean`);
    }
  }

  // 3. Products
  console.log('\n3. Checking `products` table...');
  const products = await queryD1('SELECT id, name, short_description, description, seo_description FROM products;');
  for (const p of products) {
    const text = `${p.name} ${p.short_description || ''} ${p.description || ''} ${p.seo_description || ''}`;
    if (forbiddenRegex.test(text)) {
      console.error(`   ❌ Violation in product "${p.id}" (${p.name}):`, text);
      violations++;
    } else {
      console.log(`   ✅ products [${p.id}] (${p.name}): Clean`);
    }
  }

  // 4. Categories
  console.log('\n4. Checking `categories` table...');
  const categories = await queryD1('SELECT id, name, description FROM categories;');
  for (const c of categories) {
    const text = `${c.name} ${c.description || ''}`;
    if (forbiddenRegex.test(text)) {
      console.error(`   ❌ Violation in category "${c.id}" (${c.name}):`, text);
      violations++;
    } else {
      console.log(`   ✅ categories [${c.id}] (${c.name}): Clean`);
    }
  }

  console.log('\n================================================================================');
  if (violations === 0) {
    console.log('🎉 D1 CLEANLINESS VERIFIED: ALL TABLES AND RECORDS 100% CLEAN!');
  } else {
    console.error(`⚠️ D1 CLEANLINESS FAILED: ${violations} violation(s) found.`);
  }
  console.log('================================================================================\n');

  return violations === 0;
}

checkD1().then(success => {
  if (!success) process.exit(1);
});
