import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Platform, StyleSheet, View, ImageBackground, useWindowDimensions } from 'react-native';
import { Sidebar } from '@/components/ui/Sidebar';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  return (
    <ImageBackground 
      source={require('@/assets/images/hero-bg.png')} 
      style={{ flex: 1 }} 
      imageStyle={{ opacity: 0.15 }}
    >
      <View style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column', backgroundColor: 'rgba(10, 10, 10, 0.7)' }}>
        {isDesktop && <Sidebar />}
        
        <View style={{ flex: 1 }}>
          <ResponsiveContainer>
            <Tabs
              screenOptions={{
                tabBarActiveTintColor: theme.tabIconSelected,
                tabBarInactiveTintColor: theme.tabIconDefault,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarStyle: isDesktop ? { display: 'none' } : {
                  position: 'absolute',
                  borderTopWidth: StyleSheet.hairlineWidth,
                  borderTopColor: '#27272A',
                  elevation: 0,
                  backgroundColor: theme.cardBackground,
                  height: Platform.OS === 'ios' ? 88 : 60,
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
          </ResponsiveContainer>
        </View>
      </View>
    </ImageBackground>
  );
}