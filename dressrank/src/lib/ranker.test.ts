import { describe, it, expect } from 'vitest';
import {
  fitTaste,
  scoreItem,
  priceScore,
  combinedScore,
  normalise,
  kmeansMedoids,
  positionScore,
  insertionStep,
  mostUncertainPair,
} from './ranker';

/** Build a normalised vector from plain numbers. */
const v = (...xs: number[]): Float32Array => {
  const a = Float32Array.from(xs);
  const n = Math.hypot(...xs) || 1;
  for (let i = 0; i < a.length; i++) a[i] /= n;
  return a;
};

describe('fitTaste', () => {
  it('recovers a known taste direction from comparisons', () => {
    // Ground truth: dimension 0 is "good". Items with more of it should win.
    const vectors = [v(1, 0), v(0.9, 0.4), v(0.2, 1), v(0, 1)];
    const comparisons = [
      { winnerIdx: 0, loserIdx: 3 },
      { winnerIdx: 1, loserIdx: 2 },
      { winnerIdx: 0, loserIdx: 2 },
    ];
    const w = fitTaste(vectors, comparisons);
    // The learned direction should favour dimension 0 over dimension 1.
    expect(w[0]).toBeGreaterThan(w[1]);
    // And it should rank the winners above the losers it was trained on.
    expect(scoreItem(w, vectors[0])).toBeGreaterThan(scoreItem(w, vectors[3]));
    expect(scoreItem(w, vectors[1])).toBeGreaterThan(scoreItem(w, vectors[2]));
  });

  it('generalises to an item it never saw', () => {
    const vectors = [v(1, 0), v(0, 1), v(0.8, 0.2), v(0.2, 0.8)];
    const w = fitTaste(vectors, [
      { winnerIdx: 0, loserIdx: 1 },
      { winnerIdx: 2, loserIdx: 3 },
    ]);
    const unseenGood = v(0.95, 0.1);
    const unseenBad = v(0.1, 0.95);
    expect(scoreItem(w, unseenGood)).toBeGreaterThan(scoreItem(w, unseenBad));
  });

  it('returns a zero vector when there is nothing to learn from', () => {
    const w = fitTaste([v(1, 0), v(0, 1)], []);
    expect(Array.from(w)).toEqual([0, 0]);
  });

  it('handles contradictory comparisons without blowing up', () => {
    const vectors = [v(1, 0), v(0, 1)];
    const w = fitTaste(vectors, [
      { winnerIdx: 0, loserIdx: 1 },
      { winnerIdx: 1, loserIdx: 0 },
    ]);
    expect(w.every((x) => Number.isFinite(x))).toBe(true);
  });
});

describe('priceScore', () => {
  it('is flat at or under budget', () => {
    expect(priceScore(100, 200)).toBe(1);
    expect(priceScore(200, 200)).toBe(1);
  });

  it('decays softly above budget rather than cutting off', () => {
    const justOver = priceScore(220, 200);
    const wayOver = priceScore(700, 200);
    expect(justOver).toBeLessThan(1);
    expect(justOver).toBeGreaterThan(0.85); // a near-miss stays competitive
    expect(wayOver).toBeLessThan(0.1); // a $700 dress does not
  });
});

describe('combinedScore', () => {
  it('alpha=1 ignores price entirely', () => {
    expect(combinedScore(0.8, 900, 200, 1)).toBeCloseTo(0.8);
  });

  it('lowering alpha lets a cheaper item overtake a better-looking one', () => {
    const pricey = combinedScore(0.9, 800, 200, 0.4);
    const cheap = combinedScore(0.7, 120, 200, 0.4);
    expect(cheap).toBeGreaterThan(pricey);
  });
});

describe('normalise', () => {
  it('maps to 0..1', () => {
    expect(normalise([1, 2, 3])).toEqual([0, 0.5, 1]);
  });

  it('returns midpoints when every score is identical', () => {
    expect(normalise([2, 2, 2])).toEqual([0.5, 0.5, 0.5]);
  });
});

describe('kmeansMedoids', () => {
  it('picks one real item from each cluster', () => {
    // Two tight, well-separated clusters.
    const vectors = [v(1, 0), v(0.99, 0.1), v(0.98, 0.05), v(0, 1), v(0.1, 0.99), v(0.05, 0.98)];
    const medoids = kmeansMedoids(vectors, 2, 7);
    expect(medoids).toHaveLength(2);
    // one from each side, not two neighbours
    const [a, b] = medoids;
    const sameCluster = (a < 3 && b < 3) || (a >= 3 && b >= 3);
    expect(sameCluster).toBe(false);
  });

  it('is deterministic for a given seed', () => {
    const vectors = Array.from({ length: 30 }, (_, i) => v(Math.cos(i), Math.sin(i)));
    expect(kmeansMedoids(vectors, 5, 1)).toEqual(kmeansMedoids(vectors, 5, 1));
  });

  it('returns everything when the catalog is smaller than k', () => {
    expect(kmeansMedoids([v(1, 0), v(0, 1)], 10)).toEqual([0, 1]);
  });
});

describe('mostUncertainPair', () => {
  it('chooses the closest-scoring pair', () => {
    const w = Float32Array.from([1, 0]);
    const vectors = [v(1, 0), v(0.99, 0.14), v(0, 1)];
    const pair = mostUncertainPair(w, vectors, [0, 1, 2], new Set());
    expect(pair).not.toBeNull();
    // 0 and 1 score almost identically; 2 is far away
    expect(pair!.sort()).toEqual([0, 1]);
  });

  it('skips pairs already asked', () => {
    const w = Float32Array.from([1, 0]);
    const vectors = [v(1, 0), v(0.99, 0.14), v(0, 1)];
    const pair = mostUncertainPair(w, vectors, [0, 1, 2], new Set(['0:1']));
    expect(pair!.includes(2)).toBe(true);
  });
});

describe('binary-search insertion', () => {
  it('narrows to a position in log2(n) steps', () => {
    let lo = 0;
    let hi = 100;
    let steps = 0;
    // Simulate: the item belongs at index 40.
    for (;;) {
      const step = insertionStep(lo, hi);
      if (step.done) {
        expect(step.index).toBe(40);
        break;
      }
      steps++;
      if (step.compareAgainst < 40) lo = step.compareAgainst + 1;
      else hi = step.compareAgainst;
      expect(steps).toBeLessThan(10); // ceil(log2(100)) = 7
    }
  });
});

describe('positionScore', () => {
  it('scores the top of the list 10 and the bottom 0', () => {
    expect(positionScore(0, 10)).toBe(10);
    expect(positionScore(9, 10)).toBe(0);
  });

  it('is monotonically decreasing down the list', () => {
    const scores = [0, 1, 2, 3, 4].map((i) => positionScore(i, 5));
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i]).toBeLessThan(scores[i - 1]);
    }
  });
});
