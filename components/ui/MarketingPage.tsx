import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AnimatedText } from '@/components/ui/AnimatedText';
import { AuthModalForm } from '@/components/ui/AuthModalForm';
import { MarketingFooter } from '@/components/ui/MarketingFooter';
import { MarketingNavbar } from '@/components/ui/MarketingNavbar';
import { PageHero } from '@/components/ui/PageHero';
import { Colors } from '@/constants/theme';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { ScrollView } from 'react-native';

interface MarketingPageProps {
  activeRoute: string;
  heroVideo?: number;
  heroImage?: number;
  eyebrow: string;
  title: string;
  subtitle?: string;
  ctaTitle?: React.ReactNode;
  ctaSubtitle?: string;
  ctaButtonLabel?: string;
  ctaBackgroundImage?: number;
  children: React.ReactNode;
}

export function MarketingPage({
  activeRoute,
  heroVideo,
  heroImage,
  eyebrow,
  title,
  subtitle,
  ctaTitle,
  ctaSubtitle,
  ctaButtonLabel = 'JOIN AURA FITNESS',
  ctaBackgroundImage,
  children,
}: MarketingPageProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const auth = useAuthModal();

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ flexGrow: 1 }}>
      <MarketingNavbar onOpenAuth={auth.openAuth} activeRoute={activeRoute} />

      <PageHero video={heroVideo} image={heroImage} eyebrow={eyebrow} title={title} subtitle={subtitle} />

      {children}

      {/* CTA banner */}
      <View style={styles.ctaBanner}>
        {ctaBackgroundImage ? (
          <>
            <Image
              source={ctaBackgroundImage}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              contentPosition="center"
            />
            <LinearGradient
              colors={['rgba(10,10,10,0.75)', 'rgba(10,10,10,0.85)', 'rgba(10,10,10,0.95)']}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
          </>
        ) : null}
        <View style={styles.ctaContent}>
          <AnimatedText style={styles.ctaTitle} delay={100}>
            {ctaTitle ?? (
              <>
                READY TO <Text style={{ color: Colors.dark.primary }}>TRANSFORM</Text>?
              </>
            )}
          </AnimatedText>
          <AnimatedText style={styles.ctaSub} delay={200}>
            {ctaSubtitle ?? 'Your first week is on us. No commitment, no excuses.'}
          </AnimatedText>
          <View style={{ marginTop: 32, flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
            <Pressable
              onPress={() => auth.openAuth('signup')}
              style={({ hovered }: any) => [styles.cta, hovered && { backgroundColor: '#D97706' }]}
            >
              <Text style={styles.ctaText}>{ctaButtonLabel}</Text>
            </Pressable>
            <Pressable
              style={({ hovered }: any) => [
                styles.ctaSecondary,
                hovered && { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.05)' },
              ]}
            >
              <Text style={styles.ctaSecondaryText}>SCHEDULE A TOUR</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <MarketingFooter />

      <AuthModalForm
        authMode={auth.authMode}
        email={auth.email}
        setEmail={auth.setEmail}
        password={auth.password}
        setPassword={auth.setPassword}
        feedbackMessage={auth.feedbackMessage}
        feedbackType={auth.feedbackType}
        onSubmit={auth.handleAuth}
        onSwitchMode={auth.openAuth}
        onClose={auth.closeAuth}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  ctaBanner: {
    backgroundColor: '#111',
    paddingVertical: 100,
    paddingHorizontal: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  ctaContent: {
    alignItems: 'center',
    maxWidth: 700,
    alignSelf: 'center',
  },
  ctaTitle: {
    color: '#FFF',
    fontSize: 44,
    fontFamily: 'Inter_900Black',
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 16,
  },
  ctaSub: {
    color: '#999',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 26,
  },
  cta: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 4,
  },
  ctaText: {
    color: '#0A0A0A',
    fontSize: 13,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 2,
  },
  ctaSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 4,
  },
  ctaSecondaryText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },
});
