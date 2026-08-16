/**
 * Download product images locally so the app never depends on a retailer CDN.
 *
 * Hotlinking breaks in three ways: CDNs block it, products get delisted, and any
 * environment without egress to those hosts shows a wall of blank cards. A dead
 * image is a dead comparison, so we keep our own copy.
 *
 *   node scripts/thumbs.mjs [width]
 * rewrites `image` in data/catalog.embedded.json to /img/<id>.jpg
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const WIDTH = Number.parseInt(process.argv[2] || '400', 10);
const CONCURRENCY = 12;
const OUT_DIR = 'data/img';

const key = (id) => createHash('sha1').update(id).digest('hex').slice(0, 16);

/** Ask the CDN for a resized image rather than downloading full-size. */
function sized(src, width) {
  if (!src) return src;
  const [base, query] = src.split('?');
  const params = new URLSearchParams(query || '');
  params.set('width', String(width));
  return `${base}?${params.toString()}`;
}

async function download(dress) {
  const name = `${key(dress.id)}.jpg`;
  try {
    const res = await fetch(sized(dress.image, WIDTH), {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'image/avif,image/webp,image/*,*/*' },
    });
    if (!res.ok) return { dress, ok: false };
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 1000) return { dress, ok: false };
    await writeFile(`${OUT_DIR}/${name}`, buf);
    return { dress, ok: true, name, bytes: buf.length };
  } catch {
    return { dress, ok: false };
  }
}

async function main() {
  const path = 'data/catalog.embedded.json';
  const catalog = JSON.parse(await readFile(path, 'utf8'));
  await mkdir(OUT_DIR, { recursive: true });
  console.log(`downloading ${catalog.length} images at ${WIDTH}px…`);

  let done = 0;
  let failed = 0;
  let bytes = 0;
  const queue = [...catalog];

  async function worker() {
    for (;;) {
      const dress = queue.shift();
      if (!dress) return;
      const r = await download(dress);
      done++;
      if (r.ok) {
        dress.imageRemote = dress.image;
        dress.image = `/img/${r.name}`;
        bytes += r.bytes;
      } else {
        failed++;
      }
      if (done % 200 === 0) console.log(`  ${done}/${catalog.length}  (${failed} failed)`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // IMPORTANT: never drop rows here. catalog.embedded.json is index-aligned with
  // embeddings.bin, so removing an entry would silently shift every embedding
  // after it and corrupt all recommendations. Failures keep their remote URL and
  // fall back to the placeholder in the UI.
  await writeFile(path, JSON.stringify(catalog, null, 1));

  const local = catalog.filter((d) => d.image.startsWith('/img/')).length;
  console.log(
    `\n${local}/${catalog.length} images stored locally (${(bytes / 1e6).toFixed(0)} MB); ` +
      `${failed} failed and kept their remote URL`,
  );
}

main();
