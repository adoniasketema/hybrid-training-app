import { Tabs } from 'expo-router';
import React, { useState } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { AppBackground } from '@/components/ui/AppBackground';
import { Sidebar } from '@/components/ui/Sidebar';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AppBackground>
      <View style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column' }}>
        {isDesktop && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((v) => !v)}
          />
        )}

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
                  title: 'Today',
                  tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
                }}
              />
              <Tabs.Screen
                name="workout"
                options={{
                  title: 'Sessions',
                  tabBarIcon: ({ color }) => <IconSymbol size={28} name="flame.fill" color={color} />,
                }}
              />
              <Tabs.Screen
                name="progress"
                options={{
                  title: 'Records',
                  tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
                }}
              />
              <Tabs.Screen
                name="profile"
                options={{
                  title: 'You',
                  tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.crop.circle" color={color} />,
                }}
              />
            </Tabs>
          </ResponsiveContainer>
        </View>
      </View>
    </AppBackground>
  );
}