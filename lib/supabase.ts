import { localDayKey } from '@/lib/date';

/**
 * In-memory mock of the Supabase client, so the app is fully demo-able
 * without provisioning a backend or shipping credentials.
 *
 * To swap in the real client, replace the `supabase` export at the bottom of
 * this file with:
 *
 *   import { createClient } from '@supabase/supabase-js';
 *   export const supabase = createClient(
 *     process.env.EXPO_PUBLIC_SUPABASE_URL!,
 *     process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
 *   );
 *
 * Every call site uses the real client's API shape (chained filters,
 * `.select().single()`, the `workouts(*, workout_exercises(*, exercises(*)))`
 * join, and the realtime channel contract), so no consumer code changes.
 */

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

  // Mutations are DEFERRED until the query is awaited.
  //
  // Real Supabase builds a query lazily and executes it on await, so
  // `.update(patch).eq('id', x)` filters to one row. Running the mutation
  // eagerly inside update()/delete() meant the filters hadn't been collected
  // yet, so `applyFilters` matched the whole table — `finishWorkout()` marked
  // *every* workout complete, and `saveSetToDb()` wrote the same weight/reps
  // to *every* set. Deferring restores the real client's semantics.
  let pending: { type: 'update'; patch: any } | { type: 'delete' } | null = null;

  const runPendingMutation = () => {
    if (!pending) return;
    const table = TABLES[tableName] || [];
    const targets = applyFilters(table);

    if (pending.type === 'update') {
      const { patch } = pending;
      targets.forEach((r) => Object.assign(r, patch));
    } else {
      const doomed = new Set(targets);
      TABLES[tableName] = table.filter((r) => !doomed.has(r));
    }
    pending = null;
  };

  const read = () => {
    runPendingMutation();
    return decorateRows(tableName, applyFilters(TABLES[tableName] || []));
  };

  const chain: any = {
    select: () => chain,
    eq: (col: string, val: any) => {
      filters.push([col, val]);
      return chain;
    },
    order: () => chain,
    single: async () => {
      const rows = read();
      return { data: rows[0] ?? null, error: null };
    },
    maybeSingle: async () => {
      const rows = read();
      return { data: rows[0] ?? null, error: null };
    },
    // insert/update/delete return the chain so callers can do
    // `.insert(...).select().single()` (real Supabase supports this).
    insert: (row: any) => {
      // Insert is applied immediately because the generated id must be
      // available to a chained `.select().single()`.
      if (!TABLES[tableName]) TABLES[tableName] = [];
      const rows = Array.isArray(row) ? row : [row];
      const inserted = rows.map((r) => ({ id: newId(tableName), ...r }));
      TABLES[tableName].unshift(...inserted);
      // Scope any chained read to the row we just created.
      filters.push(['id', inserted[0].id]);
      return chain;
    },
    update: (patch: any) => {
      pending = { type: 'update', patch };
      return chain;
    },
    delete: () => {
      pending = { type: 'delete' };
      return chain;
    },
    then: (resolve: any) => {
      const rows = read();
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
    // Derived from the session, matching the real client. Returning MOCK_USER
    // unconditionally (as this used to) made every `if (!user)` guard in the
    // data layer unreachable, so the signed-out path was never exercised and
    // post-sign-out fetches could still resolve with a user.
    getUser: async () => ({ data: { user: currentSession?.user ?? null }, error: null }),
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