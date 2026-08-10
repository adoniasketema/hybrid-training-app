import { localDayKey } from '@/lib/date';

// The original URL is invalid, so we use a mock client for the portfolio showcase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

// Mock Data
const MOCK_USER = { id: 'demo-user-123', email: 'demo@hybrid.com' };

// Persistent in-memory "tables". Writes mutate these arrays so subsequent
// reads (from a different chain instance) see the changes — that's the
// behavior real Supabase gives you, and what the workout flow relies on.
const TABLES: Record<string, any[]> = {
  exercises: [
    { id: 'ex-1', name: 'Bench Press', type: 'strength', category: 'Chest' },
    { id: 'ex-2', name: 'Squat', type: 'strength', category: 'Legs' },
    { id: 'ex-3', name: 'Deadlift', type: 'strength', category: 'Back' },
    { id: 'ex-4', name: 'Treadmill Run', type: 'cardio', category: 'Running' },
  ],
  users: [{ id: MOCK_USER.id, name: 'Demo User' }],
  workouts: Array.from({ length: 10 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (i * 2));
    return {
      id: `workout-${i}`,
      date: localDayKey(d),
      completed: true,
      user_id: MOCK_USER.id,
    };
  }),
  workout_exercises: [] as any[],
};

// Seed workout_exercises tied to the seeded workouts.
const SEED_EXERCISES = TABLES.exercises;
TABLES.workouts.forEach((w: any, i: number) => {
  TABLES.workout_exercises.push(
    { id: `we-${i}-1`, workout_id: w.id, exercise_id: 'ex-1', sets: null, reps: 10, weight_kg: 60 + i * 2, duration_minutes: null, distance_km: null, exercises: SEED_EXERCISES[0] },
    { id: `we-${i}-2`, workout_id: w.id, exercise_id: 'ex-2', sets: null, reps: 8,  weight_kg: 80 + i * 2, duration_minutes: null, distance_km: null, exercises: SEED_EXERCISES[1] },
  );
});

let mockIdCounter = 1;
const newId = (prefix: string) => `${prefix}-mock-${Date.now()}-${mockIdCounter++}`;

/**
 * Emulate the `workouts(*, workout_exercises(*, exercises(*)))` join shape
 * that the real Supabase client returns. Applied to every read path
 * (single / maybeSingle / then) so single-row and multi-row reads behave
 * consistently — this was a bug: only `then` used to decorate, so the
 * workout detail view got empty exercise groups.
 */
const decorateRows = (tableName: string, rows: any[]) => {
  if (tableName !== 'workouts') return rows;
  const wes = TABLES.workout_exercises || [];
  return rows.map((w: any) => ({
    ...w,
    workout_exercises: wes.filter((we: any) => we.workout_id === w.id),
  }));
};

// A robust mock chain to intercept all Supabase queries
const createMockChain = (tableName: string) => {
  // filters accumulate across .eq() calls
  const filters: Array<[string, any]> = [];
  const applyFilters = (rows: any[]) =>
    filters.length === 0 ? rows : rows.filter((r) => filters.every(([c, v]) => r[c] === v));

  const chain: any = {
    select: () => chain,
    eq: (col: string, val: any) => {
      filters.push([col, val]);
      return chain;
    },
    order: () => chain,
    single: async () => {
      const rows = decorateRows(tableName, applyFilters(TABLES[tableName] || []));
      return { data: rows[0] ?? null, error: null };
    },
    maybeSingle: async () => {
      const rows = decorateRows(tableName, applyFilters(TABLES[tableName] || []));
      return { data: rows[0] ?? null, error: null };
    },
    // insert/update/delete return the chain so callers can do
    // `.insert(...).select().single()` (real Supabase supports this).
    insert: (row: any) => {
      if (!TABLES[tableName]) TABLES[tableName] = [];
      const rows = Array.isArray(row) ? row : [row];
      const inserted = rows.map((r) => ({ id: newId(tableName), ...r }));
      TABLES[tableName].unshift(...inserted);
      // Subsequent .select().single() on this chain should return the inserted row.
      // Restrict filters to the inserted id(s) so .single() picks the new one.
      filters.push(['id', inserted[0].id]);
      // For the workouts table, the app queries `workout_exercises(id)` — we
      // need to ensure future reads join those, but the simple filter model
      // above returns the raw workout row which is enough for the create path.
      return chain;
    },
    update: (patch: any) => {
      const table = TABLES[tableName] || [];
      const rowsToUpdate = applyFilters(table);
      rowsToUpdate.forEach((r) => Object.assign(r, patch));
      return chain;
    },
    delete: () => {
      const table = TABLES[tableName];
      if (!table) return chain;
      const keep = new Set(table);
      applyFilters(table).forEach((r) => keep.delete(r));
      TABLES[tableName] = table.filter((r) => keep.has(r));
      return chain;
    },
    then: (resolve: any) => {
      const rows = decorateRows(tableName, applyFilters(TABLES[tableName] || []));
      resolve({ data: rows, error: null });
    },
  };
  return chain;
};

let sessionCallback: any = null;
// Start signed-out so the marketing landing page is the default entry point.
let currentSession: { user: typeof MOCK_USER; access_token: string } | null = null;
const MOCK_SESSION = { user: MOCK_USER, access_token: 'mock-token' };

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: currentSession }, error: null }),
    getUser: async () => ({ data: { user: MOCK_USER }, error: null }),
    signInWithPassword: async () => {
      currentSession = MOCK_SESSION;
      if (sessionCallback) sessionCallback('SIGNED_IN', currentSession);
      return { data: { session: currentSession, user: MOCK_USER }, error: null };
    },
    signUp: async () => {
      currentSession = MOCK_SESSION;
      if (sessionCallback) sessionCallback('SIGNED_IN', currentSession);
      return { data: { session: currentSession, user: MOCK_USER }, error: null };
    },
    signOut: async () => {
      currentSession = null as any;
      if (sessionCallback) sessionCallback('SIGNED_OUT', null);
      return { error: null };
    },
    onAuthStateChange: (cb: any) => {
      sessionCallback = cb;
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
  },
  from: (table: string) => createMockChain(table),

  // Mirrors the real client's contract: `.on()` and `.subscribe()` both return
  // the channel itself, so callers can chain multiple `.on()` handlers and
  // hand the result straight to `removeChannel`. Returning a different shape
  // here (as an earlier version did) hides subscription leaks until the real
  // client is swapped in.
  channel: (name: string) => {
    let subscribed = false;
    const ch: any = {
      topic: name,
      on: (_event: string, _filter: any, _callback: any) => ch,
      subscribe: () => {
        subscribed = true;
        return ch;
      },
      unsubscribe: () => {
        subscribed = false;
        return Promise.resolve('ok');
      },
      get isSubscribed() {
        return subscribed;
      },
    };
    return ch;
  },
  removeChannel: (channel: any) => channel?.unsubscribe?.(),
} as any;