import { httpClient } from '../../services/httpClient';
import type {
  CreateEmployeePayload,
  DepartmentOption,
  DocumentType,
  EmployeeDocument,
  EmployeeQrBadge,
  EmployeeRecord,
  TeamOption,
} from './types';

export const employeesApi = {
  getMeta: () =>
    httpClient.get<{ departments: DepartmentOption[]; teams: TeamOption[] }>('/employees/meta'),

  getAll: (params?: {
    search?: string;
    departmentId?: string;
    teamId?: string;
    employmentStatus?: string;
  }) => httpClient.get<EmployeeRecord[]>('/employees', { params }),

  getOne: (id: string) => httpClient.get<EmployeeRecord>(`/employees/${id}`),

  getMyProfile: () => httpClient.get<EmployeeRecord>('/employees/me'),

  getQrBadge: (id: string) => httpClient.get<EmployeeQrBadge>(`/employees/${id}/qr`),

  create: (payload: CreateEmployeePayload) =>
    httpClient.post<EmployeeRecord>('/employees', payload),

  update: (id: string, payload: Record<string, any>) =>
    httpClient.patch<EmployeeRecord>(`/employees/${id}`, payload),

  archive: (id: string) =>
    httpClient.patch<{ message: string }>(`/employees/${id}/archive`),

  addDocument: (
    employeeId: string,
    payload: { docType: DocumentType; fileName: string; fileUrl: string },
  ) => httpClient.post<EmployeeDocument>(`/employees/${employeeId}/documents`, payload),

  verifyDocument: (docId: string) =>
    httpClient.patch<EmployeeDocument>(`/employees/documents/${docId}/verify`),
};
