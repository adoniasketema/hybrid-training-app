import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useWorkout } from './workout-context';
import { SleekCard } from '@/components/ui/SleekCard';
import { Colors } from '@/constants/theme';

export default function ProgressScreen() {
  const { workoutHistory, weeklySessions, streak } = useWorkout();

  const weeklyGoal = 5;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Progress</Text>

        <View style={styles.heroRow}>
          <SleekCard containerStyle={styles.statCard}>
            <Text style={styles.statLabel}>Current Streak</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statUnit}>day{streak === 1 ? '' : 's'}</Text>
            </View>
          </SleekCard>

          <SleekCard containerStyle={styles.statCard}>
            <Text style={styles.statLabel}>This Week</Text>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{weeklySessions}</Text>
              <Text style={styles.statUnit}>/ {weeklyGoal}</Text>
            </View>
          </SleekCard>
        </View>

        <SleekCard containerStyle={styles.historyCard}>
          <Text style={styles.historyCardTitle}>Workout History</Text>
          {workoutHistory.length === 0 ? (
            <Text style={styles.cardText}>No workouts logged yet. Your history will appear here.</Text>
          ) : (
            workoutHistory.map((workout, index) => (
              <View key={workout.id} style={[styles.historyItem, index === 0 && styles.historyItemFirst]}>
                <View style={styles.historyItemHeader}>
                  <Text style={styles.historyDate}>{workout.date}</Text>
                  <Text style={[styles.historyStatus, workout.completed && styles.historyStatusDone]}>
                    {workout.completed ? 'Completed' : 'In Progress'}
                  </Text>
                </View>
                <Text style={styles.historyDetail}>{workout.entries.length} entries</Text>
              </View>
            ))
          )}
        </SleekCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 24,
    paddingBottom: 120, // Tab bar padding
    gap: 16,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 20,
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statValue: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    letterSpacing: -1,
  },
  statUnit: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.textSecondary,
    marginLeft: 6,
  },
  historyCard: {
    marginTop: 8,
  },
  historyCardTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  cardText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
  historyItem: {
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyItemFirst: {
    borderTopWidth: 0,
    paddingTop: 4,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyDate: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
  },
  historyStatus: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.primary,
  },
  historyStatusDone: {
    color: Colors.dark.status,
  },
  historyDetail: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
  },
});