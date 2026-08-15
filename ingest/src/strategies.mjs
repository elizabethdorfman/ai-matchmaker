/**
 * Ingestion strategies, tried in order of how structured the source is.
 *
 *   1. shopify — /products.json, the whole catalog as JSON
 *   2. jsonld  — schema.org/Product parsed from product pages found via sitemap
 *
 * Tier 3 (LLM extraction from raw HTML) is deliberately absent until we know
 * from real numbers how much of the brand list falls through these two.
 */

import { get, robotsFor } from './fetcher.mjs';
import { makeItem } from './normalize.mjs';

const PAGE_SIZE = 250;

/* ------------------------------------------------------------------ */
/* Tier 1: Shopify                                                     */
/* ------------------------------------------------------------------ */

export async function shopifyStrategy(brand, { maxItems = Infinity } = {}) {
  const items = [];
  const maxPages = Math.min(40, Math.ceil(maxItems / PAGE_SIZE) || 1);

  for (let page = 1; page <= maxPages; page++) {
    const res = await get(`https://${brand.domain}/products.json?limit=${PAGE_SIZE}&page=${page}`, { json: true });

    if (!res.ok) {
      if (page === 1) return { ok: false, reason: res.status === 'blocked' ? 'blocked' : `products.json ${res.status}`, items: [] };
      break;
    }
    const products = res.body?.products;
    if (!Array.isArray(products)) {
      if (page === 1) return { ok: false, reason: 'not-shopify', items: [] };
      break;
    }
    if (!products.length) break;

    for (const p of products) {
      items.push(makeItem({
        brand,
        externalId: p.id,
        title: p.title,
        descriptionHtml: p.body_html,
        productType: p.product_type,
        tags: Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
        images: (p.images || []).map((i) => i.src),
        variants: (p.variants || []).map((v) => ({ price: v.price, size: v.option1, available: v.available, sku: v.sku })),
        url: `https://${brand.domain}/products/${p.handle}`,
        source: 'shopify',
      }));
      if (items.length >= maxItems) return { ok: true, items };
    }
    if (products.length < PAGE_SIZE) break;
  }

  return items.length ? { ok: true, items } : { ok: false, reason: 'empty-catalog', items: [] };
}

/* ------------------------------------------------------------------ */
/* Tier 2: sitemap + schema.org JSON-LD                                */
/* ------------------------------------------------------------------ */

const LOC_RE = /<loc>\s*([^<]+?)\s*<\/loc>/g;
const PRODUCT_URL = /\/(products?|p|item|shop|dp)\//i;

function extractLocs(xml) {
  const out = [];
  let m;
  while ((m = LOC_RE.exec(xml)) !== null) out.push(m[1].replace(/&amp;/g, '&').trim());
  return out;
}

/**
 * Walk sitemap indexes breadth-first to collect product URLs.
 *
 * Bounded on both axes: at most `maxSitemaps` index fetches and `limit`
 * product URLs. Large retailers publish sitemap trees with thousands of
 * children, and an unbounded walk would spend hours before yielding a
 * single item.
 */
async function discoverProductUrls(brand, limit, maxSitemaps = 25, mode = 'strict') {
  const robots = await robotsFor(brand.domain);
  const roots = robots.sitemaps.length
    ? robots.sitemaps
    : [`https://${brand.domain}/sitemap.xml`, `https://${brand.domain}/sitemap_index.xml`];

  const queue = [];
  for (const root of roots) {
    const res = await get(root);
    if (res.ok) { queue.push(...extractLocs(res.body)); break; }
  }
  if (!queue.length) return { urls: [], reason: 'no-sitemap' };

  const seen = new Set();
  const strict = [];  // URL matched the product pattern — high confidence
  const loose = [];   // came from a product-named sitemap — fallback only
  let fetched = 0;

  // Product-looking sitemaps first — a site with 200 child sitemaps usually
  // names the product ones, and guessing right saves most of the budget.
  queue.sort((a, b) => (/product|item|pdp/i.test(b) ? 1 : 0) - (/product|item|pdp/i.test(a) ? 1 : 0));

  while (queue.length && strict.length < limit && fetched < maxSitemaps) {
    const loc = queue.shift();
    if (seen.has(loc)) continue;
    seen.add(loc);

    if (!loc.endsWith('.xml') && PRODUCT_URL.test(loc)) { strict.push(loc); continue; }
    if (!loc.endsWith('.xml')) continue;

    // A sitemap *named* for product-detail pages is authoritative about its
    // own contents. Many retailers use bare URLs with no /products/ segment
    // (ganni.com/en/<slug>), so trusting the filename recovers catalogs the
    // URL pattern alone would miss entirely.
    const isProductSitemap = /pdp|product|item/i.test(loc);

    fetched++;
    const res = await get(loc);
    if (!res.ok) continue;
    for (const child of extractLocs(res.body)) {
      if (child.endsWith('.xml')) queue.push(child);
      else if (PRODUCT_URL.test(child)) { if (strict.length < limit) strict.push(child); }
      else if (isProductSitemap && loose.length < limit) loose.push(child);
    }
  }

  // Strict matches first; top up from the filename-derived pool only when the
  // pattern didn't yield enough. Retailers whose PDP URLs carry no /products/
  // segment (ganni.com/en/<slug>) are recovered without displacing the sites
  // where the pattern works.
  // 'strict' trusts the URL pattern; 'loose' trusts the sitemap filename.
  // The caller retries in loose mode when strict yields no parseable items,
  // which covers both retailer shapes without one displacing the other.
  const urls = (mode === 'loose' ? [...loose, ...strict] : [...strict, ...loose]).slice(0, limit);
  return { urls, reason: urls.length ? null : 'no-product-urls' };
}

const JSONLD_RE = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

/** Pull every JSON-LD blob off a page and return the first Product node. */
export function findProductNode(html) {
  let m;
  while ((m = JSONLD_RE.exec(html)) !== null) {
    let parsed;
    try { parsed = JSON.parse(m[1].trim()); } catch { continue; }
    const stack = Array.isArray(parsed) ? [...parsed] : [parsed];
    while (stack.length) {
      const node = stack.shift();
      if (!node || typeof node !== 'object') continue;
      const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
      if (types.includes('Product')) return node;
      if (Array.isArray(node['@graph'])) stack.push(...node['@graph']);
      if (node.mainEntity) stack.push(node.mainEntity);
    }
  }
  return null;
}

function offersToVariants(offers) {
  const list = Array.isArray(offers) ? offers : offers ? [offers] : [];
  return list.flatMap((o) => {
    if (!o || typeof o !== 'object') return [];
    if (o['@type'] === 'AggregateOffer') {
      return [o.lowPrice, o.highPrice]
        .filter((p) => p != null)
        .map((price) => ({ price, size: null, available: true }));
    }
    return [{
      price: o.price,
      size: o.sku || null,
      available: /InStock/i.test(o.availability || ''),
    }];
  });
}

function currencyOf(offers) {
  const list = Array.isArray(offers) ? offers : offers ? [offers] : [];
  for (const o of list) if (o?.priceCurrency) return o.priceCurrency;
  return 'USD';
}

export async function jsonLdStrategy(brand, opts = {}) {
  const { maxItems = 250 } = opts;
  const attempt = await harvest(brand, maxItems, 'strict');
  if (attempt.ok || attempt.reason === 'no-sitemap' || attempt.reason === 'blocked') return attempt;
  // Strict URL matching found nothing parseable — fall back to trusting the
  // sitemap filename instead. Retailers split cleanly between these two shapes.
  return harvest(brand, maxItems, 'loose');
}

async function harvest(brand, maxItems, mode) {
  // Over-collect: a sitemap named for products still contains category and
  // landing pages, and a 1:1 URL budget lets a handful of those zero out an
  // otherwise-healthy brand. Gather 3x and stop once we have enough items.
  const { urls, reason } = await discoverProductUrls(brand, maxItems * 3, 25, mode);
  if (!urls.length) return { ok: false, reason: reason ?? 'no-sitemap', items: [] };

  const items = [];
  let parsed = 0, missing = 0;

  for (const url of urls) {
    if (items.length >= maxItems) break;
    const res = await get(url);
    if (!res.ok) {
      if (res.status === 'blocked') return { ok: false, reason: 'blocked', items };
      continue;
    }
    parsed++;
    const node = findProductNode(res.body);
    if (!node) { missing++; continue; }

    const images = (Array.isArray(node.image) ? node.image : [node.image])
      .filter(Boolean)
      .map((i) => (typeof i === 'string' ? i : i?.url || i?.contentUrl))
      .filter(Boolean);

    items.push(makeItem({
      brand,
      externalId: node.sku || node.productID || node.mpn || url,
      title: node.name,
      descriptionHtml: node.description,
      productType: node.category || null,
      tags: [],
      images,
      variants: offersToVariants(node.offers),
      url,
      source: 'jsonld',
      currency: currencyOf(node.offers),
    }));
  }

  if (!items.length) {
    return { ok: false, reason: parsed ? `no-jsonld-products (${missing}/${parsed} pages lacked Product)` : 'no-pages-fetched', items: [] };
  }
  return { ok: true, items };
}

export const STRATEGIES = [
  { name: 'shopify', run: shopifyStrategy },
  { name: 'jsonld', run: jsonLdStrategy },
];
