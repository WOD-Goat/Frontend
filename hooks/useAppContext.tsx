import { useAuth } from '@/hooks/useAuth';
import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const ONBOARDING_KEY = 'onboarding_complete';

interface AppContextType {
  isOnboardingComplete: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isInitialized } = useAuth();

  // Load onboarding status from storage
  useEffect(() => {
    const loadOnboardingStatus = async () => {
      try {
        const status = await SecureStore.getItemAsync(ONBOARDING_KEY);
        if (status === 'true') {
          setIsOnboardingComplete(true);
        }
      } catch (error) {
        console.error('Failed to load onboarding status:', error);
      }
    };

    loadOnboardingStatus();
  }, []);

  useEffect(() => {
    // Wait for auth initialization and onboarding status load
    if (isInitialized) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500); // Reduced time since auth is already initialized
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  const completeOnboarding = async () => {
    try {
      await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
      setIsOnboardingComplete(true);
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
      // Still set local state even if storage fails
      setIsOnboardingComplete(true);
    }
  };

  return (
    <AppContext.Provider
      value={{
        isOnboardingComplete,
        isAuthenticated,
        isLoading,
        completeOnboarding,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
