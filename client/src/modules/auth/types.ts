export type UserRole =
  | 'SUPER_ADMIN'
  | 'HR_ADMIN'
  | 'HR_COORDINATOR'
  | 'TEAM_LEADER'
  | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  designation?: string;
  avatar?: string;
  biometricId?: string;
  isImpersonating?: boolean;
  originalAdminId?: string;
}

export interface RoleConfig {
  title: string;
  scope: 'Org' | 'Team' | 'Self';
  color: string;
  bg: string;
  email: string;
  description: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  user?: User;
  data?: {
    access_token?: string;
    accessToken?: string;
    refresh_token?: string;
    refreshToken?: string;
    user?: User;
  };
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export const ROLES: Record<UserRole, RoleConfig> = {
  SUPER_ADMIN: {
    title: 'Super Admin',
    scope: 'Org',
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
    email: 'superadmin@markanthony.ventures',
    description: 'Full portal control, RBAC, Master Settings & Payroll Lock',
  },
  HR_ADMIN: {
    title: 'HR Admin',
    scope: 'Org',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50 border-indigo-200',
    email: 'hr@markanthony.in',
    description: 'Operational control across all HRMS modules',
  },
  HR_COORDINATOR: {
    title: 'HR Coordinator',
    scope: 'Org',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    email: 'hr.coord@markanthony.in',
    description: 'HR coordination, leave review, recruitment & onboarding support',
  },
  TEAM_LEADER: {
    title: 'Team Lead',
    scope: 'Team',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    email: 'tl.dhinesh@markanthony.in',
    description: 'Team attendance, leave approvals & site visit verification',
  },
  EMPLOYEE: {
    title: 'Employee',
    scope: 'Self',
    color: 'text-slate-700',
    bg: 'bg-slate-100 border-slate-200',
    email: 'employee@markanthony.ventures',
    description: 'Self-service: Profile, QR, Attendance, Leave & Payslips',
  },
};
