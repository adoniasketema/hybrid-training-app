import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | undefined>(undefined);

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedbackMessage(message);
    setFeedbackType(type);
  };

  const routeAfterLogin = async (userId: string) => {
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    router.replace(profile ? '/tabs' : '/onboarding');
  };

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const message = error.message.includes('Invalid login credentials')
        ? 'No account found or wrong password. If you have not signed up yet, please sign up first.'
        : error.message;

      showFeedback(message, 'error');
      return;
    }

    if (!data?.session?.user?.id) {
      showFeedback('Login succeeded, but we could not locate your account. Please try again.', 'error');
      return;
    }

    showFeedback('Login successful. Welcome back!', 'success');
    setTimeout(() => routeAfterLogin(data.session.user.id), 800);
  };

  const handleSignUp = async () => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      showFeedback(error.message, 'error');
      return;
    }

    showFeedback('Sign up successful. Continue to onboarding.', 'success');
    setTimeout(() => router.replace('/onboarding' as unknown as any), 900);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.field}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          style={styles.input}
        />
      </View>

      <View style={styles.field}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          textContentType="password"
          style={styles.input}
        />
      </View>

      {feedbackMessage ? (
        <Text style={[styles.feedbackText, feedbackType === 'success' ? styles.success : styles.error]}>
          {feedbackMessage}
        </Text>
      ) : null}

      <Button title="Login" onPress={handleLogin} />
      <View style={styles.spacer} />
      <Button title="Sign Up" onPress={handleSignUp} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  field: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    color: 'white',
  },
  spacer: {
    height: 12,
  },
  feedbackText: {
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
  },
  success: {
    color: 'limegreen',
  },
  error: {
    color: 'tomato',
  },
});
