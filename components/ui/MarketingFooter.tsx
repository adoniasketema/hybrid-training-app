import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { Colors } from '@/constants/theme';

type FooterLink = { label: string; route?: string };

const CLUB_LINKS: FooterLink[] = [
  { label: 'Classes', route: '/(auth)/classes' },
  { label: 'Training', route: '/(auth)/training' },
  { label: 'Locations', route: '/(auth)/locations' },
  { label: 'Careers' },
];

const SERVICE_LINKS: FooterLink[] = [
  { label: 'Spa & Wellness', route: '/(auth)/spa' },
  { label: 'Fitness & Sports', route: '/(auth)/fitness' },
  { label: 'Nutrition' },
  { label: 'Corporate' },
];

const CONNECT_LINKS: FooterLink[] = [
  { label: 'Instagram' },
  { label: 'Twitter' },
  { label: 'LinkedIn' },
  { label: 'Contact Us' },
];

function FooterColumn({ title, links }: { title: string; links: FooterLink[] }) {
  const router = useRouter();
  return (
    <View style={styles.footerCol}>
      <Text style={styles.footerColTitle}>{title}</Text>
      {links.map((link) =>
        link.route ? (
          <Pressable key={link.label} onPress={() => router.push(link.route as any)}>
            {({ hovered }: any) => (
              <Text style={[styles.footerLink, hovered && { color: Colors.dark.primary }]}>{link.label}</Text>
            )}
          </Pressable>
        ) : (
          <Text key={link.label} style={styles.footerLink}>{link.label}</Text>
        )
      )}
    </View>
  );
}

export function MarketingFooter() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  return (
    <View style={styles.footer}>
      <View style={[styles.footerInner, isMobile && { flexDirection: 'column', gap: 32 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.logoText}>
            AURA<Text style={{ color: Colors.dark.primary }}>FITNESS</Text>
          </Text>
          <Text style={styles.footerTagline}>Elevating fitness since 2024.</Text>
        </View>
        <FooterColumn title="CLUB" links={CLUB_LINKS} />
        <FooterColumn title="SERVICES" links={SERVICE_LINKS} />
        <FooterColumn title="CONNECT" links={CONNECT_LINKS} />
      </View>
      <View style={styles.footerBottom}>
        <Text style={styles.footerCopy}>© 2024 Aura Fitness. All rights reserved.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logoText: {
    fontSize: 22,
    fontFamily: 'Inter_800ExtraBold',
    color: '#FFF',
    letterSpacing: 2,
  },
  footer: {
    backgroundColor: '#050505',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  footerInner: {
    flexDirection: 'row',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    gap: 40,
    paddingBottom: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  footerTagline: {
    color: '#666',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 8,
  },
  footerCol: {
    gap: 10,
  },
  footerColTitle: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
    marginBottom: 4,
  },
  footerLink: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  footerBottom: {
    paddingVertical: 24,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  footerCopy: {
    color: '#555',
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
});
