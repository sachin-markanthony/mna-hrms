import type { UserRole } from '../auth/types';

export interface SettingsUser {
  id: string;
  employeeId: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  roleId?: string | null;
  employmentStatus: 'ACTIVE' | 'ON_NOTICE' | 'INACTIVE' | 'ARCHIVED';
  isArchived: boolean;
  canImpersonate: boolean;
  lastLoginAt?: string | null;
  teamId?: string | null;
  team?: { id: string; name: string } | null;
  roleDefinition?: { id: string; name: string; displayName: string } | null;
  employee?: {
    id: string;
    jobTitle?: string | null;
    department?: { id: string; name: string } | null;
  } | null;
}

export interface PermissionItem {
  id: string;
  key: string;
  module: string;
  description?: string | null;
}

export interface RoleDefinitionItem {
  id: string;
  name: string;
  displayName: string;
  description?: string | null;
  isSystem: boolean;
  permissions: Array<{ permission: PermissionItem }>;
  _count?: { users: number };
}

export interface OrgUnitItem {
  id: string;
  name: string;
  description?: string | null;
  _count?: { employees?: number; designations?: number; users?: number };
}

export interface DesignationItem {
  id: string;
  title: string;
  departmentId?: string | null;
  department?: { id: string; name: string } | null;
  description?: string | null;
  isActive: boolean;
}

export interface ShiftSettingItem {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  gracePeriodMinutes: number;
  fullDayHours: number;
  halfDayHours: number;
  isDefault: boolean;
}
