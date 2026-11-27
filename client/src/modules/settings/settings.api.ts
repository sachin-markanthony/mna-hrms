import { httpClient } from '../../services/httpClient';
import type {
  DesignationItem,
  OrgUnitItem,
  PermissionItem,
  RoleDefinitionItem,
  SettingsUser,
  ShiftSettingItem,
} from './types';

export const settingsApi = {
  // Users
  listUsers: () => httpClient.get<SettingsUser[]>('/settings/users'),
  updateUserAccess: (
    id: string,
    payload: {
      employmentStatus?: SettingsUser['employmentStatus'];
      isArchived?: boolean;
      teamId?: string | null;
    },
  ) => httpClient.patch<SettingsUser>(`/settings/users/${id}/access`, payload),

  // RBAC (RolesModule)
  listRoles: () => httpClient.get<RoleDefinitionItem[]>('/roles'),
  listPermissions: () => httpClient.get<PermissionItem[]>('/roles/permissions'),
  createRole: (payload: {
    name: string;
    displayName: string;
    description?: string;
    permissionIds?: string[];
  }) => httpClient.post<RoleDefinitionItem>('/roles', payload),
  syncRolePermissions: (roleId: string, permissionIds: string[]) =>
    httpClient.put<RoleDefinitionItem>(`/roles/${roleId}/permissions`, { permissionIds }),
  assignUserRole: (userId: string, roleId: string) =>
    httpClient.patch('/roles/assign-user', { userId, roleId }),
  deleteRole: (roleId: string) => httpClient.delete(`/roles/${roleId}`),

  // Departments
  listDepartments: () => httpClient.get<OrgUnitItem[]>('/settings/departments'),
  createDepartment: (payload: { name: string; description?: string }) =>
    httpClient.post<OrgUnitItem>('/settings/departments', payload),
  deleteDepartment: (id: string) => httpClient.delete(`/settings/departments/${id}`),

  // Teams
  listTeams: () => httpClient.get<OrgUnitItem[]>('/settings/teams'),
  createTeam: (payload: { name: string; description?: string }) =>
    httpClient.post<OrgUnitItem>('/settings/teams', payload),
  deleteTeam: (id: string) => httpClient.delete(`/settings/teams/${id}`),

  // Designations
  listDesignations: () => httpClient.get<DesignationItem[]>('/settings/designations'),
  createDesignation: (payload: {
    title: string;
    departmentId?: string | null;
    description?: string;
  }) => httpClient.post<DesignationItem>('/settings/designations', payload),
  deleteDesignation: (id: string) => httpClient.delete(`/settings/designations/${id}`),

  // Shifts & Grace Periods
  listShifts: () => httpClient.get<ShiftSettingItem[]>('/settings/shifts'),
  createShift: (payload: Omit<ShiftSettingItem, 'id'>) =>
    httpClient.post<ShiftSettingItem>('/settings/shifts', payload),
  updateShift: (id: string, payload: Omit<ShiftSettingItem, 'id'>) =>
    httpClient.patch<ShiftSettingItem>(`/settings/shifts/${id}`, payload),
  deleteShift: (id: string) => httpClient.delete(`/settings/shifts/${id}`),
};
