import { daysAgoKey, localDayKey } from '@/lib/date';

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

export const EMPTY_STATS: WorkoutStats = {
  streak: 0,
  weeklySessions: 0,
  hasWorkoutToday: false,
  todayCount: 0,
  history: [],
};

/**
 * Derive streak / weekly / history from raw workout rows. Pure — the single
 * fetch lives in `lib/dashboard.ts`.
 *
 * - streak: consecutive calendar days (ending today or yesterday) with >=1
 *   completed workout
 * - weeklySessions: completed workouts in the last 7 days (sessions, not days,
 *   so two workouts on one day count as 2)
 *
 * All day comparisons go through `localDayKey` — see lib/date.ts for why
 * mixing UTC and local formatting shifted these by a day.
 */
export function deriveWorkoutStats(rows: any[]): WorkoutStats {
  const completed = rows.filter((w: any) => w.completed);
  const todayKey = localDayKey();

  // Unique set of days that have at least one completed workout
  const daysWithWorkout = new Set(completed.map((w: any) => w.date as string));

  // Walk back from today, counting consecutive days present in the set. If
  // today has no workout yet, start from yesterday so an in-progress day
  // doesn't appear to break an existing streak.
  let streak = 0;
  const cursor = new Date();
  if (!daysWithWorkout.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (daysWithWorkout.has(localDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const cutoffKey = daysAgoKey(6);
  const weeklySessions = completed.filter((w: any) => (w.date as string) >= cutoffKey).length;
  const todayCount = completed.filter((w: any) => w.date === todayKey).length;

  const history: WorkoutHistoryItem[] = [...completed]
    .sort((a: any, b: any) => String(b.date).localeCompare(String(a.date)))
    .map((w: any) => ({
      id: w.id,
      date: w.date,
      completed: w.completed,
      entryCount: w.workout_exercises?.length ?? 0,
    }));

  return {
    streak,
    weeklySessions,
    hasWorkoutToday: todayCount > 0,
    todayCount,
    history,
  };
}
