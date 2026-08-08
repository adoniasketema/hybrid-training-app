import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AnimatedText } from '@/components/ui/AnimatedText';
import { AuthModal } from '@/components/ui/AuthModal';
import { Colors } from '@/constants/theme';

interface AuthModalFormProps {
  authMode: 'login' | 'signup' | null;
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  feedbackMessage: string;
  feedbackType?: 'success' | 'error';
  onSubmit: () => void;
  onSwitchMode: (mode: 'login' | 'signup') => void;
  onClose: () => void;
}

export function AuthModalForm({
  authMode,
  email,
  setEmail,
  password,
  setPassword,
  feedbackMessage,
  feedbackType,
  onSubmit,
  onSwitchMode,
  onClose,
}: AuthModalFormProps) {
  return (
    <AuthModal visible={!!authMode} onClose={onClose}>
      <AnimatedText style={styles.modalTitle}>
        {authMode === 'login' ? 'Welcome Back' : 'Join Aura Fitness'}
      </AnimatedText>
      <AnimatedText style={styles.modalSub}>
        {authMode === 'login'
          ? 'Enter your details to access your account.'
          : 'Create an account to start your journey.'}
      </AnimatedText>

      <View style={styles.inputContainer}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email address"
          placeholderTextColor="#555"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#555"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          style={styles.input}
        />
      </View>

      {feedbackMessage ? (
        <Text style={[styles.feedbackText, feedbackType === 'success' ? styles.success : styles.error]}>
          {feedbackMessage}
        </Text>
      ) : null}

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={onSubmit}
          style={({ hovered }: any) => [styles.cta, { width: '100%' }, hovered && { backgroundColor: '#D97706' }]}
        >
          <Text style={[styles.ctaText, { textAlign: 'center' }]}>
            {authMode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </Text>
        </Pressable>
        <Pressable onPress={() => onSwitchMode(authMode === 'login' ? 'signup' : 'login')}>
          <Text style={styles.switchAuthText}>
            {authMode === 'login' ? 'Need an account? Sign up' : 'Already a member? Log in'}
          </Text>
        </Pressable>
      </View>
    </AuthModal>
  );
}

const styles = StyleSheet.create({
  modalTitle: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  modalSub: {
    fontSize: 15,
    color: '#9CA3AF',
    fontFamily: 'Inter_400Regular',
    marginBottom: 32,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
    width: '100%',
  },
  input: {
    backgroundColor: '#1A1C23',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 6,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    width: '100%',
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
    alignItems: 'center',
  },
  cta: {
    backgroundColor: Colors.dark.primary,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 4,
  },
  ctaText: {
    color: '#0A0A0A',
    fontSize: 13,
    fontFamily: 'Inter_800ExtraBold',
    letterSpacing: 2,
  },
  switchAuthText: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  feedbackText: {
    marginBottom: 16,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Inter_500Medium',
  },
  success: {
    color: '#10B981',
  },
  error: {
    color: '#EF4444',
  },
});
