import { authService } from "@/api/services/auth";
import { useGlobalState } from "@/components/lib/global-state";
import type { AuthResponse, RegisterUserData, User } from "@/types/auth";
import { useState } from "react";

interface UseAuthReturn {
  loading: boolean;
  error: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterUserData) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const globalState = useGlobalState();

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response: AuthResponse = await authService.login(email, password);
      if (response.success && response.user) {
        setUser(response.user);
        // Update global state with user data for instant access across all tabs
        globalState.set("user", response.user);
        console.log("👤 useAuth: User data set in global state");
        return true;
      } else {
        setError(response.message || "Login failed");
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
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
      // First, register the user
      const registerResponse = await authService.register(userData);

      if (registerResponse.success) {
        console.log("👤 useAuth: Registration successful, now logging in...");

        // After successful registration, login to get tokens and user data
        const loginSuccess = await login(userData.email, userData.password);

        if (loginSuccess) {
          console.log("👤 useAuth: Auto-login after registration successful");
          return true;
        } else {
          setError(
            "Registration successful but login failed. Please try logging in.",
          );
          return false;
        }
      } else {
        setError(registerResponse.message || "Registration failed");
        return false;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
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
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setError(null);
      setLoading(false);
      // Clear user from global state
      globalState.set("user", null);
      console.log("👤 useAuth: User data cleared from global state");
    }
  };

  const fetchUserProfile = async (): Promise<void> => {
    if (!authService.isAuthenticated()) {
      return;
    }

    // Simply make a request that requires authentication
    // If token is expired, API client will automatically refresh
    try {
      // This will trigger automatic refresh if needed
      const response = await authService.login("dummy", "dummy"); // This will fail but trigger refresh
      if (response.user) {
        setUser(response.user);
      }
    } catch {
      console.log("Profile fetch failed - this is expected for dummy login");
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
    fetchUserProfile,
    isAuthenticated,
  };
};
