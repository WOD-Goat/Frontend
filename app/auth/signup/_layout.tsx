import { SignupProvider } from '@/hooks/useSignupContext';
import { Stack } from 'expo-router';

export default function SignupLayout() {
  return (
    <SignupProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="age" />
        <Stack.Screen name="gender" />
        <Stack.Screen name="height" />
        <Stack.Screen name="weight" />
      </Stack>
    </SignupProvider>
  );
}
