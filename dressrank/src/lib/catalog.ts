import type { Dress, Attributes, CatalogMeta } from './types';

export interface LoadedCatalog {
  dresses: Dress[];
  vectors: Float32Array[];
  attributes: Attributes[];
  meta: CatalogMeta;
}

/**
 * Load the precomputed catalog. Embeddings ship as a flat Float32 binary rather
 * than JSON — 1400 x 512 floats is 2.9 MB binary versus ~30 MB of JSON text.
 */
export async function loadCatalog(): Promise<LoadedCatalog> {
  const [dresses, meta, buffer, attributes] = await Promise.all([
    fetch('/catalog.embedded.json').then((r) => r.json() as Promise<Dress[]>),
    fetch('/meta.json').then((r) => r.json() as Promise<CatalogMeta>),
    fetch('/embeddings.bin').then((r) => r.arrayBuffer()),
    fetch('/attributes.json')
      .then((r) => (r.ok ? (r.json() as Promise<Attributes[]>) : []))
      .catch(() => [] as Attributes[]),
  ]);

  const all = new Float32Array(buffer);
  const { dim } = meta;
  const vectors: Float32Array[] = [];
  for (let i = 0; i < dresses.length; i++) {
    vectors.push(all.subarray(i * dim, (i + 1) * dim));
  }

  return { dresses, vectors, attributes, meta };
}

export const formatPrice = (price: number, currency = 'CAD'): string =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
