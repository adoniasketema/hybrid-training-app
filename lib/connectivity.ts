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

/** Throws `OfflineError` when there is no usable connection. */
export async function assertOnline(): Promise<void> {
  const state = await NetInfo.fetch();
  // `isConnected === false` is definitive; null/undefined means unknown, and
  // we optimistically allow the write rather than blocking on a bad probe.
  if (state.isConnected === false) {
    throw new OfflineError();
  }
}
