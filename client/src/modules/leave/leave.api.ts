import { httpClient } from '../../services/httpClient';
import type {
  ApplyLeavePayload,
  LeaveBalance,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
} from './types';

export const leaveApi = {
  getMyBalances: (year?: number) =>
    httpClient.get<LeaveBalance[]>('/leave/balances/me', {
      params: year ? { year } : undefined,
    }),

  getRequests: (params?: { status?: LeaveStatus; leaveType?: LeaveType; year?: number }) =>
    httpClient.get<LeaveRequest[]>('/leave/requests', { params }),

  getCalendar: (month?: number, year?: number) =>
    httpClient.get<LeaveRequest[]>('/leave/calendar', {
      params: { month, year },
    }),

  applyLeave: (payload: ApplyLeavePayload) =>
    httpClient.post<LeaveRequest>('/leave/requests', payload),

  submitTeamLeadDecision: (
    id: string,
    decision: 'APPROVED' | 'REJECTED',
    remarks?: string,
  ) =>
    httpClient.patch<LeaveRequest>(`/leave/requests/${id}/team-lead-decision`, {
      decision,
      remarks,
    }),

  submitHrDecision: (id: string, decision: 'APPROVED' | 'REJECTED', remarks?: string) =>
    httpClient.patch<LeaveRequest>(`/leave/requests/${id}/hr-decision`, {
      decision,
      remarks,
    }),

  cancelLeave: (id: string) =>
    httpClient.patch<LeaveRequest>(`/leave/requests/${id}/cancel`),
};
