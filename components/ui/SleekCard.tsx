import React from 'react';
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors } from '@/constants/theme';

interface SleekCardProps extends ViewProps {
  containerStyle?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function SleekCard({ containerStyle, children, ...rest }: SleekCardProps) {
  return (
    <BlurView 
      intensity={Platform.OS === 'web' ? 40 : 20} 
      tint="dark" 
      style={[styles.card, containerStyle]} 
      {...rest}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(26, 28, 35, 0.4)', // highly transparent
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderTopColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
});
