/**
 * Scrape dresses from Shopify-backed retailers.
 * These expose /products.json publicly, so no browser is needed.
 *
 *   node scripts/scrape-shopify.mjs
 * writes: data/catalog.json
 */
import { writeFile, mkdir } from 'node:fs/promises';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

/** domain -> display name. Order matters only for tie-breaking. */
const STORES = {
  'showpo.com': 'Showpo',
  'beginningboutique.com.au': 'Beginning Boutique',
  'peppermayo.com': 'Peppermayo',
  'petalandpup.com': 'Petal & Pup',
  'tigermist.com.au': 'Tiger Mist',
  'verge-girl.com': 'Verge Girl',
  'whitefoxboutique.com': 'White Fox',
  'motelrocks.com': 'Motel Rocks',
  'oakandfort.com': 'Oak + Fort',
  'everlane.com': 'Everlane',
};

const PAGES = 4; // 250 products per page
const DRESS_RE = /\b(dress|gown|frock|sundress)\b/i;
const NOT_DRESS_RE = /dress\s*shirt|dressing gown|nightgown|dress pant|christening/i;

async function getJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function priceOf(product) {
  const nums = (product.variants || [])
    .map((v) => Number.parseFloat(v.price))
    .filter((n) => Number.isFinite(n) && n > 0);
  return nums.length ? Math.min(...nums) : null;
}

function imageOf(product) {
  const img = (product.images || [])[0];
  return img?.src || null;
}

/** Ask Shopify's CDN for a resized image rather than downloading the full-size one. */
export function sized(src, width = 500) {
  if (!src) return null;
  return src.includes('?') ? `${src}&width=${width}` : `${src}?width=${width}`;
}

async function scrapeStore(domain, storeName) {
  const out = [];
  for (let page = 1; page <= PAGES; page++) {
    let data;
    try {
      data = await getJson(`https://${domain}/products.json?limit=250&page=${page}`);
    } catch (err) {
      console.warn(`  ${domain} page ${page}: ${err.message}`);
      break;
    }
    const products = data.products || [];
    if (!products.length) break;

    for (const p of products) {
      const hay = `${p.title || ''} ${p.product_type || ''}`;
      if (!DRESS_RE.test(hay) || NOT_DRESS_RE.test(hay)) continue;

      const price = priceOf(p);
      const image = imageOf(p);
      if (!price || !image) continue;

      out.push({
        id: `${domain}:${p.id}`,
        store: storeName,
        domain,
        name: p.title,
        price: Math.round(price * 100) / 100,
        currency: 'CAD',
        url: `https://${domain}/products/${p.handle}`,
        image: sized(image, 500),
        tags: Array.isArray(p.tags) ? p.tags.slice(0, 12) : [],
        productType: p.product_type || '',
      });
    }
  }
  return out;
}

async function main() {
  const all = [];
  for (const [domain, name] of Object.entries(STORES)) {
    process.stdout.write(`${name.padEnd(20)} `);
    try {
      const items = await scrapeStore(domain, name);
      all.push(...items);
      console.log(`${items.length} dresses`);
    } catch (err) {
      console.log(`FAILED — ${err.message}`);
    }
  }

  // de-dupe by id, then drop obvious duplicates by name+price within a store
  const seen = new Set();
  const catalog = all.filter((d) => {
    const key = `${d.domain}|${d.name.toLowerCase()}|${d.price}`;
    if (seen.has(d.id) || seen.has(key)) return false;
    seen.add(d.id);
    seen.add(key);
    return true;
  });

  await mkdir('data', { recursive: true });
  await writeFile('data/catalog.json', JSON.stringify(catalog, null, 1));
  console.log(`\n${catalog.length} dresses -> data/catalog.json`);

  const byStore = catalog.reduce((acc, d) => ({ ...acc, [d.store]: (acc[d.store] || 0) + 1 }), {});
  console.table(byStore);
}

main();
