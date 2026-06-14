import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useWorkout } from './workout-context';
import { SleekCard } from '@/components/ui/SleekCard';
import { SleekButton } from '@/components/ui/SleekButton';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { todayLog, weeklySessions, streak } = useWorkout();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Welcome back. Stay consistent.</Text>
        
        <SleekCard containerStyle={styles.headerCard}>
          <Text style={styles.cardTitle}>Today's Session</Text>
          <Text style={styles.cardValue}>{todayLog ? (todayLog.completed ? 'Completed' : 'In Progress') : 'Ready to Start'}</Text>
          <Text style={styles.cardText}>{todayLog ? `${todayLog.entries.length} entries logged` : 'No workout started yet.'}</Text>
          
          <SleekButton 
            title={todayLog ? "CONTINUE" : "START NEW"} 
            onPress={() => router.push('/tabs/workout')} 
            variant="primary" 
            style={styles.button} 
          />
        </SleekCard>

        <View style={styles.statRow}>
          <SleekCard containerStyle={styles.statCard}>
            <Text style={styles.statLabel}>Weekly</Text>
            <Text style={styles.statValue}>{weeklySessions}</Text>
          </SleekCard>
          <SleekCard containerStyle={styles.statCard}>
            <Text style={styles.statLabel}>Streak</Text>
            <Text style={styles.statValue}>{streak}</Text>
          </SleekCard>
        </View>

        <SleekCard containerStyle={styles.infoCard}>
          <Text style={styles.cardTitle}>Overview</Text>
          <Text style={styles.cardText}>Track strength and cardio efficiently. Keep logging your progress to build your profile.</Text>
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
  container: {
    padding: 24,
    paddingBottom: 120, // accommodate bottom tab
    gap: 20,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  headerCard: {
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 28,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  cardText: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    lineHeight: 22,
  },
  statRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.textSecondary,
  },
  statValue: {
    fontSize: 36,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    letterSpacing: -1,
  },
  infoCard: {
    gap: 8,
  },
  button: {
    marginTop: 16,
  },
});
