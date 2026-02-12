import { apiClient } from "@/api/client";
import { authService } from "@/api/services/auth";
import { LoadingScreen } from "@/components";
import { useStorage } from "@/components/lib/storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";

export default function Index() {
  const { get: getFromStorage } = useStorage();
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const loadOnboardingStatus = async () => {
      try {
        const status = await getFromStorage('isOnboardingComplete');
        setIsOnboardingComplete(status === true);
      } catch (error) {
        console.error('Failed to load onboarding status:', error);
      }
    };

    loadOnboardingStatus();
  }, [getFromStorage]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Wait for auth service to initialize and load tokens
        await apiClient.waitForInitialization();
        
        // Check if tokens exist in storage
        const hasTokens = authService.isAuthenticated();
        
        if (!hasTokens) {
          console.log('🔐 Index: No tokens found, redirecting to login');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        console.log('🔐 Index: Tokens found, validating refresh token...');
        
        // Try to refresh the access token to validate refresh token
        try {
          const refreshed = await apiClient.refreshAccessToken();
          
          if (refreshed) {
            console.log('✅ Index: Refresh token valid, access token refreshed');
            setIsAuthenticated(true);
          } else {
            console.log('⚠️ Index: Refresh token invalid, clearing storage');
            await apiClient.clearTokens;
            setIsAuthenticated(false);
          }
        } catch {
          console.log('⚠️ Index: Session expired, please log in again');
          await apiClient.clearTokens;
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Index initialization error:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  useEffect(() => {
    if (isLoading) return; // Wait for initialization

    if (!isOnboardingComplete) {
      router.push("/onboarding");
      return;
    }

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // If user is authenticated, show main app
    router.push("/(tabs)");
  }, [isLoading, isOnboardingComplete, isAuthenticated]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Return loading screen while navigation happens
  return <LoadingScreen />;
}
