import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const pathname = usePathname();

  const NAV_ITEMS = [
    { name: 'index', title: 'Today', icon: 'house.fill', path: '/' },
    { name: 'workout', title: 'Sessions', icon: 'flame.fill', path: '/workout' },
    { name: 'progress', title: 'Records', icon: 'chart.bar.fill', path: '/progress' },
    { name: 'profile', title: 'You', icon: 'person.crop.circle', path: '/profile' },
  ] as const;

  const openMarketingSite = () => {
    // Web: open in a new tab so the signed-in session isn't disturbed by the
    // auth gate. Native: fall back to a normal push (best effort).
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open('/', '_blank');
    } else {
      router.push('/(auth)/login' as any);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: collapsed ? 76 : 260,
          borderRightColor: 'rgba(255,255,255,0.05)',
          paddingHorizontal: collapsed ? 12 : 16,
        },
      ]}
    >
      {/* Header: wordmark + collapse toggle */}
      <View style={[styles.header, collapsed && styles.headerCollapsed]}>
        {collapsed ? (
          <Text style={[styles.markMini, { color: theme.primary }]}>A</Text>
        ) : (
          <>
            <Text style={styles.title}>
              AURA<Text style={{ color: theme.primary }}>FITNESS</Text>
            </Text>
            <View style={[styles.headerRule, { backgroundColor: theme.primary }]} />
          </>
        )}
      </View>

      {/* Toggle button */}
      <Pressable
        onPress={onToggle}
        // @ts-ignore — web-only DOM attribute
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={({ hovered }: any) => [
          styles.toggleBtn,
          collapsed && { alignSelf: 'center' },
          hovered && styles.toggleBtnHovered,
        ]}
      >
        <Text style={styles.toggleGlyph}>{collapsed ? '›' : '‹'}</Text>
      </Pressable>

      {/* Nav */}
      <View style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path || (pathname === '/' && item.path === '/');

          return (
            <Pressable
              key={item.name}
              onPress={() => router.push(item.path as any)}
              // @ts-ignore
              title={collapsed ? item.title : undefined}
              style={({ hovered }: any) => [
                styles.navItem,
                collapsed && styles.navItemCollapsed,
                isActive && {
                  backgroundColor: 'rgba(245, 158, 11, 0.10)',
                  borderLeftWidth: 3,
                  borderLeftColor: theme.primary,
                  paddingLeft: collapsed ? 9 : 13,
                },
                hovered && !isActive && { backgroundColor: 'rgba(255,255,255,0.04)' },
                !isActive && {
                  borderLeftWidth: 3,
                  borderLeftColor: 'transparent',
                  paddingLeft: collapsed ? 9 : 13,
                },
                // @ts-ignore
                { cursor: 'pointer' },
              ]}
            >
              <IconSymbol
                name={item.icon as any}
                size={22}
                color={isActive ? theme.primary : theme.tabIconDefault}
              />
              {!collapsed ? (
                <Text style={[styles.navText, { color: isActive ? theme.primary : theme.text }]}>
                  {item.title}
                </Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {/* Footer: view marketing site */}
      <Pressable
        onPress={openMarketingSite}
        // @ts-ignore
        title={collapsed ? 'View marketing site' : undefined}
        style={({ hovered }: any) => [
          styles.footerBtn,
          collapsed && styles.footerBtnCollapsed,
          hovered && styles.footerBtnHovered,
          // @ts-ignore
          { cursor: 'pointer' },
        ]}
      >
        <IconSymbol name="paperplane.fill" size={18} color={Colors.dark.primary} />
        {!collapsed ? <Text style={styles.footerBtnText}>View Marketing Site</Text> : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    borderRightWidth: 1,
    paddingVertical: 24,
  },
  header: {
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  headerCollapsed: {
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_800ExtraBold',
    color: '#FFF',
    letterSpacing: 2,
  },
  markMini: {
    fontSize: 26,
    fontFamily: 'Inter_900Black',
    letterSpacing: -1,
  },
  headerRule: {
    width: 32,
    height: 2,
    borderRadius: 1,
    marginTop: 10,
    opacity: 0.9,
  },
  toggleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    marginRight: 0,
  },
  toggleBtnHovered: {
    backgroundColor: 'rgba(245,158,11,0.10)',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  toggleGlyph: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Inter_800ExtraBold',
    lineHeight: 18,
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
  navItemCollapsed: {
    justifyContent: 'center',
    gap: 0,
    paddingHorizontal: 0,
  },
  navText: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  footerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.25)',
    backgroundColor: 'rgba(245,158,11,0.05)',
    marginTop: 12,
  },
  footerBtnCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  footerBtnHovered: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderColor: 'rgba(245,158,11,0.55)',
  },
  footerBtnText: {
    color: Colors.dark.primary,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.3,
  },
});
