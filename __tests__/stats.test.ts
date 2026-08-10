import { localDayKey } from '@/lib/date';
import { deriveWorkoutStats } from '@/lib/stats';

/** Build a workout row `n` days before the frozen "now". */
const workoutNDaysAgo = (n: number, opts: { completed?: boolean; entries?: number } = {}) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return {
    id: `w-${n}`,
    date: localDayKey(d),
    completed: opts.completed ?? true,
    workout_exercises: Array.from({ length: opts.entries ?? 2 }).map((_, i) => ({
      id: `we-${n}-${i}`,
      weight_kg: 100,
      reps: 5,
      exercises: { id: 'ex-1', name: 'Bench Press', type: 'strength' },
    })),
  };
};

// Freeze to a mid-afternoon time so tests are deterministic and don't
// straddle midnight while running.
beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 7, 9, 14, 0, 0));
});
afterEach(() => {
  jest.useRealTimers();
});

describe('deriveWorkoutStats — streak', () => {
  it('counts consecutive days ending today', () => {
    const rows = [workoutNDaysAgo(0), workoutNDaysAgo(1), workoutNDaysAgo(2)];
    expect(deriveWorkoutStats(rows).streak).toBe(3);
  });

  it('stops at the first gap', () => {
    // today, yesterday, then a gap at 2 days ago
    const rows = [workoutNDaysAgo(0), workoutNDaysAgo(1), workoutNDaysAgo(3)];
    expect(deriveWorkoutStats(rows).streak).toBe(2);
  });

  it('preserves the streak when today has no workout yet', () => {
    // Deliberate grace period: not having trained *yet* today shouldn't zero
    // out a streak that is still alive from yesterday.
    const rows = [workoutNDaysAgo(1), workoutNDaysAgo(2)];
    expect(deriveWorkoutStats(rows).streak).toBe(2);
  });

  it('is zero when the most recent workout is older than yesterday', () => {
    const rows = [workoutNDaysAgo(2), workoutNDaysAgo(3)];
    expect(deriveWorkoutStats(rows).streak).toBe(0);
  });

  it('is zero with no workouts at all', () => {
    expect(deriveWorkoutStats([]).streak).toBe(0);
  });

  it('does not double-count two workouts on the same day', () => {
    const a = workoutNDaysAgo(0);
    const b = { ...workoutNDaysAgo(0), id: 'w-0-second' };
    expect(deriveWorkoutStats([a, b]).streak).toBe(1);
  });

  it('ignores in-progress workouts when building the streak', () => {
    const rows = [
      workoutNDaysAgo(0, { completed: false }),
      workoutNDaysAgo(1),
      workoutNDaysAgo(2),
    ];
    // Today is incomplete, so the streak comes from yesterday back = 2.
    expect(deriveWorkoutStats(rows).streak).toBe(2);
  });

  it('REGRESSION: streak is unaffected by the late-evening UTC rollover', () => {
    // 23:30 ET = next day in UTC. The old UTC-based todayKey() made "today"
    // look like tomorrow, so a workout logged today stopped counting.
    jest.setSystemTime(new Date(2026, 7, 9, 23, 30, 0));

    const rows = [workoutNDaysAgo(0), workoutNDaysAgo(1)];
    const stats = deriveWorkoutStats(rows);

    expect(stats.streak).toBe(2);
    expect(stats.hasWorkoutToday).toBe(true);
  });
});

describe('deriveWorkoutStats — weekly sessions', () => {
  it('counts sessions (rows), not distinct days, over the trailing 7 days', () => {
    const rows = [
      workoutNDaysAgo(0),
      { ...workoutNDaysAgo(0), id: 'second-today' },
      workoutNDaysAgo(3),
    ];
    expect(deriveWorkoutStats(rows).weeklySessions).toBe(3);
  });

  it('includes the 7th day back and excludes the 8th', () => {
    expect(deriveWorkoutStats([workoutNDaysAgo(6)]).weeklySessions).toBe(1);
    expect(deriveWorkoutStats([workoutNDaysAgo(7)]).weeklySessions).toBe(0);
  });

  it('excludes in-progress workouts', () => {
    const rows = [workoutNDaysAgo(0, { completed: false }), workoutNDaysAgo(1)];
    expect(deriveWorkoutStats(rows).weeklySessions).toBe(1);
  });
});

describe('deriveWorkoutStats — today flags and history', () => {
  it('reports todayCount and hasWorkoutToday', () => {
    const rows = [workoutNDaysAgo(0), { ...workoutNDaysAgo(0), id: 'x' }, workoutNDaysAgo(5)];
    const stats = deriveWorkoutStats(rows);
    expect(stats.todayCount).toBe(2);
    expect(stats.hasWorkoutToday).toBe(true);
  });

  it('reports no workout today when there is none', () => {
    const stats = deriveWorkoutStats([workoutNDaysAgo(1)]);
    expect(stats.todayCount).toBe(0);
    expect(stats.hasWorkoutToday).toBe(false);
  });

  it('returns history newest-first with entry counts', () => {
    const rows = [workoutNDaysAgo(2, { entries: 1 }), workoutNDaysAgo(0, { entries: 3 })];
    const history = deriveWorkoutStats(rows).history;

    expect(history.map((h) => h.date)).toEqual([
      localDayKey(new Date(2026, 7, 9)),
      localDayKey(new Date(2026, 7, 7)),
    ]);
    expect(history[0].entryCount).toBe(3);
    expect(history[1].entryCount).toBe(1);
  });

  it('tolerates rows with a missing workout_exercises join', () => {
    const rows = [{ id: 'w', date: localDayKey(), completed: true }];
    expect(deriveWorkoutStats(rows as any).history[0].entryCount).toBe(0);
  });
});
