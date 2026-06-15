import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { WorkoutProvider } from '@/hooks/workout-context';

import { Platform, StyleSheet } from 'react-native';

export default function AppLayout() {
  const colorScheme = useColorScheme();

  return (
    <WorkoutProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'dark'].tabIconSelected,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'dark'].tabIconDefault,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            position: 'absolute',
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: '#27272A', // Very dark grey border
            elevation: 0,
            backgroundColor: Colors[colorScheme ?? 'dark'].cardBackground,
            height: Platform.OS === 'ios' ? 88 : 60,
          },
          sceneContainerStyle: {
            backgroundColor: Colors[colorScheme ?? 'dark'].background,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="workout"
          options={{
            title: 'Workout',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="flame.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progress',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle" color={color} />,
          }}
        />
      </Tabs>
    </WorkoutProvider>
  );
}
