import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { photoForWorkout } from '@/components/ui/session-photo';
import { daysAgoKey, localDayKey } from '@/lib/date';

export interface SessionFeedItem {
  id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  exerciseNames?: string[];
  setCount?: number;
  totalVolumeLbs?: number;
}

interface SessionFeedCardProps {
  session: SessionFeedItem;
  compact?: boolean;
}

const formatDate = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

const relativeDay = (iso: string) => {
  const d = new Date(iso + 'T00:00:00');
  const now = new Date();
  if (iso === localDayKey(now)) return 'TODAY';
  if (iso === daysAgoKey(1, now)) return 'YESTERDAY';
  const diffDays = Math.round((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 7) return `${diffDays}D AGO`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}W AGO`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
};

/**
 * The signature feed card used on Today and Sessions. Photo hero + dark
 * bottom gradient + workout metadata. Taps route into the workout detail.
 */
export function SessionFeedCard({ session, compact = false }: SessionFeedCardProps) {
  const router = useRouter();
  const photo = photoForWorkout(session.id);
  const height = compact ? 180 : 220;

  return (
    <Pressable
      onPress={() => router.push(`/workout?workoutId=${session.id}`)}
      style={({ hovered, pressed }: any) => [
        styles.card,
        { height },
        (hovered || pressed) && styles.cardHovered,
      ]}
    >
      <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />

      <LinearGradient
        colors={['rgba(10,10,10,0.15)', 'rgba(10,10,10,0.55)', 'rgba(10,10,10,0.92)']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.top}>
        <View style={[styles.statusChip, !session.completed && styles.statusChipInProgress]}>
          <Text style={[styles.statusChipText, !session.completed && styles.statusChipTextInProgress]}>
            {session.completed ? 'COMPLETED' : 'IN PROGRESS'}
          </Text>
        </View>
        <Text style={styles.relDate}>{relativeDay(session.date)}</Text>
      </View>

      <View style={styles.bottom}>
        <Text style={styles.date}>{formatDate(session.date)}</Text>

        {session.exerciseNames && session.exerciseNames.length > 0 ? (
          <View style={styles.chipRow}>
            {session.exerciseNames.slice(0, 3).map((name) => (
              <View key={name} style={styles.exChip}>
                <Text style={styles.exChipText}>{name}</Text>
              </View>
            ))}
            {session.exerciseNames.length > 3 ? (
              <View style={styles.exChip}>
                <Text style={styles.exChipText}>+{session.exerciseNames.length - 3}</Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={styles.metaRow}>
          {session.totalVolumeLbs !== undefined ? (
            <Text style={styles.metaText}>
              <Text style={styles.metaNum}>{Math.round(session.totalVolumeLbs).toLocaleString()}</Text> lb
            </Text>
          ) : null}
          {session.setCount !== undefined ? (
            <Text style={styles.metaText}>
              <Text style={styles.metaNum}>{session.setCount}</Text> {session.setCount === 1 ? 'set' : 'sets'}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  cardHovered: {
    borderColor: 'rgba(245,158,11,0.35)',
  },
  top: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    backgroundColor: 'rgba(245,158,11,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.45)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusChipInProgress: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.30)',
  },
  statusChipText: {
    color: Colors.dark.primary,
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 1.5,
  },
  statusChipTextInProgress: {
    color: '#FFF',
  },
  relDate: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.5,
    backgroundColor: 'rgba(10,10,10,0.5)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  bottom: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    gap: 10,
  },
  date: {
    color: '#FFF',
    fontSize: 24,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.5,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  exChip: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  exChipText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 4,
  },
  metaText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  metaNum: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Inter_800ExtraBold',
  },
});
