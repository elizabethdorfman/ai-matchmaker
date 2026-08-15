# Working rules

## How to run work for me

- **Plan research before running it.** For anything bigger than a couple of searches, show me the
  plan first and let me redirect. Don't launch a long multi-agent run and tell me after.
- **Do a fast sample run first.** Give me ~10 results in the final format so I can confirm the
  direction, then go deep. A quick wrong answer beats a slow wrong answer.
- **Check the premise before scaling up.** If I say "cute stores" and you build a vintage guide,
  that's a whole run wasted. Read back what I asked for before spending agents on it.

## Researching stores, products, or places

These rules came out of the Toronto shopping guide and apply to any "find me the good ones" task.

### Rank on the thing I'm buying, not on the star average
A single rating blends product quality with customer service, and for resale it also absorbs
complaints from people *selling*. Score the merchandise separately and keep service out of it.
- **Count:** selection/curation, quality, condition, value, size range, colour, fabric.
- **Record but never score:** staff friendliness, greeting, wait times.
- **Bucket separately:** seller/consignor complaints — irrelevant if I'm buying.
- **Still counts against a store:** real product problems — stains, damage, fakes, picked-over
  stock. Rudeness is noise; a hole is data.

### Get real prices, never vibes
Do not infer `$$` from a store's aesthetic. Pull actual numbers:
- Shopify stores usually expose `/products.json?limit=250` or
  `/collections/all/products.json?limit=250`. Use it.
- Report min / median / max, **% of stock under $100**, and **% under $50**.
- My budget is **under $100 per piece**. A store where the median is $400 is a splurge listing,
  clearly labelled — not a main recommendation.

### Score colour and fabric explicitly
Two things I care about that most guides ignore, both measurable from the same feed:
- **Colour & uniqueness** — what share of pieces name a real (non-neutral) colour, how many
  distinct hues are in the range, and what share are printed/patterned/textured. This separates
  a genuinely colourful shop from a beige-minimalist one that merely photographs well.
- **Fabric** — what share of products disclose composition at all, and what share of those are
  natural fibres (cotton, linen, silk, wool, cashmere, hemp, Tencel). Disclosure itself is a
  quality signal: shops hiding the composition are usually hiding polyester.

The script that does this lives in the scratchpad as `analyze_store.py` — reuse it rather than
rewriting the logic.

### Verify before listing
- Confirm the store is **currently open** — guides and directories are badly out of date.
  Real examples caught this way: M Boutique (parent company Mendocino went insolvent in 2020),
  Frou-Frou Vintage, Fortnight Lingerie, Birds of North America's storefront, Soop Soop.
- Confirm the **address** from the store's own site; flag conflicts rather than picking one.
- Say **"not found"** rather than inventing a rating, price, quote, or brand.
- Note **sample size**. A 4.9 across 19 reviews carries almost no information — label it thin.
- Where there's no evidence on a dimension, show a **dash, not a zero**. Missing ≠ bad.

## Deliverables

- Finished guides and reports go out as a **published artifact**, not a chat dump — I want a link
  I can open on my phone and share.
- Mobile-first: these get read while walking around.
- Include the caveats. A store with great clothes and a real problem should say so.

# Project: ai-matchmaker

React 18 + Vite + TypeScript + Tailwind; `npm run build` runs `tsc` first, so type errors break
the build. Lint with `npm run lint` (max-warnings 0).
