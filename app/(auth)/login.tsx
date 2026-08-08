import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { AnimatedText } from '@/components/ui/AnimatedText';
import { AuthModalForm } from '@/components/ui/AuthModalForm';
import { MarketingFooter } from '@/components/ui/MarketingFooter';
import { MarketingNavbar } from '@/components/ui/MarketingNavbar';
import { VideoBackground } from '@/components/ui/VideoBackground';
import { Colors } from '@/constants/theme';
import { useAuthModal } from '@/hooks/use-auth-modal';

// ─── Services Data ───────────────────────────────────────────────
const SERVICES = [
  {
    image: require('@/assets/images/gym-weightroom.png'),
    title: 'FITNESS & STRENGTH',
    desc: 'Over 100,000 sq. ft. of premium equipment, free weights, and functional training zones.',
  },
  {
    image: require('@/assets/images/gym-training.png'),
    title: 'PERSONAL TRAINING',
    desc: 'One-on-one coaching with certified trainers who build programs around your goals.',
  },
  {
    image: require('@/assets/images/gym-recovery.png'),
    title: 'SPA & RECOVERY',
    desc: 'Sauna, steam rooms, cold plunge pools, and massage therapy to optimize your recovery.',
  },
];

// ─── Stats ───────────────────────────────────────────────────────
const STATS = [
  { value: '50K+', label: 'Active Members' },
  { value: '200+', label: 'Expert Trainers' },
  { value: '15', label: 'Club Locations' },
  { value: '24/7', label: 'Access' },
];

export default function LandingScreen() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const auth = useAuthModal();

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ flexGrow: 1 }}>

      <MarketingNavbar onOpenAuth={auth.openAuth} activeRoute="/(auth)/login" />

      {/* ═══════════════ HERO w/ VIDEO ═══════════════ */}
      <VideoBackground source={require('@/assets/videos/12188774-uhd_3840_2160_25fps.mp4')}>
        <View style={[styles.heroOverlay, { minHeight: isMobile ? 600 : 850 }]}>
          <View style={styles.heroContent}>
            <AnimatedText style={styles.heroEyebrow} delay={200}>
              PREMIUM ATHLETIC CLUB
            </AnimatedText>
            <AnimatedText style={[styles.heroTitle, isMobile && { fontSize: 44, lineHeight: 48 }]} delay={400}>
              IT'S <Text style={{ color: Colors.dark.primary }}>GO</Text> TIME
            </AnimatedText>
            <AnimatedText style={[styles.heroSub, isMobile && { fontSize: 16 }]} delay={600}>
              Experience world-class fitness, recovery, and community.{'\n'}
              Join the club that elevates everything.
            </AnimatedText>
            <View style={{ marginTop: 40, flexDirection: isMobile ? 'column' : 'row', gap: 16, alignItems: 'center' }}>
              <Pressable
                onPress={() => auth.openAuth('signup')}
                style={({ hovered }: any) => [styles.heroCta, hovered && { backgroundColor: '#D97706' }]}
              >
                <Text style={styles.heroCtaText}>START YOUR JOURNEY</Text>
              </Pressable>
              <Pressable
                onPress={() => {}}
                style={({ hovered }: any) => [
                  styles.heroCtaSecondary,
                  hovered && { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.05)' },
                ]}
              >
                <Text style={styles.heroCtaSecondaryText}>SCHEDULE A TOUR</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </VideoBackground>

      {/* ═══════════════ STATS BAR ═══════════════ */}
      <View style={styles.statsBar}>
        {STATS.map((stat, i) => (
          <View key={i} style={[styles.statItem, i < STATS.length - 1 && !isMobile && styles.statDivider]}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* ═══════════════ SERVICES ═══════════════ */}
      <View style={styles.servicesSection}>
        <Text style={styles.sectionEyebrow}>WHAT WE OFFER</Text>
        <Text style={styles.sectionTitle}>EXCEPTIONAL SERVICES</Text>

        <View style={[styles.servicesGrid, (isMobile || isTablet) && { flexDirection: 'column' }]}>
          {SERVICES.map((svc, i) => (
            <Pressable
              key={i}
              style={({ hovered }: any) => [styles.serviceCard, hovered && { transform: [{ scale: 1.02 }] }]}
            >
              <Image source={svc.image} style={styles.serviceImage} resizeMode="cover" />
              <View style={styles.serviceOverlay} />
              <View style={styles.serviceContent}>
                <Text style={styles.serviceTitle}>{svc.title}</Text>
                <Text style={styles.serviceDesc}>{svc.desc}</Text>
                <Text style={styles.serviceLink}>Learn More →</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>

      {/* ═══════════════ CTA BANNER ═══════════════ */}
      <View style={styles.ctaBanner}>
        <View style={styles.ctaContent}>
          <AnimatedText style={styles.ctaTitle} delay={100}>
            READY TO <Text style={{ color: Colors.dark.primary }}>TRANSFORM</Text>?
          </AnimatedText>
          <AnimatedText style={styles.ctaSub} delay={200}>
            Join with up to 10 people on one Shared Membership.{'\n'}
            Your first week is on us.
          </AnimatedText>
          <View style={{ marginTop: 32, flexDirection: isMobile ? 'column' : 'row', gap: 16 }}>
            <Pressable
              onPress={() => auth.openAuth('signup')}
              style={({ hovered }: any) => [styles.heroCta, hovered && { backgroundColor: '#D97706' }]}
            >
              <Text style={styles.heroCtaText}>JOIN AURA FITNESS</Text>
            </Pressable>
            <Pressable
              style={({ hovered }: any) => [
                styles.heroCtaSecondary,
                hovered && { borderColor: '#fff', backgroundColor: 'rgba(255,255,255,0.05)' },
              ]}
            >
              <Text style={styles.heroCtaSecondaryText}>VIEW MEMBERSHIP OPTIONS</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* ═══════════════ TRACKING PROMO ═══════════════ */}
      <View style={styles.trackingSection}>
        <View style={[styles.trackingInner, isMobile && { flexDirection: 'column' }]}>
          <View style={[styles.trackingText, isMobile && { marginBottom: 32 }]}>
            <Text style={styles.sectionEyebrow}>MEMBER EXCLUSIVE</Text>
            <Text style={[styles.sectionTitle, { textAlign: 'left', marginBottom: 16 }]}>
              TRACK YOUR PROGRESS
            </Text>
            <Text style={styles.trackingDesc}>
              Log your workouts, monitor your lifts, and visualize your progress over time.
              Our built-in tracking system keeps you accountable and motivated.
            </Text>
            <View style={{ marginTop: 24 }}>
              <Pressable
                onPress={() => auth.openAuth('signup')}
                style={({ hovered }: any) => [
                  styles.heroCta,
                  { alignSelf: 'flex-start' },
                  hovered && { backgroundColor: '#D97706' },
                ]}
              >
                <Text style={styles.heroCtaText}>GET STARTED FREE</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.trackingVisual}>
            {/* Mock dashboard preview */}
            <View style={styles.dashPreview}>
              <View style={styles.dashHeader}>
                <View style={[styles.dashDot, { backgroundColor: '#EF4444' }]} />
                <View style={[styles.dashDot, { backgroundColor: '#F59E0B' }]} />
                <View style={[styles.dashDot, { backgroundColor: '#10B981' }]} />
              </View>
              <View style={styles.dashBody}>
                <Text style={styles.dashTitle}>Weekly Summary</Text>
                <View style={styles.dashStats}>
                  <View style={styles.dashStatItem}>
                    <Text style={styles.dashStatVal}>4</Text>
                    <Text style={styles.dashStatLbl}>Workouts</Text>
                  </View>
                  <View style={styles.dashStatItem}>
                    <Text style={styles.dashStatVal}>12,400</Text>
                    <Text style={styles.dashStatLbl}>lbs lifted</Text>
                  </View>
                  <View style={styles.dashStatItem}>
                    <Text style={[styles.dashStatVal, { color: Colors.dark.primary }]}>↑ 8%</Text>
                    <Text style={styles.dashStatLbl}>vs last week</Text>
                  </View>
                </View>
                {/* Mini bar chart */}
                <View style={styles.chartRow}>
                  {[40, 65, 50, 80, 70, 90, 55].map((h, i) => (
                    <View key={i} style={styles.chartCol}>
                      <View style={[styles.chartBar, { height: h, backgroundColor: i === 5 ? Colors.dark.primary : '#333' }]} />
                      <Text style={styles.chartLabel}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
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

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },

  // Hero
  heroOverlay: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  heroContent: {
    alignItems: 'center',
    maxWidth: 800,
    paddingHorizontal: 24,
  },
  heroEyebrow: {
    color: Colors.dark.primary,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 6,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 88,
    fontFamily: 'Inter_900Black',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 92,
    letterSpacing: -2,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 18,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 28,
    marginTop: 20,
  },
  heroCta: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 4,
  },
  heroCtaText: {
    color: '#0A0A0A',
    fontSize: 13,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 2,
  },
  heroCtaSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 4,
  },
  heroCtaSecondaryText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 2,
  },

  // Stats Bar
  statsBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    backgroundColor: '#111',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 40,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: '#333',
  },
  statValue: {
    color: Colors.dark.primary,
    fontSize: 40,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -1,
  },
  statLabel: {
    color: '#999',
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginTop: 4,
  },

  // Services
  servicesSection: {
    paddingVertical: 100,
    paddingHorizontal: 24,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
  },
  sectionEyebrow: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#FFF',
    fontSize: 36,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.5,
    marginBottom: 60,
    textAlign: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    maxWidth: 1200,
    width: '100%',
    gap: 24,
  },
  serviceCard: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 400,
    position: 'relative',
  },
  serviceImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  serviceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  serviceContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 28,
  },
  serviceTitle: {
    color: '#FFF',
    fontSize: 20,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  serviceDesc: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    lineHeight: 22,
    marginBottom: 12,
  },
  serviceLink: {
    color: Colors.dark.primary,
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 0.5,
  },

  // CTA Banner
  ctaBanner: {
    backgroundColor: '#111',
    paddingVertical: 100,
    paddingHorizontal: 24,
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

  // Tracking Section
  trackingSection: {
    paddingVertical: 100,
    paddingHorizontal: 24,
    backgroundColor: '#0A0A0A',
  },
  trackingInner: {
    maxWidth: 1200,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 60,
    width: '100%',
  },
  trackingText: {
    flex: 1,
    justifyContent: 'center',
  },
  trackingDesc: {
    color: '#999',
    fontSize: 16,
    lineHeight: 28,
    fontFamily: 'Inter_400Regular',
  },
  trackingVisual: {
    flex: 1,
    alignItems: 'center',
  },
  dashPreview: {
    width: '100%',
    maxWidth: 450,
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222',
    overflow: 'hidden',
  },
  dashHeader: {
    flexDirection: 'row',
    gap: 6,
    padding: 12,
    paddingBottom: 0,
  },
  dashDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dashBody: {
    padding: 24,
  },
  dashTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    marginBottom: 20,
  },
  dashStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  dashStatItem: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  dashStatVal: {
    color: '#FFF',
    fontSize: 22,
    fontFamily: 'Inter_800ExtraBold',
  },
  dashStatLbl: {
    color: '#777',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    gap: 8,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
  },
  chartBar: {
    width: '100%',
    borderRadius: 4,
  },
  chartLabel: {
    color: '#666',
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    marginTop: 8,
  },
});
