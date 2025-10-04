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
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/v1/auth/login', credentials);
    const data = response.data;

    await tokenStorage.setTokens(data.access_token, data.refresh_token);

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

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/v1/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      await tokenStorage.clearAll();
    }
  },

  async refreshToken(): Promise<{ access_token: string; refresh_token: string }> {
    const refreshToken = await tokenStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/api/v1/auth/refresh', {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token: new_refresh_token } = response.data;

    await tokenStorage.setTokens(access_token, new_refresh_token);

    return { access_token, refresh_token: new_refresh_token };
  },

  async isAuthenticated(): Promise<boolean> {
    const accessToken = await tokenStorage.getAccessToken();
    const refreshToken = await tokenStorage.getRefreshToken();
    return !!(accessToken && refreshToken);
  },

  async getCurrentUser(): Promise<UserData | null> {
    return await tokenStorage.getUserData();
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/api/v1/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/api/v1/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return response.data;
  },
};
