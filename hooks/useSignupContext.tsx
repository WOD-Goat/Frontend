import { Gender } from '@/types/auth';
import { createContext, ReactNode, useContext, useState } from 'react';

interface SignupData {
  email: string;
  password: string;
  fullName: string;
  nickname: string;
  mobileNumber: string;
  gender: Gender;
  age: number;
  weight: number;
  height: number;
}

interface SignupContextType {
  signupData: Partial<SignupData>;
  updateSignupData: (data: Partial<SignupData>) => void;
  clearSignupData: () => void;
}

const SignupContext = createContext<SignupContextType | undefined>(undefined);

interface SignupProviderProps {
  children: ReactNode;
}

export function SignupProvider({ children }: SignupProviderProps) {
  const [signupData, setSignupData] = useState<Partial<SignupData>>({});

  const updateSignupData = (data: Partial<SignupData>) => {
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
