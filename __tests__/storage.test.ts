/**
 * Guards the dependency contract that took the whole app down once.
 *
 * `react-native-mmkv` v4 removed `MMKV` as a runtime export (it is now
 * type-only) and instances come from `createMMKV()`. Because `lib/storage.ts`
 * is imported at module scope by the data layer, `new MMKV()` threw
 * "MMKV is not a constructor" during module evaluation and every
 * authenticated screen went down — the dev server returned HTTP 500.
 */

describe('lib/storage', () => {
  it('REGRESSION: importing the module does not throw', () => {
    // The failure mode was at module-eval time, so simply loading it is the
    // assertion. A unit test this cheap would have caught the outage.
    expect(() => require('@/lib/storage')).not.toThrow();
  });

  it('exposes a usable key/value store', () => {
    const { storage } = require('@/lib/storage');

    storage.set('smoke', 'value');
    expect(storage.getString('smoke')).toBe('value');

    storage.remove('smoke');
    expect(storage.getString('smoke')).toBeUndefined();
  });

  it('returns undefined for a missing key rather than throwing', () => {
    const { storage } = require('@/lib/storage');
    expect(storage.getString('never-written')).toBeUndefined();
  });
});

describe('react-native-mmkv dependency contract', () => {
  it('REGRESSION: the package exports createMMKV, and MMKV only as a type', () => {
    // Checked statically against the shipped source. requireActual() can't be
    // used here because loading the real module initialises a native
    // TurboModule that doesn't exist under Jest — but the export surface is
    // exactly what broke, so assert on that directly.
    const fs = require('fs');
    const path = require('path');
    const src = fs.readFileSync(
      path.join(__dirname, '..', 'node_modules', 'react-native-mmkv', 'src', 'index.ts'),
      'utf8',
    );

    // A value export we can call...
    expect(src).toMatch(/export\s*\{\s*createMMKV\s*\}/);
    // ...and MMKV exported as a TYPE only, so `new MMKV()` cannot work.
    expect(src).toMatch(/export\s+type\s*\{\s*MMKV\s*\}/);
    expect(src).not.toMatch(/export\s*\{\s*MMKV\s*\}/);
  });

  it('uses remove(), not delete(), for key eviction', () => {
    const { storage } = require('@/lib/storage');
    expect(typeof storage.remove).toBe('function');
  });
});
