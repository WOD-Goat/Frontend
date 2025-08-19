import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type {
  AuthResponse,
  LogoutResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
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
   * Refresh access token
   */
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    console.log('🔐 AuthService: Refresh token attempt');
    
    const refreshToken = apiClient.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const requestData: RefreshTokenRequest = { refreshToken };
      
      const response = await apiClient.post<RefreshTokenResponse>(
        API_ENDPOINTS.AUTH.REFRESH_TOKEN,
        requestData
      );
      
      console.log('🔐 AuthService: Refresh token response:', response);
      
      const refreshResponse = response as unknown as RefreshTokenResponse;
      
      // Update access token if refresh is successful
      if (refreshResponse.success && refreshResponse.accessToken) {
        console.log('🔐 AuthService: Setting new access token from refresh');
        await apiClient.setAccessToken(refreshResponse.accessToken);
      }
      
      return refreshResponse;
    } catch (error) {
      console.error('🔐 AuthService: Refresh token error:', error);
      // Clear tokens on refresh failure
      await apiClient.clearTokens();
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
   * Clear stored tokens (local logout)
   */
  clearSession: async () => {
    console.log('🔐 AuthService: Clearing session');
    await apiClient.clearTokens();
  },

  /**
   * Get current access token
   */
  getAccessToken: () => {
    const token = apiClient.getAccessToken();
    console.log('🔐 AuthService: Current access token:', token ? 'exists' : 'null');
    return token;
  },

  /**
   * Get current refresh token
   */
  getRefreshToken: () => {
    const token = apiClient.getRefreshToken();
    console.log('🔐 AuthService: Current refresh token:', token ? 'exists' : 'null');
    return token;
  },

  /**
   * Initialize auth service (wait for token loading)
   */
  initialize: async () => {
    await apiClient.waitForInitialization();
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    return !!apiClient.getAccessToken();
  },
};
