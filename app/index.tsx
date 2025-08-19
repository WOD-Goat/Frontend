import { LoadingScreen } from "@/components";
import { useAppContext } from "@/hooks";
import { Redirect } from "expo-router";

export default function Index() {
  const { isLoading, isOnboardingComplete, isAuthenticated } = useAppContext();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // If user hasn't completed onboarding, show onboarding
  if (!isOnboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  // If user has completed onboarding but isn't authenticated, show login
  if (!isAuthenticated) {
    return <Redirect href="/auth/login" />;
  }

  // If user is authenticated, show main app
  return <Redirect href="/(tabs)" />;
}
