import { useAuth } from '@/hooks/useAuth';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

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
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Simulate loading check
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const completeOnboarding = () => {
    setIsOnboardingComplete(true);
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
