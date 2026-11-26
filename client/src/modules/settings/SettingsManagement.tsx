import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Briefcase,
  Building2,
  Clock,
  KeyRound,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../auth';
import { settingsApi } from './settings.api';
import type {
  DesignationItem,
  OrgUnitItem,
  PermissionItem,
  RoleDefinitionItem,
  SettingsUser,
  ShiftSettingItem,
} from './types';

type TabId = 'users' | 'rbac' | 'org' | 'designations' | 'shifts';

export function SettingsManagement() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<TabId>('users');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [users, setUsers] = useState<SettingsUser[]>([]);
  const [roles, setRoles] = useState<RoleDefinitionItem[]>([]);
  const [permissions, setPermissions] = useState<PermissionItem[]>([]);
  const [departments, setDepartments] = useState<OrgUnitItem[]>([]);
  const [teams, setTeams] = useState<OrgUnitItem[]>([]);
  const [designations, setDesignations] = useState<DesignationItem[]>([]);
  const [shifts, setShifts] = useState<ShiftSettingItem[]>([]);

  const [userSearch, setUserSearch] = useState('');

  // RBAC Editor State
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [checkedPermIds, setCheckedPermIds] = useState<Set<string>>(new Set());
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRoleForm, setNewRoleForm] = useState({
    name: '',
    displayName: '',
    description: '',
  });

  // Org Unit Forms
  const [deptForm, setDeptForm] = useState({ name: '', description: '' });
  const [teamForm, setTeamForm] = useState({ name: '', description: '' });

  // Designation Form
  const [desigForm, setDesigForm] = useState({
    title: '',
    departmentId: '',
    description: '',
  });

  // Shift Form
  const [shiftForm, setShiftForm] = useState({
    name: '',
    startTime: '09:30',
    endTime: '18:30',
    gracePeriodMinutes: 15,
    fullDayHours: 8.5,
    halfDayHours: 4.0,
    isDefault: false,
  });

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [uRes, dRes, tRes, desRes, sRes] = await Promise.all([
        settingsApi.listUsers(),
        settingsApi.listDepartments(),
        settingsApi.listTeams(),
        settingsApi.listDesignations(),
        settingsApi.listShifts(),
      ]);
      setUsers(uRes);
      setDepartments(dRes);
      setTeams(tRes);
      setDesignations(desRes);
      setShifts(sRes);

      if (isSuperAdmin) {
        const [rRes, pRes] = await Promise.all([
          settingsApi.listRoles(),
          settingsApi.listPermissions(),
        ]);
        setRoles(rRes);
        setPermissions(pRes);
        if (rRes.length > 0 && !selectedRoleId) {
          const initial = rRes[0];
          setSelectedRoleId(initial.id);
          setCheckedPermIds(new Set(initial.permissions.map((p) => p.permission.id)));
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load master settings');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin, selectedRoleId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const selectedRole = useMemo(
    () => roles.find((r) => r.id === selectedRoleId) ?? null,
    [roles, selectedRoleId],
  );

  const permissionsByModule = useMemo(() => {
    const grouped = new Map<string, PermissionItem[]>();
    for (const p of permissions) {
      const list = grouped.get(p.module) ?? [];
      list.push(p);
      grouped.set(p.module, list);
    }
    return Array.from(grouped.entries());
  }, [permissions]);

  const filteredUsers = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.employeeId.toLowerCase().includes(q),
    );
  }, [users, userSearch]);

  const selectRole = (role: RoleDefinitionItem) => {
    setSelectedRoleId(role.id);
    setCheckedPermIds(new Set(role.permissions.map((p) => p.permission.id)));
  };

  const togglePermission = (permId: string) => {
    setCheckedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await settingsApi.syncRolePermissions(selectedRole.id, Array.from(checkedPermIds));
      setNotice(`Permissions updated for "${selectedRole.displayName}".`);
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to update role permissions');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateRole = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const created = await settingsApi.createRole({
        name: newRoleForm.name.trim().toUpperCase(),
        displayName: newRoleForm.displayName.trim(),
        description: newRoleForm.description.trim() || undefined,
      });
      setRoleModalOpen(false);
      setNewRoleForm({ name: '', displayName: '', description: '' });
      setNotice(`Role "${created.displayName}" created.`);
      await loadAll();
      selectRole(created);
    } catch (err: any) {
      setError(err?.message || 'Failed to create role');
    } finally {
      setBusy(false);
    }
  };

  const handleAssignUserRole = async (userId: string, roleId: string) => {
    if (!roleId) return;
    setBusy(true);
    setError(null);
    try {
      await settingsApi.assignUserRole(userId, roleId);
      setNotice('User role updated.');
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to assign user role');
    } finally {
      setBusy(false);
    }
  };

  const handleUpdateUserAccess = async (
    userId: string,
    payload: Parameters<typeof settingsApi.updateUserAccess>[1],
  ) => {
    setBusy(true);
    setError(null);
    try {
      await settingsApi.updateUserAccess(userId, payload);
      setNotice('User access updated.');
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to update user access');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateDept = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await settingsApi.createDepartment({
        name: deptForm.name,
        description: deptForm.description || undefined,
      });
      setDeptForm({ name: '', description: '' });
      setNotice('Department created.');
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to create department');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateTeam = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await settingsApi.createTeam({
        name: teamForm.name,
        description: teamForm.description || undefined,
      });
      setTeamForm({ name: '', description: '' });
      setNotice('Team created.');
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to create team');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateDesignation = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await settingsApi.createDesignation({
        title: desigForm.title,
        departmentId: desigForm.departmentId || null,
        description: desigForm.description || undefined,
      });
      setDesigForm({ title: '', departmentId: '', description: '' });
      setNotice('Designation created.');
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to create designation');
    } finally {
      setBusy(false);
    }
  };

  const handleCreateShift = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await settingsApi.createShift({
        ...shiftForm,
        gracePeriodMinutes: Number(shiftForm.gracePeriodMinutes),
        fullDayHours: Number(shiftForm.fullDayHours),
        halfDayHours: Number(shiftForm.halfDayHours),
      });
      setShiftForm({
        name: '',
        startTime: '09:30',
        endTime: '18:30',
        gracePeriodMinutes: 15,
        fullDayHours: 8.5,
        halfDayHours: 4.0,
        isDefault: false,
      });
      setNotice('Shift configuration saved.');
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to create shift');
    } finally {
      setBusy(false);
    }
  };

  const handleSetDefaultShift = async (s: ShiftSettingItem) => {
    setBusy(true);
    setError(null);
    try {
      await settingsApi.updateShift(s.id, {
        name: s.name,
        startTime: s.startTime,
        endTime: s.endTime,
        gracePeriodMinutes: s.gracePeriodMinutes,
        fullDayHours: s.fullDayHours,
        halfDayHours: s.halfDayHours,
        isDefault: true,
      });
      setNotice(`"${s.name}" set as default shift.`);
      await loadAll();
    } catch (err: any) {
      setError(err?.message || 'Failed to update shift');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Master Settings &amp; Access Control
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Admin Governance
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage users, dynamic RBAC permissions, departments, teams, designations &amp; shift grace periods.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadAll()}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}
      {notice && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
          {notice}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center gap-2">
          {(
            [
              { id: 'users', label: `Users & Access (${users.length})`, icon: Users, show: true },
              { id: 'rbac', label: `RBAC Permissions (${roles.length})`, icon: Shield, show: isSuperAdmin },
              { id: 'org', label: `Departments & Teams (${departments.length}/${teams.length})`, icon: Building2, show: true },
              { id: 'designations', label: `Designations (${designations.length})`, icon: Briefcase, show: true },
              { id: 'shifts', label: `Shift Grace Periods (${shifts.length})`, icon: Clock, show: true },
            ] as const
          )
            .filter((t) => t.show)
            .map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activeTab === tab.id
                    ? 'bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
        </div>

        {/* TAB 1: USERS & ACCESS */}
        {activeTab === 'users' && (
          <div>
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800">
              <div className="relative max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search user name, email, or EMP ID..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-xs"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role Assignment</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4">Status</th>
                    {isSuperAdmin && <th className="py-3 px-4">Impersonate</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {u.name}{' '}
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {u.employeeId}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        {isSuperAdmin && roles.length > 0 ? (
                          <select
                            disabled={busy || u.id === user?.id}
                            value={u.roleId ?? roles.find((r) => r.name === u.role)?.id ?? ''}
                            onChange={(e) => void handleAssignUserRole(u.id, e.target.value)}
                            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.displayName} ({r.name})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-semibold text-indigo-700">{u.role}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          disabled={busy}
                          value={u.teamId ?? ''}
                          onChange={(e) =>
                            void handleUpdateUserAccess(u.id, {
                              teamId: e.target.value || null,
                            })
                          }
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
                        >
                          <option value="">No Team</option>
                          {teams.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          disabled={busy || u.id === user?.id}
                          value={u.employmentStatus}
                          onChange={(e) => {
                            const status = e.target.value as SettingsUser['employmentStatus'];
                            void handleUpdateUserAccess(u.id, {
                              employmentStatus: status,
                              isArchived: status === 'ARCHIVED',
                            });
                          }}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="ON_NOTICE">ON_NOTICE</option>
                          <option value="INACTIVE">INACTIVE</option>
                          <option value="ARCHIVED">ARCHIVED</option>
                        </select>
                      </td>
                      {isSuperAdmin && (
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            disabled={busy || u.id === user?.id}
                            onClick={() =>
                              void handleUpdateUserAccess(u.id, {
                                canImpersonate: !u.canImpersonate,
                              })
                            }
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${u.canImpersonate
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                          >
                            {u.canImpersonate ? 'Allowed' : 'Disabled'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: RBAC ROLES & PERMISSIONS */}
        {activeTab === 'rbac' && isSuperAdmin && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-slate-500">Roles</h3>
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs text-[11px] font-semibold"
                >
                  <Plus className="w-3 h-3" />
                  New Role
                </button>
              </div>
              <div className="space-y-2">
                {roles.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => selectRole(r)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${selectedRoleId === r.id
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{r.displayName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {r.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {r.permissions.length} permissions &bull; {r._count?.users ?? 0} users
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              {selectedRole && (
                <>
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {selectedRole.displayName} Permissions
                      </h3>
                      <p className="text-xs text-slate-500">{selectedRole.description}</p>
                    </div>
                    {selectedRole.name !== 'SUPER_ADMIN' && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void handleSavePermissions()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save Permissions
                      </button>
                    )}
                  </div>

                  {selectedRole.name === 'SUPER_ADMIN' && (
                    <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                      SuperAdmin retains universal system permissions and cannot be restricted.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {permissionsByModule.map(([mod, perms]) => (
                      <div
                        key={mod}
                        className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2"
                      >
                        <div className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1.5">
                          <KeyRound className="w-3 h-3" />
                          {mod}
                        </div>
                        {perms.map((p) => (
                          <label
                            key={p.id}
                            className="flex items-start gap-2 text-xs cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              disabled={selectedRole.name === 'SUPER_ADMIN'}
                              checked={checkedPermIds.has(p.id)}
                              onChange={() => togglePermission(p.id)}
                              className="mt-0.5 rounded border-slate-300"
                            />
                            <div>
                              <div className="font-mono text-[11px] font-semibold text-slate-800">
                                {p.key}
                              </div>
                              {p.description && (
                                <div className="text-[11px] text-slate-500">{p.description}</div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: DEPARTMENTS & TEAMS */}
        {activeTab === 'org' && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Departments */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Departments</h3>
              <form onSubmit={(e) => void handleCreateDept(e)} className="flex gap-2">
                <input
                  required
                  placeholder="New department name..."
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs text-xs font-semibold"
                >
                  Add
                </button>
              </form>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/70 border border-slate-200 rounded-lg">
                {departments.map((d) => (
                  <div key={d.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{d.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {d._count?.employees ?? 0} employees &bull; {d._count?.designations ?? 0} designations
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void settingsApi
                          .deleteDepartment(d.id)
                          .then(() => loadAll())
                          .catch((err: any) => setError(err?.message))
                      }
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Teams */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Teams</h3>
              <form onSubmit={(e) => void handleCreateTeam(e)} className="flex gap-2">
                <input
                  required
                  placeholder="New team name..."
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs text-xs font-semibold"
                >
                  Add
                </button>
              </form>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/70 border border-slate-200 rounded-lg">
                {teams.map((t) => (
                  <div key={t.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{t.name}</div>
                      <div className="text-[11px] text-slate-500">{t._count?.users ?? 0} members</div>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void settingsApi
                          .deleteTeam(t.id)
                          .then(() => loadAll())
                          .catch((err: any) => setError(err?.message))
                      }
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DESIGNATIONS */}
        {activeTab === 'designations' && (
          <div className="p-6 space-y-4">
            <form
              onSubmit={(e) => void handleCreateDesignation(e)}
              className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Designation Title
                </label>
                <input
                  required
                  placeholder="Senior Property Advisor"
                  value={desigForm.title}
                  onChange={(e) => setDesigForm({ ...desigForm, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department
                </label>
                <select
                  value={desigForm.departmentId}
                  onChange={(e) => setDesigForm({ ...desigForm, departmentId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                >
                  <option value="">All / General</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <input
                  placeholder="Optional summary"
                  value={desigForm.description}
                  onChange={(e) => setDesigForm({ ...desigForm, description: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs text-xs font-semibold"
              >
                Add Designation
              </button>
            </form>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/70 border border-slate-200 rounded-lg">
              {designations.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No designations configured yet.
                </div>
              ) : (
                designations.map((des) => (
                  <div key={des.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{des.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {des.department?.name ?? 'General'} {des.description ? `â€¢ ${des.description}` : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void settingsApi
                          .deleteDesignation(des.id)
                          .then(() => loadAll())
                          .catch((err: any) => setError(err?.message))
                      }
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: SHIFT & GRACE PERIODS */}
        {activeTab === 'shifts' && (
          <div className="p-6 space-y-6">
            <form
              onSubmit={(e) => void handleCreateShift(e)}
              className="p-4 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-3 items-end text-xs"
            >
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Shift Name</label>
                <input
                  required
                  placeholder="General Office Shift"
                  value={shiftForm.name}
                  onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Start (24h)</label>
                <input
                  type="time"
                  required
                  value={shiftForm.startTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">End (24h)</label>
                <input
                  type="time"
                  required
                  value={shiftForm.endTime}
                  onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Grace (mins)</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  required
                  value={shiftForm.gracePeriodMinutes}
                  onChange={(e) =>
                    setShiftForm({ ...shiftForm, gracePeriodMinutes: Number(e.target.value) })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-white"
                />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs font-semibold"
              >
                Add Shift
              </button>
            </form>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/70 border border-slate-200 rounded-lg">
              {shifts.map((s) => (
                <div
                  key={s.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      {s.name}
                      {s.isDefault && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      Timing: {s.startTime} &ndash; {s.endTime} &bull; Grace Period:{' '}
                      <span className="font-semibold text-slate-800">{s.gracePeriodMinutes} mins</span>{' '}
                      &bull; Full Day: {s.fullDayHours}h &bull; Half Day: {s.halfDayHours}h
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!s.isDefault && (
                      <>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleSetDefaultShift(s)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Set Default
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void settingsApi
                              .deleteShift(s.id)
                              .then(() => loadAll())
                              .catch((err: any) => setError(err?.message))
                          }
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Custom Role Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white dark:bg-[#0f172a] rounded-lg border border-slate-200/80 dark:border-slate-800 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">Create Custom Role</h2>
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={(e) => void handleCreateRole(e)} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Role Key (UPPER_SNAKE_CASE)
                </label>
                <input
                  required
                  placeholder="FINANCE_MANAGER"
                  value={newRoleForm.name}
                  onChange={(e) => setNewRoleForm({ ...newRoleForm, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Display Name</label>
                <input
                  required
                  placeholder="Finance Manager"
                  value={newRoleForm.displayName}
                  onChange={(e) =>
                    setNewRoleForm({ ...newRoleForm, displayName: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <input
                  placeholder="Payroll & finance approvals"
                  value={newRoleForm.description}
                  onChange={(e) =>
                    setNewRoleForm({ ...newRoleForm, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="px-4 py-2 rounded-lg bg-[#072b53] hover:bg-[#051e3b] text-white shadow-xs font-semibold"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
