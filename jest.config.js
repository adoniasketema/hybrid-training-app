/**
 * The suite deliberately runs in a fixed NON-UTC timezone (see the `test`
 * script in package.json). A previous bug shipped because day keys were
 * formatted with toISOString() (UTC) while the calendar used local getters —
 * under a UTC test runner that class of bug is invisible, because the two
 * agree. Pinning to America/New_York makes any UTC assumption fail loudly.
 */
module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/__tests__'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // Only *.test.ts(x) are suites — this keeps helpers like setup.ts in
  // __tests__/ from being collected as (empty) test files.
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  // The repo vendors third-party sample code that isn't ours to test.
  testPathIgnorePatterns: [
    '/node_modules/',
    '/graphify/',
    '/react-bits/',
    '/ui-ux-pro-max-skill/',
  ],
  collectCoverageFrom: [
    'lib/**/*.ts',
    '!lib/storage.ts', // thin native-module wrapper, covered by a smoke test
  ],
};
