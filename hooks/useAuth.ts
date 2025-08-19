import { authService } from '@/api/services/auth';
import type { AuthResponse, User } from '@/types/auth';
import { useState } from 'react';

interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: User) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await authService.login(email, password);

      if (response.success && response.user) {
        setUser(response.user);
        return true;
      } else {
        setError(response.message || response.error || 'Login failed');
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

  const register = async (userData: User): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);

      if (response.success && response.data) {
        setUser(response.data);
        return true;
      } else {
        setError(response.message || response.error || 'Registration failed');
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

  const logout = () => {
    authService.logout();
    setUser(null);
    setError(null);
  };

  const isAuthenticated = !!user && !!authService.getToken();

  return {
    loading,
    error,
    user,
    login,
    register,
    logout,
    isAuthenticated,
  };
};
