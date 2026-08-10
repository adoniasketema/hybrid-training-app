/**
 * The mock Supabase client is the app's entire data layer, so its fidelity to
 * the real client's API *is* production behaviour here. Every test below
 * encodes a contract that, when broken, previously produced a silent bug.
 */

// Fresh module state per test — TABLES is module-level and mutable.
let supabase: any;

beforeEach(() => {
  jest.resetModules();
  supabase = require('@/lib/supabase').supabase;
});

const signIn = () => supabase.auth.signInWithPassword();

describe('auth', () => {
  it('starts signed out so the marketing site is the entry point', async () => {
    const { data } = await supabase.auth.getSession();
    expect(data.session).toBeNull();
  });

  it('REGRESSION: getUser() reflects session state instead of always returning a user', async () => {
    // getUser() used to return MOCK_USER unconditionally, which made every
    // `if (!user)` guard in the data layer unreachable and left the
    // signed-out path completely untested.
    const before = await supabase.auth.getUser();
    expect(before.data.user).toBeNull();

    await signIn();
    const during = await supabase.auth.getUser();
    expect(during.data.user).not.toBeNull();

    await supabase.auth.signOut();
    const after = await supabase.auth.getUser();
    expect(after.data.user).toBeNull();
  });

  it('getUser() and getSession() agree on identity', async () => {
    await signIn();
    const { data: u } = await supabase.auth.getUser();
    const { data: s } = await supabase.auth.getSession();
    expect(u.user.id).toBe(s.session.user.id);
  });

  it('notifies subscribers on sign in and sign out', async () => {
    const events: string[] = [];
    supabase.auth.onAuthStateChange((event: string) => events.push(event));

    await signIn();
    await supabase.auth.signOut();

    expect(events).toEqual(['SIGNED_IN', 'SIGNED_OUT']);
  });
});

describe('query chain', () => {
  it('REGRESSION: insert().select().single() round-trips the new row', async () => {
    // insert() used to be async, so anything chained onto it threw
    // "chain.insert(...).select is not a function" and the create-workout
    // flow silently did nothing.
    const { data, error } = await supabase
      .from('workouts')
      .insert({ user_id: 'demo-user-123', date: '2026-08-09', completed: false })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({ date: '2026-08-09', completed: false });
    expect(typeof data.id).toBe('string');
  });

  it('REGRESSION: single() and then() decorate the join identically', async () => {
    // Only then() used to expand workout_exercises, so the detail screen
    // (which uses single()) rendered a workout with no exercises.
    const viaThen = await supabase.from('workouts').select('*').eq('id', 'workout-0');
    const viaSingle = await supabase.from('workouts').select('*').eq('id', 'workout-0').single();

    expect(Array.isArray(viaThen.data[0].workout_exercises)).toBe(true);
    expect(Array.isArray(viaSingle.data.workout_exercises)).toBe(true);
    expect(viaSingle.data.workout_exercises).toEqual(viaThen.data[0].workout_exercises);
    expect(viaSingle.data.workout_exercises.length).toBeGreaterThan(0);
  });

  it('expands the nested exercises relation, not just the ids', async () => {
    const { data } = await supabase.from('workouts').select('*').eq('id', 'workout-0').single();
    expect(data.workout_exercises[0].exercises).toMatchObject({ name: expect.any(String) });
  });

  it('accumulates multiple .eq() filters', async () => {
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', 'demo-user-123')
      .eq('completed', true);

    expect(data.length).toBeGreaterThan(0);
    expect(data.every((w: any) => w.completed && w.user_id === 'demo-user-123')).toBe(true);
  });

  it('returns null from single() when nothing matches', async () => {
    const { data } = await supabase.from('workouts').select('*').eq('id', 'does-not-exist').single();
    expect(data).toBeNull();
  });

  it('writes are visible to a later, independent read', async () => {
    const { data: created } = await supabase
      .from('workouts')
      .insert({ user_id: 'demo-user-123', date: '2026-08-09', completed: false })
      .select()
      .single();

    const { data: found } = await supabase.from('workouts').select('*').eq('id', created.id).single();
    expect(found).not.toBeNull();
    expect(found.id).toBe(created.id);
  });

  it('update() mutates matching rows and persists', async () => {
    await supabase.from('workouts').update({ completed: false }).eq('id', 'workout-0');
    const { data } = await supabase.from('workouts').select('*').eq('id', 'workout-0').single();
    expect(data.completed).toBe(false);
  });

  it('REGRESSION: update().eq() touches only the filtered row, not the table', async () => {
    // Mutations used to run eagerly inside update(), before .eq() had pushed
    // its filter — so every row matched. finishWorkout() marked EVERY workout
    // complete and saveSetToDb() wrote the same weight/reps to EVERY set.
    const { data: before } = await supabase.from('workouts').select('*');
    expect(before.length).toBeGreaterThan(1);

    await supabase.from('workouts').update({ completed: false }).eq('id', 'workout-0');

    const { data: after } = await supabase.from('workouts').select('*');
    const mutated = after.filter((w: any) => w.completed === false);
    expect(mutated).toHaveLength(1);
    expect(mutated[0].id).toBe('workout-0');
  });

  it('REGRESSION: a set update does not overwrite every other set', async () => {
    const { data: sets } = await supabase.from('workout_exercises').select('*');
    const target = sets[0];
    const otherOriginalReps = sets[1].reps;

    await supabase.from('workout_exercises').update({ reps: 999 }).eq('id', target.id);

    const { data: afterSets } = await supabase.from('workout_exercises').select('*');
    expect(afterSets.find((s: any) => s.id === target.id).reps).toBe(999);
    expect(afterSets.find((s: any) => s.id === sets[1].id).reps).toBe(otherOriginalReps);
  });

  it('an unfiltered update still applies to the whole table (matches real client)', async () => {
    await supabase.from('workouts').update({ completed: false });
    const { data } = await supabase.from('workouts').select('*');
    expect(data.every((w: any) => w.completed === false)).toBe(true);
  });

  it('delete() removes only matching rows', async () => {
    const before = (await supabase.from('workouts').select('*')).data.length;
    await supabase.from('workouts').delete().eq('id', 'workout-0');
    const after = await supabase.from('workouts').select('*');

    expect(after.data).toHaveLength(before - 1);
    expect(after.data.find((w: any) => w.id === 'workout-0')).toBeUndefined();
  });

  it('returns an empty array for an unknown table rather than throwing', async () => {
    const { data } = await supabase.from('nonexistent').select('*');
    expect(data).toEqual([]);
  });
});

describe('realtime channel contract', () => {
  it('REGRESSION: .on() and .subscribe() both return the channel', async () => {
    // The old mock returned a different object from .on(), so the handle
    // passed to removeChannel() could never be torn down — a subscription
    // leak that only became visible against the real client.
    const channel = supabase.channel('public:workouts');
    expect(channel.on('postgres_changes', {}, () => {})).toBe(channel);
    expect(channel.subscribe()).toBe(channel);
  });

  it('supports chaining multiple .on() handlers like the real client', () => {
    const channel = supabase
      .channel('t')
      .on('postgres_changes', {}, () => {})
      .on('postgres_changes', {}, () => {})
      .subscribe();
    expect(channel.isSubscribed).toBe(true);
  });

  it('removeChannel() actually unsubscribes', async () => {
    const channel = supabase.channel('t').on('postgres_changes', {}, () => {}).subscribe();
    expect(channel.isSubscribed).toBe(true);

    await supabase.removeChannel(channel);
    expect(channel.isSubscribed).toBe(false);
  });

  it('removeChannel() tolerates a null handle', () => {
    expect(() => supabase.removeChannel(null)).not.toThrow();
    expect(() => supabase.removeChannel(undefined)).not.toThrow();
  });
});
