import { supabase } from '@/lib/supabase';

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
export async function getWorkoutStats(): Promise<WorkoutStats> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { streak: 0, weeklySessions: 0, hasWorkoutToday: false, todayCount: 0, history: [] };
  }

  const { data, error } = await supabase
    .from('workouts')
    .select('id, date, completed, workout_exercises(id)')
    .eq('user_id', user.id)
    .eq('completed', true)
    .order('date', { ascending: false });

  if (error || !data) {
    return { streak: 0, weeklySessions: 0, hasWorkoutToday: false, todayCount: 0, history: [] };
  }

  // Unique set of days that have at least one completed workout
  const daysWithWorkout = new Set(data.map((w) => w.date as string));

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
  const weeklySessions = data.filter((w) => (w.date as string) >= cutoffKey).length;

  const todayCount = data.filter((w) => w.date === todayKey()).length;

  const history: WorkoutHistoryItem[] = data.map((w: any) => ({
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