import {
  invalidateCache,
  isArrayOf,
  isPersonalRecord,
  isSessionSummary,
  isVolumeTotals,
  isWorkoutStats,
  readCache,
  writeCache,
} from '@/lib/cache';
import { EMPTY_STATS } from '@/lib/stats';
import { mmkvStore } from './setup';

const always = () => true;

describe('readCache', () => {
  it('returns the fallback on a cache miss', () => {
    expect(readCache('nope', 'fallback', always)).toBe('fallback');
  });

  it('round-trips a written value', () => {
    writeCache('k', { a: 1 });
    expect(readCache('k', null, always)).toEqual({ a: 1 });
  });

  it('REGRESSION: returns the fallback instead of throwing on corrupt JSON', () => {
    // A truncated write used to reject the enclosing async function. Screens
    // consume these via .then(setState) with no .catch(), so one bad entry
    // meant an unhandled rejection and a permanently empty screen.
    mmkvStore.set('corrupt', '{"half":');

    expect(() => readCache('corrupt', 'fallback', always)).not.toThrow();
    expect(readCache('corrupt', 'fallback', always)).toBe('fallback');
  });

  it('evicts a corrupt entry so it is not retried on every load', () => {
    mmkvStore.set('corrupt', 'not json at all');
    readCache('corrupt', 'fallback', always);
    expect(mmkvStore.has('corrupt')).toBe(false);
  });

  it('rejects and evicts a payload whose shape no longer matches', () => {
    // Simulates a cache written by an older build after the type changed.
    writeCache('stats', { streak: 3 }); // missing the rest of WorkoutStats
    expect(readCache('stats', EMPTY_STATS, isWorkoutStats)).toBe(EMPTY_STATS);
    expect(mmkvStore.has('stats')).toBe(false);
  });

  it('accepts a payload that satisfies its guard', () => {
    const valid = { streak: 1, weeklySessions: 2, hasWorkoutToday: true, todayCount: 1, history: [] };
    writeCache('stats', valid);
    expect(readCache('stats', EMPTY_STATS, isWorkoutStats)).toEqual(valid);
  });

  it('treats an empty string as a miss', () => {
    mmkvStore.set('empty', '');
    expect(readCache('empty', 'fallback', always)).toBe('fallback');
  });

  it('preserves a legitimately falsy cached value', () => {
    writeCache('zero', 0);
    expect(readCache('zero', 999, always)).toBe(0);
  });
});

describe('writeCache', () => {
  it('does not throw when the value cannot be serialized', () => {
    const cyclic: any = {};
    cyclic.self = cyclic;
    expect(() => writeCache('cyclic', cyclic)).not.toThrow();
  });
});

describe('invalidateCache', () => {
  it('removes the listed keys and leaves others alone', () => {
    writeCache('a', 1);
    writeCache('b', 2);
    invalidateCache(['a']);
    expect(mmkvStore.has('a')).toBe(false);
    expect(mmkvStore.has('b')).toBe(true);
  });

  it('is a no-op for keys that do not exist', () => {
    expect(() => invalidateCache(['ghost'])).not.toThrow();
  });
});

describe('shape guards', () => {
  it('isWorkoutStats requires every field', () => {
    expect(isWorkoutStats(EMPTY_STATS)).toBe(true);
    expect(isWorkoutStats({ streak: 1 })).toBe(false);
    expect(isWorkoutStats(null)).toBe(false);
  });

  it('isVolumeTotals requires both numbers', () => {
    expect(isVolumeTotals({ allTime: 0, thisWeek: 0 })).toBe(true);
    expect(isVolumeTotals({ allTime: 0 })).toBe(false);
  });

  it('isSessionSummary rejects a partial row', () => {
    expect(
      isSessionSummary({
        id: 'a',
        date: '2026-08-09',
        completed: true,
        exerciseNames: [],
        setCount: 0,
        totalVolumeLbs: 0,
      }),
    ).toBe(true);
    expect(isSessionSummary({ id: 'a', date: '2026-08-09' })).toBe(false);
  });

  it('isPersonalRecord rejects a partial row', () => {
    expect(
      isPersonalRecord({
        exerciseId: 'ex-1',
        exerciseName: 'Bench Press',
        maxWeightLbs: 100,
        atReps: 5,
        atDate: '2026-08-09',
      }),
    ).toBe(true);
    expect(isPersonalRecord({ exerciseId: 'ex-1' })).toBe(false);
  });

  it('isArrayOf validates every element and rejects non-arrays', () => {
    const guard = isArrayOf(isVolumeTotals);
    expect(guard([{ allTime: 1, thisWeek: 1 }])).toBe(true);
    expect(guard([{ allTime: 1, thisWeek: 1 }, { allTime: 1 }])).toBe(false);
    expect(guard([])).toBe(true);
    expect(guard('not an array')).toBe(false);
  });
});
