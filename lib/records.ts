import { Achievement } from '@/components/ui/AchievementBadge';
import { daysAgoKey } from '@/lib/date';
import { WorkoutStats } from '@/lib/stats';

export type PersonalRecord = {
  exerciseId: string;
  exerciseName: string;
  maxWeightLbs: number;
  atReps: number;
  atDate: string;
};

export type SessionSummary = {
  id: string;
  date: string;
  completed: boolean;
  exerciseNames: string[];
  setCount: number;
  totalVolumeLbs: number;
};

export type VolumeTotals = { allTime: number; thisWeek: number };

/**
 * Pure derivations over the raw `workouts(*, workout_exercises(*, exercises(*)))`
 * rows. These do no IO — the single fetch lives in `lib/dashboard.ts`, which
 * keeps these trivially unit-testable and stops each screen from issuing its
 * own near-identical query for the same rows.
 */

/** Heaviest logged set per strength exercise. Cardio has no PR concept here. */
export function derivePersonalRecords(rows: any[]): PersonalRecord[] {
  const byExercise = new Map<string, PersonalRecord>();

  for (const w of rows) {
    if (!w.completed) continue; // PRs only count completed sessions
    for (const we of w.workout_exercises ?? []) {
      const ex = we.exercises;
      if (!ex || ex.type !== 'strength') continue;

      const weight = Number(we.weight_kg ?? 0);
      const reps = Number(we.reps ?? 0);
      if (weight <= 0) continue;

      const existing = byExercise.get(ex.id);
      if (!existing || weight > existing.maxWeightLbs) {
        byExercise.set(ex.id, {
          exerciseId: ex.id,
          exerciseName: ex.name,
          maxWeightLbs: weight,
          atReps: reps,
          atDate: w.date,
        });
      }
    }
  }

  return Array.from(byExercise.values()).sort((a, b) => b.maxWeightLbs - a.maxWeightLbs);
}

/**
 * Total lb moved across completed workouts, plus the trailing-7-day subset.
 * (`weight_kg` is stored as-is; the UI treats the number as pounds.)
 */
export function deriveVolumeTotals(rows: any[]): VolumeTotals {
  const cutoffKey = daysAgoKey(6);

  let allTime = 0;
  let thisWeek = 0;

  for (const w of rows) {
    if (!w.completed) continue;
    for (const we of w.workout_exercises ?? []) {
      const v = Number(we.weight_kg ?? 0) * Number(we.reps ?? 0);
      allTime += v;
      if ((w.date as string) >= cutoffKey) thisWeek += v;
    }
  }

  return { allTime, thisWeek };
}

/** Feed of completed + in-progress sessions, newest first. */
export function deriveSessionFeed(rows: any[]): SessionSummary[] {
  return [...rows]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .map((w) => {
      const wes = w.workout_exercises ?? [];
      const names = Array.from(
        new Set(wes.map((we: any) => we.exercises?.name).filter(Boolean)),
      ) as string[];

      let volume = 0;
      for (const we of wes) volume += Number(we.weight_kg ?? 0) * Number(we.reps ?? 0);

      return {
        id: w.id,
        date: w.date,
        completed: !!w.completed,
        exerciseNames: names,
        setCount: wes.length,
        totalVolumeLbs: volume,
      };
    });
}

/**
 * Compute achievement earned/locked state from stats + PRs. Deterministic
 * thresholds tuned for the seed data so the tab feels alive on first view.
 */
export function computeAchievements(
  stats: WorkoutStats,
  prs: PersonalRecord[],
  volume: VolumeTotals,
): Achievement[] {
  const sessionsCount = stats.history.length;
  const maxBench = prs.find((p) => p.exerciseName === 'Bench Press')?.maxWeightLbs ?? 0;

  return [
    {
      id: 'first-workout',
      name: 'First Session',
      description: 'Log your first workout.',
      icon: '\u{1F3AF}',
      earned: sessionsCount >= 1,
    },
    {
      id: 'streak-3',
      name: '3-Day Streak',
      description: 'Train three days in a row.',
      icon: '\u{1F525}',
      earned: stats.streak >= 3,
    },
    {
      id: 'streak-7',
      name: 'Week Warrior',
      description: 'Train seven days in a row.',
      icon: '\u{26A1}',
      earned: stats.streak >= 7,
    },
    {
      id: 'ten-sessions',
      name: 'Ten Down',
      description: 'Complete ten sessions.',
      icon: '\u{1F947}',
      earned: sessionsCount >= 10,
    },
    {
      id: 'bench-100',
      name: '100 lb Bench',
      description: 'Bench press 100 lb or more.',
      icon: '\u{1F4AA}',
      earned: maxBench >= 100,
    },
    {
      id: 'volume-10k',
      name: 'Ten Thousand',
      description: 'Move 10,000 lb total.',
      icon: '\u{1F3CB}',
      earned: volume.allTime >= 10000,
    },
    {
      id: 'week-full',
      name: 'Full Week',
      description: 'Five sessions in a week.',
      icon: '\u{1F31F}',
      earned: stats.weeklySessions >= 5,
    },
    {
      id: 'centurion',
      name: 'Century',
      description: 'Complete 100 sessions.',
      icon: '\u{1F451}',
      earned: sessionsCount >= 100,
    },
  ];
}
