import apiClient from './api';

export type SessionVolumeStatus = 'draft' | 'submitted' | 'read' | 'approved' | 'rejected';

export interface SessionVolumeCreate {
  trainer_id: string;
  customer_id: string;
  period: string; // YYYY-MM-DD format
  session_count: number;
  plans?: string;
  notes?: string;
  status?: SessionVolumeStatus;
}

export interface SessionVolumeUpdate {
  period?: string;
  session_count?: number;
  plans?: string;
  notes?: string;
  status?: SessionVolumeStatus;
}

export interface UserInfo {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
}

export interface SessionVolume {
  id: string;
  trainer_id: string;
  customer_id: string;
  period: string;
  session_count: number;
  plans: string | null;
  notes: string | null;
  status: SessionVolumeStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  customer: UserInfo | null;
  trainer: UserInfo | null;
  is_active: boolean;
  is_draft: boolean;
  is_submitted: boolean;
  is_approved: boolean;
  is_rejected: boolean;
}

export const sessionVolumeService = {
  /**
   * Create a new session volume
   */
  async createSessionVolume(data: SessionVolumeCreate): Promise<SessionVolume> {
    const response = await apiClient.post<SessionVolume>('/api/v1/session-volumes', data);
    return response.data;
  },

  /**
   * Get session volumes with optional filters
   */
  async getSessionVolumes(params?: {
    skip?: number;
    limit?: number;
    trainer_id?: string;
    customer_id?: string;
    status?: SessionVolumeStatus;
    start_period?: string;
    end_period?: string;
  }): Promise<SessionVolume[]> {
    const response = await apiClient.get<SessionVolume[]>('/api/v1/session-volumes', { params });
    return response.data;
  },

  /**
   * Get a specific session volume by ID
   */
  async getSessionVolume(id: string): Promise<SessionVolume> {
    const response = await apiClient.get<SessionVolume>(`/api/v1/session-volumes/${id}`);
    return response.data;
  },

  /**
   * Update a session volume
   */
  async updateSessionVolume(id: string, data: SessionVolumeUpdate): Promise<SessionVolume> {
    const response = await apiClient.put<SessionVolume>(`/api/v1/session-volumes/${id}`, data);
    return response.data;
  },

  /**
   * Delete a session volume
   */
  async deleteSessionVolume(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/api/v1/session-volumes/${id}`);
    return response.data;
  },

  /**
   * Get session volumes for a specific customer
   */
  async getSessionVolumesByCustomer(customerId: string, skip: number = 0, limit: number = 100): Promise<SessionVolume[]> {
    return this.getSessionVolumes({
      customer_id: customerId,
      skip,
      limit,
    });
  },

  /**
   * Get session volumes for a specific period
   */
  async getSessionVolumesByPeriod(year: number, month: number, params?: {
    trainer_id?: string;
    customer_id?: string;
  }): Promise<SessionVolume[]> {
    const response = await apiClient.get<SessionVolume[]>(
      `/api/v1/session-volumes/period/${year}/${month}`,
      { params }
    );
    return response.data;
  },

  /**
   * Approve a session volume (customer only)
   */
  async approveSessionVolume(id: string, notes?: string): Promise<{
    success: boolean;
    message: string;
    new_status: string;
    updated_at: string;
  }> {
    const response = await apiClient.post(`/api/v1/session-volumes/${id}/approve`, {
      status: 'approved',
      notes: notes || undefined,
    });
    return response.data;
  },

  /**
   * Reject a session volume (customer only)
   */
  async rejectSessionVolume(id: string, notes: string): Promise<{
    success: boolean;
    message: string;
    new_status: string;
    updated_at: string;
  }> {
    const response = await apiClient.post(`/api/v1/session-volumes/${id}/reject`, {
      status: 'rejected',
      notes,
    });
    return response.data;
  },
};
