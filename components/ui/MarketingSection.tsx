import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Colors } from '@/constants/theme';
import { SleekCard } from '@/components/ui/SleekCard';
import { IconSymbol } from '@/components/ui/icon-symbol';

export function MarketingSection({
  eyebrow,
  title,
  intro,
  children,
  dark = false,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: React.ReactNode;
  dark?: boolean;
}) {
  return (
    <View style={[styles.section, { backgroundColor: dark ? '#0A0A0A' : '#0D0D0D' }]}>
      <View style={styles.header}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {intro ? <Text style={styles.intro}>{intro}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export type FeatureCardItem = {
  title: string;
  desc: string;
  meta?: string[];
  accent?: string;
};

export function CardGrid({ items, minCardWidth = 320 }: { items: FeatureCardItem[]; minCardWidth?: number }) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 48, 1200);
  const columns = Math.max(1, Math.floor(contentWidth / minCardWidth));
  const gap = 20;
  const cardWidth = columns === 1 ? '100%' : (contentWidth - gap * (columns - 1)) / columns;

  return (
    <View style={[styles.grid, { gap, maxWidth: 1200 }]}>
      {items.map((item, i) => (
        <SleekCard key={i} containerStyle={[styles.card, { width: cardWidth as any }]}>
          {item.accent ? <View style={[styles.accentBar, { backgroundColor: item.accent }]} /> : null}
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardDesc}>{item.desc}</Text>
          {item.meta && item.meta.length > 0 ? (
            <View style={styles.metaRow}>
              {item.meta.map((m, mi) => (
                <View key={mi} style={styles.metaPill}>
                  <Text style={styles.metaText}>{m}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </SleekCard>
      ))}
    </View>
  );
}

export type LocationItem = { name: string; address: string; hours: string };

export function LocationGrid({ locations }: { locations: LocationItem[] }) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 48, 1200);
  const columns = Math.max(1, Math.floor(contentWidth / 320));
  const gap = 20;
  const cardWidth = columns === 1 ? '100%' : (contentWidth - gap * (columns - 1)) / columns;

  return (
    <View style={[styles.grid, { gap, maxWidth: 1200 }]}>
      {locations.map((loc, i) => (
        <SleekCard key={i} containerStyle={[styles.card, { width: cardWidth as any, minHeight: 180 }]}>
          <View style={styles.locHeader}>
            <IconSymbol name="mappin.and.ellipse" size={22} color={Colors.dark.primary} />
            <Text style={styles.locName}>{loc.name}</Text>
          </View>
          <Text style={styles.locAddress}>{loc.address}</Text>
          <View style={styles.locHoursRow}>
            <IconSymbol name="clock.fill" size={15} color="#888" />
            <Text style={styles.locHours}>{loc.hours}</Text>
          </View>
        </SleekCard>
      ))}
    </View>
  );
}

export type TrainerItem = { name: string; specialty: string; initials: string };

export function TrainerGrid({ trainers }: { trainers: TrainerItem[] }) {
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width - 48, 1200);
  const columns = Math.max(1, Math.floor(contentWidth / 240));
  const gap = 20;
  const cardWidth = columns === 1 ? '100%' : (contentWidth - gap * (columns - 1)) / columns;

  return (
    <View style={[styles.grid, { gap, maxWidth: 1200 }]}>
      {trainers.map((t, i) => (
        <SleekCard key={i} containerStyle={[styles.trainerCard, { width: cardWidth as any }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{t.initials}</Text>
          </View>
          <Text style={styles.trainerName}>{t.name}</Text>
          <Text style={styles.trainerSpecialty}>{t.specialty}</Text>
        </SleekCard>
      ))}
    </View>
  );
}

export function StatsBar({ stats }: { stats: { value: string; label: string }[] }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  return (
    <View style={styles.statsBar}>
      {stats.map((stat, i) => (
        <View key={i} style={[styles.statItem, i < stats.length - 1 && !isMobile && styles.statDivider]}>
          <Text style={styles.statValue}>{stat.value}</Text>
          <Text style={styles.statLabel}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: '#111',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  statValue: {
    color: Colors.dark.primary,
    fontSize: 40,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -1,
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  section: {
    paddingVertical: 90,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    maxWidth: 720,
    marginBottom: 56,
  },
  eyebrow: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    color: '#FFF',
    fontSize: 34,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  intro: {
    color: '#999',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
  },
  card: {
    minHeight: 200,
    justifyContent: 'flex-start',
  },
  accentBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 16,
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
    marginBottom: 10,
  },
  cardDesc: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 18,
  },
  metaPill: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  metaText: {
    color: Colors.dark.primary,
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  trainerCard: {
    alignItems: 'center',
    minHeight: 200,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    color: Colors.dark.primary,
    fontSize: 24,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 1,
  },
  trainerName: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    textAlign: 'center',
  },
  trainerSpecialty: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginTop: 6,
  },
  locHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  locName: {
    color: '#FFF',
    fontSize: 19,
    fontFamily: 'Inter_700Bold',
    flex: 1,
  },
  locAddress: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    marginBottom: 16,
  },
  locHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locHours: {
    color: '#888',
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
});
