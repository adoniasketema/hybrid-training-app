import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { SleekCard } from '@/components/ui/SleekCard';
import { SleekButton } from '@/components/ui/SleekButton';
import { Colors } from '@/constants/theme';

/* ── Types ─────────────────────────────────────────────── */

type Exercise = {
  id: string;
  name: string;
  type: 'strength' | 'cardio';
};

type SetRow = {
  dbId: string;
  weightLbs: string;
  reps: string;
  distanceKm: string;
  durationMin: string;
  completed: boolean;
};

type ExerciseGroup = {
  exerciseId: string;
  exerciseName: string;
  exerciseType: 'strength' | 'cardio';
  sets: SetRow[];
};

type WorkoutData = {
  id: string;
  date: string;
  completed: boolean;
  exerciseGroups: ExerciseGroup[];
};

type WorkoutSummary = {
  id: string;
  date: string;
  completed: boolean;
  exerciseCount: number;
};

/* ── Helpers ───────────────────────────────────────────── */

const todayKey = () => new Date().toISOString().slice(0, 10);

const formatDate = (dateString: string) => {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/* ── Component ─────────────────────────────────────────── */

export default function WorkoutScreen() {
  const router = useRouter();
  const { workoutId } = useLocalSearchParams<{ workoutId?: string }>();

  // List view
  const [workouts, setWorkouts] = useState<WorkoutSummary[]>([]);

  // Detail view
  const [workout, setWorkout] = useState<WorkoutData | null>(null);

  // Exercise picker
  const [showPicker, setShowPicker] = useState(false);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // General
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Data loading ──────────────────────────────────────── */

  useEffect(() => {
    if (!workoutId) {
      loadWorkoutList();
    }
  }, [workoutId]);

  useEffect(() => {
    if (workoutId) {
      loadWorkoutDetail(workoutId);
    } else {
      setWorkout(null);
    }
  }, [workoutId]);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadWorkoutList = async () => {
    setLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      setError('Please sign in.');
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from('workouts')
      .select('id, date, completed, workout_exercises(id)')
      .eq('user_id', userData.user.id)
      .order('date', { ascending: false });

    if (err) {
      setError(err.message);
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

  const loadWorkoutDetail = async (id: string) => {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from('workouts')
      .select(
        'id, date, completed, workout_exercises(id, sets, reps, weight_kg, duration_minutes, distance_km, exercises(id, name, type))',
      )
      .eq('id', id)
      .single();

    if (err || !data) {
      setError(err?.message ?? 'Workout not found.');
      setLoading(false);
      return;
    }

    // Group workout_exercises rows by exercise
    const groupMap = new Map<string, ExerciseGroup>();

    for (const we of (data.workout_exercises ?? []) as any[]) {
      const ex = we.exercises;
      const exId: string = ex?.id ?? 'unknown';

      if (!groupMap.has(exId)) {
        groupMap.set(exId, {
          exerciseId: exId,
          exerciseName: ex?.name ?? 'Unknown',
          exerciseType: ex?.type ?? 'strength',
          sets: [],
        });
      }

      groupMap.get(exId)!.sets.push({
        dbId: we.id,
        weightLbs: String(we.weight_kg ?? 0),
        reps: String(we.reps ?? 0),
        distanceKm: String(we.distance_km ?? 0),
        durationMin: String(we.duration_minutes ?? 0),
        completed: true,
      });
    }

    setWorkout({
      id: data.id,
      date: data.date,
      completed: data.completed,
      exerciseGroups: Array.from(groupMap.values()),
    });
    setLoading(false);
  };

  const loadExercises = async () => {
    const { data } = await supabase
      .from('exercises')
      .select('id, name, type')
      .order('name', { ascending: true });

    setAllExercises((data ?? []) as Exercise[]);
  };

  /* ── Actions ───────────────────────────────────────────── */

  const createWorkoutForToday = async () => {
    setLoading(true);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      setError('Please sign in.');
      setLoading(false);
      return;
    }

    const { data, error: err } = await supabase
      .from('workouts')
      .insert({ user_id: userData.user.id, date: todayKey(), completed: false })
      .select()
      .single();

    if (err || !data) {
      setError(err?.message ?? 'Could not create workout.');
      setLoading(false);
      return;
    }

    router.push(`/tabs/workout?workoutId=${data.id}`);
  };

  const selectExercise = async (exercise: Exercise) => {
    if (!workout) return;

    const insertData: any = {
      workout_id: workout.id,
      exercise_id: exercise.id,
    };

    if (exercise.type === 'strength') {
      insertData.sets = 1;
      insertData.reps = 0;
      insertData.weight_kg = 0;
    } else {
      insertData.duration_minutes = 0;
      insertData.distance_km = 0;
    }

    const { data, error: err } = await supabase
      .from('workout_exercises')
      .insert(insertData)
      .select()
      .single();

    if (err || !data) {
      Alert.alert('Error', err?.message ?? 'Could not add exercise.');
      return;
    }

    const newSet: SetRow = {
      dbId: data.id,
      weightLbs: '0',
      reps: '0',
      distanceKm: '0',
      durationMin: '0',
      completed: false,
    };

    const existingIndex = workout.exerciseGroups.findIndex(
      (g) => g.exerciseId === exercise.id,
    );

    if (existingIndex >= 0) {
      const updated = [...workout.exerciseGroups];
      updated[existingIndex] = {
        ...updated[existingIndex],
        sets: [...updated[existingIndex].sets, newSet],
      };
      setWorkout({ ...workout, exerciseGroups: updated });
    } else {
      setWorkout({
        ...workout,
        exerciseGroups: [
          ...workout.exerciseGroups,
          {
            exerciseId: exercise.id,
            exerciseName: exercise.name,
            exerciseType: exercise.type,
            sets: [newSet],
          },
        ],
      });
    }

    setShowPicker(false);
    setSearchQuery('');
  };

  const addSet = async (groupIndex: number) => {
    if (!workout) return;
    const group = workout.exerciseGroups[groupIndex];

    const insertData: any = {
      workout_id: workout.id,
      exercise_id: group.exerciseId,
    };

    if (group.exerciseType === 'strength') {
      insertData.sets = 1;
      insertData.reps = 0;
      insertData.weight_kg = 0;
    } else {
      insertData.duration_minutes = 0;
      insertData.distance_km = 0;
    }

    const { data, error: err } = await supabase
      .from('workout_exercises')
      .insert(insertData)
      .select()
      .single();

    if (err || !data) {
      Alert.alert('Error', err?.message ?? 'Could not add set.');
      return;
    }

    const newSet: SetRow = {
      dbId: data.id,
      weightLbs: '0',
      reps: '0',
      distanceKm: '0',
      durationMin: '0',
      completed: false,
    };

    const updated = [...workout.exerciseGroups];
    updated[groupIndex] = {
      ...group,
      sets: [...group.sets, newSet],
    };
    setWorkout({ ...workout, exerciseGroups: updated });
  };

  const updateSetField = (
    groupIndex: number,
    setIndex: number,
    field: keyof Pick<SetRow, 'weightLbs' | 'reps' | 'distanceKm' | 'durationMin'>,
    value: string,
  ) => {
    if (!workout) return;

    const updated = [...workout.exerciseGroups];
    const updatedSets = [...updated[groupIndex].sets];
    updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };
    updated[groupIndex] = { ...updated[groupIndex], sets: updatedSets };
    setWorkout({ ...workout, exerciseGroups: updated });
  };

  const saveSetToDb = useCallback(
    async (groupIndex: number, setIndex: number) => {
      if (!workout) return;
      const group = workout.exerciseGroups[groupIndex];
      const set = group.sets[setIndex];

      const updateData: any = {};
      if (group.exerciseType === 'strength') {
        updateData.weight_kg = Number(set.weightLbs) || 0;
        updateData.reps = Number(set.reps) || 0;
      } else {
        updateData.distance_km = Number(set.distanceKm) || 0;
        updateData.duration_minutes = Number(set.durationMin) || 0;
      }

      await supabase
        .from('workout_exercises')
        .update(updateData)
        .eq('id', set.dbId);
    },
    [workout],
  );

  const toggleSetCompleted = async (groupIndex: number, setIndex: number) => {
    if (!workout || workout.completed) return;

    await saveSetToDb(groupIndex, setIndex);

    const updated = [...workout.exerciseGroups];
    const updatedSets = [...updated[groupIndex].sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      completed: !updatedSets[setIndex].completed,
    };
    updated[groupIndex] = { ...updated[groupIndex], sets: updatedSets };
    setWorkout({ ...workout, exerciseGroups: updated });
  };

  const finishWorkout = async () => {
    if (!workout) return;

    const { error: err } = await supabase
      .from('workouts')
      .update({ completed: true })
      .eq('id', workout.id);

    if (err) {
      Alert.alert('Error', err.message);
      return;
    }

    setWorkout({ ...workout, completed: true });
    router.push('/tabs/workout');
  };

  /* ── Filtered exercises for picker ─────────────────────── */

  const filteredSections = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const filtered = query
      ? allExercises.filter((e) => e.name.toLowerCase().includes(query))
      : allExercises;

    const groups = new Map<string, Exercise[]>();
    for (const ex of filtered) {
      const letter = ex.name[0]?.toUpperCase() ?? '#';
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter)!.push(ex);
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([letter, data]) => ({ title: letter, data }));
  }, [allExercises, searchQuery]);

  /* ── Render: Loading ───────────────────────────────────── */

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ── Render: Error ─────────────────────────────────────── */

  if (error) {
    return (
      <View style={styles.screenPadding}>
        <Text style={styles.title}>Workout</Text>
        <Text style={styles.mutedText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={() => (workoutId ? loadWorkoutDetail(workoutId) : loadWorkoutList())}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  /* ── Render: Exercise Picker ───────────────────────────── */

  if (showPicker) {
    return (
      <View style={styles.pickerContainer}>
        <View style={styles.pickerHeader}>
          <Pressable
            onPress={() => {
              setShowPicker(false);
              setSearchQuery('');
            }}
          >
            <Text style={styles.pickerClose}>✕</Text>
          </Pressable>
          <Text style={styles.pickerTitle}>Add Exercise</Text>
          <View style={{ width: 30 }} />
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
        />

        <SectionList
          sections={filteredSections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionLetter}>{section.title}</Text>
          )}
          renderItem={({ item }) => (
            <Pressable
              style={styles.exerciseRow}
              onPress={() => selectExercise(item)}
            >
              <Text style={styles.exerciseRowName}>{item.name}</Text>
              <Text style={styles.exerciseRowType}>
                {item.type === 'strength' ? 'Strength' : 'Cardio'}
              </Text>
            </Pressable>
          )}
          ListEmptyComponent={
            <Text style={[styles.mutedText, { textAlign: 'center', marginTop: 40 }]}>
              No exercises found.
            </Text>
          }
          stickySectionHeadersEnabled
        />
      </View>
    );
  }

  /* ── Render: Workout List ──────────────────────────────── */

  if (!workoutId) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.screenPadding}>
          <Text style={styles.title}>Workouts</Text>

          <SleekButton
            title="Start New Workout"
            onPress={createWorkoutForToday}
            variant="accent"
            style={{ marginBottom: 24 }}
          />

          {workouts.length === 0 ? (
            <Text style={[styles.mutedText, { textAlign: 'center', marginTop: 24 }]}>
              No workouts yet. Start your first one!
            </Text>
          ) : (
            workouts.map((w) => (
              <SleekCard
                key={w.id}
                containerStyle={{ marginBottom: 16, borderColor: w.completed ? Colors.dark.status : 'rgba(59, 130, 246, 0.15)' }}
              >
                <Pressable onPress={() => router.push(`/tabs/workout?workoutId=${w.id}`)}>
                  <Text style={styles.listCardDate}>{formatDate(w.date)}</Text>
                  <Text style={styles.listCardMeta}>
                    {w.completed ? 'Completed' : 'In Progress'} · {w.exerciseCount}{' '}
                    {w.exerciseCount === 1 ? 'set' : 'sets'}
                  </Text>
                </Pressable>
              </SleekCard>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ── Render: Workout Detail (loading selected) ─────────── */

  if (!workout) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  /* ── Render: Workout Detail ────────────────────────────── */

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.screenPadding}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header row */}
          <View style={styles.detailHeader}>
            <Pressable onPress={() => router.push('/tabs/workout')}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>
            {!workout.completed && (
              <SleekButton title="Finish" onPress={finishWorkout} variant="accent" style={{ paddingVertical: 8, paddingHorizontal: 16 }} />
            )}
          </View>

          <Text style={styles.title}>
            {workout.completed ? 'Completed Workout' : 'Workout'}
          </Text>
          <Text style={styles.dateLabel}>{formatDate(workout.date)}</Text>

          {/* Exercise groups */}
          {workout.exerciseGroups.map((group, gi) => (
            <SleekCard key={`${group.exerciseId}-${gi}`} containerStyle={{ marginTop: 24 }}>
              {/* Exercise title */}
              <Text style={styles.exerciseTitle}>{group.exerciseName}</Text>

              {/* Table header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.colSet]}>Set</Text>
                {group.exerciseType === 'strength' ? (
                  <>
                    <Text style={[styles.headerCell, styles.colValue]}>lbs</Text>
                    <Text style={[styles.headerCell, styles.colValue]}>reps</Text>
                  </>
                ) : (
                  <>
                    <Text style={[styles.headerCell, styles.colValue]}>km</Text>
                    <Text style={[styles.headerCell, styles.colValue]}>min</Text>
                  </>
                )}
                <Text style={[styles.headerCell, styles.colCheck]}>✓</Text>
              </View>

              {/* Set rows */}
              {group.sets.map((set, si) => (
                <View key={set.dbId} style={styles.tableRow}>
                  <Text style={[styles.cellText, styles.colSet]}>{si + 1}</Text>

                  {group.exerciseType === 'strength' ? (
                    <>
                      <TextInput
                        style={[styles.cellInput, styles.colValue]}
                        value={set.weightLbs}
                        onChangeText={(v) => updateSetField(gi, si, 'weightLbs', v)}
                        onBlur={() => saveSetToDb(gi, si)}
                        keyboardType="numeric"
                        editable={!workout.completed}
                        placeholderTextColor="#555"
                      />
                      <TextInput
                        style={[styles.cellInput, styles.colValue]}
                        value={set.reps}
                        onChangeText={(v) => updateSetField(gi, si, 'reps', v)}
                        onBlur={() => saveSetToDb(gi, si)}
                        keyboardType="numeric"
                        editable={!workout.completed}
                        placeholderTextColor="#555"
                      />
                    </>
                  ) : (
                    <>
                      <TextInput
                        style={[styles.cellInput, styles.colValue]}
                        value={set.distanceKm}
                        onChangeText={(v) => updateSetField(gi, si, 'distanceKm', v)}
                        onBlur={() => saveSetToDb(gi, si)}
                        keyboardType="numeric"
                        editable={!workout.completed}
                        placeholderTextColor="#555"
                      />
                      <TextInput
                        style={[styles.cellInput, styles.colValue]}
                        value={set.durationMin}
                        onChangeText={(v) => updateSetField(gi, si, 'durationMin', v)}
                        onBlur={() => saveSetToDb(gi, si)}
                        keyboardType="numeric"
                        editable={!workout.completed}
                        placeholderTextColor="#555"
                      />
                    </>
                  )}

                  <Pressable
                    style={[
                      styles.colCheck,
                      styles.checkBtn,
                      set.completed && styles.checkBtnDone,
                    ]}
                    onPress={() => toggleSetCompleted(gi, si)}
                  >
                    <Text style={styles.checkBtnText}>✓</Text>
                  </Pressable>
                </View>
              ))}

              {/* Add set */}
              {!workout.completed && (
                <Pressable style={styles.addSetBtn} onPress={() => addSet(gi)}>
                  <Text style={styles.addSetText}>+ Add Set</Text>
                </Pressable>
              )}
            </SleekCard>
          ))}

          {/* Add exercise */}
          {!workout.completed && (
            <SleekButton
              title="Add Exercise"
              onPress={() => setShowPicker(true)}
              variant="secondary"
              style={{ marginTop: 24 }}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ── Styles ────────────────────────────────────────────── */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  screenPadding: {
    padding: 24,
    paddingBottom: 120,
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  mutedText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  retryButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.dark.primary,
    borderRadius: 999,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'Inter_600SemiBold',
  },

  /* ── Workout list ── */
  listCardDate: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  listCardMeta: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },

  /* ── Workout detail header ── */
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.primary,
  },
  dateLabel: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    marginTop: -8,
    marginBottom: 8,
  },

  /* ── Exercise card ── */
  exerciseTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
    marginBottom: 12,
  },

  /* ── Set table ── */
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerCell: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.textSecondary,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  colSet: {
    width: 40,
    textAlign: 'center',
    color: Colors.dark.textSecondary,
    fontFamily: 'Inter_500Medium',
  },
  colValue: {
    flex: 1,
    textAlign: 'center',
  },
  colCheck: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 15,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.text,
  },
  cellInput: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    color: Colors.dark.text,
    backgroundColor: 'transparent',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  checkBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBtnDone: {
    backgroundColor: Colors.dark.status,
    borderColor: Colors.dark.status,
  },
  checkBtnText: {
    color: '#fff',
    fontSize: 16,
  },
  addSetBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginTop: 12,
  },
  addSetText: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.primary,
  },

  /* ── Exercise picker ── */
  pickerContainer: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  pickerClose: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  pickerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
  },
  searchInput: {
    marginHorizontal: 24,
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginBottom: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionLetter: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textSecondary,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: Colors.dark.background,
  },
  exerciseRow: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  exerciseRowName: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.text,
  },
  exerciseRowType: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
});
