import { useState } from 'react';
import { useTaste, SEED_ROUNDS } from './hooks/useTaste';
import Compare from './pages/Compare';
import Feed from './pages/Feed';
import Ranking from './pages/Ranking';

type Tab = 'compare' | 'feed' | 'ranking';

export default function App() {
  const taste = useTaste();
  const [tab, setTab] = useState<Tab>('compare');

  if (taste.error) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <h1 className="mb-3 text-2xl font-semibold">Catalog not built yet</h1>
        <p className="mb-4 text-sm opacity-70">{taste.error}</p>
        <pre className="rounded-lg bg-black/5 p-4 text-xs dark:bg-white/10">
          npm run scrape{'\n'}npm run embed
        </pre>
      </div>
    );
  }

  if (!taste.catalog) {
    return (
      <div className="grid min-h-screen place-items-center text-sm opacity-60">
        Loading catalog…
      </div>
    );
  }

  const tabs: [Tab, string][] = [
    ['compare', taste.ready ? 'Compare' : `Compare ${taste.roundsDone}/${SEED_ROUNDS}`],
    ['feed', 'For you'],
    ['ranking', 'My ranking'],
  ];

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 pb-24">
      <header className="flex items-baseline justify-between py-6">
        <h1 className="text-xl font-semibold tracking-tight">DressRank</h1>
        <span className="text-xs opacity-50">{taste.catalog.dresses.length} dresses</span>
      </header>

      <nav className="mb-6 flex gap-1 rounded-xl bg-black/5 p-1 dark:bg-white/10">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
              tab === id ? 'bg-white shadow-sm dark:bg-neutral-800' : 'opacity-60 hover:opacity-100'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {tab === 'compare' && <Compare taste={taste} onDone={() => setTab('feed')} />}
      {tab === 'feed' && <Feed taste={taste} />}
      {tab === 'ranking' && <Ranking taste={taste} />}
    </div>
  );
}
