import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeroBlock } from '@/components/ui/HeroBlock';
import { MonthCalendar } from '@/components/ui/MonthCalendar';
import { SessionFeedCard } from '@/components/ui/SessionFeedCard';
import { StatRing } from '@/components/ui/StatRing';
import { Colors } from '@/constants/theme';
import { getSessionFeed, getVolumeTotals, SessionSummary } from '@/lib/records';
import { getWorkoutStats, WorkoutStats } from '@/lib/stats';
import { supabase } from '@/lib/supabase';

const EMPTY_STATS: WorkoutStats = {
  streak: 0,
  weeklySessions: 0,
  hasWorkoutToday: false,
  todayCount: 0,
  history: [],
};

const formatDayLong = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const formatVolume = (lbs: number) => {
  if (lbs >= 1000) return `${(lbs / 1000).toFixed(1)}k`;
  return String(Math.round(lbs));
};

const HERO_PHOTO = require('@/assets/images/gym-weightroom.png');

export default function TodayScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [stats, setStats] = useState<WorkoutStats>(EMPTY_STATS);
  const [feed, setFeed] = useState<SessionSummary[]>([]);
  const [volume, setVolume] = useState({ allTime: 0, thisWeek: 0 });

  const fetchAll = useCallback(() => {
    getWorkoutStats().then(setStats);
    getSessionFeed().then(setFeed);
    getVolumeTotals().then(setVolume);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
      
      // Subscribe to real-time changes on the workouts table
      const channel = supabase.channel('public:workouts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workouts' }, payload => {
          console.log('Real-time update received!', payload);
          // Refetch data when a real-time event occurs
          fetchAll();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }, [fetchAll])
  );

  const today = new Date();
  const heroTitle = stats.hasWorkoutToday
    ? "YOU'RE ON."
    : stats.streak > 0
    ? 'STAY ON.'
    : "IT'S GO TIME";
  const heroSubtitle = stats.hasWorkoutToday
    ? "Nice work — you've logged today. Keep the streak alive tomorrow."
    : stats.streak > 0
    ? `You're on a ${stats.streak}-day streak. Don't let it break.`
    : 'Start your first session and put a workout on the board.';

  const completedDates = new Set(feed.filter((s) => s.completed).map((s) => s.date));
  const latest = feed[0];

  const ringSize = isMobile ? 104 : 128;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <HeroBlock
          photo={HERO_PHOTO}
          eyebrow={formatDayLong(today)}
          title={heroTitle}
          subtitle={heroSubtitle}
          height={isMobile ? 340 : 380}
        >
          <Pressable
            onPress={() => router.push('/workout')}
            style={({ hovered }: any) => [styles.ctaPrimary, hovered && { backgroundColor: '#D97706' }]}
          >
            <Text style={styles.ctaPrimaryText}>START SESSION</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/workout')}
            style={({ hovered }: any) => [styles.ctaSecondary, hovered && { borderColor: '#FFF' }]}
          >
            <Text style={styles.ctaSecondaryText}>VIEW SESSIONS</Text>
          </Pressable>
        </HeroBlock>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          <MonthCalendar completedDates={completedDates} />
        </View>

        <View style={[styles.ringsRow, isMobile && { justifyContent: 'space-around' }]}>
          <StatRing value={stats.weeklySessions} max={5} label="Week" unit="of 5" size={ringSize} />
          <StatRing
            value={stats.streak}
            max={7}
            label="Streak"
            unit={stats.streak === 1 ? 'day' : 'days'}
            size={ringSize}
          />
          <StatRing
            value={volume.thisWeek}
            max={volume.thisWeek > 0 ? Math.max(volume.thisWeek, 20000) : 20000}
            label="Volume"
            unit="lb"
            format={formatVolume}
            size={ringSize}
          />
        </View>

        {latest ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest Session</Text>
              <Pressable onPress={() => router.push('/workout')}>
                <Text style={styles.linkText}>See all →</Text>
              </Pressable>
            </View>
            <SessionFeedCard session={latest} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    padding: 24,
    paddingBottom: 120,
    gap: 32,
  },
  section: {
    gap: 16,
  },
  sectionHeader: {
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
  linkText: {
    color: Colors.dark.primary,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },
  ringsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 16,
  },
  ctaPrimary: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  ctaPrimaryText: {
    color: '#0A0A0A',
    fontSize: 13,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 2,
  },
  ctaSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
  },
  ctaSecondaryText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },
});
