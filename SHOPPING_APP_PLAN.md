# Rack — "the Beli of shopping"

A taste-based clothing discovery app. You rate a handful of pieces you own and love,
and it learns your taste well enough to recommend similar items *and* — the real
differentiator — the physical boutiques near you that stock your taste.

**One-liner:** Beli ranks restaurants by your palate. Rack ranks stores by your closet.

---

## Why this can work

Every shopping app today optimizes for a *transaction* (Amazon, SSENSE) or an
*aesthetic feed* (Pinterest, Instagram). Nobody owns the question people actually
ask: **"where should I shop?"** That question is local, personal, and currently
answered by TikTok videos and friends' recommendations.

Beli's insight was that a 5-star rating is useless but a *ranked list* is honest.
The same holds for clothes: "I like this jacket" is noise; "this jacket beats that
jacket" is signal. That comparison mechanic is the core of the product.

---

## Core loop

1. **Seed your taste** — Save 5–10 items you own or want. Upload a photo, paste a
   product URL, or pick from a curated onboarding grid.
2. **Rank, don't rate** — After each new save, the app asks 2–3 head-to-head
   questions ("Which would you wear more?") and binary-inserts the item into your
   personal ranked list. Same mechanic as Beli.
3. **Get recommendations** — Similar items across brands, and a *ranked feed of
   stores* — online and physical — scored for you specifically.
4. **Go shop** — Map view of boutiques near you, sorted by predicted taste match,
   not by distance or ad spend.
5. **Log what you buy** — Closes the loop and sharpens the model. Also becomes your
   closet, which is the retention hook.

---

## The two hard/interesting problems

### 1. Item-to-item similarity

This is a multimodal embedding problem, and it's very tractable now.

- **Visual embedding** — CLIP-style image embedding of the product photo. Captures
  silhouette, color, drape, vibe. Cheap, no training required.
- **Attribute extraction** — Run each item through a vision model to get structured
  tags: category, fit (oversized/tailored/cropped), fabric, color family, formality,
  price tier, era/aesthetic ("workwear", "quiet luxury", "Y2K"). Store as a sparse
  vector alongside the dense one.
- **Taste vector** — A user is the weighted centroid of their ranked items, weighted
  by rank position. Top-ranked items count more. Recompute on every insertion.
- **Retrieval** — pgvector cosine search over the item index, then re-rank with a
  small model that has access to the pairwise comparisons the user actually made.
  The comparisons are the gold data — they encode *tradeoffs*, which a centroid can't.

The subtle thing: pure visual similarity gives you "another black jacket," which is
boring and useless. The valuable recommendation is *adjacent* — same taste,
different category. So the ranker should optimize for "would this person rank this
item in their top 20?" rather than "is this visually near their centroid?" Diversity
penalty on category and color in the final slate.

### 2. Boutique-ness index

This is the genuinely novel piece and the part I'd protect.

Google Places gives you name, location, rating, review count, price level, photos,
and review text. From that, derive a **Boutique Score** — how independent/curated a
store is, as opposed to a mall chain:

| Signal | Direction | Notes |
|---|---|---|
| Number of locations under the same brand name | fewer → higher | Strongest single signal. A one-location store is a boutique; 400 locations is Zara. |
| Review count vs. rating | low count + high rating → higher | Curated stores are small and beloved |
| Review text semantics | LLM-scored | "the owner helped me," "vintage," "one of a kind," "hidden gem" vs. "great sale," "long line," "no stock in my size" |
| Photo analysis | vision-scored | Rack density, lighting, fixtures — boutiques look different from fast fashion |
| Price level + neighborhood | contextual | Cross-reference with area |

Then a second, separate axis: **Aesthetic Profile** — what taste does this store
serve? Derived from its Places photos and review language, embedded into the *same*
space as the item embeddings. That's what makes store recommendation work: a store
becomes a point in taste-space, and we rank stores by distance to your taste vector.

Store score shown to a user = `f(taste_match, boutique_score, distance, freshness)`.
Never a global "best stores" list — always personal. That's the Beli parallel.

**Data honesty:** Places rating is a weak signal on its own (everything clusters at
4.3–4.6). The boutique score is what makes it useful. And Places ToS restricts
caching/derived storage — worth checking limits before building on it as the sole
source. Foursquare/OSM as a supplement or fallback.

---

## Social layer (the Beli part, and probably the growth engine)

- **Follow friends** — see their ranked closets and recent saves.
- **Store recs from people whose taste you match** — "3 people with 80%+ taste
  overlap with you rank this store top-5."
- **Taste match %** — computed from ranked-list correlation (Kendall tau over shared
  items). This is the shareable, viral number. Beli's "you're a 92% match" is the
  screenshot that spreads.
- **City lists** — "Elizabeth's Toronto vintage list." Shareable, drives signups.
- **Travel mode** — "you're in Montreal for the weekend, here are your 6 stores."
  Highest-intent moment in the whole product, worth building for specifically.

---

## Suggested architecture

Same stack you already know from this repo, extended:

```
React + Vite + TS + Tailwind          web app
Vercel serverless functions           API
Supabase (Postgres + pgvector)        data, auth, embeddings
Google Places API (New)               store data, reviews, photos
Mapbox GL JS                          map (cheaper + nicer styling than Google Maps)
Claude (vision)                       attribute extraction, review scoring, aesthetic profiling
CLIP / open-source embedding model    image embeddings
```

---

## Index construction: 500 curated brands

The index *is* the curation. Rather than indexing the whole internet, hand-pick ~500
brands that match the product's taste thesis and crawl them completely. At a typical
1,500–3,000 live SKUs per brand that's roughly **1M items** — small enough to run on
one Postgres instance, large enough that no user hits the edges.

### Don't write 500 scrapers

Tier the crawl by how structured the site is. Nearly all of the 500 fall into the
first two tiers, and neither is really "scraping":

| Tier | Method | Coverage |
|---|---|---|
| 1 | Shopify `/products.json` — full catalog, paginated, structured JSON | Very high for independent/DTC brands, which is most of the list |
| 2 | `schema.org/Product` JSON-LD parsed from product pages, URLs discovered via `sitemap.xml` | Nearly all remaining brands — required for their own Google Shopping listings, so it's well-maintained |
| 3 | LLM-assisted extraction: feed cleaned HTML to a model with a target schema | The stragglers; slower and pricier, use sparingly |
| 4 | Manual / skip | If a brand needs bespoke code, it's usually not worth 1/500th of the index |

Sitemaps do the URL discovery, so there's no recursive link-following anywhere in the
pipeline. Build one generic worker with four strategies, not 500 scripts.

### Crawl hygiene

Respect `robots.txt`, identify the bot honestly in the UA with a contact URL, cap at
~1 req/sec/domain, and back off on 429/503. Store only what's needed (metadata,
embeddings, thumbnail) and always deep-link back to the brand — this is traffic *to*
them, which is the argument if anyone asks. Refresh price/availability daily for
in-stock items; full re-crawl weekly. Delta-detect via product `updated_at` where
exposed so most runs are cheap.

### Normalization (the step that makes search work)

Raw crawl output is unusable for retrieval — retailer titles are SEO noise
("Women's Casual Chic Oversized Blazer Fall 2025 Trendy"). Every item gets run
through a vision + text pass that produces a **canonical description** in one
controlled vocabulary: silhouette, fit, fabric, color family, formality, aesthetic
lineage, construction cues. Everything downstream — text search, image search,
recommendations — retrieves against this, never against the raw title.

Cost note: this is one vision call per item, so ~1M calls for the initial backfill.
Batch it, use a cheap tier, and only re-run when an item's image changes.

---

## Search: one index, three query types

All three modes produce a vector and hit the same ANN index. They differ only in how
the query vector is built — which is why adding image search after text search is
days of work, not a new system.

### Text search

Embed the query, ANN over canonical descriptions, **hybrid with keyword/BM25**. The
hybrid part is not optional: pure vector search is bad at exact brand names, model
names, and SKUs ("Ganni," "Sambas," "501"). Run both, fuse with reciprocal rank
fusion. Postgres does both natively — `tsvector` alongside pgvector, no second
datastore.

Structured filters (price, category, in-stock, size, ships-to) apply as SQL
predicates alongside the vector search. Let an LLM parse intent out of the query
first, so "black barrel jeans under $200" becomes a filtered vector search rather
than a literal string match.

### Image search

Upload a photo, screenshot an Instagram post, or shoot something in a store → embed
→ ANN. Two distinct user intents that need different handling:

- **"Find this exact thing"** — identity matching. Tight similarity threshold,
  weight brand/logo/hardware cues.
- **"Find things like this"** — taste matching. Loose threshold, diversity penalty
  on the slate, allow category drift.

Ship this as a visible toggle. Guessing wrong makes the feature feel broken.

**The real gotcha:** user photos are domain-shifted from catalog photos. Catalog
images are a flat garment on white; user photos are a person in a mirror in bad
light with three other garments in frame. Embedding those raw gives poor matches. So
the pipeline must **detect and crop to the garment first** (segmentation model, or
just a detector + crop), and when multiple garments are present, ask which one — the
"tap the item you mean" interaction. Skipping this step is the single most common
reason image search underperforms.

### Taste search (the differentiator)

Any result set from the two modes above gets re-ranked by the user's taste vector.
Same query, different results per person — and identical items ranked differently
depending on whose account is asking. This is the thing competitors can't copy
without the ranked-comparison data.

### Serving

~1M items with HNSW in pgvector is single-digit-millisecond retrieval on a modest
instance. Do not reach for a dedicated vector database at this scale; revisit past
~10M items.

### Sketch of the data model

```
users            id, handle, city, taste_vector, created_at
items            id, name, brand, image_url, source_url, price, category,
                 attributes jsonb, embedding vector(768)
user_items       user_id, item_id, rank_position, owned|wishlist, created_at
comparisons      user_id, item_a, item_b, winner, created_at   -- the gold data
stores           id, place_id, name, lat, lng, boutique_score,
                 aesthetic_embedding vector(768), rating, review_count
store_items      store_id, item_id                             -- weak/inferred links
follows          follower_id, followee_id
```

---

## Build order

**v0 — prove the taste model (2–3 weeks)**
Onboarding grid → rank a seed set → similar-item recommendations. No map, no social,
no stores. The only question: do the recommendations feel uncanny or generic? If
generic, nothing downstream matters. Test on ~20 people.

**v1 — add the map**
Places ingestion for one city, boutique scoring, personal store ranking, map view.
This is the moment it stops being a Pinterest clone.

**v2 — social**
Follows, taste match %, shareable city lists.

**v3 — monetize**
Affiliate on online items; paid boutique placement is *available* but dangerous —
it corrupts the ranking, which is the entire product. Beli stayed clean; so should
this. Better: a paid tier for stores to claim and manage their profile, plus
premium travel-mode features for users.

---

## Open questions

1. **Launch city.** Toronto is the obvious pick given the existing project. One city
   done densely beats five done thinly — store coverage is what makes v1 real.
2. **Inventory truth.** We can say "this store matches your taste"; we can't say
   "this store has this jacket in your size." Do we ever need to? I'd argue no for
   v1 — the promise is *discovery*, not *availability*, and that's a much cheaper
   promise to keep.
3. **Cold start for stores.** A store with 8 reviews has a noisy aesthetic profile.
   Fall back to photo-only embedding, and flag low-confidence entries in the UI
   rather than hiding them.
4. **Menswear/womenswear/unisex.** Affects the seed grid and the item index. Pick one
   to start; womenswear has more boutique density and more social sharing behavior.
5. **Name.** "Rack" is a placeholder.
