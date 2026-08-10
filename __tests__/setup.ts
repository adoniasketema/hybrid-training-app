/**
 * Native modules that can't run under Jest. Both use behaviour-faithful
 * in-memory implementations rather than bare stubs, so tests exercise real
 * control flow (cache hits/misses, offline branches) instead of just
 * asserting that a mock was called.
 *
 * Note: jest.mock factories may not reference out-of-scope variables unless
 * the name is prefixed with `mock`, hence `mockStore` below.
 */

// ── react-native-mmkv ───────────────────────────────────────────────────
// Mirrors the v4 API the app uses: a createMMKV() factory (v4 removed the
// MMKV class as a runtime export) and `remove`, not `delete` (v4 renamed it).
// Getting either wrong is what took the app down once already.
const mockStore = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: (key: string) => mockStore.get(key),
    set: (key: string, value: string) => {
      mockStore.set(key, String(value));
    },
    remove: (key: string) => mockStore.delete(key),
    contains: (key: string) => mockStore.has(key),
    clearAll: () => mockStore.clear(),
  }),
}));

// ── @react-native-community/netinfo ─────────────────────────────────────
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { fetch: jest.fn() },
}));

/**
 * Simulate connectivity. `null` = unknown, which callers treat as online.
 *
 * NetInfo is resolved via require() at call time rather than a module-scope
 * import: tests that use jest.resetModules() get a fresh mock instance, and a
 * cached reference would silently configure the wrong one (leaving
 * `fetch()` returning undefined).
 */
export function setConnected(isConnected: boolean | null) {
  const NetInfo = require('@react-native-community/netinfo').default;
  (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected });
}

/** Direct access to the fake MMKV store, for seeding/inspecting cache state. */
export const mmkvStore = mockStore;

beforeEach(() => {
  mockStore.clear();
  setConnected(true);
});
