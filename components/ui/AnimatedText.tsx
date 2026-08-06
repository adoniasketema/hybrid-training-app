import React, { useEffect, useRef } from 'react';
import { Animated, TextProps, StyleProp, TextStyle } from 'react-native';

interface AnimatedTextProps extends TextProps {
  delay?: number;
  duration?: number;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
}

export function AnimatedText({ delay = 0, duration = 600, style, children, ...rest }: AnimatedTextProps) {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateYAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, duration]);

  return (
    <Animated.Text
      {...rest}
      style={[
        style,
        {
          opacity: opacityAnim,
          transform: [{ translateY: translateYAnim }],
        },
      ]}
    >
      {children}
    </Animated.Text>
  );
}
