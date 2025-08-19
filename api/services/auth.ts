import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { AuthResponse, User } from '@/types/auth';

export const authService = {
  /**
   * Register a new user
   */
  register: async (userData: User) => {
    console.log('🔐 AuthService: Register attempt with data:', userData);
    
    try {
      const response = await apiClient.post<User>(
        API_ENDPOINTS.AUTH.REGISTER, 
        userData
      );
      
      console.log('🔐 AuthService: Register response:', response);
      
      // Store JWT token if registration is successful
      if (response.success && response.data?.token) {
        console.log('🔐 AuthService: Setting token from registration');
        apiClient.setToken(response.data.token);
      }
      
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
      
      // Store JWT token if login is successful
      if (authResponse.success && authResponse.token) {
        console.log('🔐 AuthService: Setting token from login');
        apiClient.setToken(authResponse.token);
      } else {
        console.log('🔐 AuthService: No token in response or login failed');
      }
      
      return authResponse;
    } catch (error) {
      console.error('🔐 AuthService: Login error:', error);
      throw error;
    }
  },

  /**
   * Logout user (clear stored token)
   */
  logout: () => {
    console.log('🔐 AuthService: Logging out');
    apiClient.setToken(null);
  },

  /**
   * Get current token
   */
  getToken: () => {
    const token = apiClient.getToken();
    console.log('🔐 AuthService: Current token:', token ? 'exists' : 'null');
    return token;
  },
};
