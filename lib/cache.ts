import { storage } from '@/lib/storage';

/**
 * Guarded MMKV cache access.
 *
 * Cached payloads are untrusted input: the write can be interrupted, and a
 * payload written by an older build can be missing fields that current code
 * dereferences. A bare `JSON.parse(...)` in an async data function rejects the
 * promise, and the screens consume these via `.then(setState)` with no
 * `.catch()`, so a single corrupt entry would surface as an unhandled
 * rejection and a permanently empty screen.
 *
 * `readCache` therefore never throws: it validates shape and evicts anything
 * it can't use, so the caller falls back to a normal network fetch.
 */
export function readCache<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => boolean,
): T {
  try {
    const raw = storage.getString(key);
    if (!raw) return fallback;

    const parsed: unknown = JSON.parse(raw);
    if (!isValid(parsed)) {
      storage.remove(key); // stale/incompatible shape — don't keep serving it
      return fallback;
    }
    return parsed as T;
  } catch {
    // Corrupt or truncated entry: evict so we don't retry it every load.
    try {
      storage.remove(key);
    } catch {
      /* storage unavailable — nothing further we can do */
    }
    return fallback;
  }
}

/** Best-effort cache write. Never throws — a failed write just means a refetch. */
export function writeCache(key: string, value: unknown): void {
  try {
    storage.set(key, JSON.stringify(value));
  } catch {
    /* quota exceeded / storage unavailable — safe to ignore */
  }
}

/** Remove specific keys, e.g. after a mutation invalidates derived data. */
export function invalidateCache(keys: string[]): void {
  for (const key of keys) {
    try {
      storage.remove(key);
    } catch {
      /* ignore */
    }
  }
}

/* ── Shape guards ─────────────────────────────────────────────────────── */

export const isArrayOf =
  (itemGuard: (v: any) => boolean) =>
  (value: unknown): boolean =>
    Array.isArray(value) && value.every(itemGuard);

export const isSessionSummary = (v: any): boolean =>
  !!v &&
  typeof v.id === 'string' &&
  typeof v.date === 'string' &&
  typeof v.completed === 'boolean' &&
  Array.isArray(v.exerciseNames) &&
  typeof v.setCount === 'number' &&
  typeof v.totalVolumeLbs === 'number';

export const isPersonalRecord = (v: any): boolean =>
  !!v &&
  typeof v.exerciseId === 'string' &&
  typeof v.exerciseName === 'string' &&
  typeof v.maxWeightLbs === 'number' &&
  typeof v.atReps === 'number' &&
  typeof v.atDate === 'string';

export const isVolumeTotals = (v: any): boolean =>
  !!v && typeof v.allTime === 'number' && typeof v.thisWeek === 'number';

export const isWorkoutStats = (v: any): boolean =>
  !!v &&
  typeof v.streak === 'number' &&
  typeof v.weeklySessions === 'number' &&
  typeof v.hasWorkoutToday === 'boolean' &&
  typeof v.todayCount === 'number' &&
  Array.isArray(v.history);
