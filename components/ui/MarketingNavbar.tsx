import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Colors } from '@/constants/theme';

const NAV_ITEMS: { label: string; route: string }[] = [
  { label: 'Classes', route: '/(auth)/classes' },
  { label: 'Fitness & Sports', route: '/(auth)/fitness' },
  { label: 'Training', route: '/(auth)/training' },
  { label: 'Spa & Wellness', route: '/(auth)/spa' },
  { label: 'Locations', route: '/(auth)/locations' },
];

interface MarketingNavbarProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  activeRoute?: string;
}

export function MarketingNavbar({ onOpenAuth, activeRoute }: MarketingNavbarProps) {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={[styles.navbar, isMobile && styles.navbarMobile]}>
      <Pressable onPress={() => router.push('/(auth)/login')}>
        <Text style={[styles.logoText, isMobile && styles.logoTextMobile]}>
          AURA<Text style={{ color: Colors.dark.primary }}>FITNESS</Text>
        </Text>
      </Pressable>

      {!isMobile && (
        <View style={styles.navLinks}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeRoute === item.route;
            return (
              <Pressable key={item.label} onPress={() => router.push(item.route as any)}>
                {({ hovered }: any) => (
                  <Text
                    style={[
                      styles.navLink,
                      (hovered || isActive) && { color: Colors.dark.primary },
                    ]}
                  >
                    {item.label.toUpperCase()}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      )}

      <View style={styles.navActions}>
        {!isMobile && (
          <Pressable onPress={() => onOpenAuth('login')}>
            {({ hovered }: any) => (
              <Text style={[styles.navLink, { fontFamily: 'Inter_700Bold' }, hovered && { color: Colors.dark.primary }]}>
                SIGN IN
              </Text>
            )}
          </Pressable>
        )}
        <Pressable
          onPress={() => onOpenAuth('signup')}
          style={({ hovered }: any) => [styles.joinBtn, hovered && { backgroundColor: '#D97706' }]}
        >
          <Text style={styles.joinBtnText}>JOIN AURA</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 20,
    backgroundColor: 'rgba(10, 10, 10, 0.6)',
  },
  navbarMobile: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  logoText: {
    fontSize: 22,
    fontFamily: 'Inter_800ExtraBold',
    color: '#FFF',
    letterSpacing: 2,
  },
  logoTextMobile: {
    fontSize: 18,
    letterSpacing: 1,
  },
  navLinks: {
    flexDirection: 'row',
    gap: 28,
  },
  navLink: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  joinBtn: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 4,
  },
  joinBtnText: {
    color: '#0A0A0A',
    fontSize: 12,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 1.5,
  },
});
