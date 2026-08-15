/**
 * Polite HTTP layer shared by every ingestion strategy.
 *
 * Three jobs: don't hammer anyone's origin, honour robots.txt, and record
 * *why* a host failed so the run report can distinguish "we're blocked" from
 * "this brand isn't on Shopify". That distinction drives what we do next, so
 * it matters more than it looks.
 */

const UA =
  'RackBot/0.1 (+https://rack.example/bot; product discovery indexer; contact@rack.example)';

const DEFAULT_DELAY_MS = 1000; // 1 req/sec/domain
const MAX_RETRIES = 3;

const lastHitAt = new Map();
const robotsCache = new Map();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function throttle(domain, delayMs) {
  const last = lastHitAt.get(domain) ?? 0;
  const wait = last + delayMs - Date.now();
  if (wait > 0) await sleep(wait);
  lastHitAt.set(domain, Date.now());
}

/**
 * Fetch and parse robots.txt.
 *
 * A 403 here is the interesting case: it means the origin is actively
 * refusing automated clients, not that the file is missing. We surface that
 * as `blocked` rather than treating it as "no rules, crawl freely" — a site
 * that won't serve us its robots.txt has not given us permission to guess.
 */
async function loadRobots(domain) {
  if (robotsCache.has(domain)) return robotsCache.get(domain);

  let parsed = { disallows: [], sitemaps: [], blocked: false };
  try {
    const res = await fetch(`https://${domain}/robots.txt`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(15000),
    });

    if (res.status === 403 || res.status === 401 || res.status === 429) {
      parsed.blocked = true;
    } else if (res.ok) {
      const text = await res.text();
      let applies = false;
      for (const rawLine of text.split('\n')) {
        const line = rawLine.split('#')[0].trim();
        if (!line) continue;
        const [rawKey, ...rest] = line.split(':');
        const key = rawKey.trim().toLowerCase();
        const value = rest.join(':').trim();
        if (key === 'user-agent') {
          applies = value === '*' || value.toLowerCase().includes('rackbot');
        } else if (key === 'disallow' && applies && value) {
          parsed.disallows.push(value);
        } else if (key === 'sitemap' && value) {
          parsed.sitemaps.push(value);
        }
      }
    }
  } catch {
    // Network failure or timeout — treat as unrestricted but stay slow.
  }

  robotsCache.set(domain, parsed);
  return parsed;
}

export async function robotsFor(domain) {
  return loadRobots(domain);
}

export async function isAllowed(domain, path) {
  const { disallows, blocked } = await loadRobots(domain);
  if (blocked) return false;
  return !disallows.some((rule) => path.startsWith(rule));
}

/**
 * GET with throttling, robots enforcement, and backoff on 429/5xx.
 * Returns a status string rather than throwing — a missing /products.json is
 * a normal outcome, not an error.
 */
export async function get(url, { delayMs = DEFAULT_DELAY_MS, json = false } = {}) {
  const { hostname, pathname, search } = new URL(url);

  if (!(await isAllowed(hostname, pathname))) {
    return { ok: false, status: 'robots-disallowed', body: null };
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    await throttle(hostname, delayMs);
    try {
      const res = await fetch(`https://${hostname}${pathname}${search}`, {
        headers: { 'User-Agent': UA, Accept: json ? 'application/json' : 'text/html,application/xml' },
        signal: AbortSignal.timeout(30000),
      });

      if (res.status === 403) return { ok: false, status: 'blocked', body: null };
      if (res.status === 429 || res.status >= 500) {
        if (attempt < MAX_RETRIES) { await sleep(2000 * 2 ** attempt); continue; }
        return { ok: false, status: String(res.status), body: null };
      }
      if (!res.ok) return { ok: false, status: String(res.status), body: null };

      return { ok: true, status: res.status, body: json ? await res.json() : await res.text() };
    } catch (err) {
      if (attempt < MAX_RETRIES) { await sleep(2000 * 2 ** attempt); continue; }
      return { ok: false, status: err.name === 'TimeoutError' ? 'timeout' : 'network', body: null };
    }
  }
  return { ok: false, status: 'exhausted', body: null };
}

export { UA };
