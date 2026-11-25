import type { UserRole } from '../auth/types';

export type DocumentType =
  | 'AADHAAR'
  | 'PAN'
  | 'DEGREE'
  | 'OFFER_LETTER'
  | 'NDA'
  | 'OTHER';

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  docType: DocumentType;
  fileName: string;
  fileUrl: string;
  isVerified: boolean;
  verifiedById?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface DepartmentOption {
  id: string;
  name: string;
  description?: string | null;
}

export interface TeamOption {
  id: string;
  name: string;
  description?: string | null;
}

export interface EmployeeRecord {
  id: string;
  userId: string;
  departmentId?: string | null;
  department?: DepartmentOption | null;
  jobTitle?: string | null;
  hireDate?: string | null;
  salary?: number | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  bankAccountNumber?: string | null;
  bankIfsc?: string | null;
  bankName?: string | null;
  panNumber?: string | null;
  aadhaarNumber?: string | null;
  uanNumber?: string | null;
  documents: EmployeeDocument[];
  user: {
    id: string;
    employeeId: string;
    email: string;
    name: string;
    phone?: string | null;
    role: UserRole;
    employmentStatus: string;
    dateOfJoining?: string | null;
    isArchived: boolean;
    teamId?: string | null;
    team?: TeamOption | null;
  };
}

export interface EmployeeQrBadge {
  employeeId: string;
  name: string;
  email: string;
  phone?: string | null;
  department?: string | null;
  team?: string | null;
  jobTitle?: string | null;
  bloodGroup?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  vCard: string;
}

export interface CreateEmployeePayload {
  employeeId: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  phone?: string;
  departmentId?: string;
  teamId?: string;
  jobTitle?: string;
  hireDate?: string;
  salary?: number;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}
