import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, ScrollView, StyleSheet, Text, View } from 'react-native';

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
        router.replace('/login');
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
    router.replace('/login');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!profile) {
    return (
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.message}>No profile found. Please complete onboarding first.</Text>
        <Button title="Go to Onboarding" onPress={() => router.replace('/onboarding')} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.card}>
        <Text style={styles.itemLabel}>Name</Text>
        <Text style={styles.itemValue}>{profile.name}</Text>
        <Text style={styles.itemLabel}>Email</Text>
        <Text style={styles.itemValue}>{profile.email}</Text>
        <Text style={styles.itemLabel}>Age</Text>
        <Text style={styles.itemValue}>{profile.age}</Text>
        <Text style={styles.itemLabel}>Gender</Text>
        <Text style={styles.itemValue}>{profile.gender}</Text>
        <Text style={styles.itemLabel}>Height</Text>
        <Text style={styles.itemValue}>{profile.height_cm} cm</Text>
        <Text style={styles.itemLabel}>Weight</Text>
        <Text style={styles.itemValue}>{profile.weight_kg} kg</Text>
        <Text style={styles.itemLabel}>Primary Goal</Text>
        <Text style={styles.itemValue}>{profile.primary_goal}</Text>
        <Text style={styles.itemLabel}>Fitness Level</Text>
        <Text style={styles.itemValue}>{profile.fitness_level}</Text>
        <Text style={styles.itemLabel}>Training Days</Text>
        <Text style={styles.itemValue}>{profile.training_days_per_week} / week</Text>
      </View>
      <Button title="Sign Out" onPress={signOut} color="#d9534f" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  message: {
    fontSize: 16,
    color: '#555',
  },
  card: {
    backgroundColor: '#f6f6f6',
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  itemLabel: {
    color: '#666',
    fontWeight: '700',
  },
  itemValue: {
    fontSize: 16,
    marginBottom: 8,
  },
});