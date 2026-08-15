import type { TasteProfile, StoredComparison } from './types';

const KEY = 'dressrank.profile.v1';

export const emptyProfile = (): TasteProfile => ({
  comparisons: [],
  ranking: [],
  budget: 200,
  alpha: 0.7,
  updatedAt: new Date().toISOString(),
});

/**
 * The single seam between the app and persistence. Swapping localStorage for a
 * server is a change to this file only.
 */
export function loadProfile(): TasteProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProfile();
    const parsed = JSON.parse(raw) as Partial<TasteProfile>;
    return { ...emptyProfile(), ...parsed };
  } catch {
    return emptyProfile();
  }
}

export function saveProfile(profile: TasteProfile): TasteProfile {
  const next = { ...profile, updatedAt: new Date().toISOString() };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage full or disabled — the session still works, it just will not persist
  }
  return next;
}

export function addComparison(
  profile: TasteProfile,
  winner: string,
  loser: string,
): TasteProfile {
  const entry: StoredComparison = { winner, loser, at: new Date().toISOString() };
  return saveProfile({ ...profile, comparisons: [...profile.comparisons, entry] });
}

export function resetProfile(): TasteProfile {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  return emptyProfile();
}
