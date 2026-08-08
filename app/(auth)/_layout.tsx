import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="classes" />
      <Stack.Screen name="fitness" />
      <Stack.Screen name="training" />
      <Stack.Screen name="spa" />
      <Stack.Screen name="locations" />
    </Stack>
  );
}
