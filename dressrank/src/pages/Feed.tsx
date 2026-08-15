import { useMemo, useState } from 'react';
import type { useTaste } from '../hooks/useTaste';
import { SEED_ROUNDS } from '../hooks/useTaste';
import { formatPrice } from '../lib/catalog';
import DressImage from '../components/DressImage';

interface Props {
  taste: ReturnType<typeof useTaste>;
}

type Sort = 'match' | 'value' | 'price';

export default function Feed({ taste }: Props) {
  const { catalog, scored, profile, update, roundsDone, ready, attributesSummary } = useFeed(taste);
  const [sort, setSort] = useState<Sort>('match');
  const [hideOver, setHideOver] = useState(false);

  const items = useMemo(() => {
    const list = hideOver ? scored.filter((s) => s.dress.price <= profile.budget) : scored;
    const copy = [...list];
    if (sort === 'price') copy.sort((a, b) => a.dress.price - b.dress.price);
    if (sort === 'value') copy.sort((a, b) => b.look / Math.max(b.dress.price, 1) - a.look / Math.max(a.dress.price, 1));
    return copy.slice(0, 60);
  }, [scored, sort, hideOver, profile.budget]);

  if (!catalog) return null;

  return (
    <div>
      {!ready && (
        <p className="mb-4 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
          Only {roundsDone} of {SEED_ROUNDS} comparisons so far — these will get much better as you
          compare more.
        </p>
      )}

      {attributesSummary.length > 0 && (
        <div className="mb-5 rounded-xl border border-black/10 p-4 dark:border-white/15">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide opacity-50">
            What this thinks you like
          </p>
          <div className="flex flex-wrap gap-2">
            {attributesSummary.map(([dim, value]) => (
              <span key={dim} className="rounded-full bg-black/5 px-3 py-1 text-sm dark:bg-white/10">
                <span className="opacity-50">{dim}:</span> {value}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-5 space-y-3 rounded-xl border border-black/10 p-4 dark:border-white/15">
        <label className="block">
          <div className="mb-1 flex justify-between text-xs opacity-60">
            <span>Prioritise price</span>
            <span>Prioritise look</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={profile.alpha}
            onChange={(e) => update({ alpha: Number(e.target.value) })}
            className="w-full"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <label className="flex items-center gap-2">
            <span className="opacity-60">Budget</span>
            <input
              type="number"
              min={0}
              step={10}
              value={profile.budget}
              onChange={(e) => update({ budget: Math.max(0, Number(e.target.value)) })}
              className="w-24 rounded-lg border border-black/15 bg-transparent px-2 py-1 dark:border-white/20"
            />
          </label>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={hideOver} onChange={(e) => setHideOver(e.target.checked)} />
            <span className="opacity-60">Hide over budget</span>
          </label>

          <div className="ml-auto flex gap-1 rounded-lg bg-black/5 p-1 dark:bg-white/10">
            {(['match', 'value', 'price'] as Sort[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSort(s)}
                className={`rounded-md px-2 py-1 text-xs font-medium ${
                  sort === s ? 'bg-white shadow-sm dark:bg-neutral-800' : 'opacity-60'
                }`}
              >
                {s === 'match' ? 'Best match' : s === 'value' ? 'Best value' : 'Lowest price'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map(({ dress, look }) => (
          <a
            key={dress.id}
            href={dress.url}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-2xl border border-black/10 bg-white transition hover:-translate-y-0.5 hover:shadow-lg dark:border-white/15 dark:bg-neutral-900"
          >
            <DressImage src={dress.image} alt={dress.name} className="aspect-[3/4] w-full" />
            <div className="p-3">
              <p className="line-clamp-2 text-sm font-medium leading-snug">{dress.name}</p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-xs opacity-60">{dress.store}</span>
                <span className="text-sm font-semibold">
                  {formatPrice(dress.price, dress.currency)}
                </span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
                <div
                  className="h-full rounded-full bg-neutral-900 dark:bg-white"
                  style={{ width: `${Math.round(look * 100)}%` }}
                  title={`${Math.round(look * 100)}% match`}
                />
              </div>
            </div>
          </a>
        ))}
      </div>

      {items.length === 0 && (
        <p className="py-12 text-center text-sm opacity-60">
          Nothing matches those filters. Try raising the budget.
        </p>
      )}
    </div>
  );
}

/** Derive the "what you like" summary from the CLIP attribute axes of top matches. */
function useFeed(taste: ReturnType<typeof useTaste>) {
  const summary = useMemo<[string, string][]>(() => {
    if (!taste.catalog?.attributes.length || !taste.taste) return [];
    const top = taste.scored.slice(0, 15).map((s) => s.index);
    const counts = new Map<string, Map<string, number>>();
    for (const idx of top) {
      const attrs = taste.catalog.attributes[idx];
      if (!attrs) continue;
      for (const [dim, { top: label }] of Object.entries(attrs)) {
        if (!counts.has(dim)) counts.set(dim, new Map());
        const inner = counts.get(dim)!;
        inner.set(label, (inner.get(label) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries()).map(([dim, inner]) => {
      let best = '';
      let bestN = 0;
      for (const [label, n] of inner) if (n > bestN) { bestN = n; best = label; }
      return [dim, best] as [string, string];
    });
  }, [taste.catalog, taste.scored, taste.taste]);

  return { ...taste, attributesSummary: summary };
}
