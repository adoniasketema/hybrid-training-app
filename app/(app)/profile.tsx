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
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  primary_goal: string;
  fitness_level: string;
  training_days_per_week: number;
};

export default function ProfileScreen() {
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
      setProfile(profileData ?? null);
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.dark.primary} />
      </View>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.message}>No profile found. Please complete onboarding first.</Text>
          <SleekButton title="Go to Onboarding" onPress={() => router.replace('/(auth)/onboarding')} variant="primary" />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>

        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{profile.name}</Text>
            <Text style={styles.headerEmail}>{profile.email}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <SleekButton title="Edit Profile" onPress={() => {}} style={styles.actionBtn} variant="secondary" />
          <SleekButton title="Add Device" onPress={() => {}} style={styles.actionBtn} variant="primary" />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsRow}>
          <SleekCard containerStyle={styles.statCard}>
            <Text style={styles.statLabel}>Height</Text>
            <Text style={styles.statValue}>{profile.height_cm} cm</Text>
          </SleekCard>
          <SleekCard containerStyle={styles.statCard}>
            <Text style={styles.statLabel}>Weight</Text>
            <Text style={styles.statValue}>{profile.weight_kg} kg</Text>
          </SleekCard>
          <SleekCard containerStyle={styles.statCard}>
            <Text style={styles.statLabel}>Age</Text>
            <Text style={styles.statValue}>{profile.age}</Text>
          </SleekCard>
        </View>

        {/* Settings List */}
        <SleekCard containerStyle={styles.settingsCard}>
          <Pressable style={styles.settingsRow}>
            <IconSymbol name="flame" size={20} color={Colors.dark.primary} style={styles.rowIcon} />
            <View style={styles.settingsRowTextContainer}>
              <Text style={styles.settingsRowLabel}>Goal</Text>
              <Text style={styles.settingsRowValue}>{profile.primary_goal}</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={Colors.dark.textSecondary} />
          </Pressable>
          
          <Pressable style={styles.settingsRow}>
            <IconSymbol name="chart.bar" size={20} color={Colors.dark.primary} style={styles.rowIcon} />
            <View style={styles.settingsRowTextContainer}>
              <Text style={styles.settingsRowLabel}>Level</Text>
              <Text style={styles.settingsRowValue}>{profile.fitness_level}</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={Colors.dark.textSecondary} />
          </Pressable>

          <Pressable style={[styles.settingsRow, styles.settingsRowLast]}>
            <IconSymbol name="calendar" size={20} color={Colors.dark.primary} style={styles.rowIcon} />
            <View style={styles.settingsRowTextContainer}>
              <Text style={styles.settingsRowLabel}>Training</Text>
              <Text style={styles.settingsRowValue}>{profile.training_days_per_week} days/week</Text>
            </View>
            <IconSymbol name="chevron.right" size={20} color={Colors.dark.textSecondary} />
          </Pressable>
        </SleekCard>

        {/* Account Settings */}
        <SleekCard containerStyle={styles.settingsCard}>
          <Pressable style={[styles.settingsRow, styles.settingsRowLast]} onPress={signOut}>
            <IconSymbol name="arrow.right.circle" size={20} color="#EF4444" style={styles.rowIcon} />
            <Text style={[styles.settingsRowText, { color: '#EF4444' }]}>Sign Out</Text>
          </Pressable>
        </SleekCard>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  content: {
    padding: 24,
    paddingBottom: 120, // Tab bar padding
    gap: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter_700Bold',
    color: Colors.dark.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    marginBottom: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.cardBackground,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)', // Glow effect
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.primary,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 24,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  headerEmail: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: Colors.dark.textSecondary,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontFamily: 'Inter_600SemiBold',
    color: Colors.dark.text,
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
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingsRowLast: {
    borderBottomWidth: 0,
  },
  rowIcon: {
    marginRight: 16,
  },
  settingsRowTextContainer: {
    flex: 1,
  },
  settingsRowLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingsRowValue: {
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
    color: Colors.dark.text,
    marginTop: 2,
  },
  settingsRowText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_500Medium',
  },
});
