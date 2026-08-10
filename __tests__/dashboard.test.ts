// Imported once at module scope: requiring './setup' *inside* a test would
// re-execute the setup file (its registry entry is cleared by
// jest.resetModules) and re-register its beforeEach hook mid-test.
import { mmkvStore, setConnected } from './setup';

const dashboardKeys = () => [...mmkvStore.keys()].filter((k) => k.startsWith('dashboard_'));

let getDashboardData: any;
let invalidateDashboardCache: any;
let supabase: any;
let NetInfo: any;

beforeEach(() => {
  jest.resetModules();
  ({ getDashboardData, invalidateDashboardCache } = require('@/lib/dashboard'));
  supabase = require('@/lib/supabase').supabase;
  NetInfo = require('@react-native-community/netinfo').default;
  setConnected(true);
});

const signIn = () => supabase.auth.signInWithPassword();

describe('getDashboardData', () => {
  it('returns empty data when signed out, without querying', async () => {
    const data = await getDashboardData();
    expect(data.feed).toEqual([]);
    expect(data.personalRecords).toEqual([]);
    expect(data.stats.streak).toBe(0);
  });

  it('returns all four derived views from one call', async () => {
    await signIn();
    const data = await getDashboardData();

    expect(data.feed.length).toBeGreaterThan(0);
    expect(data.personalRecords.length).toBeGreaterThan(0);
    expect(data.volume.allTime).toBeGreaterThan(0);
    expect(data.stats.history.length).toBeGreaterThan(0);
  });

  it('REGRESSION: issues a single connectivity probe, not one per view', async () => {
    // Today and Records each used to call three functions that separately did
    // their own getUser() + NetInfo.fetch() + workouts query.
    await signIn();
    (NetInfo.fetch as jest.Mock).mockClear();

    await getDashboardData();

    expect((NetInfo.fetch as jest.Mock).mock.calls).toHaveLength(1);
  });

  it('REGRESSION: issues a single workouts query, not one per view', async () => {
    await signIn();
    const fromSpy = jest.spyOn(supabase, 'from');

    await getDashboardData();

    const workoutQueries = fromSpy.mock.calls.filter(([t]) => t === 'workouts');
    expect(workoutQueries).toHaveLength(1);
    fromSpy.mockRestore();
  });

  it('derived views agree with each other (one source of truth)', async () => {
    await signIn();
    const { stats, feed } = await getDashboardData();

    // history counts completed only; feed includes in-progress too
    const completedInFeed = feed.filter((s: any) => s.completed).length;
    expect(stats.history).toHaveLength(completedInFeed);
  });
});

describe('offline behaviour', () => {
  it('serves the cached snapshot when offline', async () => {
    await signIn();
    const online = await getDashboardData(); // populates cache
    expect(online.feed.length).toBeGreaterThan(0);

    setConnected(false);
    const offline = await getDashboardData();

    expect(offline.feed).toHaveLength(online.feed.length);
    expect(offline.stats.streak).toBe(online.stats.streak);
  });

  it('returns empty data when offline with no cache', async () => {
    await signIn();
    setConnected(false);

    const data = await getDashboardData();
    expect(data.feed).toEqual([]);
    expect(data.stats.streak).toBe(0);
  });

  it('treats unknown connectivity as online rather than blocking', async () => {
    await signIn();
    setConnected(null);

    const data = await getDashboardData();
    expect(data.feed.length).toBeGreaterThan(0);
  });

  it('does not throw when the cached payload is corrupt', async () => {
    await signIn();
    await getDashboardData();

    mmkvStore.set(dashboardKeys()[0], '{"truncated":');

    setConnected(false);
    await expect(getDashboardData()).resolves.toMatchObject({ feed: [] });
  });
});

describe('cache invalidation', () => {
  it('drops the cached snapshot so a stale pre-write view is not served', async () => {
    await signIn();
    await getDashboardData();
    expect(dashboardKeys()).toHaveLength(1);

    await invalidateDashboardCache();
    expect(dashboardKeys()).toHaveLength(0);
  });

  it('reflects a newly finished workout after invalidation', async () => {
    await signIn();
    const before = await getDashboardData();

    // Create + complete a new session, as the workout screen does.
    const { data: created } = await supabase
      .from('workouts')
      .insert({ user_id: 'demo-user-123', date: '2026-08-09', completed: false })
      .select()
      .single();
    await supabase.from('workouts').update({ completed: true }).eq('id', created.id);
    await invalidateDashboardCache();

    const after = await getDashboardData();
    expect(after.feed).toHaveLength(before.feed.length + 1);
    expect(after.stats.history).toHaveLength(before.stats.history.length + 1);
  });

  it('is a no-op when signed out', async () => {
    await expect(invalidateDashboardCache()).resolves.toBeUndefined();
  });
});
