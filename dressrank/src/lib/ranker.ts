/**
 * Learning taste from head-to-head comparisons.
 *
 * A comparison ("I'd wear A over B") is a stronger signal than a thumbs-up: it
 * constrains a direction rather than a threshold. So we fit a taste vector `w`
 * such that w·(vA - vB) > 0 for every preferred pair — a Bradley-Terry ranker,
 * which is just logistic regression over difference vectors.
 *
 * This is why ~10 answers is enough to be useful, where 10 binary labels would not be.
 */

export type Vec = Float32Array;

export interface Comparison {
  winnerIdx: number;
  loserIdx: number;
}

export interface FitOptions {
  /** L2 penalty. High, because we are fitting 512 dims from ~10 examples. */
  lambda?: number;
  iterations?: number;
  learningRate?: number;
}

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export function dot(a: Vec | number[], b: Vec | number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export function norm(a: Vec | number[]): number {
  return Math.sqrt(dot(a, a));
}

/**
 * Fit a taste direction from comparisons.
 *
 * Each comparison contributes the difference vector d = vWinner - vLoser, which
 * should score positively. We maximise sum(log sigmoid(w·d)) - lambda|w|^2.
 */
export function fitTaste(
  vectors: Vec[],
  comparisons: Comparison[],
  { lambda = 0.05, iterations = 400, learningRate = 0.5 }: FitOptions = {},
): Float32Array {
  const dim = vectors[0]?.length ?? 0;
  const w = new Float32Array(dim);
  if (!comparisons.length || !dim) return w;

  // Precompute difference vectors once.
  const diffs: Float32Array[] = comparisons.map(({ winnerIdx, loserIdx }) => {
    const d = new Float32Array(dim);
    const a = vectors[winnerIdx];
    const b = vectors[loserIdx];
    for (let i = 0; i < dim; i++) d[i] = a[i] - b[i];
    return d;
  });

  // Initialise at the mean difference — already a reasonable direction.
  for (const d of diffs) for (let i = 0; i < dim; i++) w[i] += d[i] / diffs.length;

  const grad = new Float32Array(dim);
  for (let iter = 0; iter < iterations; iter++) {
    grad.fill(0);
    for (const d of diffs) {
      // gradient of log sigmoid(w·d) is (1 - sigmoid(w·d)) * d
      const p = sigmoid(dot(w, d));
      const scale = 1 - p;
      for (let i = 0; i < dim; i++) grad[i] += scale * d[i];
    }
    for (let i = 0; i < dim; i++) {
      grad[i] = grad[i] / diffs.length - lambda * w[i];
      w[i] += learningRate * grad[i];
    }
  }

  const n = norm(w);
  if (n > 0) for (let i = 0; i < dim; i++) w[i] /= n;
  return w;
}

/** Raw taste score for an item. Higher is more your thing. */
export function scoreItem(w: Float32Array, v: Vec): number {
  return dot(w, v);
}

/**
 * Price term: flat up to budget, then a soft decay.
 * A slightly-over-budget perfect match should still surface; a wildly
 * over-budget one should not.
 */
export function priceScore(price: number, budget: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0.5;
  if (price <= budget) return 1;
  return Math.exp(-(price - budget) / budget);
}

/** Combine look and price. alpha=1 is pure look, alpha=0 is pure price. */
export function combinedScore(look01: number, price: number, budget: number, alpha: number): number {
  return alpha * look01 + (1 - alpha) * priceScore(price, budget);
}

/** Map raw scores onto 0..1 so they can be blended with the price term. */
export function normalise(scores: number[]): number[] {
  if (!scores.length) return [];
  let lo = Infinity;
  let hi = -Infinity;
  for (const s of scores) {
    if (s < lo) lo = s;
    if (s > hi) hi = s;
  }
  const span = hi - lo;
  return span > 1e-9 ? scores.map((s) => (s - lo) / span) : scores.map(() => 0.5);
}

/**
 * k-means over the catalog, used to pick seed items that span the whole space.
 * Showing 10 near-identical dresses would waste the entire comparison budget.
 */
export function kmeansMedoids(vectors: Vec[], k: number, seed = 42, iterations = 12): number[] {
  const n = vectors.length;
  if (n === 0) return [];
  if (n <= k) return vectors.map((_, i) => i);
  const dim = vectors[0].length;

  // deterministic PRNG so the seed set is stable between sessions
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  // k-means++ initialisation
  const centroids: Float32Array[] = [Float32Array.from(vectors[Math.floor(rand() * n)])];
  while (centroids.length < k) {
    const d2 = vectors.map((v) => {
      let best = Infinity;
      for (const c of centroids) best = Math.min(best, 1 - dot(v, c));
      return best * best;
    });
    const total = d2.reduce((a, b) => a + b, 0) || 1;
    let target = rand() * total;
    let pick = 0;
    for (let i = 0; i < n; i++) {
      target -= d2[i];
      if (target <= 0) { pick = i; break; }
    }
    centroids.push(Float32Array.from(vectors[pick]));
  }

  const assign = new Int32Array(n);
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < n; i++) {
      let best = 0;
      let bestSim = -Infinity;
      for (let c = 0; c < centroids.length; c++) {
        const sim = dot(vectors[i], centroids[c]);
        if (sim > bestSim) { bestSim = sim; best = c; }
      }
      assign[i] = best;
    }
    const sums = centroids.map(() => new Float32Array(dim));
    const counts = new Int32Array(centroids.length);
    for (let i = 0; i < n; i++) {
      const c = assign[i];
      counts[c]++;
      const v = vectors[i];
      for (let d = 0; d < dim; d++) sums[c][d] += v[d];
    }
    for (let c = 0; c < centroids.length; c++) {
      if (!counts[c]) continue;
      const len = norm(sums[c]) || 1;
      for (let d = 0; d < dim; d++) centroids[c][d] = sums[c][d] / len;
    }
  }

  // medoid = real item closest to each centroid, so we always show a real dress
  const medoids: number[] = [];
  for (let c = 0; c < centroids.length; c++) {
    let best = -1;
    let bestSim = -Infinity;
    for (let i = 0; i < n; i++) {
      if (assign[i] !== c) continue;
      const sim = dot(vectors[i], centroids[c]);
      if (sim > bestSim) { bestSim = sim; best = i; }
    }
    if (best >= 0 && !medoids.includes(best)) medoids.push(best);
  }
  return medoids;
}

/**
 * Pick the next pair to ask about: the comparison the current model is least
 * sure of. Uncertainty is where a question buys the most information.
 */
export function mostUncertainPair(
  w: Float32Array,
  vectors: Vec[],
  candidates: number[],
  asked: Set<string>,
): [number, number] | null {
  let best: [number, number] | null = null;
  let bestGap = Infinity;
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      const a = candidates[i];
      const b = candidates[j];
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      if (asked.has(key)) continue;
      const gap = Math.abs(scoreItem(w, vectors[a]) - scoreItem(w, vectors[b]));
      if (gap < bestGap) { bestGap = gap; best = [a, b]; }
    }
  }
  return best;
}

/**
 * Beli-style insertion: where does this item belong in an existing ranked list?
 * Returns the comparison to ask, or the final index once the range collapses.
 */
export function insertionStep(
  lo: number,
  hi: number,
): { done: true; index: number } | { done: false; compareAgainst: number; lo: number; hi: number } {
  if (lo >= hi) return { done: true, index: lo };
  const mid = Math.floor((lo + hi) / 2);
  return { done: false, compareAgainst: mid, lo, hi };
}

/** Position in a ranked list -> a 0-10 score, best at the top. */
export function positionScore(index: number, total: number): number {
  if (total <= 1) return 10;
  return Math.round((10 - (index / (total - 1)) * 10) * 10) / 10;
}
