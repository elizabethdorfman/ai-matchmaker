import { useMemo, useState } from 'react';
import type { useTaste } from '../hooks/useTaste';
import { formatPrice } from '../lib/catalog';
import { insertionStep, positionScore } from '../lib/ranker';
import DressImage from '../components/DressImage';
import type { Dress } from '../lib/types';

interface Props {
  taste: ReturnType<typeof useTaste>;
}

interface Pending {
  dressId: string;
  lo: number;
  hi: number;
}

/**
 * Beli-style ranked list. Adding a dress runs a binary search against the list
 * you already have — about 7 comparisons to place something among 100.
 */
export default function Ranking({ taste }: Props) {
  const { catalog, profile, update, scored } = taste;
  const [pending, setPending] = useState<Pending | null>(null);

  const byId = useMemo(() => {
    const map = new Map<string, Dress>();
    catalog?.dresses.forEach((d) => map.set(d.id, d));
    return map;
  }, [catalog]);

  const ranked = useMemo(
    () => profile.ranking.map((id) => byId.get(id)).filter((d): d is Dress => Boolean(d)),
    [profile.ranking, byId],
  );

  if (!catalog) return null;

  const startAdd = (dressId: string) => {
    if (profile.ranking.includes(dressId)) return;
    if (profile.ranking.length === 0) {
      update({ ranking: [dressId] });
      return;
    }
    setPending({ dressId, lo: 0, hi: profile.ranking.length });
  };

  const answer = (preferNew: boolean) => {
    if (!pending) return;
    const step = insertionStep(pending.lo, pending.hi);
    if (step.done) return;
    const nextLo = preferNew ? pending.lo : step.compareAgainst + 1;
    const nextHi = preferNew ? step.compareAgainst : pending.hi;
    const settled = insertionStep(nextLo, nextHi);
    if (settled.done) {
      const next = [...profile.ranking];
      next.splice(settled.index, 0, pending.dressId);
      update({ ranking: next });
      setPending(null);
    } else {
      setPending({ ...pending, lo: nextLo, hi: nextHi });
    }
  };

  const remove = (id: string) =>
    update({ ranking: profile.ranking.filter((x) => x !== id) });

  if (pending) {
    const step = insertionStep(pending.lo, pending.hi);
    if (!step.done) {
      const challenger = byId.get(pending.dressId);
      const incumbent = byId.get(profile.ranking[step.compareAgainst]);
      if (challenger && incumbent) {
        return (
          <div>
            <p className="mb-4 text-sm opacity-70">Where does this go? Pick the one you prefer.</p>
            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {[
                { dress: challenger, isNew: true },
                { dress: incumbent, isNew: false },
              ].map(({ dress, isNew }) => (
                <button
                  key={dress.id + String(isNew)}
                  type="button"
                  onClick={() => answer(isNew)}
                  className="overflow-hidden rounded-2xl border border-black/10 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/15 dark:bg-neutral-900"
                >
                  <DressImage src={dress.image} alt={dress.name} className="aspect-[3/4] w-full" />
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-medium">{dress.name}</p>
                    <p className="mt-1 text-xs opacity-60">
                      {dress.store} · {formatPrice(dress.price, dress.currency)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPending(null)}
              className="mt-6 text-xs underline underline-offset-4 opacity-60"
            >
              Cancel
            </button>
          </div>
        );
      }
    }
  }

  return (
    <div>
      {ranked.length === 0 ? (
        <div className="rounded-xl border border-black/10 p-6 dark:border-white/15">
          <p className="mb-4 text-sm opacity-70">
            Your ranking is empty. Add a few of your top matches to build it.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {scored.slice(0, 5).map(({ dress }) => (
              <button
                key={dress.id}
                type="button"
                onClick={() => startAdd(dress.id)}
                className="overflow-hidden rounded-xl border border-black/10 dark:border-white/15"
              >
                <DressImage src={dress.image} alt={dress.name} className="aspect-[3/4] w-full" />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <ol className="space-y-2">
          {ranked.map((dress, i) => (
            <li
              key={dress.id}
              className="flex items-center gap-3 rounded-xl border border-black/10 bg-white p-2 dark:border-white/15 dark:bg-neutral-900"
            >
              <span className="w-8 text-center text-sm font-semibold tabular-nums opacity-50">
                {i + 1}
              </span>
              <DressImage src={dress.image} alt={dress.name} className="h-16 w-12 rounded-md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{dress.name}</p>
                <p className="text-xs opacity-60">
                  {dress.store} · {formatPrice(dress.price, dress.currency)}
                </p>
              </div>
              <span className="rounded-lg bg-black/5 px-2 py-1 text-sm font-semibold tabular-nums dark:bg-white/10">
                {positionScore(i, ranked.length).toFixed(1)}
              </span>
              <button
                type="button"
                onClick={() => remove(dress.id)}
                aria-label={`Remove ${dress.name}`}
                className="px-2 text-xs opacity-40 hover:opacity-80"
              >
                ✕
              </button>
            </li>
          ))}
        </ol>
      )}

      {ranked.length > 0 && (
        <div className="mt-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide opacity-50">
            Add from your top matches
          </p>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {scored
              .filter((s) => !profile.ranking.includes(s.dress.id))
              .slice(0, 6)
              .map(({ dress }) => (
                <button
                  key={dress.id}
                  type="button"
                  onClick={() => startAdd(dress.id)}
                  className="overflow-hidden rounded-lg border border-black/10 dark:border-white/15"
                  title={dress.name}
                >
                  <DressImage src={dress.image} alt={dress.name} className="aspect-[3/4] w-full" />
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
