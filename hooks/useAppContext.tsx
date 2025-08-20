import * as SecureStore from 'expo-secure-store';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const ONBOARDING_KEY = 'onboarding_complete';

interface AppContextType {
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

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
