import React from 'react';

import { MarketingPage } from '@/components/ui/MarketingPage';
import { CardGrid, FeatureCardItem, MarketingSection, StatsBar } from '@/components/ui/MarketingSection';

const STATS = [
  { value: '100K', label: 'Sq Ft of Space' },
  { value: '400+', label: 'Machines' },
  { value: '8', label: 'Training Zones' },
  { value: '24/7', label: 'Member Access' },
];

const ZONES: FeatureCardItem[] = [
  {
    title: 'Free Weight Hall',
    desc: 'Competition platforms, dumbbells to 100kg, and specialty bars in a dedicated iron sanctuary.',
    meta: ['Strength'],
    accent: '#F59E0B',
  },
  {
    title: 'Cardio Deck',
    desc: 'Rows of treadmills, stair climbers, and assault bikes overlooking floor-to-ceiling windows.',
    meta: ['Endurance'],
    accent: '#EF4444',
  },
  {
    title: 'Functional Training',
    desc: 'Turf lanes, sleds, rigs, and kettlebells for athletic, movement-first workouts.',
    meta: ['Athletic'],
    accent: '#10B981',
  },
  {
    title: 'Turf & Sports Zone',
    desc: 'Sprint the 40-yard turf, run agility ladders, or drill plyometrics on sprung flooring.',
    meta: ['Performance'],
    accent: '#F59E0B',
  },
  {
    title: 'Group Studios',
    desc: 'Three acoustically tuned studios hosting cycle, yoga, HIIT, and strength classes daily.',
    meta: ['Classes'],
    accent: '#10B981',
  },
  {
    title: 'Basketball Court',
    desc: 'Full-size hardwood court for pickup games, shootarounds, and open-run leagues.',
    meta: ['Sport'],
    accent: '#EF4444',
  },
];

export default function FitnessScreen() {
  return (
    <MarketingPage
      activeRoute="/(auth)/fitness"
      heroVideo={require('@/assets/videos/15204643_2160_3840_30fps.mp4')}
      eyebrow="Fitness & Sports"
      title="A FLOOR BUILT FOR EVERYTHING"
      subtitle="One hundred thousand square feet of premium equipment, open courts, and dedicated zones — designed to move the way you train."
      ctaButtonLabel="TOUR THE FLOOR"
      ctaBackgroundImage={require('@/assets/images/gym-floor-view.jpg')}
    >
      <StatsBar stats={STATS} />
      <MarketingSection
        eyebrow="Training Zones"
        title="EXPLORE EVERY ZONE"
        intro="Purpose-built spaces for strength, endurance, sport, and everything in between — all under one roof."
      >
        <CardGrid items={ZONES} />
      </MarketingSection>
    </MarketingPage>
  );
}
