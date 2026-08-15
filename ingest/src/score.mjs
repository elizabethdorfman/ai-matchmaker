#!/usr/bin/env node
/**
 * Interim quality score.
 *
 * Two of the four planned inputs exist in the index today: material quality
 * and value-per-dollar. Fashionability (vision pass) and store quality
 * (Places) are not built yet, so this is a *materials-and-value* score, not
 * the composite. Naming it honestly matters — a "top items" list that
 * silently omits fashionability will read as a taste ranking and isn't one.
 *
 *   node src/score.mjs [--top 25] [--max-price 300] [--category dress]
 */
import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const GARMENT = new Set(['top','shirt','dress','knitwear','trousers','skirt',
  'outerwear','blazer','jumpsuit','sweatshirt','shorts']);

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const [f, inline] = process.argv[i].split('=');
  args[f.replace(/^--/, '')] = inline ?? process.argv[++i];
}
const TOP = Number(args.top ?? 25);
const MAXP = Number(args['max-price'] ?? Infinity);

const items = (await readFile(resolve(ROOT, 'data/items.jsonl'), 'utf8'))
  .trim().split('\n').map((l) => JSON.parse(l))
  // Only real garment categories. The `apparel` flag catches obvious
  // non-clothing, but "unknown" is where towels, combs, and scrunchies hide —
  // an unclassified item is not evidence of a garment.
  .filter((i) => GARMENT.has(i.category))
  .filter((i) => i.apparel && i.natural_fiber_ratio != null && i.price_avg != null)
  .filter((i) => i.price_avg <= MAXP)
  .filter((i) => !args.category || i.category === args.category);

/**
 * Value = material quality relative to what similar garments cost.
 *
 * Compared within category, because a $40 tee and a $400 coat aren't
 * competing. A fully-natural piece priced below its category median scores
 * high; a synthetic one priced above it scores low. This is the signal no
 * shopping app surfaces, and the reason to compute it per-category rather
 * than globally.
 */
const byCategory = new Map();
for (const i of items) {
  if (!byCategory.has(i.category)) byCategory.set(i.category, []);
  byCategory.get(i.category).push(i.price_avg);
}
const medians = new Map();
for (const [cat, prices] of byCategory) {
  const s = prices.sort((a, b) => a - b);
  medians.set(cat, s[s.length >> 1]);
}

for (const i of items) {
  const med = medians.get(i.category) || i.price_avg;
  // Ratio of category-median price to this item's price, damped so a very
  // cheap item can't dominate on price alone.
  const priceAdvantage = Math.min(2, med / Math.max(i.price_avg, 1));
  i.material = i.natural_fiber_ratio;
  i.value = i.natural_fiber_ratio * Math.sqrt(priceAdvantage);
  i.score = 0.5 * i.material + 0.5 * Math.min(1, i.value / 1.4);
}

// Colourways are separate products in Shopify; collapse them so one style
// can't occupy half the leaderboard.
const seen = new Set();
const deduped = [];
for (const i of items.sort((a, b) => b.score - a.score || a.price_avg - b.price_avg)) {
  const key = `${i.brand_slug}:${(i.title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').split(' ').slice(0, 5).join(' ')}`;
  if (seen.has(key)) continue;
  seen.add(key);
  deduped.push(i);
}
items.length = 0; items.push(...deduped);

console.log(`Scored ${items.length} apparel items with explicit fiber composition`);
console.log(`(materials + value only — fashionability and store quality not yet built)\n`);
console.log(`${'SCORE'.padEnd(6)}${'PRICE'.padStart(7)}  ${'FIBER'.padStart(5)}  ${'CATEGORY'.padEnd(11)}${'BRAND'.padEnd(22)}ITEM`);
console.log('─'.repeat(108));
for (const i of items.slice(0, TOP)) {
  console.log(
    `${i.score.toFixed(2).padEnd(6)}$${String(Math.round(i.price_avg)).padStart(6)}  ` +
    `${(i.natural_fiber_ratio * 100).toFixed(0).padStart(4)}%  ${i.category.padEnd(11)}` +
    `${i.brand_name.slice(0, 21).padEnd(22)}${(i.title || '').slice(0, 40)}`
  );
}
