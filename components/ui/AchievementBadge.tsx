import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or short glyph — keeps this dep-free
  earned: boolean;
}

interface AchievementBadgeProps {
  achievement: Achievement;
}

/**
 * Chip-style achievement badge. Earned = gold-tinted; locked = muted with
 * padlock. Kept simple: single row of icon + name.
 */
export function AchievementBadge({ achievement }: AchievementBadgeProps) {
  const { name, description, icon, earned } = achievement;
  return (
    <View style={[styles.badge, earned ? styles.badgeEarned : styles.badgeLocked]}>
      <View style={[styles.iconWrap, earned ? styles.iconWrapEarned : styles.iconWrapLocked]}>
        <Text style={[styles.iconGlyph, !earned && styles.iconGlyphLocked]}>
          {earned ? icon : '\u{1F512}'}
        </Text>
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.name, !earned && styles.nameLocked]}>{name}</Text>
        <Text style={styles.desc}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  badgeEarned: {
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  badgeLocked: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapEarned: {
    backgroundColor: 'rgba(245,158,11,0.20)',
  },
  iconWrapLocked: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  iconGlyph: {
    fontSize: 18,
  },
  iconGlyphLocked: {
    opacity: 0.6,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  nameLocked: {
    color: 'rgba(255,255,255,0.55)',
  },
  desc: {
    color: Colors.dark.textSecondary,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
