import { setConnected } from './setup';

let assertOnline: any;
let isOffline: any;
let OfflineError: any;

beforeEach(() => {
  jest.resetModules();
  ({ assertOnline, isOffline, OfflineError } = require('@/lib/connectivity'));
  setConnected(true);
});

describe('isOffline', () => {
  it('is false when connected', async () => {
    setConnected(true);
    expect(await isOffline()).toBe(false);
  });

  it('is true only on an explicit disconnect', async () => {
    setConnected(false);
    expect(await isOffline()).toBe(true);
  });

  it('treats unknown connectivity as online', async () => {
    // NetInfo reports null while the state is still resolving. Blocking here
    // would serve stale cache for no reason — a failed request already falls
    // back to cache on its own.
    setConnected(null);
    expect(await isOffline()).toBe(false);
  });
});

describe('assertOnline', () => {
  it('resolves when connected', async () => {
    setConnected(true);
    await expect(assertOnline()).resolves.toBeUndefined();
  });

  it('REGRESSION: throws OfflineError when disconnected', async () => {
    // Writes previously went straight to the backend with no connectivity
    // check, so an offline "log set" vanished silently — the worst failure
    // mode for a training log.
    setConnected(false);
    await expect(assertOnline()).rejects.toThrow(OfflineError);
  });

  it('carries a user-facing message', async () => {
    setConnected(false);
    await expect(assertOnline()).rejects.toThrow(/offline/i);
  });

  it('does not block on unknown connectivity', async () => {
    setConnected(null);
    await expect(assertOnline()).resolves.toBeUndefined();
  });

  it('OfflineError is identifiable via instanceof and name', async () => {
    setConnected(false);
    const err = await assertOnline().catch((e: any) => e);
    expect(err).toBeInstanceOf(OfflineError);
    expect(err.name).toBe('OfflineError');
  });
});

describe('read and write paths agree on what "offline" means', () => {
  it('REGRESSION: unknown connectivity permits both a read and a write', async () => {
    // These used to disagree — dashboard used `!isConnected` (null => offline)
    // while assertOnline used `=== false` (null => online), so an unknown
    // state blocked reads while still permitting writes.
    setConnected(null);
    const { getDashboardData } = require('@/lib/dashboard');
    const { supabase } = require('@/lib/supabase');
    await supabase.auth.signInWithPassword();

    await expect(assertOnline()).resolves.toBeUndefined();
    const data = await getDashboardData();
    expect(data.feed.length).toBeGreaterThan(0);
  });

  it('an explicit disconnect blocks writes and serves cache for reads', async () => {
    const { getDashboardData } = require('@/lib/dashboard');
    const { supabase } = require('@/lib/supabase');
    await supabase.auth.signInWithPassword();

    await getDashboardData(); // warm the cache while online
    setConnected(false);

    await expect(assertOnline()).rejects.toThrow(OfflineError);
    const cached = await getDashboardData();
    expect(cached.feed.length).toBeGreaterThan(0); // served from cache
  });
});
