import React from 'react';

import { MarketingPage } from '@/components/ui/MarketingPage';
import { LocationGrid, LocationItem, MarketingSection } from '@/components/ui/MarketingSection';

const LOCATIONS: LocationItem[] = [
  {
    name: 'AURA Downtown',
    address: '120 Market Street, Financial District',
    hours: 'Open 24 hours · Members',
  },
  {
    name: 'AURA Riverside',
    address: '45 Harbor Walk, Riverside Quarter',
    hours: 'Mon–Sun · 5:00 AM – 11:00 PM',
  },
  {
    name: 'AURA Uptown',
    address: '888 Highland Avenue, Uptown',
    hours: 'Open 24 hours · Members',
  },
  {
    name: 'AURA Midtown',
    address: '300 Central Plaza, Midtown Core',
    hours: 'Mon–Sun · 5:00 AM – 12:00 AM',
  },
  {
    name: 'AURA Coastline',
    address: '17 Ocean Boulevard, Coastline District',
    hours: 'Open 24 hours · Members',
  },
];

export default function LocationsScreen() {
  return (
    <MarketingPage
      activeRoute="/(auth)/locations"
      heroImage={require('@/assets/images/gym-clubhouse.jpg')}
      eyebrow="Locations"
      title="FIND YOUR CLUB"
      subtitle="Fifteen premium clubs and counting. One membership unlocks every location, city to coast."
      ctaButtonLabel="BECOME A MEMBER"
      ctaTitle="ONE PASS, EVERY CLUB"
      ctaSubtitle="Your membership travels with you — train at any AURA location, any time."
      ctaBackgroundImage={require('@/assets/images/gym-weightroom.png')}
    >
      <MarketingSection
        eyebrow="Flagship Clubs"
        title="WHERE TO TRAIN"
        intro="Every location shares the same premium equipment, recovery amenities, and coaching standard."
      >
        <LocationGrid locations={LOCATIONS} />
      </MarketingSection>
    </MarketingPage>
  );
}
