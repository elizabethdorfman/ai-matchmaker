import { useCallback, useEffect, useMemo, useState } from 'react';
import { loadCatalog, type LoadedCatalog } from '../lib/catalog';
import {
  fitTaste,
  scoreItem,
  normalise,
  combinedScore,
  kmeansMedoids,
  mostUncertainPair,
  type Comparison,
} from '../lib/ranker';
import { addComparison, loadProfile, resetProfile, saveProfile } from '../lib/storage';
import type { Dress, TasteProfile } from '../lib/types';

export const SEED_ROUNDS = 10;

export interface ScoredDress {
  dress: Dress;
  index: number;
  look: number;
  score: number;
}

export function useTaste() {
  const [catalog, setCatalog] = useState<LoadedCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<TasteProfile>(() => loadProfile());

  useEffect(() => {
    loadCatalog()
      .then(setCatalog)
      .catch((e: unknown) =>
        setError(
          e instanceof Error
            ? `${e.message} — run "npm run data" to build the catalog first.`
            : 'Failed to load catalog.',
        ),
      );
  }, []);

  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    catalog?.dresses.forEach((d, i) => map.set(d.id, i));
    return map;
  }, [catalog]);

  /** The learned taste direction, refitted whenever a comparison lands. */
  const taste = useMemo(() => {
    if (!catalog) return null;
    const pairs: Comparison[] = [];
    for (const c of profile.comparisons) {
      const w = indexById.get(c.winner);
      const l = indexById.get(c.loser);
      if (w !== undefined && l !== undefined) pairs.push({ winnerIdx: w, loserIdx: l });
    }
    if (!pairs.length) return null;
    return fitTaste(catalog.vectors, pairs);
  }, [catalog, profile.comparisons, indexById]);

  /** Seed items spanning the catalog, so early comparisons are informative. */
  const seeds = useMemo(() => {
    if (!catalog) return [];
    return kmeansMedoids(catalog.vectors, SEED_ROUNDS * 2 + 4);
  }, [catalog]);

  const askedKeys = useMemo(() => {
    const set = new Set<string>();
    for (const c of profile.comparisons) {
      const a = indexById.get(c.winner);
      const b = indexById.get(c.loser);
      if (a === undefined || b === undefined) continue;
      set.add(a < b ? `${a}:${b}` : `${b}:${a}`);
    }
    return set;
  }, [profile.comparisons, indexById]);

  /** Next pair to ask about: spread out at first, then wherever we are least sure. */
  const nextPair = useMemo<[number, number] | null>(() => {
    if (!catalog || !seeds.length) return null;
    const round = profile.comparisons.length;
    if (round < SEED_ROUNDS && !taste) {
      const a = seeds[(round * 2) % seeds.length];
      const b = seeds[(round * 2 + 1) % seeds.length];
      if (a !== undefined && b !== undefined && a !== b) return [a, b];
    }
    const pool = taste
      ? seeds.concat(
          rankedIndices(catalog, taste, 40).filter((i) => !seeds.includes(i)),
        )
      : seeds;
    return mostUncertainPair(
      taste ?? new Float32Array(catalog.meta.dim),
      catalog.vectors,
      pool,
      askedKeys,
    );
  }, [catalog, seeds, taste, profile.comparisons.length, askedKeys]);

  /** Everything scored on look, then blended with price. */
  const scored = useMemo<ScoredDress[]>(() => {
    if (!catalog) return [];
    const raw = taste
      ? catalog.vectors.map((v) => scoreItem(taste, v))
      : catalog.vectors.map(() => 0);
    const looks = normalise(raw);
    return catalog.dresses
      .map((dress, index) => ({
        dress,
        index,
        look: looks[index],
        score: combinedScore(looks[index], dress.price, profile.budget, profile.alpha),
      }))
      .sort((a, b) => b.score - a.score);
  }, [catalog, taste, profile.budget, profile.alpha]);

  const choose = useCallback(
    (winnerIdx: number, loserIdx: number) => {
      if (!catalog) return;
      const winner = catalog.dresses[winnerIdx]?.id;
      const loser = catalog.dresses[loserIdx]?.id;
      if (!winner || !loser) return;
      setProfile((p) => addComparison(p, winner, loser));
    },
    [catalog],
  );

  const update = useCallback((patch: Partial<TasteProfile>) => {
    setProfile((p) => saveProfile({ ...p, ...patch }));
  }, []);

  const reset = useCallback(() => setProfile(resetProfile()), []);

  return {
    catalog,
    error,
    profile,
    taste,
    scored,
    nextPair,
    choose,
    update,
    reset,
    roundsDone: profile.comparisons.length,
    ready: profile.comparisons.length >= SEED_ROUNDS,
  };
}

/** Top-n indices by raw taste score. */
function rankedIndices(catalog: LoadedCatalog, taste: Float32Array, n: number): number[] {
  return catalog.vectors
    .map((v, i) => [scoreItem(taste, v), i] as const)
    .sort((a, b) => b[0] - a[0])
    .slice(0, n)
    .map(([, i]) => i);
}
