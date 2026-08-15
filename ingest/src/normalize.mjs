/**
 * Canonical item record.
 *
 * Every strategy funnels into makeItem(). Downstream — embedding, search,
 * recommendation — only ever sees this shape, never a raw payload.
 *
 * Deliberately NOT set here: `canonical_description` and `embedding`. Those
 * come from the enrichment pass, because retailer titles are too noisy to
 * retrieve against. The fields below are the scaffolding that pass runs on.
 */

import { createHash } from 'node:crypto';

const CATEGORY_RULES = [
  [/\b(trucker|bomber|parka|puffer|trench|overcoat|peacoat|anorak|outerwear|coat)\b/i, 'outerwear'],
  [/\b(blazer|suit jacket|sport coat)\b/i, 'blazer'],
  [/\b(jean|denim pant|trouser|chino|slack|pant|cargo|legging)\b/i, 'trousers'],
  [/\bshorts?\b/i, 'shorts'],
  [/\bskirt\b/i, 'skirt'],
  [/\b(dress|gown|frock)\b/i, 'dress'],
  [/\b(jumpsuit|romper|overall|coverall)\b/i, 'jumpsuit'],
  [/\b(sweater|knit|cardigan|jumper|pullover|cashmere)\b/i, 'knitwear'],
  [/\b(hoodie|sweatshirt|crewneck|fleece)\b/i, 'sweatshirt'],
  [/\b(shirt|blouse|button.?up|button.?down|oxford|poplin)\b/i, 'shirt'],
  [/\b(tee|t-shirt|tank|camisole|top)\b/i, 'top'],
  [/\b(sneaker|boot|loafer|sandal|heel|shoe|clog|mule|flat)\b/i, 'footwear'],
  [/\b(bag|tote|backpack|purse|clutch)\b/i, 'bag'],
  [/\b(sock|underwear|brief|bra|boxer|lingerie)\b/i, 'underwear'],
  [/\b(hat|cap|beanie|scarf|belt|glove|sunglass|jewel|ring|necklace|earring|bracelet)\b/i, 'accessory'],
];

const COLOR_RULES = [
  [/\b(black|onyx|jet|noir)\b/i, 'black'],
  [/\b(white|ivory|cream|ecru|bone)\b/i, 'white'],
  [/\b(grey|gray|charcoal|heather|slate)\b/i, 'grey'],
  [/\b(navy|indigo|midnight)\b/i, 'navy'],
  [/\b(blue|denim|cobalt|sky|azure)\b/i, 'blue'],
  [/\b(green|olive|sage|forest|emerald|khaki)\b/i, 'green'],
  [/\b(brown|tan|camel|chocolate|espresso|taupe|mocha|cognac)\b/i, 'brown'],
  [/\b(beige|sand|oat|natural|stone)\b/i, 'beige'],
  [/\b(red|crimson|burgundy|wine|maroon)\b/i, 'red'],
  [/\b(pink|blush|rose|fuchsia)\b/i, 'pink'],
  [/\b(purple|lilac|lavender|plum)\b/i, 'purple'],
  [/\b(yellow|mustard|gold|butter)\b/i, 'yellow'],
  [/\b(orange|rust|terracotta|apricot)\b/i, 'orange'],
];

/**
 * Fiber rules do double duty: they populate the item's `fabric` field and
 * feed the brand-level natural-fiber ratio that gates index quality.
 */
const NATURAL = /\b(cotton|linen|wool|merino|cashmere|silk|hemp|alpaca|mohair|leather|suede|ramie|jute|lyocell|tencel)\b/i;
const SYNTHETIC = /\b(polyester|nylon|acrylic|elastane|spandex|polyamide|viscose|rayon|modal|acetate)\b/i;

const FABRIC_RULES = [
  [/\bcashmere\b/i, 'cashmere'], [/\b(merino|wool)\b/i, 'wool'],
  [/\bsilk\b/i, 'silk'], [/\blinen\b/i, 'linen'], [/\bhemp\b/i, 'hemp'],
  [/\b(denim|chambray)\b/i, 'denim'], [/\b(leather|suede)\b/i, 'leather'],
  [/\b(tencel|lyocell)\b/i, 'lyocell'],
  [/\b(cotton|poplin|jersey|twill)\b/i, 'cotton'],
  [/\b(polyester|nylon|acrylic|technical)\b/i, 'synthetic'],
  [/\b(viscose|rayon|modal)\b/i, 'semi-synthetic'],
];

const firstMatch = (rules, text, fallback = null) => {
  for (const [re, value] of rules) if (re.test(text)) return value;
  return fallback;
};

const itemId = (brandSlug, externalId) =>
  createHash('sha1').update(`${brandSlug}:${externalId}`).digest('hex').slice(0, 16);

const stripHtml = (html) =>
  (html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Extract explicit fiber percentages ("80% cotton, 20% linen") when present.
 * Falls back to bare fiber mentions. Returns null when the text says nothing
 * about composition — null is meaningfully different from zero here, and the
 * brand-level rollup must not treat "unknown" as "synthetic".
 */
function naturalFiberRatio(text) {
  if (!text) return null;
  const pct = [...text.matchAll(/(\d{1,3})\s*%\s*([a-z][a-z\s-]{2,20})/gi)];
  if (pct.length) {
    let nat = 0, total = 0;
    for (const [, n, rawFiber] of pct) {
      const share = Number(n);
      if (!Number.isFinite(share) || share <= 0 || share > 100) continue;
      total += share;
      if (NATURAL.test(rawFiber)) nat += share;
    }
    if (total > 0) return Math.min(1, nat / total);
  }
  // Without explicit percentages we can't distinguish "100% cotton" from
  // "cotton-blend". Returning a confident 1.0 here inflated the whole index,
  // so weak evidence now reports null and the rollup ignores it.
  return null;
}

const NON_APPAREL = /(sunglass|eyewear|jewel|candle|mug|book|pet|tabletop|home|decor|gift.?card|fragrance|skincare)/i;
const KIDS = /\b(kids?|girls?|boys?|baby|toddler|children)\b/i;

export function makeItem({
  brand, externalId, title, descriptionHtml, productType,
  tags = [], images = [], variants = [], url, source, currency = 'USD',
}) {
  const prices = variants.map((v) => Number(v.price)).filter((p) => Number.isFinite(p) && p > 0);
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const inStock = [...new Set(variants.filter((v) => v.available).map((v) => v.size).filter(Boolean))];

  const signalText = [title, productType, ...tags].join(' ');
  const bodyText = stripHtml(descriptionHtml);
  const fiberText = `${signalText} ${bodyText}`;

  // Average across variants, not minimum — a size run priced identically is
  // unaffected, but bundles and multi-size products no longer read as cheap.
  const avgPrice = prices.length ? prices.reduce((a, c) => a + c, 0) / prices.length : null;

  return {
    id: itemId(brand.slug, externalId),
    external_id: String(externalId),
    brand_slug: brand.slug,
    brand_name: brand.name,
    title: title?.trim() ?? null,
    url,
    source,
    category: firstMatch(CATEGORY_RULES, signalText, 'unknown'),
    color_family: firstMatch(COLOR_RULES, signalText),
    fabric: firstMatch(FABRIC_RULES, fiberText),
    natural_fiber_ratio: naturalFiberRatio(fiberText),
    product_type: productType?.trim() || null,
    price_avg: avgPrice === null ? null : Number(avgPrice.toFixed(2)),
    price_min: prices.length ? Math.min(...prices) : null,
    price_max: prices.length ? Math.max(...prices) : null,
    currency,
    sizes,
    in_stock_sizes: inStock,
    available: inStock.length > 0,
    images: images.slice(0, 6),
    primary_image: images[0] ?? null,
    raw_description: bodyText.slice(0, 1200) || null,
    tags: tags.slice(0, 40),

    // Filled by the enrichment pass, not the crawl.
    canonical_description: null,
    attributes: null,
    embedding: null,

    // Excluded from brand-level quality rollups: accessories and kidswear
    // are not what the fabric and price signals are meant to describe.
    apparel: !NON_APPAREL.test(`${productType || ''} ${title || ''}`)
      && !KIDS.test([productType || '', ...tags].join(' ')),

    crawled_at: new Date().toISOString(),
  };
}

export { stripHtml, naturalFiberRatio };
