import { useRouter } from 'expo-router';
import { useState } from 'react';

import { supabase } from '@/lib/supabase';

export type AuthMode = 'login' | 'signup' | null;

export function useAuthModal() {
  const router = useRouter();

  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | undefined>(undefined);

  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedbackMessage(message);
    setFeedbackType(type);
  };

  const routeAfterAuth = async (userId: string) => {
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    router.replace(profile ? '/(app)' : '/(auth)/onboarding');
  };

  const handleAuth = async () => {
    if (authMode === 'login') {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { showFeedback(error.message, 'error'); return; }
      if (data?.session?.user?.id) {
        showFeedback('Welcome back!', 'success');
        setTimeout(() => routeAfterAuth(data.session.user.id), 800);
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { showFeedback(error.message, 'error'); return; }
      showFeedback('Account created!', 'success');
      setTimeout(() => router.replace('/(auth)/onboarding'), 900);
    }
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setFeedbackMessage('');
  };

  const closeAuth = () => setAuthMode(null);

  return {
    authMode,
    email,
    setEmail,
    password,
    setPassword,
    feedbackMessage,
    feedbackType,
    handleAuth,
    openAuth,
    closeAuth,
  };
}
