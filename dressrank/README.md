# DressRank

Learn your dress taste from head-to-head comparisons, then rank a real catalog by **look and
price**.

Compare ten pairs of dresses. A taste model is fitted from those answers and used to rank a few
thousand real, in-stock dresses — every recommendation links to a page where you can buy it.

## Why comparisons rather than swiping

A thumbs-up says "good" against an unknown bar. A comparison says "this one, over *that* one,"
which is an actual constraint. So each answer becomes a constraint on a taste direction `w`, fitted
as logistic regression over the **difference** between two dresses' CLIP embeddings — a
Bradley–Terry ranker:

```
for every preferred pair (a ≻ b):   w · (v_a − v_b) > 0
score(dress) = w · v_dress
```

That is why ten answers is enough to be useful, where ten binary labels would not be. No fine-tuning
is involved and none is needed at this data scale.

Two more things make ten questions go far:

- **The first pairs span the catalog.** Seed items are k-means medoids over the embeddings, so you
  are never asked to choose between two near-identical black midis.
- **Later pairs target uncertainty.** Once a model exists, the next question is the pair it is least
  sure about — where an answer buys the most information.

## Setup

```bash
npm install
npm run data      # scrape + embed; takes ~10 min the first time
npm run dev
```

`npm run data` writes into `data/`, which Vite serves as its public directory:

| File | What it is |
|---|---|
| `catalog.embedded.json` | dresses that embedded successfully |
| `embeddings.bin` | Float32, 512 dims per dress, row-major |
| `attributes.json` | zero-shot scores per named dimension |
| `meta.json` | count, dim, model id |

Embeddings are computed **once at build time**, so the browser never runs CLIP — it only does dot
products. Recommendations are instant and there is no server at runtime.

## Data sources

`npm run scrape` pulls from Shopify-backed retailers, which expose `/products.json` publicly:
Showpo, Beginning Boutique, Peppermayo, Petal & Pup, Tiger Mist, White Fox, Oak + Fort, Everlane.
About 2,600 dresses.

### Zara, Aritzia and Simons need your machine

These three block plain HTTP requests, so they need a real browser:

```bash
npx playwright install chromium   # once
npm run scrape:anchors            # merges into data/catalog.json
npm run embed                     # re-embed with the new items
```

**This cannot run in a sandboxed CI environment** — Chromium there has no network egress, which is
why they are absent from the default catalog. On a normal machine it works. Selectors are in
`scripts/scrape-anchors.mjs` and will need occasional updating when those sites redesign.

## How scoring works

```
look   = normalised w · v                    (0–1)
price  = 1                                   if price ≤ budget
       = exp(−(price − budget) / budget)     above it
final  = α · look + (1 − α) · price
```

The price term is a soft decay rather than a cliff on purpose: a slightly-over-budget perfect match
should still surface, a wildly over-budget one should not. `α` is the look ↔ price slider in the UI;
budget defaults to $200.

## Explainability

Alongside the embedding, every image is scored zero-shot against named dimensions — colour, print,
silhouette, fabric, vibe, occasion. The feed summarises your top matches along those axes ("floral,
satin, romantic"), so the model can be argued with rather than just obeyed.

## Testing

```bash
npm test
```

`src/lib/ranker.test.ts` covers the parts that must be right: that the fit recovers a known taste
direction, that it generalises to items it never saw, that contradictory answers do not blow it up,
that the price curve behaves at the boundaries, and that binary-search insertion converges in
log₂(n) steps.

## Layout

```
scripts/    scrape-shopify.mjs · scrape-anchors.mjs · embed.mjs
data/       generated catalog + embeddings (Vite public dir)
src/lib/    ranker.ts (the maths) · catalog.ts · storage.ts · types.ts
src/hooks/  useTaste.ts — loads data, fits the model, scores everything
src/pages/  Compare · Feed · Ranking
```

State lives in `localStorage` behind `src/lib/storage.ts`. That file is the only thing that needs to
change to add accounts.

## Known limits

- **Taste is learned from product photos**, which vary by retailer — a flat-lay and an on-model shot
  of the same dress embed differently. More comparisons wash this out; it is noise, not bias.
- **The catalog skews to the trend-driven Australian labels** that publish open feeds. Adding the
  anchors above changes the mix considerably.
- **Ten comparisons is a floor, not a target.** The model keeps improving as you use the feed.
