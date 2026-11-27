import { httpClient } from '../../services/httpClient';
import type {
  OfficialLetterItem,
  PayrollRunDetail,
  PayrollRunSummary,
  PayslipItem,
} from './types';

export const payrollApi = {
  listRuns: () => httpClient.get<PayrollRunSummary[]>('/payroll/runs'),

  getRun: (id: string) => httpClient.get<PayrollRunDetail>(`/payroll/runs/${id}`),

  generateRun: (payload: { month: number; year: number; notes?: string }) =>
    httpClient.post<PayrollRunDetail>('/payroll/runs/generate', payload),

  updatePayslip: (
    id: string,
    payload: { bonus?: number; otherDeductions?: number; lopDays?: number; remarks?: string },
  ) => httpClient.patch<PayslipItem>(`/payroll/payslips/${id}`, payload),

  lockRun: (id: string) => httpClient.patch<PayrollRunDetail>(`/payroll/runs/${id}/lock`),

  markPaid: (id: string) => httpClient.patch<PayrollRunDetail>(`/payroll/runs/${id}/pay`),

  setVisibility: (id: string, visible: boolean) =>
    httpClient.patch<PayrollRunDetail>(`/payroll/runs/${id}/visibility`, { visible }),

  getMyPayslips: () => httpClient.get<PayslipItem[]>('/payroll/my-payslips'),

  getMyOfficialLetters: () => httpClient.get<OfficialLetterItem[]>('/payroll/my-official-letters'),
};
