import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';

/**
 * Ambient chrome for the authenticated app shell: solid base + two soft
 * gold-tinted gradient glows. Replaces the old ImageBackground (a faint
 * design-reference screenshot) with intentional, on-brand gradient chrome.
 */
export function AppBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(245,158,11,0.10)', 'rgba(245,158,11,0)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.6 }}
        style={[styles.glow, styles.glowTopRight]}
      />
      <LinearGradient
        colors={['rgba(245,158,11,0.06)', 'rgba(245,158,11,0)']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0.5, y: 0.4 }}
        style={[styles.glow, styles.glowBottomLeft]}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    flex: 1,
  },
  glow: {
    position: 'absolute',
    width: '70%',
    height: '55%',
  },
  glowTopRight: {
    top: 0,
    right: 0,
  },
  glowBottomLeft: {
    bottom: 0,
    left: 0,
  },
});
