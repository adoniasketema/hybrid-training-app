import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter, useSearchParams } from 'expo-router';

import { supabase } from '@/lib/supabase';

type ExerciseMode = 'strength' | 'cardio';

type WorkoutEntry = {
  id: string;
  type: 'strength' | 'cardio';
  exercise: string;
  sets?: number;
  reps?: number;
  weightKg?: number;
  distanceKm?: number;
  durationMin?: number;
};

type WorkoutLog = {
  id: string;
  date: string;
  completed: boolean;
  entries: WorkoutEntry[];
};

type WorkoutSummary = {
  id: string;
  date: string;
  completed: boolean;
  exerciseCount: number;
};

const exerciseModes: ExerciseMode[] = ['strength', 'cardio'];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function WorkoutScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const rawWorkoutId = params.workoutId;
  const workoutId = Array.isArray(rawWorkoutId) ? rawWorkoutId[0] : rawWorkoutId;

  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);
  const [mode, setMode] = useState<ExerciseMode>('strength');
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('8');
  const [weight, setWeight] = useState('50');
  const [distance, setDistance] = useState('3');
  const [duration, setDuration] = useState('20');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkouts();
  }, []);

  useEffect(() => {
    if (workoutId) {
      loadSelectedWorkout(workoutId);
    } else {
      setSelectedWorkout(null);
    }
  }, [workoutId]);

  const loadWorkouts = async () => {
    setLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setError('Could not load workouts because you are not signed in.');
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('workouts')
      .select('id,date,completed,workout_exercises(id)')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setWorkouts(
      (data ?? []).map((item: any) => ({
        id: item.id,
        date: item.date,
        completed: item.completed,
        exerciseCount: item.workout_exercises?.length ?? 0,
      })),
    );
    setLoading(false);
  };

  const loadSelectedWorkout = async (id: string) => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('workouts')
      .select(
        'id,date,completed,workout_exercises(id,sets,reps,weight_kg,duration_minutes,distance_km,exercises(id,name,type))',
      )
      .eq('id', id)
      .single();

    if (error || !data) {
      setError(error?.message ?? 'Workout not found.');
      setSelectedWorkout(null);
      setLoading(false);
      return;
    }

    const mapped: WorkoutLog = {
      id: data.id,
      date: data.date,
      completed: data.completed,
      entries: (data.workout_exercises ?? []).map((we: any) => {
        const exercise = we.exercises;
        if (exercise?.type === 'cardio') {
          return {
            id: we.id,
            type: 'cardio',
            exercise: exercise.name,
            distanceKm: we.distance_km ?? 0,
            durationMin: we.duration_minutes ?? 0,
          } as WorkoutEntry;
        }

        return {
          id: we.id,
          type: 'strength',
          exercise: exercise?.name ?? 'Unknown',
          sets: we.sets ?? 0,
          reps: we.reps ?? 0,
          weightKg: we.weight_kg ?? 0,
        } as WorkoutEntry;
      }),
    };

    setSelectedWorkout(mapped);
    setLoading(false);
  };

  const openWorkout = (id: string) => {
    router.push(`/tabs/workout?workoutId=${id}`);
  };

  const backToList = () => {
    router.push('/tabs/workout');
  };

  const createWorkoutForToday = async () => {
    setLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setError('Please sign in to create a workout.');
      setLoading(false);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const { data, error } = await supabase
      .from('workouts')
      .insert({ user_id: user.id, date: today, completed: false })
      .select()
      .single();

    if (error || !data) {
      setError(error?.message ?? 'Unable to create workout.');
      setLoading(false);
      return;
    }

    await loadWorkouts();
    router.push(`/tabs/workout?workoutId=${data.id}`);
  };

  const addEntry = async () => {
    if (!selectedWorkout) {
      return;
    }

    if (!exerciseName.trim()) {
      Alert.alert('Enter an exercise name');
      return;
    }

    const { data: exData, error: findError } = await supabase
      .from('exercises')
      .select('id')
      .eq('name', exerciseName.trim())
      .single();

    if (findError || !exData) {
      Alert.alert('Exercise not found', 'Please use an existing exercise name from the list.');
      return;
    }

    const values: any = {
      workout_id: selectedWorkout.id,
      exercise_id: exData.id,
    };

    if (mode === 'strength') {
      const setsNumber = Number(sets);
      const repsNumber = Number(reps);
      const weightNumber = Number(weight);

      if (!setsNumber || !repsNumber || !weightNumber) {
        Alert.alert('Enter sets, reps, and weight for strength work.');
        return;
      }

      values.sets = setsNumber;
      values.reps = repsNumber;
      values.weight_kg = weightNumber;
    } else {
      const distanceNumber = Number(distance);
      const durationNumber = Number(duration);

      if (!distanceNumber || !durationNumber) {
        Alert.alert('Enter distance and duration for cardio work.');
        return;
      }

      values.duration_minutes = durationNumber;
      values.distance_km = distanceNumber;
    }

    const { data, error } = await supabase.from('workout_exercises').insert(values).select().single();
    if (error || !data) {
      Alert.alert('Could not add entry', error?.message ?? 'Please try again.');
      return;
    }

    const newEntry: WorkoutEntry =
      mode === 'strength'
        ? {
            id: data.id,
            type: 'strength',
            exercise: exerciseName.trim(),
            sets: values.sets,
            reps: values.reps,
            weightKg: values.weight_kg,
          }
        : {
            id: data.id,
            type: 'cardio',
            exercise: exerciseName.trim(),
            distanceKm: values.distance_km,
            durationMin: values.duration_minutes,
          };

    setSelectedWorkout((current) =>
      current
        ? {
            ...current,
            entries: [...current.entries, newEntry],
          }
        : current,
    );
    setExerciseName('');
    await loadWorkouts();
  };

  const completeWorkout = async () => {
    if (!selectedWorkout || selectedWorkout.completed || selectedWorkout.entries.length === 0) {
      return;
    }

    const { error } = await supabase.from('workouts').update({ completed: true }).eq('id', selectedWorkout.id);
    if (error) {
      Alert.alert('Could not complete workout', error.message);
      return;
    }

    setSelectedWorkout({ ...selectedWorkout, completed: true });
    await loadWorkouts();
  };

  const workoutList = useMemo(() => workouts, [workouts]);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Workout</Text>
        <Text style={styles.cardText}>{error}</Text>
        <Button title="Retry" onPress={loadWorkouts} />
      </View>
    );
  }

  if (workoutId && !selectedWorkout) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Workout</Text>
        <Text style={styles.cardText}>Loading selected workout...</Text>
      </View>
    );
  }

  if (!workoutId) {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Choose a workout</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your saved workouts</Text>
            <Text style={styles.cardText}>Select a workout to edit it, or create a new one for today.</Text>
          </View>

          {workoutList.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.cardText}>No saved workouts yet.</Text>
              <Button title="Create today’s workout" onPress={createWorkoutForToday} />
            </View>
          ) : (
            workoutList.map((workout) => (
              <View key={workout.id} style={styles.card}>
                <Text style={styles.cardTitle}>{formatDate(workout.date)}</Text>
                <Text style={styles.cardText}>
                  {workout.completed ? 'Completed' : 'In progress'} · {workout.exerciseCount} entries
                </Text>
                <Button title="Edit workout" onPress={() => openWorkout(workout.id)} />
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Button title="Back to list" onPress={backToList} />
        <Text style={styles.title}>Edit Workout</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{formatDate(selectedWorkout.date)}</Text>
          <Text style={styles.cardText}>{selectedWorkout.completed ? 'Completed' : 'In progress'}</Text>
          <Text style={styles.cardText}>{selectedWorkout.entries.length} exercise entries</Text>
        </View>

        <View style={styles.segmentRow}>
          {exerciseModes.map((option) => (
            <Button
              key={option}
              title={option === 'strength' ? 'Strength' : 'Cardio'}
              color={mode === option ? '#007aff' : '#999'}
              onPress={() => setMode(option)}
            />
          ))}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Exercise</Text>
          <TextInput style={styles.input} value={exerciseName} onChangeText={setExerciseName} placeholder="Push-ups, Run" />
        </View>

        {mode === 'strength' ? (
          <>
            <View style={styles.row}>
              <View style={styles.smallField}>
                <Text style={styles.label}>Sets</Text>
                <TextInput style={styles.input} value={sets} onChangeText={setSets} keyboardType="numeric" />
              </View>
              <View style={styles.smallField}>
                <Text style={styles.label}>Reps</Text>
                <TextInput style={styles.input} value={reps} onChangeText={setReps} keyboardType="numeric" />
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Weight (kg)</Text>
              <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" />
            </View>
          </>
        ) : (
          <>
            <View style={styles.row}>
              <View style={styles.smallField}>
                <Text style={styles.label}>Distance (km)</Text>
                <TextInput style={styles.input} value={distance} onChangeText={setDistance} keyboardType="numeric" />
              </View>
              <View style={styles.smallField}>
                <Text style={styles.label}>Duration (min)</Text>
                <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" />
              </View>
            </View>
          </>
        )}

        <Button title="Add Entry" onPress={addEntry} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Entries</Text>
          {selectedWorkout.entries.length === 0 ? (
            <Text style={styles.cardText}>No entries yet. Add your first set or cardio session.</Text>
          ) : (
            selectedWorkout.entries.map((entry) => (
              <View key={entry.id} style={styles.entryRow}>
                <Text style={styles.entryTitle}>{entry.exercise}</Text>
                {entry.type === 'strength' ? (
                  <Text style={styles.entryMeta}>
                    {entry.sets} x {entry.reps} @ {entry.weightKg} kg
                  </Text>
                ) : (
                  <Text style={styles.entryMeta}>
                    {entry.distanceKm} km · {entry.durationMin} min
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        <Button
          title={selectedWorkout.completed ? 'Workout Complete' : 'Mark Workout Complete'}
          onPress={completeWorkout}
          disabled={selectedWorkout.completed || selectedWorkout.entries.length === 0}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 14,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardText: {
    fontSize: 16,
    color: '#444',
  },
  segmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  field: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  smallField: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#fff',
  },
  entryRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  entryTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  entryMeta: {
    fontSize: 14,
    color: '#555',
  },
});
