import { httpClient } from '../../services/httpClient';
import type {
  LoginPayload,
  AuthResponse,
  User,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from './types';

/**
 * Consolidated Auth API Module
 * Uses the shared httpClient (DRY principle)
 * Aligned with backend Swagger endpoints
 */
export const authApi = {
  login: (payload: LoginPayload) =>
    httpClient.post<AuthResponse>('/auth/login', payload),

  getMe: () => httpClient.get<User>('/auth/me'),

  refresh: (refreshToken?: string) =>
    httpClient.post<AuthResponse>('/auth/refresh', { refreshToken }),

  logout: () =>
    httpClient.post<{ success: boolean }>('/auth/logout').catch(() => ({ success: true })),

  changePassword: (currentPassword: string, newPassword: string) =>
    httpClient.patch<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    }),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    httpClient.post<{ message: string }>('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    httpClient.post<{ success: boolean }>('/auth/reset-password', payload),
};
