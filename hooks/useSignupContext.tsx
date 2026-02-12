import { RegisterUserData } from '@/types/auth';
import { createContext, ReactNode, useContext, useState } from 'react';

interface SignupContextType {
  signupData: Partial<RegisterUserData>;
  updateSignupData: (data: Partial<RegisterUserData>) => void;
  clearSignupData: () => void;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

interface SignupProviderProps {
  children: ReactNode;
}

export function SignupProvider({ children }: SignupProviderProps) {
  const [signupData, setSignupData] = useState<Partial<RegisterUserData>>({});

  const updateSignupData = (data: Partial<RegisterUserData>) => {
    setSignupData(prev => ({ ...prev, ...data }));
    console.log('📝 SignupData updated:', { ...signupData, ...data });
  };

  const clearSignupData = () => {
    setSignupData({});
    console.log('🗑️ SignupData cleared');
  };

  

  return (
    <SignupContext.Provider
      value={{
        signupData,
        updateSignupData,
        clearSignupData,
      }}
    >
      {children}
    </SignupContext.Provider>
  );
}

export function useSignupContext() {
  const context = useContext(SignupContext);
  if (context === undefined) {
    throw new Error('useSignupContext must be used within a SignupProvider');
  }
  return context;
}
