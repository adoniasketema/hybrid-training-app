import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface WeekStripProps {
  /** Set of ISO date strings (YYYY-MM-DD) that have a completed workout */
  completedDates: Set<string>;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/**
 * Monday→Sunday day pills for the current week. Completed days get a gold
 * fill, today is outlined in gold, other days sit muted.
 */
export function WeekStrip({ completedDates }: WeekStripProps) {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sun, 1 = Mon...
  const monday = new Date(today);
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(today.getDate() + offsetToMonday);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const isToday = iso === today.toISOString().slice(0, 10);
    const completed = completedDates.has(iso);
    return { iso, dayNum: d.getDate(), label: DAY_LABELS[i], completed, isToday };
  });

  return (
    <View style={styles.row}>
      {days.map((d) => (
        <View key={d.iso} style={styles.column}>
          <Text style={styles.dayLabel}>{d.label}</Text>
          <View
            style={[
              styles.pill,
              d.completed && styles.pillCompleted,
              d.isToday && !d.completed && styles.pillToday,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                d.completed && styles.pillTextCompleted,
                d.isToday && !d.completed && styles.pillTextToday,
              ]}
            >
              {d.dayNum}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  pill: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillCompleted: {
    backgroundColor: Colors.dark.primary,
    borderColor: Colors.dark.primary,
  },
  pillToday: {
    borderColor: Colors.dark.primary,
    borderWidth: 2,
  },
  pillText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  pillTextCompleted: {
    color: '#0A0A0A',
  },
  pillTextToday: {
    color: Colors.dark.primary,
  },
});
