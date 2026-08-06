import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function Sidebar() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const pathname = usePathname();

  const NAV_ITEMS = [
    { name: 'index', title: 'Home', icon: 'house.fill', path: '/' },
    { name: 'workout', title: 'Workout', icon: 'flame.fill', path: '/workout' },
    { name: 'progress', title: 'Progress', icon: 'chart.bar.fill', path: '/progress' },
    { name: 'profile', title: 'Profile', icon: 'person.crop.circle', path: '/profile' },
  ] as const;

  return (
    <View style={[styles.container, { backgroundColor: 'transparent', borderRightColor: 'rgba(255,255,255,0.05)' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>HybridTraining</Text>
      </View>
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          // simple path matching since expo-router pathname includes the leading slash
          const isActive = pathname === item.path || (pathname === '/' && item.path === '/');
          
          return (
            <Pressable
              key={item.name}
              onPress={() => router.push(item.path as any)}
              style={({ hovered }) => [
                styles.navItem,
                isActive && { backgroundColor: 'transparent', borderLeftWidth: 3, borderLeftColor: theme.primary, paddingLeft: 13 },
                hovered && !isActive && { backgroundColor: '#1A1C23' },
                !isActive && { borderLeftWidth: 3, borderLeftColor: 'transparent', paddingLeft: 13 },
                // @ts-ignore - hover is supported in react-native-web
                { cursor: 'pointer' }
              ]}
            >
              <IconSymbol 
                name={item.icon as any} 
                size={24} 
                color={isActive ? theme.primary : theme.tabIconDefault} 
              />
              <Text style={[styles.navText, { color: isActive ? theme.primary : theme.text }]}>
                {item.title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    height: '100%',
    borderRightWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 40,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter_700Bold',
  },
  nav: {
    flex: 1,
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 16,
  },
  navText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  }
});
