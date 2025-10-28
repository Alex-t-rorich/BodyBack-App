import apiClient from './api';

export interface QRCodeDisplay {
  token: string;
  qr_url: string;
  user_name: string;
  created_at: string;
  instructions: string;
}

export interface ScanQRCodeResponse {
  valid: boolean;
  user_id: string | null;
  user_name: string | null;
  user_role: string | null;
  message: string;
  scanned_at: string;
}

export const qrCodeService = {
  /**
   * Get the current user's QR code (auto-creates if doesn't exist)
   */
  async getMyQRCode(): Promise<QRCodeDisplay> {
    const response = await apiClient.get<QRCodeDisplay>('/api/v1/qr-codes/me');
    return response.data;
  },

  /**
   * Get the full URL for the QR code image
   */
  getQRCodeImageUrl(token: string, baseUrl: string = 'http://10.0.2.2:8000'): string {
    return `${baseUrl}/api/v1/qr-codes/image/${token}`;
  },

  /**
   * Scan and validate a QR code (trainer only)
   * Note: This validates the QR code but does NOT create session tracking records
   */
  async scanQRCode(token: string): Promise<ScanQRCodeResponse> {
    const response = await apiClient.post<ScanQRCodeResponse>('/api/v1/qr-codes/scan', {
      token,
    });
    return response.data;
  },
};
