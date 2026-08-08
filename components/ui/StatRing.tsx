import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/theme';

interface StatRingProps {
  value: number;
  max?: number;
  label: string;
  unit?: string;
  /** Format the center number (e.g. `12400 → "12.4k"`) */
  format?: (v: number) => string;
  color?: string;
  size?: number;
}

/**
 * Circular progress ring rendered via CSS conic-gradient (works in
 * react-native-web without needing react-native-svg). Big number in center,
 * short label under it. Falls back to a plain bordered circle on native.
 */
export function StatRing({
  value,
  max,
  label,
  unit,
  format,
  color = Colors.dark.primary,
  size = 128,
}: StatRingProps) {
  // No max = "achievement" ring, always full
  const pct = max ? Math.min(100, (value / max) * 100) : value > 0 ? 100 : 0;
  const trackColor = 'rgba(255,255,255,0.08)';
  const displayValue = format ? format(value) : String(value);

  const isWeb = Platform.OS === 'web';

  const ringStyle: any = isWeb
    ? {
        width: size,
        height: size,
        borderRadius: size / 2,
        // conic-gradient renders the arc on web; the trackColor fills the rest.
        backgroundImage: `conic-gradient(${color} ${pct * 3.6}deg, ${trackColor} ${pct * 3.6}deg)`,
      }
    : {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 6,
        borderColor: color,
      };

  const innerSize = size - 16;

  return (
    <View style={styles.container}>
      <View style={ringStyle}>
        <View
          style={[
            styles.inner,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              top: 8,
              left: 8,
            },
          ]}
        >
          <Text style={styles.value}>{displayValue}</Text>
          {unit ? <Text style={styles.unit}>{unit}</Text> : null}
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  inner: {
    position: 'absolute',
    backgroundColor: '#111214',
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    color: '#FFF',
    fontSize: 28,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.5,
  },
  unit: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  label: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
