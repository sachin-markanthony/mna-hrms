export type PayrollRunStatus = 'DRAFT' | 'LOCKED' | 'PAID';

export interface PayrollActor {
  id: string;
  name: string;
  email: string;
}

export interface PayslipItem {
  id: string;
  payrollRunId: string;
  userId: string;
  month: number;
  year: number;
  workingDaysInMonth: number;
  presentDays: number;
  halfDays: number;
  lopDays: number;
  monthlyGross: number;
  basicPay: number;
  hra: number;
  specialAllowance: number;
  lopDeduction: number;
  professionalTax: number;
  otherDeductions: number;
  bonus: number;
  netPay: number;
  emailSentAt?: string | null;
  emailMessageId?: string | null;
  remarks?: string | null;
  payrollRun?: {
    id: string;
    status: PayrollRunStatus;
    lockedAt?: string | null;
    paidAt?: string | null;
    isPayslipVisible: boolean;
    payslipsReleasedAt?: string | null;
  };
  user: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    role: string;
    employee?: {
      jobTitle?: string | null;
      bankName?: string | null;
      bankAccountNumber?: string | null;
      bankIfsc?: string | null;
      panNumber?: string | null;
      uanNumber?: string | null;
      department?: { id: string; name: string } | null;
    } | null;
  };
}

export interface PayrollRunSummary {
  id: string;
  month: number;
  year: number;
  status: PayrollRunStatus;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNetPay: number;
  generatedById: string;
  lockedById?: string | null;
  lockedAt?: string | null;
  paidById?: string | null;
  paidAt?: string | null;
  isPayslipVisible: boolean;
  payslipsReleasedAt?: string | null;
  emailsDispatchedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  generatedBy?: PayrollActor | null;
  lockedBy?: PayrollActor | null;
  paidBy?: PayrollActor | null;
}

export interface PayrollRunDetail extends PayrollRunSummary {
  payslips: PayslipItem[];
}

export interface SendPayslipEmailsResponse {
  sentCount: number;
  failedCount: number;
  errors: Array<{ employeeId: string; email: string; error: string }>;
}

export interface OfficialLetterItem {
  id: string;
  refNumber: string;
  letterType: string;
  status: string;
  recipientName: string;
  recipientEmail: string;
  designation: string;
  department: string;
  annualGrossCtc?: number | null;
  monthlyGross?: number | null;
  joiningDate?: string | null;
  relievingDate?: string | null;
  workLocation?: string | null;
  probationMonths?: number | null;
  ceoName: string;
  ceoTitle: string;
  headOfHrName: string;
  headOfHrTitle: string;
  customNotes?: string | null;
  employeeCode?: string | null;
  recipientGender?: string | null;
  candidateResponse?: string | null;
  createdAt: string;
}
