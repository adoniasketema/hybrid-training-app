import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { SleekButton } from '@/components/ui/SleekButton';
import { SleekCard } from '@/components/ui/SleekCard';
import { Colors } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

type UserProfile = {
  email: string;
  name: string;
  age?: number;
  gender?: string;
  height_cm?: number;
  weight_kg?: number;
  primary_goal?: string;
  fitness_level?: string;
  training_days_per_week?: number;
};

const HERO_PHOTO = require('@/assets/images/gym-training.png');

export default function YouScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;

      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      const { data: profileData } = await supabase.from('users').select('*').eq('id', user.id).maybeSingle();
      // Fall back to the auth user's email/name so we never render a totally
      // empty screen if the users table row is minimal.
      const merged: UserProfile = {
        email: profileData?.email ?? user.email ?? 'demo@hybrid.com',
        name: profileData?.name ?? 'Athlete',
        age: profileData?.age,
        gender: profileData?.gender,
        height_cm: profileData?.height_cm,
        weight_kg: profileData?.weight_kg,
        primary_goal: profileData?.primary_goal,
        fitness_level: profileData?.fitness_level,
        training_days_per_week: profileData?.training_days_per_week,
      };
      setProfile(merged);
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  if (loading || !profile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  const initial = (profile.name || 'A').charAt(0).toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Hero identity card */}
        <View style={styles.hero}>
          <Image source={HERO_PHOTO} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={['rgba(10,10,10,0.35)', 'rgba(10,10,10,0.75)', 'rgba(10,10,10,0.98)']}
            locations={[0, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroContent}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
            <View style={styles.memberChip}>
              <Text style={styles.memberChipText}>AURA MEMBER</Text>
            </View>
            <Text style={styles.name}>{profile.name}</Text>
            <Text style={styles.email}>{profile.email}</Text>
          </View>
        </View>

        {/* Vitals */}
        <View style={styles.vitalsRow}>
          <VitalCell label="Height" value={profile.height_cm ? `${profile.height_cm} cm` : null} />
          <VitalCell label="Weight" value={profile.weight_kg ? `${profile.weight_kg} kg` : null} />
          <VitalCell label="Age" value={profile.age ? String(profile.age) : null} />
        </View>

        {/* Actions */}
        <View style={styles.actionRow}>
          <SleekButton title="Edit Profile" onPress={() => {}} style={{ flex: 1 }} variant="secondary" />
          <SleekButton title="Add Device" onPress={() => {}} style={{ flex: 1 }} variant="primary" />
        </View>

        {/* Preferences */}
        <SleekCard containerStyle={styles.settingsCard}>
          <SettingsRow
            icon="flame.fill"
            label="Goal"
            value={profile.primary_goal ?? 'Not set'}
          />
          <SettingsRow
            icon="chart.bar.fill"
            label="Level"
            value={profile.fitness_level ?? 'Not set'}
          />
          <SettingsRow
            icon="clock.fill"
            label="Training"
            value={
              profile.training_days_per_week
                ? `${profile.training_days_per_week} days / week`
                : 'Not set'
            }
            last
          />
        </SleekCard>

        {/* Account */}
        <SleekCard containerStyle={styles.settingsCard}>
          <Pressable style={styles.signOutRow} onPress={signOut}>
            <IconSymbol name="xmark" size={16} color="#EF4444" style={{ marginRight: 12 }} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </SleekCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function VitalCell({ label, value }: { label: string; value: string | null }) {
  const empty = !value;
  return (
    <View style={[styles.vitalCell, empty && styles.vitalCellEmpty]}>
      <Text style={styles.vitalLabel}>{label}</Text>
      {empty ? (
        <View style={styles.addRow}>
          <Text style={styles.addPlus}>+</Text>
          <Text style={styles.addText}>Add</Text>
        </View>
      ) : (
        <Text style={styles.vitalValue}>{value}</Text>
      )}
    </View>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  last,
}: {
  icon: any;
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.settingsRow, last && styles.settingsRowLast]}>
      <IconSymbol name={icon} size={18} color={Colors.dark.primary} style={{ marginRight: 14 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.settingsLabel}>{label}</Text>
        <Text style={styles.settingsValue}>{value}</Text>
      </View>
      <IconSymbol name="chevron.right" size={18} color={Colors.dark.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  content: {
    padding: 24,
    paddingBottom: 120,
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  hero: {
    height: 300,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  heroContent: {
    position: 'absolute',
    left: 24,
    bottom: 24,
    right: 24,
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 2,
    borderColor: Colors.dark.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 32,
    fontFamily: 'Inter_800ExtraBold',
    color: Colors.dark.primary,
  },
  memberChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.45)',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    marginBottom: 8,
  },
  memberChipText: {
    color: Colors.dark.primary,
    fontSize: 10,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 1.5,
  },
  name: {
    color: '#FFF',
    fontSize: 32,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: -0.7,
  },
  email: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },

  vitalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  vitalCell: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(20,20,22,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
  vitalCellEmpty: {
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.12)',
  },
  vitalLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  vitalValue: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addPlus: {
    color: Colors.dark.primary,
    fontSize: 20,
    fontFamily: 'Inter_800ExtraBold',
    lineHeight: 20,
  },
  addText: {
    color: Colors.dark.primary,
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },

  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingsRowLast: {
    borderBottomWidth: 0,
  },
  settingsLabel: {
    color: Colors.dark.textSecondary,
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  settingsValue: {
    color: '#FFF',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
  signOutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
});
