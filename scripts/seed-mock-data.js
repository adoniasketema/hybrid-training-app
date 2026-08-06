const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Seeding Mock Data for Portfolio Showcase...');

  // 1. We will use a dedicated demo account.
  const email = 'demo@hybrid.com';
  const password = 'password123';

  // Attempt to sign in, if fails, sign up.
  let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    console.log('Demo user not found or error. Attempting to sign up...', authError.message);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (signUpError) {
      console.error('Failed to create demo user:', signUpError.message);
      return;
    }
    authData = signUpData;
    console.log('Demo user created! Please check if email confirmation is required by your Supabase project settings.');
  }

  const userId = authData.user.id;
  console.log(`Logged in as demo user: ${userId}`);

  // 2. Fetch or Create Exercises
  const defaultExercises = [
    { name: 'Bench Press', type: 'strength', category: 'Chest' },
    { name: 'Squat', type: 'strength', category: 'Legs' },
    { name: 'Deadlift', type: 'strength', category: 'Back' },
    { name: 'Pull Up', type: 'strength', category: 'Back' },
    { name: 'Treadmill Run', type: 'cardio', category: 'Running' },
    { name: 'Cycling', type: 'cardio', category: 'Cycling' }
  ];

  const insertedExercises = [];
  
  // We'll just insert and ignore conflicts if possible, or fetch existing.
  for (const ex of defaultExercises) {
    const { data: existing } = await supabase.from('exercises').select('id').eq('name', ex.name).single();
    if (existing) {
      insertedExercises.push({ ...ex, id: existing.id });
    } else {
      const { data: newEx, error: insertError } = await supabase.from('exercises').insert([ex]).select().single();
      if (insertError) {
        console.warn(`Could not insert exercise ${ex.name}. RLS might be blocking it if it's not user-specific. Error:`, insertError.message);
      } else {
        insertedExercises.push(newEx);
      }
    }
  }

  if (insertedExercises.length === 0) {
      console.log("No exercises found or inserted. Using fallback IDs or aborting.");
  }

  console.log(`Ensured ${insertedExercises.length} exercises exist.`);

  // 3. Generate 30 days of past workouts
  console.log('Generating past 30 days of workouts...');
  const workoutsToInsert = [];
  const today = new Date();

  for (let i = 30; i >= 0; i -= Math.floor(Math.random() * 3) + 1) { // Workout every 1-3 days
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    workoutsToInsert.push({
      user_id: userId,
      date: d.toISOString().slice(0, 10), // YYYY-MM-DD
      completed: true,
    });
  }

  const { data: createdWorkouts, error: workoutsError } = await supabase
    .from('workouts')
    .insert(workoutsToInsert)
    .select();

  if (workoutsError) {
    console.error('Failed to create workouts:', workoutsError.message);
    return;
  }

  console.log(`Created ${createdWorkouts.length} workouts.`);

  // 4. Generate Workout Exercises for each workout
  const workoutExercisesToInsert = [];
  
  for (let i = 0; i < createdWorkouts.length; i++) {
    const workout = createdWorkouts[i];
    
    // Pick 2-4 random exercises for this workout
    const numExercises = Math.floor(Math.random() * 3) + 2;
    const shuffledEx = [...insertedExercises].sort(() => 0.5 - Math.random());
    const selectedEx = shuffledEx.slice(0, numExercises);

    for (const ex of selectedEx) {
      // Create 3-4 sets for strength, 1 set for cardio
      const numSets = ex.type === 'strength' ? 3 : 1;
      
      for (let s = 1; s <= numSets; s++) {
        // Base weight increases slightly over time (using `i` as a progression metric)
        const weightProgression = (i * 1.5);
        const weight = ex.name === 'Deadlift' ? 135 + weightProgression : 
                       ex.name === 'Squat' ? 115 + weightProgression : 
                       ex.name === 'Bench Press' ? 95 + weightProgression : 0;
                       
        workoutExercisesToInsert.push({
          workout_id: workout.id,
          exercise_id: ex.id,
          sets: s,
          reps: ex.type === 'strength' ? (10 - Math.floor(Math.random() * 2)) : null,
          weight_kg: ex.type === 'strength' ? weight : null,
          distance_km: ex.type === 'cardio' ? (2 + Math.random() * 3).toFixed(1) : null,
          duration_minutes: ex.type === 'cardio' ? (15 + Math.random() * 20).toFixed(0) : null
        });
      }
    }
  }

  const { error: weError } = await supabase
    .from('workout_exercises')
    .insert(workoutExercisesToInsert);

  if (weError) {
    console.error('Failed to create workout exercises:', weError.message);
  } else {
    console.log(`Successfully generated ${workoutExercisesToInsert.length} sets/logged exercises!`);
  }

  console.log('Mock data generation complete!');
}

seed();
