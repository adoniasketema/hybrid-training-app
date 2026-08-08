import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface MonthCalendarProps {
  completedDates: Set<string>;
  onSelectDate?: (iso: string) => void;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const iso = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 6×7 month grid with prev/next arrows. Days that appear in
 * `completedDates` get a gold fill; today gets a gold outline. Days outside
 * the current month render muted.
 */
export function MonthCalendar({ completedDates, onSelectDate }: MonthCalendarProps) {
  const now = new Date();
  const [cursor, setCursor] = useState(new Date(now.getFullYear(), now.getMonth(), 1));

  const todayIso = iso(now);

  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  // Grid starts on Monday of the week containing the 1st.
  const startDay = monthStart.getDay(); // 0 = Sun
  const offsetToMonday = startDay === 0 ? -6 : 1 - startDay;
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() + offsetToMonday);

  const days = Array.from({ length: 42 }).map((_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return {
      iso: iso(d),
      dayNum: d.getDate(),
      inMonth: d.getMonth() === cursor.getMonth(),
      completed: completedDates.has(iso(d)),
      isToday: iso(d) === todayIso,
    };
  });

  const shiftMonth = (delta: number) => {
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1));
  };

  return (
    <View style={styles.container}>
      {/* Header: prev / month year / next */}
      <View style={styles.header}>
        <Pressable
          onPress={() => shiftMonth(-1)}
          style={({ hovered }: any) => [styles.navBtn, hovered && styles.navBtnHovered]}
        >
          <Text style={styles.navBtnText}>‹</Text>
        </Pressable>
        <View style={styles.monthTitleWrap}>
          <Text style={styles.monthTitle}>
            {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
          </Text>
        </View>
        <Pressable
          onPress={() => shiftMonth(1)}
          style={({ hovered }: any) => [styles.navBtn, hovered && styles.navBtnHovered]}
        >
          <Text style={styles.navBtnText}>›</Text>
        </Pressable>
      </View>

      {/* Day-of-week labels */}
      <View style={styles.dayLabelRow}>
        {DAY_LABELS.map((l, i) => (
          <Text key={i} style={styles.dayLabel}>
            {l}
          </Text>
        ))}
      </View>

      {/* 6 rows of 7 */}
      {[0, 1, 2, 3, 4, 5].map((row) => (
        <View key={row} style={styles.weekRow}>
          {days.slice(row * 7, row * 7 + 7).map((d) => (
            <Pressable
              key={d.iso}
              onPress={() => onSelectDate?.(d.iso)}
              style={({ hovered }: any) => [
                styles.cell,
                d.completed && styles.cellCompleted,
                d.isToday && !d.completed && styles.cellToday,
                hovered && !d.completed && styles.cellHovered,
              ]}
            >
              <Text
                style={[
                  styles.cellText,
                  !d.inMonth && styles.cellTextOutside,
                  d.completed && styles.cellTextCompleted,
                  d.isToday && !d.completed && styles.cellTextToday,
                ]}
              >
                {d.dayNum}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(20,20,22,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  navBtnHovered: {
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  navBtnText: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    lineHeight: 22,
  },
  monthTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  monthTitle: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.3,
  },
  dayLabelRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dayLabel: {
    flex: 1,
    textAlign: 'center',
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  weekRow: {
    flexDirection: 'row',
    gap: 4,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cellCompleted: {
    backgroundColor: Colors.dark.primary,
  },
  cellToday: {
    borderColor: Colors.dark.primary,
    borderWidth: 1.5,
  },
  cellHovered: {
    backgroundColor: 'rgba(245,158,11,0.08)',
    borderColor: 'rgba(245,158,11,0.25)',
  },
  cellText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  cellTextOutside: {
    color: 'rgba(255,255,255,0.18)',
  },
  cellTextCompleted: {
    color: '#0A0A0A',
    fontFamily: 'Inter_800ExtraBold',
  },
  cellTextToday: {
    color: Colors.dark.primary,
  },
});
