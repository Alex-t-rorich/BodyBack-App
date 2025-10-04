import apiClient from './api';
import { tokenStorage } from '../utils/storage';

export interface UserData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  location: string | null;
}

export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  location?: string;
}

export const userService = {
  async getMe(): Promise<UserData> {
    const response = await apiClient.get<UserData>('/api/v1/users/me');
    return response.data;
  },

  async updateMe(data: UserUpdateData): Promise<UserData> {
    const storedUser = await tokenStorage.getUserData();
    if (!storedUser?.user_id) {
      throw new Error('User not authenticated');
    }
    const response = await apiClient.put<UserData>(`/api/v1/users/${storedUser.user_id}`, data);
    return response.data;
  },
};
