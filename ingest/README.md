# Ingest

Crawls the brands in `../crawl-targets.json` into a JSONL item index.

```bash
node src/ingest.mjs                                 # everything
node src/ingest.mjs --group needs_tier2 --max 20    # one group, capped
node src/ingest.mjs --brands madewell,quince        # named brands
```

## Strategies, tried in order

| Tier | Method | Notes |
|---|---|---|
| 1 | Shopify `/products.json` | Full catalog as JSON. Richest data — variants, tags, fiber composition. |
| 2 | `schema.org/Product` JSON-LD, URLs from `sitemap.xml` | Two passes: **strict** (URL matches a product pattern), then **loose** (trust a sitemap *named* `pdp`/`product`) if strict yields nothing parseable. Retailers split cleanly between these shapes. |

## What the run report tells you

`data/crawl-report.json` separates three failure modes that need different responses:

- **BLOCKED** — the origin returned 403, including on `robots.txt`. It is refusing automated clients. Not a bug to fix; needs a licensed feed instead.
- **FAILED** — reachable, but no structured data (no `products.json`, no `Product` JSON-LD).
- **succeeded** — with per-brand rollups for average price, natural-fiber ratio, and image/category coverage.

## Known limits

- **Tier-2 data is thinner than tier-1.** JSON-LD rarely carries fiber composition, so the fabric gate has weak coverage for exactly the large retailers that need tier 2 (~20-45% vs near-total on Shopify).
- Sitemap walking is bounded (25 index fetches, 3x the item budget in candidate URLs) so a large retailer's sitemap tree can't consume the whole run.
