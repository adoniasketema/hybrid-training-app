import { invalidateCache, readCache, writeCache } from '@/lib/cache';
import { isOffline } from '@/lib/connectivity';
import {
  derivePersonalRecords,
  deriveSessionFeed,
  deriveVolumeTotals,
  PersonalRecord,
  SessionSummary,
  VolumeTotals,
} from '@/lib/records';
import { deriveWorkoutStats, EMPTY_STATS, WorkoutStats } from '@/lib/stats';
import { supabase } from '@/lib/supabase';

export type DashboardData = {
  stats: WorkoutStats;
  feed: SessionSummary[];
  volume: VolumeTotals;
  personalRecords: PersonalRecord[];
};

const EMPTY_DASHBOARD: DashboardData = {
  stats: EMPTY_STATS,
  feed: [],
  volume: { allTime: 0, thisWeek: 0 },
  personalRecords: [],
};

/**
 * Superset of every column the four derivations need, fetched once. Previously
 * each screen called three separate functions that each did their own
 * `auth.getUser()`, `NetInfo.fetch()`, and near-identical `workouts` query —
 * 3x the round trips and payload for one logical dataset.
 *
 * Note this deliberately does NOT filter on `completed`: the feed shows
 * in-progress sessions, while stats/PRs/volume filter in memory.
 */
const WORKOUT_SELECT =
  'id, date, completed, workout_exercises(id, weight_kg, reps, exercises(id, name, type))';

const cacheKeyFor = (userId: string) => `dashboard_${userId}`;

const isDashboardData = (v: any): boolean =>
  !!v &&
  !!v.stats &&
  typeof v.stats.streak === 'number' &&
  Array.isArray(v.stats.history) &&
  Array.isArray(v.feed) &&
  !!v.volume &&
  typeof v.volume.allTime === 'number' &&
  Array.isArray(v.personalRecords);

/**
 * Single entry point for all dashboard data. One auth call, one connectivity
 * check, one query, one cache entry — so the four derived views can never
 * drift out of sync with each other the way four independent caches could.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return EMPTY_DASHBOARD;

  const cacheKey = cacheKeyFor(user.id);

  if (await isOffline()) {
    return readCache<DashboardData>(cacheKey, EMPTY_DASHBOARD, isDashboardData);
  }

  const { data: rows, error } = await supabase
    .from('workouts')
    .select(WORKOUT_SELECT)
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  // Connected but the request failed — fall back to cache rather than
  // flashing an empty dashboard.
  if (error || !rows) {
    return readCache<DashboardData>(cacheKey, EMPTY_DASHBOARD, isDashboardData);
  }

  const result: DashboardData = {
    stats: deriveWorkoutStats(rows as any[]),
    feed: deriveSessionFeed(rows as any[]),
    volume: deriveVolumeTotals(rows as any[]),
    personalRecords: derivePersonalRecords(rows as any[]),
  };

  writeCache(cacheKey, result);
  return result;
}

/**
 * Drop the cached dashboard after a mutation so the next read can't serve a
 * snapshot that predates the write.
 */
export async function invalidateDashboardCache(): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  invalidateCache([cacheKeyFor(user.id)]);
}
