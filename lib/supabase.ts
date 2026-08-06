import { createClient } from '@supabase/supabase-js'

// The original URL is invalid, so we use a mock client for the portfolio showcase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

// Mock Data
const MOCK_USER = { id: 'demo-user-123', email: 'demo@hybrid.com' };
const MOCK_EXERCISES = [
  { id: 'ex-1', name: 'Bench Press', type: 'strength', category: 'Chest' },
  { id: 'ex-2', name: 'Squat', type: 'strength', category: 'Legs' },
  { id: 'ex-3', name: 'Deadlift', type: 'strength', category: 'Back' },
  { id: 'ex-4', name: 'Treadmill Run', type: 'cardio', category: 'Running' }
];

// Generate 10 days of mock workouts
const MOCK_WORKOUTS = Array.from({ length: 10 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (i * 2));
  return {
    id: `workout-${i}`,
    date: d.toISOString().slice(0, 10),
    completed: true,
    user_id: MOCK_USER.id,
    workout_exercises: [
      { id: `we-${i}-1`, exercises: MOCK_EXERCISES[0], sets: null, reps: 10, weight_kg: 60 + i * 2, duration_minutes: null, distance_km: null },
      { id: `we-${i}-2`, exercises: MOCK_EXERCISES[1], sets: null, reps: 8, weight_kg: 80 + i * 2, duration_minutes: null, distance_km: null }
    ]
  };
});

// A robust mock chain to intercept all Supabase queries
const createMockChain = (tableName: string) => {
  let resultData: any = [];
  
  if (tableName === 'workouts') resultData = MOCK_WORKOUTS;
  if (tableName === 'exercises') resultData = MOCK_EXERCISES;
  if (tableName === 'users') resultData = { id: MOCK_USER.id, name: 'Demo User' };

  const chain = {
    select: () => chain,
    eq: (col: string, val: any) => {
      if (Array.isArray(resultData)) {
        resultData = resultData.filter(item => item[col] === val);
      }
      return chain;
    },
    order: () => chain,
    single: async () => ({ data: Array.isArray(resultData) ? resultData[0] : resultData, error: null }),
    maybeSingle: async () => ({ data: Array.isArray(resultData) ? resultData[0] : resultData, error: null }),
    insert: async () => ({ data: resultData, error: null }),
    update: async () => ({ data: resultData, error: null }),
    delete: async () => ({ data: resultData, error: null }),
    then: (resolve: any) => resolve({ data: resultData, error: null })
  };
  return chain;
};

let sessionCallback: any = null;
let currentSession = { user: MOCK_USER, access_token: 'mock-token' };

export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: currentSession }, error: null }),
    getUser: async () => ({ data: { user: MOCK_USER }, error: null }),
    signInWithPassword: async () => {
      if (sessionCallback) sessionCallback('SIGNED_IN', currentSession);
      return { data: { session: currentSession, user: MOCK_USER }, error: null };
    },
    signUp: async () => {
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
  from: (table: string) => createMockChain(table)
} as any;