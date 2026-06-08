import { useRouter } from 'expo-router';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useWorkout } from './workout-context';

export default function HomeScreen() {
  const router = useRouter();
  const { todayLog, weeklySessions, streak } = useWorkout();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Hybrid Training Pro</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today&apos;s workout</Text>
        <Text style={styles.cardValue}>{todayLog ? (todayLog.completed ? 'Completed' : 'In progress') : 'Ready to start'}</Text>
        <Text style={styles.cardText}>{todayLog ? `${todayLog.entries.length} entries logged` : 'Start your workout in the Workout tab.'}</Text>
      </View>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Weekly</Text>
          <Text style={styles.statValue}>{weeklySessions}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Streak</Text>
          <Text style={styles.statValue}>{streak}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Training overview</Text>
        <Text style={styles.cardText}>Track strength and cardio in one place. Log supersets, interval runs, and recovery days as you go.</Text>
      </View>

      <Button title="Choose a Workout" onPress={() => router.push('/tabs/workout')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#f2f2f7',
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#007aff',
  },
  cardText: {
    fontSize: 15,
    color: '#4f4f4f',
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
  },
});
