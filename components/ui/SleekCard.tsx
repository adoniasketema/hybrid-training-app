import React from 'react';
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

interface SleekCardProps extends ViewProps {
  containerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function SleekCard({ containerStyle, children, ...rest }: SleekCardProps) {
  return (
    <View style={[styles.card, containerStyle]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.cardBackground,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)', // Very subtle blue border
    shadowColor: Colors.dark.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
});
