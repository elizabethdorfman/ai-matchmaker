#!/usr/bin/env node
/**
 * Crawl the brand list into a JSONL item index.
 *
 *   node src/ingest.mjs                                  # everything
 *   node src/ingest.mjs --brands zara,cos --max 50       # a subset, capped
 *   node src/ingest.mjs --group needs_tier2 --max 40
 *   node src/ingest.mjs --out data/items.jsonl
 *
 * The run report is the point as much as the items: it tells you which
 * strategy covered which brands, and — critically — which hosts *blocked*
 * us versus simply not being on Shopify. Those need different responses.
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STRATEGIES } from './strategies.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGETS = resolve(ROOT, '../crawl-targets.json');

function parseArgs(argv) {
  const a = { brands: null, group: null, max: 250, out: 'data/items.jsonl', concurrency: 6 };
  for (let i = 0; i < argv.length; i++) {
    const [flag, inline] = argv[i].split('=');
    const value = inline ?? argv[++i];
    if (flag === '--brands') a.brands = value.split(',').map((s) => s.trim());
    else if (flag === '--group') a.group = value;
    else if (flag === '--max') a.max = Number(value);
    else if (flag === '--out') a.out = value;
    else if (flag === '--concurrency') a.concurrency = Number(value);
  }
  return a;
}

const median = (xs) => {
  const s = [...xs].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

async function crawlBrand(brand, max) {
  const started = Date.now();
  const attempts = [];

  for (const strategy of STRATEGIES) {
    const out = await strategy.run(brand, { maxItems: max });
    attempts.push(`${strategy.name}:${out.ok ? `${out.items.length} items` : out.reason}`);
    if (out.ok && out.items.length) {
      return { brand, items: out.items, strategy: strategy.name, attempts, seconds: (Date.now() - started) / 1000 };
    }
    // A blocked host will block every strategy — don't waste the budget.
    if (out.reason === 'blocked') break;
  }
  const blocked = attempts.some((a) => a.includes('blocked'));
  return { brand, items: [], strategy: blocked ? 'BLOCKED' : 'FAILED', attempts, seconds: (Date.now() - started) / 1000 };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const cfg = JSON.parse(await readFile(TARGETS, 'utf8'));

  const groups = args.group ? [args.group] : ['crawl_ready', 'needs_tier2'];
  let brands = groups.flatMap((g) => cfg[g] ?? []);
  if (args.brands) brands = brands.filter((b) => args.brands.includes(b.slug));
  if (!brands.length) { console.error('No brands matched.'); process.exit(1); }

  console.log(`Crawling ${brands.length} brands (max ${args.max} items each, concurrency ${args.concurrency})\n`);

  const queue = [...brands];
  const results = [];
  await Promise.all(Array.from({ length: args.concurrency }, async () => {
    while (queue.length) {
      const r = await crawlBrand(queue.shift(), args.max);
      results.push(r);
      const mark = r.strategy === 'BLOCKED' ? '⛔' : r.strategy === 'FAILED' ? '✗' : '✓';
      console.log(`${mark} ${r.brand.name.padEnd(24)} ${String(r.items.length).padStart(4)} items  ${r.strategy.padEnd(8)} ${r.seconds.toFixed(1)}s  (${r.attempts.join(' → ')})`);
    }
  }));

  const allItems = results.flatMap((r) => r.items);
  const outPath = resolve(ROOT, args.out);
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, allItems.map((i) => JSON.stringify(i)).join('\n') + '\n');

  // Per-brand rollups: price and natural-fiber ratio, the two quality signals.
  const report = results.map((r) => {
    // Roll up quality signals over apparel only.
    const core = r.items.filter((i) => i.apparel);
    const prices = core.map((i) => i.price_avg).filter((p) => p != null);
    const fibers = core.map((i) => i.natural_fiber_ratio).filter((f) => f != null);
    return {
      slug: r.brand.slug, name: r.brand.name, strategy: r.strategy,
      items: r.items.length, attempts: r.attempts, seconds: +r.seconds.toFixed(1),
      avg_price: prices.length ? +(prices.reduce((a, c) => a + c, 0) / prices.length).toFixed(0) : null,
      median_price: prices.length ? +median(prices).toFixed(0) : null,
      currency: r.items[0]?.currency ?? null,
      natural_fiber_median: fibers.length ? +median(fibers).toFixed(2) : null,
      fiber_coverage: core.length ? +(fibers.length / core.length).toFixed(2) : 0,
      apparel_items: core.length,
      pct_with_image: r.items.length ? +(r.items.filter((i) => i.primary_image).length / r.items.length).toFixed(2) : 0,
      pct_categorized: r.items.length ? +(r.items.filter((i) => i.category !== 'unknown').length / r.items.length).toFixed(2) : 0,
    };
  });

  const ok = report.filter((r) => r.items > 0);
  const blocked = report.filter((r) => r.strategy === 'BLOCKED');
  const failed = report.filter((r) => r.strategy === 'FAILED');
  const byStrategy = {};
  for (const r of ok) byStrategy[r.strategy] = (byStrategy[r.strategy] ?? 0) + 1;

  console.log('\n' + '─'.repeat(70));
  console.log(`attempted        ${report.length}`);
  console.log(`succeeded        ${ok.length} (${Math.round((ok.length / report.length) * 100)}%)`);
  for (const [n, c] of Object.entries(byStrategy)) console.log(`  via ${n.padEnd(10)} ${c}`);
  console.log(`blocked (403)    ${blocked.length}${blocked.length ? '  → ' + blocked.map((b) => b.name).join(', ') : ''}`);
  console.log(`failed           ${failed.length}${failed.length ? '  → ' + failed.map((b) => b.name).join(', ') : ''}`);
  console.log(`items written    ${allItems.length} → ${args.out}`);
  console.log('─'.repeat(70));

  await writeFile(resolve(ROOT, 'data/crawl-report.json'),
    JSON.stringify({ generated_at: new Date().toISOString(), args, report }, null, 2));
}

main().catch((e) => { console.error(e); process.exit(1); });
