import { httpClient } from '../../services/httpClient';
import type {
  AttendanceMasterRecord,
  AttendanceRawLog,
  AttendanceRegularization,
  AttendanceStatus,
  SiteVisitRecord,
} from './types';

export const attendanceApi = {
  getMaster: (params?: { startDate?: string; endDate?: string; status?: AttendanceStatus }) =>
    httpClient.get<AttendanceMasterRecord[]>('/attendance/master', { params }),

  getRawLogs: (params?: { startDate?: string; endDate?: string }) =>
    httpClient.get<AttendanceRawLog[]>('/attendance/raw-logs', { params }),

  getSiteVisits: (params?: { startDate?: string; endDate?: string }) =>
    httpClient.get<SiteVisitRecord[]>('/attendance/site-visits', { params }),

  getRegularizations: () =>
    httpClient.get<AttendanceRegularization[]>('/attendance/regularizations'),

  requestRegularization: (payload: {
    attendanceDate: string;
    requestedIn?: string;
    requestedOut?: string;
    reason: string;
  }) => httpClient.post<AttendanceRegularization>('/attendance/regularize', payload),

  decideRegularization: (
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    remarks?: string,
  ) =>
    httpClient.patch<AttendanceRegularization>(`/attendance/regularize/${id}/decision`, {
      decision,
      remarks,
    }),

  reconcile: (date?: string) =>
    httpClient.post<{ date: string; reconciledCount: number }>('/attendance/reconcile', undefined, {
      params: date ? { date } : undefined,
    }),

  runLatecomerScan: () =>
    httpClient.post<{ flaggedCount: number }>('/attendance/latecomer-scan'),
};
