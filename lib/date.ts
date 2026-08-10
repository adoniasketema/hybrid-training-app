/**
 * Local-time day keys (YYYY-MM-DD).
 *
 * Everything that compares "days" must go through here. Using
 * `toISOString().slice(0,10)` formats in UTC, which disagrees with the
 * calendar grid (built from local getFullYear/getMonth/getDate) whenever the
 * user's local date differs from the UTC date — e.g. 23:30 in New York is
 * already "tomorrow" in UTC. That mismatch silently shifted streaks and
 * "did I train today?" by a day for anyone west of UTC.
 */
export const localDayKey = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Local day key for `n` days before `from` (n may be negative for future). */
export const daysAgoKey = (n: number, from: Date = new Date()): string => {
  const d = new Date(from);
  d.setDate(d.getDate() - n);
  return localDayKey(d);
};
