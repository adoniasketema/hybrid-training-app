import NetInfo from '@react-native-community/netinfo';

/**
 * Thrown when a mutation is attempted with no connectivity.
 *
 * The cache layer makes *reads* work offline, but writes go straight to the
 * backend with no outbox. Without this guard an offline "log set" silently
 * no-ops and the user's work disappears on next load — the worst possible
 * failure mode for a training log.
 *
 * Scoping offline support to reads and failing writes loudly is the honest
 * behaviour; a full outbox (queue mutations, flush on reconnect) is the
 * follow-up if offline logging becomes a real requirement.
 */
export class OfflineError extends Error {
  constructor(message = "You're offline. Reconnect to save changes.") {
    super(message);
    this.name = 'OfflineError';
  }
}

/**
 * Single definition of "offline", shared by the read and write paths.
 *
 * NetInfo reports `isConnected: null` while the state is still unknown. Only
 * an explicit `false` is treated as offline — an unknown state stays
 * optimistic, since a failed request already falls back to cache, whereas
 * treating unknown as offline would serve stale data for no reason.
 *
 * Keeping this in one place matters: reads and writes previously disagreed
 * (`!isConnected` vs `isConnected === false`), so an unknown state would
 * block reads while still permitting writes.
 */
export async function isOffline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state?.isConnected === false;
}

/** Throws `OfflineError` when there is no usable connection. */
export async function assertOnline(): Promise<void> {
  if (await isOffline()) {
    throw new OfflineError();
  }
}
