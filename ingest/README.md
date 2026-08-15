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

## Blocked hosts

Some retailers return **403 on `robots.txt` itself** — Anthropologie, Zara, COS,
& Other Stories, Mango, J.Crew. Verified as origin-level, not a local egress
policy: the proxy records no relay failure for those hosts, so the CONNECT
tunnel succeeded and the 403 came from the retailer.

These are not a bug to fix in the crawler. Route them through a licensed
product feed (Rakuten, Impact, CJ — all three carry most of this set) rather
than working around the block.

## Client-rendered hosts (unresolved)

GANNI, Uniqlo, Kotn, Amour Vert, and VETTA serve `robots.txt` normally and do
not disallow us — they render products client-side, so no `Product` JSON-LD
appears in the initial HTML. These need a headless renderer (tier 3).

Playwright is installed but **could not be verified in this sandbox**: Chromium
fails with `ERR_CONNECTION_RESET` through the session's egress proxy even for
`example.com`, across every proxy flag combination tried. The renderer strategy
is therefore unwritten rather than written-and-untested. It should work in a
normal network environment.

## Interim scoring (`src/score.mjs`) — known not to work yet

Scores items on the two signals the index currently carries: material quality
and value-per-dollar within category. **The output is not usable as a ranking**,
and the failure is instructive:

- **It ranks cheap basics.** Materials + value with no fashionability term is a
  "best-value cotton tee" finder. The top of the list is graphic tees and tanks.
- **Scores saturate.** Dozens of items tie at 1.00 — any item that is 100%
  natural and below its category median maxes out, so there is no ordering
  within the top band.
- **Keyword categorisation is unreliable.** A cashmere *comb* classified as
  knitwear, a *scrunchie* as a shirt, a mock-neck *tee* as shorts.

The third point is the important one: it is direct evidence for the plan's
claim that retailer titles and tags are too noisy to build on, and that the
vision enrichment pass producing canonical descriptions is a prerequisite for
search *and* for categorisation — not just a quality upgrade.

Do not use this score for anything user-facing until fashionability (vision)
and taste-match (user comparisons) are in it.
