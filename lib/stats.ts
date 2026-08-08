import { supabase } from '@/lib/supabase';
import { storage } from '@/lib/storage';
import NetInfo from '@react-native-community/netinfo';

export type WorkoutHistoryItem = {
  id: string;
  date: string;
  completed: boolean;
  entryCount: number;
};

export type WorkoutStats = {
  streak: number;
  weeklySessions: number;
  hasWorkoutToday: boolean;
  todayCount: number;
  history: WorkoutHistoryItem[];
};

const todayKey = () => new Date().toISOString().slice(0, 10);

/**
 * Fetches completed workouts for the current user and derives:
 * - streak: consecutive calendar days (ending today or yesterday) with >=1 completed workout
 * - weeklySessions: count of completed workouts in the last 7 days (sessions, not days —
 *   so two workouts on the same day count as 2 toward this number)
 */
const EMPTY_STATS: WorkoutStats = {
  streak: 0,
  weeklySessions: 0,
  hasWorkoutToday: false,
  todayCount: 0,
  history: [],
};

export async function getWorkoutStats(): Promise<WorkoutStats> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { streak: 0, weeklySessions: 0, hasWorkoutToday: false, todayCount: 0, history: [] };
  }

  const cacheKey = `stats_${user.id}`;
  const netInfo = await NetInfo.fetch();

  // If offline, return the cached stats immediately
  if (!netInfo.isConnected) {
    const cached = storage.getString(cacheKey);
    return cached ? JSON.parse(cached) : EMPTY_STATS;
  }

  const { data, error } = await supabase
    .from('workouts')
    .select('id, date, completed, workout_exercises(id)')
    .eq('user_id', user.id)
    .eq('completed', true)
    .order('date', { ascending: false });

  if (error || !data) {
    // Fallback to cache if network request fails despite being "connected"
    const cached = storage.getString(cacheKey);
    return cached ? JSON.parse(cached) : EMPTY_STATS;
  }

  // Unique set of days that have at least one completed workout
  const daysWithWorkout = new Set(data.map((w: any) => w.date as string));

  // Streak: walk back from today, counting consecutive days present in the set.
  // If today has no workout yet, that's fine — streak counts from yesterday back,
  // so you don't lose your streak just for not having trained yet today.
  let streak = 0;
  const cursor = new Date();
  // If today isn't in the set, start checking from yesterday instead so an
  // in-progress day doesn't break an existing streak.
  if (!daysWithWorkout.has(todayKey())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daysWithWorkout.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Weekly: count of completed *sessions* (rows) in the last 7 days, today inclusive.
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  const weeklySessions = data.filter((w: any) => (w.date as string) >= cutoffKey).length;

  const todayCount = data.filter((w: any) => w.date === todayKey()).length;

  const history: WorkoutHistoryItem[] = data.map((w: any) => ({
    id: w.id,
    date: w.date,
    completed: w.completed,
    entryCount: w.workout_exercises?.length ?? 0,
  }));

  const result = {
    streak,
    weeklySessions,
    hasWorkoutToday: todayCount > 0,
    todayCount,
    history,
  };

  // Cache the newly fetched stats for offline use
  storage.set(cacheKey, JSON.stringify(result));
  return result;
}