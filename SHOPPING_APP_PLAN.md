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

Ingestion of items: start with a URL-paste flow (scrape OG tags + product image) plus
photo upload. Skip retailer API partnerships until there's traction — they're slow
and gate you on scale you don't have yet.

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
