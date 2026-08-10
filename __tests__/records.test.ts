import { localDayKey } from '@/lib/date';
import {
  computeAchievements,
  derivePersonalRecords,
  deriveSessionFeed,
  deriveVolumeTotals,
} from '@/lib/records';
import { EMPTY_STATS, WorkoutStats } from '@/lib/stats';

const BENCH = { id: 'ex-1', name: 'Bench Press', type: 'strength' };
const SQUAT = { id: 'ex-2', name: 'Squat', type: 'strength' };
const RUN = { id: 'ex-4', name: 'Treadmill Run', type: 'cardio' };

const set = (exercise: any, weight: number, reps: number) => ({
  id: `we-${Math.random()}`,
  weight_kg: weight,
  reps,
  exercises: exercise,
});

const workout = (
  id: string,
  daysAgo: number,
  sets: any[],
  completed = true,
) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return { id, date: localDayKey(d), completed, workout_exercises: sets };
};

beforeEach(() => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 7, 9, 14, 0, 0));
});
afterEach(() => {
  jest.useRealTimers();
});

describe('derivePersonalRecords', () => {
  it('picks the heaviest set per exercise', () => {
    const rows = [
      workout('a', 1, [set(BENCH, 100, 5), set(BENCH, 135, 3)]),
      workout('b', 3, [set(BENCH, 115, 5)]),
    ];
    const prs = derivePersonalRecords(rows);
    expect(prs).toHaveLength(1);
    expect(prs[0]).toMatchObject({ exerciseName: 'Bench Press', maxWeightLbs: 135, atReps: 3 });
  });

  it('tracks each exercise separately, sorted heaviest first', () => {
    const rows = [workout('a', 1, [set(BENCH, 135, 3), set(SQUAT, 225, 5)])];
    expect(derivePersonalRecords(rows).map((p) => p.exerciseName)).toEqual([
      'Squat',
      'Bench Press',
    ]);
  });

  it('excludes cardio', () => {
    const rows = [workout('a', 1, [set(RUN, 0, 0), set(BENCH, 95, 5)])];
    const prs = derivePersonalRecords(rows);
    expect(prs).toHaveLength(1);
    expect(prs[0].exerciseName).toBe('Bench Press');
  });

  it('ignores zero-weight sets so bodyweight logging cannot create a 0 lb PR', () => {
    expect(derivePersonalRecords([workout('a', 1, [set(BENCH, 0, 20)])])).toEqual([]);
  });

  it('ignores in-progress workouts', () => {
    const rows = [workout('a', 0, [set(BENCH, 500, 1)], false)];
    expect(derivePersonalRecords(rows)).toEqual([]);
  });

  it('records the date the PR was set', () => {
    const rows = [workout('a', 2, [set(BENCH, 135, 3)])];
    expect(derivePersonalRecords(rows)[0].atDate).toBe(localDayKey(new Date(2026, 7, 7)));
  });

  it('tolerates rows with no join data', () => {
    expect(derivePersonalRecords([{ id: 'a', date: '2026-08-09', completed: true }] as any)).toEqual([]);
  });
});

describe('deriveVolumeTotals', () => {
  it('multiplies weight by reps across all completed sets', () => {
    const rows = [workout('a', 1, [set(BENCH, 100, 5), set(SQUAT, 200, 3)])];
    expect(deriveVolumeTotals(rows).allTime).toBe(500 + 600);
  });

  it('separates the trailing-7-day window from all-time', () => {
    const rows = [
      workout('recent', 2, [set(BENCH, 100, 10)]), // 1000, within window
      workout('old', 30, [set(BENCH, 100, 10)]), // 1000, outside window
    ];
    const totals = deriveVolumeTotals(rows);
    expect(totals.allTime).toBe(2000);
    expect(totals.thisWeek).toBe(1000);
  });

  it('includes the 7th day back and excludes the 8th', () => {
    expect(deriveVolumeTotals([workout('a', 6, [set(BENCH, 10, 10)])]).thisWeek).toBe(100);
    expect(deriveVolumeTotals([workout('a', 7, [set(BENCH, 10, 10)])]).thisWeek).toBe(0);
  });

  it('excludes in-progress workouts', () => {
    expect(deriveVolumeTotals([workout('a', 0, [set(BENCH, 100, 5)], false)]).allTime).toBe(0);
  });

  it('is zero for no rows', () => {
    expect(deriveVolumeTotals([])).toEqual({ allTime: 0, thisWeek: 0 });
  });
});

describe('deriveSessionFeed', () => {
  it('sorts newest first regardless of input order', () => {
    const rows = [
      workout('older', 5, [set(BENCH, 100, 5)]),
      workout('newest', 0, [set(BENCH, 100, 5)]),
      workout('middle', 2, [set(BENCH, 100, 5)]),
    ];
    expect(deriveSessionFeed(rows).map((s) => s.id)).toEqual(['newest', 'middle', 'older']);
  });

  it('includes in-progress sessions (unlike stats/PRs/volume)', () => {
    const rows = [workout('wip', 0, [set(BENCH, 100, 5)], false)];
    const feed = deriveSessionFeed(rows);
    expect(feed).toHaveLength(1);
    expect(feed[0].completed).toBe(false);
  });

  it('de-duplicates exercise names', () => {
    const rows = [workout('a', 0, [set(BENCH, 100, 5), set(BENCH, 110, 3), set(SQUAT, 200, 5)])];
    expect(deriveSessionFeed(rows)[0].exerciseNames).toEqual(['Bench Press', 'Squat']);
  });

  it('counts sets and total volume per session', () => {
    const rows = [workout('a', 0, [set(BENCH, 100, 5), set(SQUAT, 200, 3)])];
    const [s] = deriveSessionFeed(rows);
    expect(s.setCount).toBe(2);
    expect(s.totalVolumeLbs).toBe(1100);
  });

  it('handles a session with no exercises yet', () => {
    const rows = [workout('empty', 0, [])];
    const [s] = deriveSessionFeed(rows);
    expect(s.setCount).toBe(0);
    expect(s.exerciseNames).toEqual([]);
    expect(s.totalVolumeLbs).toBe(0);
  });
});

describe('computeAchievements — threshold boundaries', () => {
  const stats = (over: Partial<WorkoutStats>): WorkoutStats => ({ ...EMPTY_STATS, ...over });
  const historyOf = (n: number) =>
    Array.from({ length: n }).map((_, i) => ({
      id: `h${i}`,
      date: '2026-08-01',
      completed: true,
      entryCount: 1,
    }));
  const earned = (list: ReturnType<typeof computeAchievements>, id: string) =>
    list.find((a) => a.id === id)!.earned;

  const noVolume = { allTime: 0, thisWeek: 0 };

  it('unlocks the first session at exactly 1', () => {
    expect(earned(computeAchievements(stats({ history: [] }), [], noVolume), 'first-workout')).toBe(false);
    expect(earned(computeAchievements(stats({ history: historyOf(1) }), [], noVolume), 'first-workout')).toBe(true);
  });

  it('unlocks the 3-day streak at exactly 3, not 2', () => {
    expect(earned(computeAchievements(stats({ streak: 2 }), [], noVolume), 'streak-3')).toBe(false);
    expect(earned(computeAchievements(stats({ streak: 3 }), [], noVolume), 'streak-3')).toBe(true);
  });

  it('unlocks the 7-day streak at exactly 7, not 6', () => {
    expect(earned(computeAchievements(stats({ streak: 6 }), [], noVolume), 'streak-7')).toBe(false);
    expect(earned(computeAchievements(stats({ streak: 7 }), [], noVolume), 'streak-7')).toBe(true);
  });

  it('unlocks ten sessions at exactly 10, not 9', () => {
    expect(earned(computeAchievements(stats({ history: historyOf(9) }), [], noVolume), 'ten-sessions')).toBe(false);
    expect(earned(computeAchievements(stats({ history: historyOf(10) }), [], noVolume), 'ten-sessions')).toBe(true);
  });

  it('unlocks the 100 lb bench at exactly 100, not 99', () => {
    const pr = (w: number) => [
      { exerciseId: 'ex-1', exerciseName: 'Bench Press', maxWeightLbs: w, atReps: 1, atDate: '2026-08-01' },
    ];
    expect(earned(computeAchievements(EMPTY_STATS, pr(99), noVolume), 'bench-100')).toBe(false);
    expect(earned(computeAchievements(EMPTY_STATS, pr(100), noVolume), 'bench-100')).toBe(true);
  });

  it('keys the bench achievement off Bench Press specifically, not any lift', () => {
    const squatOnly = [
      { exerciseId: 'ex-2', exerciseName: 'Squat', maxWeightLbs: 400, atReps: 1, atDate: '2026-08-01' },
    ];
    expect(earned(computeAchievements(EMPTY_STATS, squatOnly, noVolume), 'bench-100')).toBe(false);
  });

  it('unlocks 10k volume at exactly 10000, not 9999', () => {
    expect(earned(computeAchievements(EMPTY_STATS, [], { allTime: 9999, thisWeek: 0 }), 'volume-10k')).toBe(false);
    expect(earned(computeAchievements(EMPTY_STATS, [], { allTime: 10000, thisWeek: 0 }), 'volume-10k')).toBe(true);
  });

  it('unlocks the full week at exactly 5 weekly sessions', () => {
    expect(earned(computeAchievements(stats({ weeklySessions: 4 }), [], noVolume), 'week-full')).toBe(false);
    expect(earned(computeAchievements(stats({ weeklySessions: 5 }), [], noVolume), 'week-full')).toBe(true);
  });

  it('always returns the full list so locked badges still render', () => {
    const list = computeAchievements(EMPTY_STATS, [], noVolume);
    expect(list).toHaveLength(8);
    expect(list.every((a) => a.earned === false)).toBe(true);
    expect(new Set(list.map((a) => a.id)).size).toBe(8); // ids unique
  });
});
