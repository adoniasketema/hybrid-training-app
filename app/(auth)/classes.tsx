import React from 'react';

import { MarketingPage } from '@/components/ui/MarketingPage';
import { CardGrid, FeatureCardItem, MarketingSection } from '@/components/ui/MarketingSection';

const CLASSES: FeatureCardItem[] = [
  {
    title: 'HIIT Burn',
    desc: 'High-intensity intervals engineered to torch calories and spike your conditioning in 45 explosive minutes.',
    meta: ['Conditioning', '45 min', 'High'],
    accent: '#EF4444',
  },
  {
    title: 'Power Vinyasa Yoga',
    desc: 'Breath-linked flow in a heated studio to build mobility, balance, and a calm, focused mind.',
    meta: ['Mind & Body', '60 min', 'Moderate'],
    accent: '#10B981',
  },
  {
    title: 'Spin & Sculpt',
    desc: 'Rhythm-driven cycling on premium bikes, paired with light resistance work for a full-body finish.',
    meta: ['Cardio', '50 min', 'High'],
    accent: '#F59E0B',
  },
  {
    title: 'Boxing Conditioning',
    desc: 'Bag work, footwork, and core drills coached by former competitors. All levels welcome.',
    meta: ['Combat', '55 min', 'High'],
    accent: '#EF4444',
  },
  {
    title: 'Strength Circuit',
    desc: 'Coached barbell and dumbbell stations built to add lean muscle and raw functional strength.',
    meta: ['Strength', '60 min', 'Moderate'],
    accent: '#F59E0B',
  },
  {
    title: 'Recovery Flow',
    desc: 'Guided mobility, foam rolling, and breath work to reset your nervous system between hard sessions.',
    meta: ['Recovery', '40 min', 'Low'],
    accent: '#10B981',
  },
];

export default function ClassesScreen() {
  return (
    <MarketingPage
      activeRoute="/(auth)/classes"
      heroVideo={require('@/assets/videos/12712319_2160_3840_30fps.mp4')}
      eyebrow="Group Fitness"
      title="CLASSES BUILT TO PUSH YOU"
      subtitle="Over 200 studio sessions every week — led by elite coaches, powered by a community that shows up."
      ctaButtonLabel="RESERVE A CLASS"
      ctaTitle="YOUR NEXT CLASS IS WAITING"
      ctaSubtitle="Members get unlimited access to every studio session. First week on us."
      ctaBackgroundImage={require('@/assets/images/gym-classes.jpg')}
    >
      <MarketingSection
        eyebrow="The Schedule"
        title="SIGNATURE SESSIONS"
        intro="From all-out conditioning to deep recovery — a format for every goal and every day of your week."
      >
        <CardGrid items={CLASSES} />
      </MarketingSection>
    </MarketingPage>
  );
}
