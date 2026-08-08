import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { AnimatedText } from '@/components/ui/AnimatedText';
import { VideoBackground } from '@/components/ui/VideoBackground';
import { Colors } from '@/constants/theme';

interface PageHeroProps {
  /** Pass require('@/assets/videos/...') to play a looping background video */
  video?: number;
  /** Pass require('@/assets/images/...') for a static image hero (used if `video` is not set) */
  image?: number;
  eyebrow: string;
  title: string;
  subtitle?: string;
}

export function PageHero({ video, image, eyebrow, title, subtitle }: PageHeroProps) {
  const { width, height: viewportHeight } = useWindowDimensions();
  const isMobile = width < 768;
  // Bigger, cinematic heros — mobile aims for near-full-height without
  // eating the whole viewport; desktop caps at 85vh so the section below
  // always peeks through and hints at more content.
  const targetHeight = isMobile ? Math.max(560, viewportHeight * 0.75) : 720;
  const height = Math.min(targetHeight, viewportHeight * 0.85);

  const overlay = (
    <>
      <LinearGradient
        colors={['rgba(10,10,10,0.15)', 'rgba(10,10,10,0.35)', 'rgba(10,10,10,0.9)']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <AnimatedText style={styles.eyebrow} delay={150}>{eyebrow}</AnimatedText>
        <AnimatedText style={[styles.title, isMobile && { fontSize: 40, lineHeight: 44 }]} delay={300}>
          {title}
        </AnimatedText>
        {subtitle ? (
          <AnimatedText style={[styles.subtitle, isMobile && { fontSize: 15 }]} delay={450}>
            {subtitle}
          </AnimatedText>
        ) : null}
      </View>
    </>
  );

  if (video) {
    return (
      <VideoBackground source={video}>
        <View style={[styles.container, { height, backgroundColor: 'transparent' }]}>{overlay}</View>
      </VideoBackground>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {image ? (
        <Image
          source={image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition="center"
        />
      ) : null}
      {overlay}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
    maxWidth: 820,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  eyebrow: {
    color: Colors.dark.primary,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 18,
    textAlign: 'center',
  },
  title: {
    fontSize: 64,
    fontFamily: 'Inter_900Black',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 68,
    letterSpacing: -1.5,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 17,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 27,
    marginTop: 18,
  },
});
