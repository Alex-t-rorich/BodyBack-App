import apiClient from './api';
import { tokenStorage } from '../utils/storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  email: string;
  role: string | null;
  status: number;
  first_name: string | null;
  last_name: string | null;
}

export interface UserData {
  user_id: string;
  email: string;
  role: string | null;
  status: number;
  first_name: string | null;
  last_name: string | null;
}

export const authService = {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', credentials);
    const data = response.data;

    // Store tokens
    await tokenStorage.setTokens(data.access_token, data.refresh_token);

    // Store user data
    const userData: UserData = {
      user_id: data.user_id,
      email: data.email,
      role: data.role,
      status: data.status,
      first_name: data.first_name,
      last_name: data.last_name,
    };
    await tokenStorage.setUserData(userData);

    return data;
  },

  /**
   * Logout user - clear tokens and user data
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint (optional, as JWT is stateless)
      await apiClient.post('/api/v1/auth/logout');
    } catch (error) {
      // Even if the API call fails, we still clear local data
      console.error('Logout API error:', error);
    } finally {
      // Clear all stored data
      await tokenStorage.clearAll();
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ access_token: string; refresh_token: string }> {
    const refreshToken = await tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token: new_refresh_token } = response.data;

    // Update stored tokens
    await tokenStorage.setTokens(access_token, new_refresh_token);

    return { access_token, refresh_token: new_refresh_token };
  },

  /**
   * Check if user is authenticated (has valid tokens)
   */
  async isAuthenticated(): Promise<boolean> {
    const accessToken = await tokenStorage.getAccessToken();
    const refreshToken = await tokenStorage.getRefreshToken();
    return !!(accessToken && refreshToken);
  },

  /**
   * Get current user data from storage
   */
  async getCurrentUser(): Promise<UserData | null> {
    return await tokenStorage.getUserData();
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/api/v1/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },
};
