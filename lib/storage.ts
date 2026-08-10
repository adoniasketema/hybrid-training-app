import { createMMKV } from 'react-native-mmkv';

// v4 removed the `MMKV` class as a runtime export — it is now a type-only
// export, and instances are created via the `createMMKV` factory. On web this
// is backed by localStorage.
export const storage = createMMKV();
