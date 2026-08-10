import { daysAgoKey, localDayKey } from '@/lib/date';

/**
 * These run under TZ=America/New_York (see package.json). Under a UTC runner
 * every assertion here would pass trivially even with the old buggy
 * implementation — the whole point is to run somewhere UTC != local.
 */
describe('localDayKey', () => {
  it('formats as YYYY-MM-DD', () => {
    expect(localDayKey(new Date(2026, 7, 9, 12, 0, 0))).toBe('2026-08-09');
  });

  it('zero-pads single-digit months and days', () => {
    expect(localDayKey(new Date(2026, 0, 5, 12, 0, 0))).toBe('2026-01-05');
  });

  it('REGRESSION: uses local date, not UTC, late in the evening', () => {
    // 23:30 in New York is already 03:30 the NEXT day in UTC. The old
    // implementation (toISOString().slice(0,10)) returned tomorrow here,
    // which silently shifted streaks and "did I train today?" by a day.
    const lateEvening = new Date(2026, 7, 9, 23, 30, 0); // Aug 9, 11:30pm ET

    expect(localDayKey(lateEvening)).toBe('2026-08-09');
    // Prove the two genuinely disagree, so this test can't rot into a no-op
    // if someone runs the suite in UTC.
    expect(lateEvening.toISOString().slice(0, 10)).toBe('2026-08-10');
  });

  it('REGRESSION: stays on the local day just after midnight', () => {
    const justAfterMidnight = new Date(2026, 7, 9, 0, 15, 0);
    expect(localDayKey(justAfterMidnight)).toBe('2026-08-09');
  });

  it('defaults to now when called with no argument', () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 7, 9, 14, 0, 0));
    expect(localDayKey()).toBe('2026-08-09');
    jest.useRealTimers();
  });
});

describe('daysAgoKey', () => {
  it('walks back the requested number of days', () => {
    const from = new Date(2026, 7, 9, 12, 0, 0);
    expect(daysAgoKey(0, from)).toBe('2026-08-09');
    expect(daysAgoKey(1, from)).toBe('2026-08-08');
    expect(daysAgoKey(6, from)).toBe('2026-08-03');
  });

  it('crosses month boundaries', () => {
    expect(daysAgoKey(3, new Date(2026, 7, 2, 12, 0, 0))).toBe('2026-07-30');
  });

  it('crosses year boundaries', () => {
    expect(daysAgoKey(2, new Date(2026, 0, 1, 12, 0, 0))).toBe('2025-12-30');
  });

  it('handles leap days', () => {
    expect(daysAgoKey(1, new Date(2028, 2, 1, 12, 0, 0))).toBe('2028-02-29');
  });

  it('does not mutate the date it was given', () => {
    const from = new Date(2026, 7, 9, 12, 0, 0);
    const snapshot = from.getTime();
    daysAgoKey(5, from);
    expect(from.getTime()).toBe(snapshot);
  });

  it('REGRESSION: produces no gaps or repeats across a DST transition', () => {
    // US DST ends Nov 1 2026. Mixing local date arithmetic with UTC
    // formatting could skip or duplicate a day here, silently breaking a
    // streak that spans the transition.
    const cursor = new Date(2026, 10, 3, 12, 0, 0); // Nov 3
    const keys: string[] = [];
    for (let i = 0; i < 5; i++) {
      keys.push(localDayKey(cursor));
      cursor.setDate(cursor.getDate() - 1);
    }

    expect(keys).toEqual([
      '2026-11-03',
      '2026-11-02',
      '2026-11-01',
      '2026-10-31',
      '2026-10-30',
    ]);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
