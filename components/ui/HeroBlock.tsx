import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface HeroBlockProps {
  photo?: number;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  children?: React.ReactNode;
  height?: number;
}

/**
 * Big photo-backed hero for in-app screens. Full-bleed image (or dark
 * background if omitted) + dark bottom gradient + display type. `children`
 * renders under the subtitle for a CTA row.
 */
export function HeroBlock({ photo, eyebrow, title, subtitle, children, height = 320 }: HeroBlockProps) {
  return (
    <View style={[styles.container, { height }]}>
      {photo ? (
        <Image source={photo} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="center" />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#141414' }]} />
      )}

      <LinearGradient
        colors={['rgba(10,10,10,0.15)', 'rgba(10,10,10,0.55)', 'rgba(10,10,10,0.95)']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.content}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children ? <View style={styles.childrenRow}>{children}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  content: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    gap: 8,
  },
  eyebrow: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  title: {
    color: '#FFF',
    fontSize: 44,
    fontFamily: 'Inter_900Black',
    letterSpacing: -1.5,
    lineHeight: 46,
    marginTop: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    marginTop: 6,
    lineHeight: 22,
  },
  childrenRow: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
});
