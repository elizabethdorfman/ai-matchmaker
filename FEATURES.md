# Rack — Features

Three features. They share one vector index, which is what makes them one product
instead of three.

| # | Feature | What it is |
|---|---|---|
| 1 | **Vibe Search** | Are.na-style associative search over clothes. Type a vibe or drop an image, wander from there. |
| 2 | **The Index** | 500 curated brands, fully crawled. Every product embedded. This is what we recommend *from* on day one. |
| 3 | **Ranked Places** | Boutiques scored and ranked by taste match. Searchable the same associative way as clothes. |

---

# Feature 1 — Vibe Search

Are.na-style. Not a search box over a product catalog with size and price filters.

## What it feels like

- Type **"quiet luxury but sad"** or **"downtown 2003"** or **"what my cool aunt wears"**
  and get a board back.
- Drop **any image** — a screenshot, a mirror photo, a runway shot — and say *more like this*.
- Every result is a **door, not a dead end**. Tap any item to make it the new query.
  You wander sideways rather than refining downward.
- Results come back as a **board**, not a ranked list of 10 blue links.

The test: you came in looking for a jacket and left with a store you'll visit Saturday.

## How we build it

**Everything retrieves against a canonical description, never the retailer's title.**
Retailer titles are SEO garbage ("Women's Casual Chic Oversized Blazer Fall 2025
Trendy"). Every item in the index gets one vision pass that rewrites it in *our*
controlled vocabulary — silhouette, fit, fabric, formality, color story, aesthetic
lineage. This single step is what makes vibe search possible at all. Without it,
"downtown 2003" matches nothing.

**Three query types, one index.** They differ only in how the query vector is built:

| Query | How the vector is made |
|---|---|
| Text / vibe | LLM expands the phrase into the same descriptive vocabulary, then embed |
| Image | Crop to the garment, then embed |
| Item ("more like this") | Use the item's stored embedding directly |

Because they all land in the same space, adding image search after text search is days
of work, not a second system.

**Vibe queries need expansion, not matching.** "Downtown 2003" isn't in any product
description. The LLM turns it into the concrete visual vocabulary it implies — low-rise,
distressed denim, cropped layers, specific palette — and *that* gets embedded. This
expansion step is the feature.

**Hybrid with keyword search.** Pure vector search is bad at exact names — "Ganni,"
"Sambas," "501." Run keyword alongside vector, fuse the results. Postgres does both
natively; no second datastore.

**Image search gotcha worth planning for:** catalog photos are a flat garment on white,
user photos are a person in a mirror with three other garments in frame. Embedding raw
user photos gives bad matches. Detect and crop to the garment first, and when there are
several, make them tap which one they mean.

**Two image intents, shipped as a visible toggle:** *find this exact thing* (tight
threshold, weight logos and hardware) vs. *find things like this* (loose, allow category
drift). Guessing wrong makes the feature feel broken.

---

# Feature 2 — The Index

500 curated brands, fully crawled. **This is what makes recommendations work from day
one, before we have a single user.**

At ~1,500–3,000 live SKUs per brand that's roughly **1M items** — small enough to run on
one Postgres instance, large enough that nobody hits the edges.

## The index is the curation

We are deliberately *not* indexing the whole internet. A recommendation drawn from 50M
items of mostly Shein is worse than one drawn from 1M items of brands we chose. The
brand list *is* the taste of the product.

## How we build it

**Don't write 500 scrapers.** One generic worker, strategies tried in order of how
structured the site is:

| Tier | Method | Expected coverage |
|---|---|---|
| 1 | Shopify `/products.json` — the entire catalog as JSON, paginated | High. Most independent/DTC brands run Shopify. |
| 2 | `schema.org/Product` JSON-LD from product pages, URLs from `sitemap.xml` | Most of the rest — brands maintain it for Google Shopping |
| 3 | LLM extraction from cleaned HTML | The stragglers |
| 4 | Skip | If it needs bespoke code it isn't worth 1/500th of the index |

Sitemaps handle URL discovery, so there's no recursive link-following anywhere. Build
tiers 1 and 2, measure what falls through, *then* decide if tier 3 is worth it.

**Crawl hygiene:** respect robots.txt, honest user-agent with a contact address,
~1 req/sec/domain, back off on 429. Store metadata and embeddings, always deep-link back
to the brand — we send them traffic, which is the argument if anyone asks.

**Refresh:** price and availability daily for in-stock items, full re-crawl weekly.

**Enrichment is the expensive part.** One vision call per item to produce the canonical
description Feature 1 depends on. ~1M calls for the initial backfill — batch it, use a
cheap tier, only re-run when an item's image changes.

## What it powers

Cold-start recommendations. A brand-new user with five saved items gets real results
immediately, because the index already exists and is already embedded. No chicken-and-egg.

---

# Feature 3 — Ranked Places

Boutiques scored and ranked by taste match. The differentiator — nobody else answers
"where should I shop?"

## Two independent scores

**Boutique Score** — how independent and curated a store is, versus a mall chain:

| Signal | Direction |
|---|---|
| Locations under the same brand name | fewer → higher. Strongest single signal: one location is a boutique, 400 is Zara. |
| Review count vs. rating | low count + high rating → higher |
| Review language (LLM-scored) | "the owner helped me," "hidden gem," "one of a kind" ↑ / "great sale," "long line," "no stock in my size" ↓ |
| Store photos (vision-scored) | rack density, lighting, fixtures |

Raw star ratings are near-useless on their own — everything clusters at 4.3–4.6. The
boutique score is what makes place data usable.

**Aesthetic Embedding** — what taste does this store serve? Derived from its photos and
review language, embedded into **the same vector space as the clothes**. This is the
whole trick: a store becomes a point in taste-space, so we can rank stores against a
person the same way we rank garments.

## Ranking

What a user sees = `f(taste_match, boutique_score, distance, freshness)`.

Never a global "best stores" list. Always personal — two people standing on the same
corner get different rankings. That's the Beli parallel and it's the point.

## Places search works like Feature 1

Same associative model, different object type. Type **"where do I go for good vintage
denim"** or **"somewhere like Ganni but cheaper"** and get *stores* back, ranked for you.
Drop an image and find the stores whose aesthetic matches it.

Because store embeddings and item embeddings share a space, this comes almost free:
same query vector, different table.

## Cold start

A store with 8 reviews has a noisy aesthetic profile. Fall back to photo-only embedding
and flag low confidence in the UI rather than hiding the store.

## Known limit

We can say "this store matches your taste." We cannot say "they have it in your size."
Discovery is the promise; availability is a far more expensive promise to keep.

---

# How the three connect

```
        500 brands crawled  ──►  1M items  ──►  vision pass  ──►  embeddings
                                                                      │
                                                    ┌─────────────────┴──────────────────┐
                                                    ▼                                    ▼
                                            ITEM VECTORS                          STORE VECTORS
                                                    │                                    │
                                                    └──────────► same space ◄─────────────┘
                                                                      │
                                          ┌───────────────────────────┼───────────────────────────┐
                                          ▼                           ▼                           ▼
                                    vibe / text query           image query               user taste vector
                                          └───────────────────────────┴───────────────────────────┘
                                                                      │
                                                      one ANN search ─┴─►  clothes  +  stores
```

One index. One embedding space. Three ways in.

---

# Build order

1. **Index first** (Feature 2). Nothing works without it, and it needs no users.
2. **Vibe search over items** (Feature 1). The moment it becomes usable by a human.
3. **Ranked places** (Feature 3). The moment it becomes a product nobody else has.

Taste ranking (the either/or comparison mechanic) layers on top of all three as
personalized re-ranking — it improves every feature rather than being a fourth one.
