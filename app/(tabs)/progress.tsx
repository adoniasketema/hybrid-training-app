import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useWorkout } from './workout-context';

export default function ProgressScreen() {
  const { workoutHistory, weeklySessions, streak } = useWorkout();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Progress</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current streak</Text>
        <Text style={styles.cardValue}>{streak} day{streak === 1 ? '' : 's'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>This week</Text>
        <Text style={styles.cardValue}>{weeklySessions} session{weeklySessions === 1 ? '' : 's'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Workout history</Text>
        {workoutHistory.length === 0 ? (
          <Text style={styles.cardText}>No workouts logged yet. Start today from the Workout tab.</Text>
        ) : (
          workoutHistory.map((workout) => (
            <View key={workout.id} style={styles.historyItem}>
              <Text style={styles.historyDate}>{workout.date}</Text>
              <Text style={styles.historyDetail}>{workout.entries.length} entries</Text>
              <Text style={styles.historyDetail}>{workout.completed ? 'Complete' : 'In progress'}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 14,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#007aff',
  },
  cardText: {
    fontSize: 15,
    color: '#444',
  },
  historyItem: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '700',
  },
  historyDetail: {
    fontSize: 14,
    color: '#555',
  },
});