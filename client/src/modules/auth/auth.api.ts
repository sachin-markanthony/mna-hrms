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
 */
export const authApi = {
  login: (payload: LoginPayload) =>
    httpClient.post<AuthResponse>('/auth/login', payload),

  getMe: () => httpClient.get<User>('/auth/me'),

  logout: () =>
    httpClient.post<{ success: boolean }>('/auth/logout').catch(() => ({ success: true })),

  forgotPassword: (payload: ForgotPasswordPayload) =>
    httpClient.post<{ message: string }>('/auth/forgot-password', payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    httpClient.post<{ success: boolean }>('/auth/reset-password', payload),

  changePassword: (oldPassword: string, newPassword: string) =>
    httpClient.patch<{ success: boolean }>('/auth/change-password', { oldPassword, newPassword }),
};
