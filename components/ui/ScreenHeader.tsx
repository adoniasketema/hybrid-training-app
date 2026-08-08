import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimatedText } from '@/components/ui/AnimatedText';
import { Colors } from '@/constants/theme';

interface ScreenHeaderProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
}

/**
 * Compact premium header for dashboard screens. Gold uppercase eyebrow +
 * large animated title + thin gold accent rule + optional subtitle. Matches
 * the type scale used by the marketing pages' PageHero eyebrow.
 */
export function ScreenHeader({ eyebrow, title, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <AnimatedText style={styles.title} delay={80}>{title}</AnimatedText>
      <View style={styles.accentRule} />
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.primary,
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  accentRule: {
    width: 48,
    height: 2,
    borderRadius: 1,
    backgroundColor: Colors.dark.primary,
    marginTop: 12,
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    marginTop: 12,
    lineHeight: 22,
  },
});
