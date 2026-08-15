export interface Dress {
  id: string;
  store: string;
  domain: string;
  name: string;
  price: number;
  currency: string;
  url: string;
  image: string;
  tags: string[];
  productType: string;
}

/** One named dimension from the CLIP zero-shot pass. */
export interface AttributeScore {
  top: string;
  scores: number[];
}

export type Attributes = Record<string, AttributeScore>;

export interface CatalogMeta {
  count: number;
  dim: number;
  model: string;
  dimensions: string[];
}

export interface StoredComparison {
  winner: string;
  loser: string;
  at: string;
}

export interface TasteProfile {
  comparisons: StoredComparison[];
  /** Ordered best-first; ids only, so the catalog can change underneath it. */
  ranking: string[];
  budget: number;
  alpha: number;
  updatedAt: string;
  /** Reserved: set once accounts exist. */
  userId?: string;
}
