import { httpClient } from '../../services/httpClient';
import type {
  CreateOffboardingPayload,
  NocCheckpointType,
  NocStatus,
  OffboardingRecord,
  OffboardingStatus,
  TerminateEmployeePayload,
} from './types';

export const offboardingApi = {
  list: (status?: OffboardingStatus) =>
    httpClient.get<OffboardingRecord[]>('/offboarding', {
      params: status ? { status } : undefined,
    }),

  initiate: (payload: CreateOffboardingPayload) =>
    httpClient.post<OffboardingRecord>('/offboarding', payload),

  terminate: (payload: TerminateEmployeePayload) =>
    httpClient.post<OffboardingRecord>('/offboarding/terminate', payload),

  approve: (id: string, payload?: { lastWorkingDay?: string; earlyReleaseRemarks?: string }) =>
    httpClient.patch<OffboardingRecord>(`/offboarding/${id}/approve`, payload || {}),

  updateNoc: (
    id: string,
    payload: { checkpoint: NocCheckpointType; status: NocStatus; remarks?: string },
  ) => httpClient.patch<OffboardingRecord>(`/offboarding/${id}/noc`, payload),

  complete: (id: string) =>
    httpClient.patch<OffboardingRecord>(`/offboarding/${id}/complete`, {}),

  withdraw: (id: string) =>
    httpClient.patch<OffboardingRecord>(`/offboarding/${id}/withdraw`, {}),
};
