export type OffboardingStatus = 'PENDING_APPROVAL' | 'IN_NOTICE' | 'COMPLETED' | 'WITHDRAWN';
export type OffboardingType = 'RESIGNATION' | 'TERMINATION';
export type NocStatus = 'PENDING' | 'CLEARED';
export type NocCheckpointType = 'ASSETS' | 'EXPERIENCE_LETTER';

export interface OffboardingRecord {
  id: string;
  userId: string;
  employeeId: string;
  initiatedById?: string | null;
  offboardingType: OffboardingType;
  status: OffboardingStatus;
  resignationDate: string;
  lastWorkingDay: string;
  lastDayNotifiedAt?: string | null;
  noticePeriodDays: number;
  reason: string;
  handoverNotes?: string | null;
  earlyReleaseRemarks?: string | null;
  approvedAt?: string | null;
  completedAt?: string | null;
  withdrawnAt?: string | null;

  assetsNocStatus: NocStatus;
  assetsClearedBy?: string | null;
  assetsClearedAt?: string | null;
  assetsRemarks?: string | null;

  hrNocStatus: NocStatus;
  hrClearedBy?: string | null;
  hrClearedAt?: string | null;
  hrRemarks?: string | null;

  createdAt: string;
  updatedAt: string;

  user: {
    id: string;
    employeeId: string;
    name: string;
    email: string;
    phone?: string | null;
    role: string;
    employmentStatus: string;
  };
  employee: {
    id: string;
    jobTitle?: string | null;
    hireDate?: string | null;
    department?: { id: string; name: string } | null;
  };
  initiatedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface CreateOffboardingPayload {
  employeeId?: string;
  resignationDate?: string;
  reason: string;
  handoverNotes?: string;
}

export interface TerminateEmployeePayload {
  employeeId: string;
  effectiveDate?: string;
  reason: string;
}
