import React from 'react';

import { MarketingPage } from '@/components/ui/MarketingPage';
import { CardGrid, FeatureCardItem, MarketingSection, TrainerGrid, TrainerItem } from '@/components/ui/MarketingSection';

const PROGRAMS: FeatureCardItem[] = [
  {
    title: '1:1 Personal Training',
    desc: 'A dedicated coach, a program built entirely around your goals, and accountability every step of the way.',
    meta: ['Private', 'Fully Custom'],
    accent: '#F59E0B',
  },
  {
    title: 'Small Group Training',
    desc: 'Train in pods of four to six. Elite coaching and community energy at a friendlier price point.',
    meta: ['2–6 People', 'Semi-Private'],
    accent: '#10B981',
  },
  {
    title: 'Athletic Performance',
    desc: 'Sport-specific speed, power, and recovery programming for competitive and returning athletes.',
    meta: ['Performance', 'Data-Driven'],
    accent: '#EF4444',
  },
];

const TRAINERS: TrainerItem[] = [
  { name: 'Marcus Vega', specialty: 'Strength & Powerlifting', initials: 'MV' },
  { name: 'Elena Rossi', specialty: 'Mobility & Rehab', initials: 'ER' },
  { name: 'Darius Cole', specialty: 'Athletic Performance', initials: 'DC' },
  { name: 'Aisha Karim', specialty: 'Conditioning & HIIT', initials: 'AK' },
];

export default function TrainingScreen() {
  return (
    <MarketingPage
      activeRoute="/(auth)/training"
      heroVideo={require('@/assets/videos/15079798_1080_1920_30fps.mp4')}
      eyebrow="Personal Training"
      title="COACHING THAT MOVES YOU FORWARD"
      subtitle="Certified coaches, individualized programming, and the accountability that turns goals into results."
      ctaButtonLabel="BOOK A CONSULT"
      ctaTitle="TRAIN WITH A PRO"
      ctaSubtitle="Book a complimentary consultation and movement assessment with one of our coaches."
      ctaBackgroundImage={require('@/assets/images/gym-coaching.jpg')}
    >
      <MarketingSection
        eyebrow="Programs"
        title="FIND YOUR FORMAT"
        intro="Whether you want a private coach or the energy of a small group, there's a program that fits."
      >
        <CardGrid items={PROGRAMS} minCardWidth={300} />
      </MarketingSection>

      <MarketingSection
        eyebrow="The Team"
        title="MEET YOUR COACHES"
        intro="A roster of certified specialists across strength, mobility, performance, and conditioning."
        dark
      >
        <TrainerGrid trainers={TRAINERS} />
      </MarketingSection>
    </MarketingPage>
  );
}
