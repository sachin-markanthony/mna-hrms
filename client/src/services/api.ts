import { httpClient } from './httpClient';
import { authApi } from '../modules/auth/auth.api';

export * from './httpClient';
export * from '../modules/auth/auth.api';

/**
 * Centralized API Gateway
 * Fully modular and DRY - delegates to module APIs and shared httpClient
 */
export const api = {
  // 1. Auth Module
  auth: authApi,
  login: (email: string, password = '') => authApi.login({ email, password }),
  getCurrentUser: () => authApi.getMe(),
  logout: () => authApi.logout(),
  forgotPassword: (email: string) => authApi.forgotPassword({ email }),
  resetPassword: (email: string, otp: string, newPassword: string) =>
    authApi.resetPassword({ email, otp, newPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    authApi.changePassword(currentPassword, newPassword),

  // 2. Dashboard Module
  getDashboardStats: (period?: string) =>
    httpClient.get<any>('/dashboard', { params: { period } }),

  // 3. Employees & KYC Vault Module
  getEmployees: (params?: Record<string, string>) =>
    httpClient.get<any[]>('/employees', { params }),

  getEmployee: (id: string) => httpClient.get<any>(`/employees/${id}`),

  // 4. Attendance & Gate Lock / Site Visits Module
  getAttendance: (params?: Record<string, string>) =>
    httpClient.get<any[]>('/attendance', { params }),

  punchAttendance: (type: 'IN' | 'OUT', source = 'WEB') =>
    httpClient.post<any>('/attendance/punch', { type, source }),

  // 5. Leave Management Module
  getLeaveRequests: () => httpClient.get<any[]>('/leave'),

  applyLeave: (payload: { leaveTypeId: string; startDate: string; endDate: string; reason: string }) =>
    httpClient.post<any>('/leave', payload),

  // 6. Simplified Payroll Engine Module
  getPayrollSummary: (month?: string) =>
    httpClient.get<any>('/payroll', { params: { month } }),

  // 7. Recruitment & Pipeline Module
  getRecruitmentPipeline: () => httpClient.get<any>('/recruitment'),
};
