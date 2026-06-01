import { useState } from 'react';
import { Alert, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useWorkout } from './workout-context';

const exerciseModes = ['strength', 'cardio'] as const;

type ExerciseMode = typeof exerciseModes[number];

export default function WorkoutScreen() {
  const { todayLog, startWorkout, addStrengthEntry, addCardioEntry, completeWorkout } = useWorkout();
  const [mode, setMode] = useState<ExerciseMode>('strength');
  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('8');
  const [weight, setWeight] = useState('50');
  const [distance, setDistance] = useState('3');
  const [duration, setDuration] = useState('20');

  const addEntry = () => {
    if (!exerciseName.trim()) {
      Alert.alert('Enter an exercise name');
      return;
    }

    if (mode === 'strength') {
      const setsNumber = Number(sets);
      const repsNumber = Number(reps);
      const weightNumber = Number(weight);

      if (!setsNumber || !repsNumber || !weightNumber) {
        Alert.alert('Enter sets, reps, and weight for strength work.');
        return;
      }

      addStrengthEntry(exerciseName.trim(), setsNumber, repsNumber, weightNumber);
    } else {
      const distanceNumber = Number(distance);
      const durationNumber = Number(duration);

      if (!distanceNumber || !durationNumber) {
        Alert.alert('Enter distance and duration for cardio work.');
        return;
      }

      addCardioEntry(exerciseName.trim(), distanceNumber, durationNumber);
    }

    setExerciseName('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Workout Logger</Text>

        {!todayLog ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Ready for today?</Text>
            <Text style={styles.cardText}>Start a workout and log strength or cardio sessions in one place.</Text>
            <Button title="Start Today&apos;s Workout" onPress={startWorkout} />
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Today&apos;s Workout</Text>
              <Text style={styles.cardText}>{todayLog.completed ? 'Completed' : 'In progress'}</Text>
              <Text style={styles.cardText}>{todayLog.entries.length} exercise entries logged</Text>
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
              {todayLog.entries.length === 0 ? (
                <Text style={styles.cardText}>No entries yet. Add your first set or cardio session.</Text>
              ) : (
                todayLog.entries.map((entry) => (
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
              title={todayLog.completed ? 'Workout Complete' : 'Mark Workout Complete'}
              onPress={completeWorkout}
              disabled={todayLog.completed || todayLog.entries.length === 0}
            />
          </>
        )}
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