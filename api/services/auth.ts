import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  AuthResponse,
  LogoutResponse,
  RegisterUserData
} from '@/types/auth';

export const authService = {
  /**
   * Register a new user
   */
  register: async (userData: RegisterUserData) => {
    console.log('🔐 AuthService: Register attempt with data:', userData);
    
    try {
      const response = await apiClient.post<RegisterUserData>(
        API_ENDPOINTS.AUTH.REGISTER, 
        userData
      );
      
      console.log('🔐 AuthService: Register response:', response);
      
      return response;
    } catch (error) {
      console.error('🔐 AuthService: Register error:', error);
      throw error;
    }
  },

  /**
   * Login user
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('🔐 AuthService: Login attempt with:', { email, password: '***' });
    
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.AUTH.LOGIN, 
        { email, password }
      );
      console.log('🔄 API Client: Response data:', response);
      console.log('🔐 AuthService: Login response:', response);
      
      // The response IS the auth response, not wrapped in ApiResponse
      const authResponse = response as unknown as AuthResponse;
      
      // Store JWT tokens if login is successful
      if (authResponse.success && authResponse.accessToken && authResponse.refreshToken) {
        console.log('🔐 AuthService: Setting tokens from login');
        await apiClient.setTokens(authResponse.accessToken, authResponse.refreshToken);
      } else {
        console.log('🔐 AuthService: No tokens in response or login failed');
      }
      
      return authResponse;
    } catch (error) {
      console.error('🔐 AuthService: Login error:', error);
      throw error;
    }
  },

  /**
   * Logout user
   */
  logout: async (): Promise<LogoutResponse> => {
    console.log('🔐 AuthService: Logout attempt');
    
    try {
      const response = await apiClient.post<LogoutResponse>(
        API_ENDPOINTS.AUTH.LOGOUT
      );
      
      console.log('🔐 AuthService: Logout response:', response);
      
      const logoutResponse = response as unknown as LogoutResponse;
      
      // Clear tokens after successful logout
      if (logoutResponse.success) {
        console.log('🔐 AuthService: Clearing tokens after logout');
        await apiClient.clearTokens();
      }
      
      return logoutResponse;
    } catch (error) {
      console.error('🔐 AuthService: Logout error:', error);
      // Clear tokens even if logout request fails
      await apiClient.clearTokens();
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const accessToken = apiClient.getAccessToken();
    const refreshToken = apiClient.getRefreshToken();
    // If no tokens exist, definitely not authenticated
    if (!accessToken || !refreshToken) {
      return false;
    }
    return true;
  },
};
