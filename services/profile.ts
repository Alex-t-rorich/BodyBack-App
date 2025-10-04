import apiClient from './api';

export interface ProfileData {
  user_id: string;
  profile_picture_url: string | null;
  bio: string | null;
  emergency_contact: string | null;
  preferences: Record<string, any>;
  user: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone_number: string | null;
    location: string | null;
  };
}

export interface ProfileUpdateData {
  bio?: string | null;
  emergency_contact?: string | null;
  preferences?: Record<string, any>;
}

export interface UserUpdateData {
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  location?: string;
}

export const profileService = {
  async getMyProfile(): Promise<ProfileData> {
    const response = await apiClient.get<ProfileData>('/api/v1/profiles/me');
    return response.data;
  },

  async updateMyProfile(data: ProfileUpdateData): Promise<ProfileData> {
    const response = await apiClient.put<ProfileData>('/api/v1/profiles/me', data);
    return response.data;
  },

  async getUserProfile(userId: string): Promise<ProfileData> {
    const response = await apiClient.get<ProfileData>(`/api/v1/profiles/${userId}`);
    return response.data;
  },
};
