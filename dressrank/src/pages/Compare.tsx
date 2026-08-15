import type { useTaste } from '../hooks/useTaste';
import { SEED_ROUNDS } from '../hooks/useTaste';
import { formatPrice } from '../lib/catalog';
import DressImage from '../components/DressImage';

interface Props {
  taste: ReturnType<typeof useTaste>;
  onDone: () => void;
}

export default function Compare({ taste, onDone }: Props) {
  const { catalog, nextPair, choose, roundsDone, ready, reset } = taste;
  if (!catalog) return null;

  if (!nextPair) {
    return (
      <div className="rounded-xl border border-black/10 p-8 text-center dark:border-white/15">
        <p className="mb-4 text-sm opacity-70">No more pairs to compare.</p>
        <button type="button" onClick={onDone} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900">
          See recommendations
        </button>
      </div>
    );
  }

  const [a, b] = nextPair;
  const progress = Math.min(roundsDone, SEED_ROUNDS);

  return (
    <div>
      <div className="mb-5">
        <p className="mb-2 text-sm opacity-70">
          {ready
            ? 'Keep going — every answer sharpens your recommendations.'
            : 'Which would you actually wear?'}
        </p>
        <div className="h-1 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
          <div
            className="h-full rounded-full bg-neutral-900 transition-all dark:bg-white"
            style={{ width: `${(progress / SEED_ROUNDS) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        {[a, b].map((idx, side) => {
          const dress = catalog.dresses[idx];
          return (
            <button
              key={`${dress.id}-${side}`}
              type="button"
              onClick={() => choose(idx, side === 0 ? b : a)}
              className="group overflow-hidden rounded-2xl border border-black/10 bg-white text-left transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900 dark:border-white/15 dark:bg-neutral-900"
            >
              <DressImage
                src={dress.image}
                alt={dress.name}
                className="aspect-[3/4] w-full transition group-hover:scale-[1.02]"
              />
              <div className="p-3">
                <p className="line-clamp-2 text-sm font-medium leading-snug">{dress.name}</p>
                <p className="mt-1 text-xs opacity-60">
                  {dress.store} · {formatPrice(dress.price, dress.currency)}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center justify-between text-xs opacity-60">
        <span>{roundsDone} compared</span>
        <div className="flex gap-4">
          {ready && (
            <button type="button" onClick={onDone} className="underline underline-offset-4">
              See recommendations
            </button>
          )}
          <button type="button" onClick={reset} className="underline underline-offset-4">
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}
