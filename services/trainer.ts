import apiClient from './api';

export interface UserInfo {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  location: string | null;
  role: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  user_id: string;
  trainer_id: string | null;
  profile_picture_url: string | null;
  profile_data: any;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: UserInfo;
  trainer: UserInfo | null;
}

export interface TrainerStats {
  trainer_id: string;
  total_customers: number;
  active_customers: number;
  total_sessions: number;
  sessions_this_month: number;
}

export const trainerService = {
  /**
   * Get customers for the current logged-in trainer
   * Uses the trainer's ID from the auth token
   */
  async getMyCustomers(trainerId: string, skip: number = 0, limit: number = 100): Promise<Customer[]> {
    const response = await apiClient.get<Customer[]>(`/api/v1/trainers/${trainerId}/customers`, {
      params: { skip, limit },
    });
    return response.data;
  },

  /**
   * Get stats for the current logged-in trainer
   */
  async getMyStats(): Promise<TrainerStats> {
    const response = await apiClient.get<TrainerStats>('/api/v1/trainers/me/stats');
    return response.data;
  },
};
