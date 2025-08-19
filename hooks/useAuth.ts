import { authService } from '@/api/services/auth';
import type { AuthResponse, RegisterUserData, User } from '@/types/auth';
import { useEffect, useState } from 'react';

interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterUserData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  fetchUserProfile: () => Promise<void>;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize authentication state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Wait for auth service to load tokens from storage
        await authService.initialize();
        
        // If we have tokens, assume user is authenticated
        // The actual token validation will happen on the first API call
        // and automatic refresh will occur if needed (401 response)
        if (authService.isAuthenticated()) {
          // We don't have user data yet, but we know tokens exist
          // User data will be fetched when the first authenticated API call is made
          console.log('🔐 useAuth: Found existing tokens, user considered authenticated');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear any invalid tokens on initialization error
        await authService.clearSession();
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await authService.login(email, password);

      if (response.success && response.user) {
        setUser(response.user);
        return true;
      } else {
        setError(response.message || 'Login failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterUserData): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);

      if (response.success) {
        // Registration successful, but we don't get user data back
        // User needs to login after registration
        return true;
      } else {
        setError('Registration failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      await authService.logout();
    } catch (error) {
      // Even if logout request fails, clear local state
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authService.refreshToken();
      
      if (response.success && response.user) {
        setUser(response.user);
        return true;
      } else {
        setError(response.message || 'Token refresh failed');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Token refresh failed';
      setError(errorMessage);
      // Clear user state on refresh failure
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (): Promise<void> => {
    if (!authService.isAuthenticated()) {
      return;
    }

    try {
      const response = await authService.refreshToken();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Don't set error state for background profile fetching
    }
  };

  const isAuthenticated = authService.isAuthenticated();

  return {
    loading,
    error,
    user,
    login,
    register,
    logout,
    refreshToken,
    fetchUserProfile,
    isAuthenticated,
    isInitialized,
  };
};
