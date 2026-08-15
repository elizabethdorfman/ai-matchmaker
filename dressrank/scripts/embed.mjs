/**
 * CLIP-index the catalog.
 *
 * Produces, for every dress:
 *   1. a 512-d image embedding  -> data/embeddings.bin  (Float32, row-major)
 *   2. zero-shot attribute scores across named dimensions -> data/attributes.json
 *
 * The embedding drives recommendations; the attributes make them explainable.
 *
 *   node scripts/embed.mjs [limit]
 */
import { pipeline, AutoTokenizer, CLIPTextModelWithProjection, env } from '@xenova/transformers';
import { readFile, writeFile, mkdir } from 'node:fs/promises';

env.allowLocalModels = false;

const MODEL = 'Xenova/clip-vit-base-patch32';
const DIM = 512;

/** Named dimensions. Scores are softmaxed within each dimension. */
const DIMENSIONS = {
  colour: [
    'a brightly coloured dress', 'a pastel coloured dress', 'a jewel-toned dress',
    'a black or beige neutral dress', 'a white dress',
  ],
  print: [
    'a floral print dress', 'an animal print dress', 'a polka dot dress',
    'a striped dress', 'a checked or plaid dress', 'a solid colour dress with no pattern',
  ],
  silhouette: [
    'a slip dress', 'an A-line dress', 'a bodycon fitted dress', 'a tiered maxi dress',
    'a puff sleeve dress', 'a shirt dress', 'a wrap dress', 'a drop waist dress',
  ],
  fabric: [
    'a satin dress', 'a lace dress', 'a knitted dress', 'a denim dress',
    'a cotton or linen dress', 'a sheer mesh dress', 'a sequin dress',
  ],
  vibe: [
    'a minimalist understated dress', 'a romantic feminine dress', 'an edgy dress',
    'a preppy dress', 'a bohemian dress', 'a retro vintage-style dress',
  ],
  occasion: [
    'a casual daytime dress', 'a going out party dress',
    'a formal occasion dress', 'a workwear office dress',
  ],
};

const cosine = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s; // inputs are L2-normalised
};

function softmax(xs, temp = 100) {
  const scaled = xs.map((x) => x * temp);
  const max = Math.max(...scaled);
  const exps = scaled.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

async function embedPrompts() {
  const tokenizer = await AutoTokenizer.from_pretrained(MODEL);
  const textModel = await CLIPTextModelWithProjection.from_pretrained(MODEL);
  const out = {};
  for (const [dim, prompts] of Object.entries(DIMENSIONS)) {
    const inputs = await tokenizer(prompts, { padding: true, truncation: true });
    const { text_embeds } = await textModel(inputs);
    const vecs = [];
    for (let i = 0; i < prompts.length; i++) {
      const row = Array.from(text_embeds.data.slice(i * DIM, (i + 1) * DIM));
      const norm = Math.hypot(...row);
      vecs.push(row.map((v) => v / norm));
    }
    out[dim] = { prompts, vecs };
  }
  return out;
}

async function main() {
  const limit = Number.parseInt(process.argv[2] || '0', 10);
  const catalog = JSON.parse(await readFile('data/catalog.json', 'utf8'));
  const items = limit > 0 ? catalog.slice(0, limit) : catalog;
  console.log(`embedding ${items.length} dresses`);

  console.log('loading CLIP…');
  const extractor = await pipeline('image-feature-extraction', MODEL);

  let prompts = null;
  try {
    prompts = await embedPrompts();
    console.log(`prompt sets ready: ${Object.keys(prompts).join(', ')}`);
  } catch (err) {
    console.warn(`text tower unavailable (${err.message}) — attributes skipped`);
  }

  const buf = new Float32Array(items.length * DIM);
  const attributes = [];
  const kept = [];
  const t0 = Date.now();

  for (const [i, dress] of items.entries()) {
    try {
      const out = await extractor(dress.image, { pooling: 'mean', normalize: true });
      const vec = Array.from(out.data);
      buf.set(vec, kept.length * DIM);

      if (prompts) {
        const attrs = {};
        for (const [dim, { prompts: labels, vecs }] of Object.entries(prompts)) {
          const sims = vecs.map((v) => cosine(vec, v));
          const probs = softmax(sims);
          let best = 0;
          for (let k = 1; k < probs.length; k++) if (probs[k] > probs[best]) best = k;
          attrs[dim] = {
            top: labels[best].replace(/^an? /, '').replace(/ dress$/, ''),
            scores: probs.map((p) => Math.round(p * 1000) / 1000),
          };
        }
        attributes.push(attrs);
      }
      kept.push(dress);
    } catch (err) {
      // skip unreachable/broken images rather than aborting a long run
      if (i < 5) console.warn(`  skip ${dress.id}: ${err.message.slice(0, 60)}`);
    }

    if ((i + 1) % 100 === 0) {
      const per = (Date.now() - t0) / (i + 1) / 1000;
      const left = ((items.length - i - 1) * per) / 60;
      console.log(`  ${i + 1}/${items.length}  ${per.toFixed(2)}s/img  ~${left.toFixed(1)}min left`);
    }
  }

  await mkdir('data', { recursive: true });
  await writeFile('data/embeddings.bin', Buffer.from(buf.buffer, 0, kept.length * DIM * 4));
  await writeFile('data/catalog.embedded.json', JSON.stringify(kept, null, 1));
  if (attributes.length) {
    await writeFile('data/attributes.json', JSON.stringify(attributes));
  }
  await writeFile(
    'data/meta.json',
    JSON.stringify({ count: kept.length, dim: DIM, model: MODEL, dimensions: Object.keys(DIMENSIONS) }, null, 1),
  );
  console.log(`\n${kept.length} embedded -> data/embeddings.bin (${(kept.length * DIM * 4 / 1e6).toFixed(1)} MB)`);
}

main();
