import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View, Animated, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '@/constants/theme';

interface SleekButtonProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'accent';
  onPress: () => void;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function SleekButton({ title, variant = 'primary', onPress, icon, style, textStyle }: SleekButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  let bgColor = Colors.dark.primary;
  let textColor = '#FFFFFF';
  let borderColor = Colors.dark.primary;
  let glowOpacity = 0.2;

  if (variant === 'secondary') {
    bgColor = 'transparent';
    textColor = Colors.dark.secondary;
    borderColor = Colors.dark.secondary;
    glowOpacity = 0.1;
  } else if (variant === 'accent') {
    bgColor = Colors.dark.secondary;
    borderColor = Colors.dark.secondary;
    glowOpacity = 0.4;
  }

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.button,
          { 
            backgroundColor: bgColor,
            borderWidth: 1,
            borderColor: borderColor,
            shadowColor: borderColor,
            shadowOpacity: glowOpacity,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
            elevation: variant === 'secondary' ? 0 : 4,
          },
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.text, { color: textColor }, textStyle]}>{title}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 9999, // Pill shape
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 0.5,
  },
});
