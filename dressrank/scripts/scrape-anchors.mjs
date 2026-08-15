/**
 * Scrape Zara / Aritzia / Simons with a real browser.
 *
 * These block plain HTTP requests, so they need Chromium. NOTE: this script
 * cannot run inside the sandboxed build environment (Chromium has no network
 * egress there) — run it on your own machine:
 *
 *   npx playwright install chromium     # once
 *   npm run scrape:anchors
 *
 * It merges into data/catalog.json, so run it before `npm run embed`.
 */
import { chromium } from 'playwright';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const TARGETS = [
  {
    store: 'Zara',
    domain: 'zara.com',
    url: 'https://www.zara.com/ca/en/woman-dresses-l1066.html',
    itemSelector: 'li.product-grid-product',
    fields: {
      name: '.product-grid-product-info__name, a.product-link',
      price: '.price__amount-current, .money-amount__main',
      link: 'a.product-link',
      image: 'img',
    },
  },
  {
    store: 'Aritzia',
    domain: 'aritzia.com',
    url: 'https://www.aritzia.com/en/clothing/dresses',
    itemSelector: '[data-testid="product-tile"], .product-tile',
    fields: {
      name: '.product-name, [data-testid="product-name"]',
      price: '.price, [data-testid="price"]',
      link: 'a',
      image: 'img',
    },
  },
  {
    store: 'Simons',
    domain: 'simons.ca',
    url: 'https://www.simons.ca/en/women-clothing/dresses--6680',
    itemSelector: '.product-tile, [class*="ProductTile"]',
    fields: {
      name: '[class*="title"], .product-title',
      price: '[class*="price"]',
      link: 'a',
      image: 'img',
    },
  },
];

const SCROLL_PASSES = 8;

const parsePrice = (text) => {
  if (!text) return null;
  const m = text.replace(/\s/g, '').match(/(\d+[.,]?\d*)/);
  if (!m) return null;
  const n = Number.parseFloat(m[1].replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null;
};

async function scrapeTarget(browser, target) {
  const ctx = await browser.newContext({
    userAgent: UA,
    locale: 'en-CA',
    viewport: { width: 1440, height: 1000 },
  });
  const page = await ctx.newPage();
  const items = [];

  try {
    await page.goto(target.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(3500);

    // dismiss cookie / region interstitials, best effort
    for (const label of [/accept/i, /agree/i, /continue/i, /canada/i]) {
      const btn = page.getByRole('button', { name: label }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
        await page.waitForTimeout(800);
      }
    }

    // these grids lazy-load, so scroll before reading
    for (let i = 0; i < SCROLL_PASSES; i++) {
      await page.mouse.wheel(0, 4000);
      await page.waitForTimeout(1200);
    }

    const raw = await page.evaluate(
      ({ itemSelector, fields }) => {
        const pick = (root, sel) => {
          for (const s of sel.split(',')) {
            const el = root.querySelector(s.trim());
            if (el) return el;
          }
          return null;
        };
        return Array.from(document.querySelectorAll(itemSelector)).map((el) => {
          const img = pick(el, fields.image);
          const link = pick(el, fields.link);
          return {
            name: pick(el, fields.name)?.textContent?.trim() ?? null,
            priceText: pick(el, fields.price)?.textContent?.trim() ?? null,
            href: link?.getAttribute('href') ?? null,
            image:
              img?.getAttribute('src') ||
              img?.getAttribute('data-src') ||
              (img?.getAttribute('srcset') || '').split(' ')[0] ||
              null,
          };
        });
      },
      { itemSelector: target.itemSelector, fields: target.fields },
    );

    for (const [i, r] of raw.entries()) {
      const price = parsePrice(r.priceText);
      if (!r.name || !price || !r.image) continue;
      if (!/dress|gown/i.test(r.name)) continue;
      const url = r.href?.startsWith('http')
        ? r.href
        : `https://www.${target.domain}${r.href ?? ''}`;
      items.push({
        id: `${target.domain}:${i}:${r.name.slice(0, 40)}`,
        store: target.store,
        domain: target.domain,
        name: r.name,
        price,
        currency: 'CAD',
        url,
        image: r.image.startsWith('//') ? `https:${r.image}` : r.image,
        tags: [],
        productType: 'Dress',
      });
    }
  } catch (err) {
    console.warn(`  ${target.store}: ${err.message.slice(0, 120)}`);
  }

  await ctx.close();
  return items;
}

async function main() {
  const browser = await chromium.launch();
  const found = [];
  for (const target of TARGETS) {
    process.stdout.write(`${target.store.padEnd(10)} `);
    const items = await scrapeTarget(browser, target);
    console.log(`${items.length} dresses`);
    found.push(...items);
  }
  await browser.close();

  if (!found.length) {
    console.error('\nNothing scraped. Selectors may have changed, or the browser has no network access.');
    process.exit(1);
  }

  let existing = [];
  try {
    existing = JSON.parse(await readFile('data/catalog.json', 'utf8'));
  } catch {
    // first run
  }
  const anchors = new Set(TARGETS.map((t) => t.domain));
  const merged = existing.filter((d) => !anchors.has(d.domain)).concat(found);

  await mkdir('data', { recursive: true });
  await writeFile('data/catalog.json', JSON.stringify(merged, null, 1));
  console.log(`\n${merged.length} dresses total -> data/catalog.json  (run "npm run embed" next)`);
}

main();
