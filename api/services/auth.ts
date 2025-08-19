import { apiClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/endpoints';
import type { User } from '../../types/api';

export const authService = {
  /**
   * Register a new user
   */
  register: async (userData: User) => {
    const response = await apiClient.post<User>(
      API_ENDPOINTS.AUTH.REGISTER, 
      userData
    );
    
    // Store JWT token if registration is successful
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  /**
   * Login user
   */
  login: async (email: string, password: string) => {
    const response = await apiClient.post<User>(
      API_ENDPOINTS.AUTH.LOGIN, 
      { email, password }
    );
    
    // Store JWT token if login is successful
    if (response.success && response.data?.token) {
      apiClient.setToken(response.data.token);
    }
    
    return response;
  },

  /**
   * Logout user (clear stored token)
   */
  logout: () => {
    apiClient.setToken(null);
  },

  /**
   * Get current token
   */
  getToken: () => {
    return apiClient.getToken();
  },
};
