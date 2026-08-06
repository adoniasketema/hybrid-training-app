import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';

export function ResponsiveContainer({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <View style={styles.outer}>
      <View style={[styles.inner, isDesktop && styles.desktopInner]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    // On web, this ensures the container takes full height and acts as a scrolling parent if needed
    ...(Platform.OS === 'web' ? { height: '100%' as const, overflow: 'hidden' as const } : {}),
  },
  inner: {
    flex: 1,
    width: '100%',
  },
  desktopInner: {
    maxWidth: 1200, // Constrain width on large screens
    alignSelf: 'center',
  },
});
