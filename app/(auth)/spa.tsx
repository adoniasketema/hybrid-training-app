import React from 'react';

import { MarketingPage } from '@/components/ui/MarketingPage';
import { CardGrid, FeatureCardItem, MarketingSection } from '@/components/ui/MarketingSection';

const SERVICES: FeatureCardItem[] = [
  {
    title: 'Finnish Sauna',
    desc: 'Traditional dry heat cedar cabins to loosen muscles, sweat out fatigue, and unwind after training.',
    meta: ['Heat'],
    accent: '#F59E0B',
  },
  {
    title: 'Steam Room',
    desc: 'Eucalyptus-infused steam to open the airways, hydrate the skin, and calm the nervous system.',
    meta: ['Heat'],
    accent: '#10B981',
  },
  {
    title: 'Cold Plunge',
    desc: 'Contrast therapy pools held at 10°C to reduce inflammation and sharpen recovery.',
    meta: ['Contrast'],
    accent: '#38BDF8',
  },
  {
    title: 'Massage Therapy',
    desc: 'Licensed therapists offering deep-tissue, sports, and recovery massage by appointment.',
    meta: ['Bodywork'],
    accent: '#F59E0B',
  },
  {
    title: 'Recovery Lounge',
    desc: 'Compression boots, percussion therapy, and zero-gravity loungers in a quiet dedicated space.',
    meta: ['Regeneration'],
    accent: '#10B981',
  },
  {
    title: 'Cryotherapy',
    desc: 'Whole-body cryo sessions to accelerate recovery, boost energy, and reduce soreness.',
    meta: ['Cold'],
    accent: '#38BDF8',
  },
];

export default function SpaScreen() {
  return (
    <MarketingPage
      activeRoute="/(auth)/spa"
      heroImage={require('@/assets/images/gym-recovery-therapy.jpg')}
      eyebrow="Spa & Wellness"
      title="RECOVERY IS PART OF THE WORK"
      subtitle="A full recovery wing built to help you regenerate, de-stress, and come back stronger every session."
      ctaButtonLabel="EXPLORE MEMBERSHIP"
      ctaTitle="RECOVER LIKE A PRO"
      ctaSubtitle="Every membership includes full access to our spa and recovery facilities."
      ctaBackgroundImage={require('@/assets/images/gym-recovery.png')}
    >
      <MarketingSection
        eyebrow="The Wellness Wing"
        title="RESTORE & REGENERATE"
        intro="Heat, cold, and hands-on therapy — a complete toolkit to keep your body performing at its peak."
      >
        <CardGrid items={SERVICES} />
      </MarketingSection>
    </MarketingPage>
  );
}
