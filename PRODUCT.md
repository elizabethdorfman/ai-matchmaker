# Rack — Product Overview

*Working name. One page on what we're building and why.*

---

## The one-liner

**Rack learns your taste in clothes, then shows you what to buy and where to shop.**

Beli ranks restaurants by your palate. Rack ranks clothes and stores by your closet.

---

## The problem

There is no good answer to "where should I shop?"

Shopping sites are built to sell you what's in stock. Pinterest and Instagram show
you clothes you can't buy, from stores you can't find. Google gives you whoever paid
the most. So people fall back on TikTok hauls and asking friends with good taste.

The gap: **nobody helps you find the *store*.** Everyone optimizes the transaction,
not the discovery.

---

## Who it's for

Someone in their 20s–30s who cares about how they dress, has a real sense of personal
style, and is tired of being shown the same five fast-fashion brands. They already
save clothes to their camera roll and screenshot outfits. They want to find the small
store they haven't heard of.

Starting with womenswear, in one city.

---

## What it does

**1. It learns your taste.**
You save clothes you love — a photo, a link, or picks from a starter grid. Then it
asks you simple either/or questions: *"Which would you wear more?"* A few taps at a
time. That builds a ranked list of your taste, and ranking is the whole trick —
"I like this" tells us nothing, "this beats that" tells us everything.

**2. It recommends clothes.**
Similar pieces from brands you haven't heard of. Not "another black jacket" — things
that fit your taste but surprise you.

**3. It recommends stores.**
The part nobody else does. A map of boutiques near you, ranked by how well they match
*your* taste — not by distance, not by ad spend, not by star rating. We work out
which stores are actually independent and curated versus which are mall chains, and
what aesthetic each one serves.

**4. It's social.**
Follow friends, see their closets, get a taste-match percentage with them. Share city
lists. When you travel, get the six stores worth your afternoon.

---

## Search should feel like Are.na, not Amazon

This is the part we care most about getting right.

Search isn't a box that returns a grid of products with filters for size and price.
It's **associative browsing**. You should be able to type a vibe — *"quiet luxury but
sad," "downtown 2003," "what my cool aunt wears"* — and get something back. You should
be able to upload any image and say *more like this*. Every result should be a door
into the next thing, not a dead end.

The feeling to aim for: wandering, not querying. You came in looking for a jacket and
left with a store you'll go to on Saturday.

---

## Why it's defensible

The comparison data. Every either/or question someone answers teaches us something no
competitor has. Anyone can index products; nobody else knows that people who rank
*this* highly also rank *that* highly. That gets better with every user and can't be
bought.

---

## What we will not do

- **Sell placement in the rankings.** The rankings are the product. The moment a store
  can pay to rank higher, we're Yelp, and people can smell it.
- **Promise inventory we can't verify.** We say "this store matches your taste." We do
  not say "they have it in your size." Discovery is the promise; availability is a
  much more expensive promise to keep.
- **Be a checkout.** We send you to the brand or the store. We're not building
  commerce infrastructure.

---

## How we'll know it's working

**v0 (taste model only — no map, no social):**
Do the recommendations feel uncanny or generic? Test with ~20 people. If people say
"how did it know that," keep going. If they shrug, nothing downstream saves it.

**v1 (map + stores):**
Do people actually go to a store we recommended? That's the whole thesis in one
question.

**v2 (social):**
Do people share their taste-match score without being asked?

---

## Build order

| | What | Why |
|---|---|---|
| **v0** | Save items → rank them → get clothing recommendations | Proves the taste model. Everything depends on this. |
| **v1** | Store scoring + map, one city | The actual differentiator |
| **v2** | Follows, taste match %, shareable lists | Growth |
| **v3** | Travel mode, affiliate revenue | Scale |

---

## Open questions

1. **City?** Toronto is the obvious start.
2. **Is v0 even an app,** or does it start as something lighter — a web quiz, a
   browser extension — to get taste data before building a destination?
3. **Name.** "Rack" is a placeholder.
