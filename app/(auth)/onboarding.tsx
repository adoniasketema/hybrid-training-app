import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Button, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { supabase } from '@/lib/supabase';

const genderOptions = ['Male', 'Female', 'Other'] as const;
const goalOptions = ['Build muscle', 'Increase VO2 max', 'Improve endurance'] as const;
const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<typeof genderOptions[number]>('Male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState<typeof goalOptions[number]>('Build muscle');
  const [fitnessLevel, setFitnessLevel] = useState<typeof fitnessLevels[number]>('Beginner');
  const [trainingDays, setTrainingDays] = useState('3');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data?.session?.user;

      if (!user) {
        router.replace('/(auth)/login');
        return;
      }

      const { data: profile } = await supabase.from('users').select('id').eq('id', user.id).maybeSingle();
      if (profile) {
        router.replace('/(app)');
      }
    };

    checkAuth();
  }, [router]);

  const saveProfile = async () => {
    if (!name.trim() || !age.trim() || !height.trim() || !weight.trim() || !trainingDays.trim()) {
      Alert.alert('Missing information', 'Please complete all fields before continuing.');
      return;
    }

    const { data } = await supabase.auth.getSession();
    const user = data?.session?.user;

    if (!user) {
      Alert.alert('Authentication required', 'Please sign in again.');
      router.replace('/(auth)/login');
      return;
    }

    setLoading(true);

    const payload = {
      id: user.id,
      email: user.email,
      name: name.trim(),
      age: Number(age),
      gender,
      height_cm: Number(height),
      weight_kg: Number(weight),
      primary_goal: primaryGoal,
      fitness_level: fitnessLevel,
      training_days_per_week: Number(trainingDays),
    };

    const { error } = await supabase.from('users').upsert(payload, { onConflict: 'id' });
    setLoading(false);

    if (error) {
      Alert.alert('Save failed', error.message);
      return;
    }

    router.replace('/(app)');
  };

  const renderOptions = <T extends string>(options: readonly T[], selected: T, onSelect: (value: T) => void) => (
    <View style={styles.optionRow}>
      {options.map((option) => (
        <Button
          key={option}
          title={option}
          color={selected === option ? '#007aff' : '#999'}
          onPress={() => onSelect(option)}
        />
      ))}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Welcome to Hybrid Training Pro</Text>
        <Text style={styles.subtitle}>Finish your profile so we can personalize your hybrid athlete plan.</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Name" />
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Age</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Age"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Gender</Text>
            {renderOptions(genderOptions, gender, setGender)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.halfField}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              placeholder="Height"
            />
          </View>
          <View style={styles.halfField}>
            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholder="Weight"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Primary Goal</Text>
          {renderOptions(goalOptions, primaryGoal, setPrimaryGoal)}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Fitness Level</Text>
          {renderOptions(fitnessLevels, fitnessLevel, setFitnessLevel)}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Training Days / Week</Text>
          <TextInput
            style={styles.input}
            value={trainingDays}
            onChangeText={setTrainingDays}
            keyboardType="numeric"
            placeholder="3"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title={loading ? 'Saving…' : 'Finish onboarding'} onPress={saveProfile} disabled={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  field: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    color: '#111',
    backgroundColor: '#fff',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
});
