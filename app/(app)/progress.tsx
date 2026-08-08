import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AchievementBadge, Achievement } from '@/components/ui/AchievementBadge';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { SleekCard } from '@/components/ui/SleekCard';
import { StatRing } from '@/components/ui/StatRing';
import { Colors } from '@/constants/theme';
import { computeAchievements, getPersonalRecords, getVolumeTotals, PersonalRecord } from '@/lib/records';
import { getWorkoutStats, WorkoutStats } from '@/lib/stats';

const EMPTY_STATS: WorkoutStats = {
  streak: 0,
  weeklySessions: 0,
  hasWorkoutToday: false,
  todayCount: 0,
  history: [],
};

const formatDateShort = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatVolume = (lbs: number) => {
  if (lbs >= 1000) return `${(lbs / 1000).toFixed(1)}k`;
  return String(Math.round(lbs));
};

export default function RecordsScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [stats, setStats] = useState<WorkoutStats>(EMPTY_STATS);
  const [prs, setPrs] = useState<PersonalRecord[]>([]);
  const [volume, setVolume] = useState({ allTime: 0, thisWeek: 0 });

  useFocusEffect(
    useCallback(() => {
      getWorkoutStats().then(setStats);
      getPersonalRecords().then(setPrs);
      getVolumeTotals().then(setVolume);
    }, [])
  );

  const achievements: Achievement[] = computeAchievements(stats, prs, volume);
  const earnedCount = achievements.filter((a) => a.earned).length;
  const sessionsCount = stats.history.length;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader eyebrow="Your Activity" title="Records" />

        {/* Personal records — the marquee stat, up top */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Records</Text>
          {prs.length === 0 ? (
            <Text style={styles.mutedText}>Log a strength set with weight to unlock your first PR.</Text>
          ) : (
            <View style={[styles.prGrid, isMobile && { flexDirection: 'column' }]}>
              {prs.map((pr) => (
                <SleekCard key={pr.exerciseId} containerStyle={[styles.prCard, isMobile && { flex: undefined, width: '100%' }]}>
                  <Text style={styles.prExercise}>{pr.exerciseName}</Text>
                  <Text style={styles.prValue}>
                    {Math.round(pr.maxWeightLbs)}
                    <Text style={styles.prUnit}> lb</Text>
                  </Text>
                  <Text style={styles.prMeta}>
                    × {pr.atReps} · {formatDateShort(pr.atDate)}
                  </Text>
                </SleekCard>
              ))}
            </View>
          )}
        </View>

        {/* Streak / totals hero */}
        <View style={styles.heroCard}>
          <View style={styles.heroInner}>
            <StatRing
              value={stats.streak}
              max={7}
              label="Streak"
              unit={stats.streak === 1 ? 'day' : 'days'}
              size={140}
            />
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>
                {stats.streak > 0 ? `${stats.streak}-day fire.` : 'Start a streak.'}
              </Text>
              <Text style={styles.heroBody}>
                {stats.streak > 0
                  ? "Consistency beats intensity. Don't break the chain."
                  : 'Log a session today to light the fuse.'}
              </Text>
              <View style={styles.heroStats}>
                <View>
                  <Text style={styles.heroStatNum}>{sessionsCount}</Text>
                  <Text style={styles.heroStatLabel}>Total sessions</Text>
                </View>
                <View>
                  <Text style={styles.heroStatNum}>{formatVolume(volume.allTime)}</Text>
                  <Text style={styles.heroStatLabel}>All-time lb</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.sectionMeta}>
              {earnedCount} / {achievements.length} unlocked
            </Text>
          </View>
          <View style={[styles.achievementGrid, isMobile && { flexDirection: 'column' }]}>
            {achievements.map((a) => (
              <View key={a.id} style={[styles.achievementCell, isMobile && { flex: undefined, width: '100%' }]}>
                <AchievementBadge achievement={a} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  content: { padding: 24, paddingBottom: 120, gap: 32 },

  heroCard: {
    backgroundColor: 'rgba(20,20,22,0.75)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.20)',
    padding: 24,
  },
  heroInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    flexWrap: 'wrap',
  },
  heroText: {
    flex: 1,
    minWidth: 200,
    gap: 8,
  },
  heroTitle: {
    color: '#FFF',
    fontSize: 26,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.5,
  },
  heroBody: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 21,
  },
  heroStats: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 8,
  },
  heroStatNum: {
    color: Colors.dark.primary,
    fontSize: 22,
    fontFamily: 'Inter_800ExtraBold',
  },
  heroStatLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  section: { gap: 16 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.3,
  },
  sectionMeta: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  mutedText: {
    color: Colors.dark.textSecondary,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },

  prGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  prCard: {
    flex: 1,
    minWidth: 180,
    padding: 20,
    gap: 6,
  },
  prExercise: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  prValue: {
    color: '#FFF',
    fontSize: 34,
    fontFamily: 'Inter_900Black',
    letterSpacing: -1,
  },
  prUnit: {
    color: Colors.dark.textSecondary,
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0,
  },
  prMeta: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },

  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  achievementCell: {
    flex: 1,
    minWidth: 240,
  },
});
